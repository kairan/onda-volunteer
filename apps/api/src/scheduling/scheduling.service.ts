import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CLOCK, type Clock } from '../common/clock';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { assertMinistryAcceptsWrites } from '../organization/ministry-write-guard';
import { PrismaService } from '../prisma/prisma.service';
import {
  bulkUnavailabilityMembershipFailure,
  parseInstantOrThrow,
  SCHEDULING_CONFLICT_GUARD_CODES,
  validateAssignmentGuards,
} from './scheduling-rules';
import { assertSchedulingWriteAllowed } from './scheduling-write-guard';

export type CreateAssignmentInput = {
  eventId: string;
  auth: AuthenticatedRequestContext;
  volunteerId: string;
  ministryId: string;
  roleId: string;
  startsAtUtc: string;
  endsAtUtc: string;
};

function parseInstant(label: string, iso: string): Date {
  const parsed = parseInstantOrThrow(label, iso);
  if ('error' in parsed) {
    throw new BadRequestException(parsed.error);
  }
  return parsed;
}

function assertAssignmentGuards(
  input: Parameters<typeof validateAssignmentGuards>[0],
): void {
  const result = validateAssignmentGuards(input);
  if (result.ok) {
    return;
  }
  if (SCHEDULING_CONFLICT_GUARD_CODES.has(result.code)) {
    throw new HttpException(
      {
        statusCode: HttpStatus.CONFLICT,
        code: result.code,
        message: result.message,
      },
      HttpStatus.CONFLICT,
    );
  }
  throw new BadRequestException({
    code: result.code,
    message: result.message,
  });
}

export type ReleaseAssignmentInput = {
  assignmentId: string;
  auth: AuthenticatedRequestContext;
};

export type VoidAssignmentInput = {
  assignmentId: string;
  auth: AuthenticatedRequestContext;
};

export type CreateUnavailabilityInput = {
  volunteerId: string;
  auth: AuthenticatedRequestContext;
  ministryId: string;
  startsAtUtc: string;
  endsAtUtc: string;
};

export type GetVolunteerAssignmentsInput = {
  volunteerId: string;
  churchId?: string;
  auth: AuthenticatedRequestContext;
};

export type GetVolunteerUnavailabilityInput = {
  volunteerId: string;
  churchId?: string;
  auth: AuthenticatedRequestContext;
};

export type UpdateUnavailabilityInput = {
  unavailabilityId: string;
  auth: AuthenticatedRequestContext;
  startsAtUtc: string;
  endsAtUtc: string;
};

export type DeleteUnavailabilityInput = {
  unavailabilityId: string;
  auth: AuthenticatedRequestContext;
};

export type CreateBulkUnavailabilityInput = {
  volunteerId: string;
  auth: AuthenticatedRequestContext;
  ministryIds: string[];
  startsAtUtc: string;
  endsAtUtc: string;
};

@Injectable()
export class SchedulingService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async createBulkUnavailability(input: CreateBulkUnavailabilityInput) {
    await assertSchedulingWriteAllowed(input.auth);

    const volunteer = await input.auth.requireVolunteer();
    if (volunteer.id !== input.volunteerId) {
      throw new ForbiddenException({
        code: 'VOLUNTEER_MISMATCH',
        message: 'Authenticated identity does not match this request.',
      });
    }

    const u0 = parseInstant('startsAtUtc', input.startsAtUtc);
    const u1 = parseInstant('endsAtUtc', input.endsAtUtc);
    if (!(u0 < u1)) {
      throw new BadRequestException({
        code: 'INVALID_UNAVAILABILITY_WINDOW',
        message:
          'Unavailability window must have startsAtUtc strictly before endsAtUtc.',
      });
    }

    const uniqueMinistryIds = [...new Set(input.ministryIds)];
    const memberships = await this.prisma.ministryMembership.findMany({
      where: {
        volunteerId: input.volunteerId,
        ministryId: { in: uniqueMinistryIds },
      },
    });
    const membershipByMinistryId = new Map(
      memberships.map((membership) => [membership.ministryId, membership]),
    );

    const created: Array<{ id: string; ministryId: string }> = [];
    const failed: Array<{ ministryId: string; code: string; message: string }> =
      [];

    for (const ministryId of uniqueMinistryIds) {
      const membership = membershipByMinistryId.get(ministryId);
      const membershipFailure = bulkUnavailabilityMembershipFailure(
        ministryId,
        membership,
      );
      if (membershipFailure) {
        failed.push(membershipFailure);
        continue;
      }

      try {
        await assertMinistryAcceptsWrites(this.prisma, ministryId);
      } catch (err) {
        if (
          err instanceof BadRequestException &&
          (err.getResponse() as { code?: string }).code === 'MINISTRY_ARCHIVED'
        ) {
          failed.push({
            ministryId,
            code: 'MINISTRY_ARCHIVED',
            message: 'This ministry is archived and cannot accept new writes.',
          });
          continue;
        }
        throw err;
      }

      try {
        const row = await this.prisma.unavailability.create({
          data: {
            volunteerId: input.volunteerId,
            ministryId,
            startsAtUtc: u0,
            endsAtUtc: u1,
          },
        });
        created.push({ id: row.id, ministryId: row.ministryId });
      } catch {
        failed.push({
          ministryId,
          code: 'CREATE_FAILED',
          message: 'Could not record unavailability for this ministry.',
        });
      }
    }

    return {
      createdCount: created.length,
      created,
      failed,
    };
  }

  private async ministryIdsCallerCanSteward(
    callerVolunteerId: string,
    churchId?: string,
  ): Promise<string[]> {
    const [leaderships, accreditations] = await Promise.all([
      this.prisma.ministryLeader.findMany({
        where: { volunteerId: callerVolunteerId },
        include: { ministry: { select: { id: true, churchId: true } } },
      }),
      this.prisma.adminAccreditation.findMany({
        where: { volunteerId: callerVolunteerId },
        include: {
          church: {
            include: { ministries: { select: { id: true, churchId: true } } },
          },
        },
      }),
    ]);

    const ministryIds = new Set<string>();
    for (const leadership of leaderships) {
      if (!churchId || leadership.ministry.churchId === churchId) {
        ministryIds.add(leadership.ministry.id);
      }
    }
    for (const accreditation of accreditations) {
      for (const ministry of accreditation.church.ministries) {
        if (!churchId || ministry.churchId === churchId) {
          ministryIds.add(ministry.id);
        }
      }
    }
    return [...ministryIds];
  }

  async getVolunteerUnavailability(input: GetVolunteerUnavailabilityInput) {
    const caller = await input.auth.requireVolunteer();

    const now = this.clock.now();
    const baseWhere = {
      volunteerId: input.volunteerId,
      endsAtUtc: { gt: now },
      ...(input.churchId ? { ministry: { churchId: input.churchId } } : {}),
    };

    if (caller.id === input.volunteerId) {
      return this.prisma.unavailability.findMany({
        where: baseWhere,
        include: {
          ministry: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          startsAtUtc: 'asc',
        },
      });
    }

    const stewardedMinistryIds = await this.ministryIdsCallerCanSteward(
      caller.id,
      input.churchId,
    );
    if (stewardedMinistryIds.length === 0) {
      throw new ForbiddenException({
        code: 'LEADER_NOT_AUTHORIZED',
        message:
          'You may only view unavailability for volunteers in ministries you lead.',
      });
    }

    const scopedLeaderMinistryId = input.auth.headers.leaderMinistryId?.trim();
    if (scopedLeaderMinistryId) {
      await input.auth.assertLeaderCanActOnMinistry(scopedLeaderMinistryId);
      if (!stewardedMinistryIds.includes(scopedLeaderMinistryId)) {
        throw new ForbiddenException({
          code: 'LEADER_NOT_AUTHORIZED',
          message:
            'You may only view unavailability for volunteers in ministries you lead.',
        });
      }
    }

    const ministryIdsForQuery = scopedLeaderMinistryId
      ? [scopedLeaderMinistryId]
      : stewardedMinistryIds;

    return this.prisma.unavailability.findMany({
      where: {
        ...baseWhere,
        ministryId: { in: ministryIdsForQuery },
      },
      include: {
        ministry: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startsAtUtc: 'asc',
      },
    });
  }

  async getVolunteerAssignments(input: GetVolunteerAssignmentsInput) {
    const caller = await input.auth.requireVolunteer();

    if (caller.id !== input.volunteerId) {
      throw new ForbiddenException({
        code: 'VOLUNTEER_MISMATCH',
        message: 'You may only view your own assignments.',
      });
    }

    const now = this.clock.now();

    return this.prisma.assignment.findMany({
      where: {
        volunteerId: input.volunteerId,
        voidedAtUtc: null,
        endsAtUtc: { gt: now },
        ...(input.churchId ? { event: { churchId: input.churchId } } : {}),
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startsAtUtc: true,
            endsAtUtc: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startsAtUtc: 'asc',
      },
    });
  }

  async createAssignment(input: CreateAssignmentInput) {
    await assertSchedulingWriteAllowed(input.auth);
    await input.auth.assertLeaderCanActOnMinistry(input.ministryId);
    await assertMinistryAcceptsWrites(this.prisma, input.ministryId);

    const event = await this.prisma.event.findUnique({
      where: { id: input.eventId },
      include: { church: true },
    });
    if (!event) {
      throw new NotFoundException();
    }
    if (event.cancelledAtUtc) {
      throw new BadRequestException({
        code: 'EVENT_CANCELLED',
        message: 'Cannot create assignments on a cancelled event.',
      });
    }

    const a0 = parseInstant('startsAtUtc', input.startsAtUtc);
    const a1 = parseInstant('endsAtUtc', input.endsAtUtc);

    const ministry = await this.prisma.ministry.findUnique({
      where: { id: input.ministryId },
    });
    if (!ministry || ministry.churchId !== event.churchId) {
      throw new BadRequestException({
        code: 'MINISTRY_NOT_ON_EVENT_CHURCH',
        message: 'Ministry must belong to the same church as the event.',
      });
    }

    if (event.kind === 'PRIVATE' && event.ministryId !== input.ministryId) {
      throw new BadRequestException({
        code: 'PRIVATE_EVENT_MINISTRY_MISMATCH',
        message: 'Private event assignments must use the event ministry.',
      });
    }

    const membership = await this.prisma.ministryMembership.findUnique({
      where: {
        volunteerId_ministryId: {
          volunteerId: input.volunteerId,
          ministryId: input.ministryId,
        },
      },
    });
    const role = await this.prisma.ministryRole.findUnique({
      where: { id: input.roleId },
    });
    if (!role || role.ministryId !== input.ministryId) {
      throw new BadRequestException({
        code: 'ROLE_NOT_IN_MINISTRY',
        message: 'Role must belong to the assignment ministry.',
      });
    }
    const blocks = await this.prisma.unavailability.findMany({
      where: {
        volunteerId: input.volunteerId,
        ministryId: input.ministryId,
      },
    });

    const otherMinistryAssignments = await this.prisma.assignment.findMany({
      where: {
        volunteerId: input.volunteerId,
        ministryId: { not: input.ministryId },
        voidedAtUtc: null,
      },
    });

    assertAssignmentGuards({
      eventStartsAtUtc: event.startsAtUtc,
      eventEndsAtUtc: event.endsAtUtc,
      assignmentStartsAtUtc: a0,
      assignmentEndsAtUtc: a1,
      membershipStatus: membership?.status ?? null,
      roleRetired: role.retired,
      unavailabilityBlocks: blocks,
      crossMinistryConflictingAssignments: otherMinistryAssignments,
    });

    const created = await this.prisma.assignment.create({
      data: {
        eventId: input.eventId,
        ministryId: input.ministryId,
        volunteerId: input.volunteerId,
        roleId: input.roleId,
        startsAtUtc: a0,
        endsAtUtc: a1,
      },
    });

    return {
      id: created.id,
      volunteerId: created.volunteerId,
      ministryId: created.ministryId,
      roleId: created.roleId,
      window: {
        startsAtUtc: created.startsAtUtc.toISOString(),
        endsAtUtc: created.endsAtUtc.toISOString(),
      },
    };
  }

  async voidAssignment(input: VoidAssignmentInput) {
    await assertSchedulingWriteAllowed(input.auth);

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: input.assignmentId },
      include: {
        event: { select: { churchId: true } },
      },
    });
    if (!assignment) {
      throw new NotFoundException({
        code: 'ASSIGNMENT_NOT_FOUND',
        message: 'Assignment not found.',
      });
    }
    if (assignment.voidedAtUtc !== null) {
      throw new BadRequestException({
        code: 'ASSIGNMENT_ALREADY_VOIDED',
        message: 'This assignment is no longer an active commitment.',
      });
    }

    let authorized = false;
    try {
      await input.auth.assertLeaderCanActOnMinistry(assignment.ministryId);
      authorized = true;
    } catch (err) {
      if (!(err instanceof ForbiddenException)) {
        throw err;
      }
    }
    if (!authorized) {
      try {
        await input.auth.assertAdminAccreditedForChurch(
          assignment.event.churchId,
        );
        authorized = true;
      } catch (err) {
        if (err instanceof ForbiddenException) {
          throw new ForbiddenException({
            code: 'LEADER_NOT_ASSIGNED',
            message:
              'You are not authorized to void assignments for this ministry.',
          });
        }
        throw err;
      }
    }

    const now = this.clock.now();
    const updated = await this.prisma.assignment.update({
      where: { id: assignment.id },
      data: { voidedAtUtc: now },
    });

    return {
      id: updated.id,
      voidedAtUtc: updated.voidedAtUtc!.toISOString(),
    };
  }

  async releaseAssignment(input: ReleaseAssignmentInput) {
    await assertSchedulingWriteAllowed(input.auth);

    const volunteer = await input.auth.requireVolunteer();

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: input.assignmentId },
    });
    if (!assignment) {
      throw new NotFoundException();
    }
    if (assignment.volunteerId !== volunteer.id) {
      throw new ForbiddenException({
        code: 'ASSIGNMENT_NOT_OWNED',
        message: 'Volunteers may only release their own assignments.',
      });
    }
    if (assignment.voidedAtUtc !== null) {
      throw new BadRequestException({
        code: 'ASSIGNMENT_ALREADY_VOIDED',
        message: 'This assignment is no longer an active commitment.',
      });
    }

    const now = this.clock.now();
    const updated = await this.prisma.assignment.update({
      where: { id: assignment.id },
      data: { voidedAtUtc: now },
    });

    return {
      id: updated.id,
      voidedAtUtc: updated.voidedAtUtc!.toISOString(),
      ministryId: updated.ministryId,
      window: {
        startsAtUtc: updated.startsAtUtc.toISOString(),
        endsAtUtc: updated.endsAtUtc.toISOString(),
      },
    };
  }

  async createUnavailability(input: CreateUnavailabilityInput) {
    await assertSchedulingWriteAllowed(input.auth);

    const caller = await input.auth.requireVolunteer();

    if (caller.id !== input.volunteerId) {
      await input.auth.assertLeaderCanActOnMinistry(input.ministryId);
    }
    await assertMinistryAcceptsWrites(this.prisma, input.ministryId);

    const u0 = parseInstant('startsAtUtc', input.startsAtUtc);
    const u1 = parseInstant('endsAtUtc', input.endsAtUtc);
    if (!(u0 < u1)) {
      throw new BadRequestException({
        code: 'INVALID_UNAVAILABILITY_WINDOW',
        message:
          'Unavailability window must have startsAtUtc strictly before endsAtUtc.',
      });
    }

    const membership = await this.prisma.ministryMembership.findUnique({
      where: {
        volunteerId_ministryId: {
          volunteerId: input.volunteerId,
          ministryId: input.ministryId,
        },
      },
    });
    if (!membership) {
      throw new BadRequestException({
        code: 'MEMBERSHIP_REQUIRED',
        message:
          'Volunteer must have ministry membership before recording unavailability.',
      });
    }

    const created = await this.prisma.unavailability.create({
      data: {
        volunteerId: input.volunteerId,
        ministryId: input.ministryId,
        startsAtUtc: u0,
        endsAtUtc: u1,
      },
    });

    return {
      id: created.id,
      ministryId: created.ministryId,
      window: {
        startsAtUtc: created.startsAtUtc.toISOString(),
        endsAtUtc: created.endsAtUtc.toISOString(),
      },
    };
  }

  private async assertCanMutateUnavailability(
    auth: AuthenticatedRequestContext,
    row: { volunteerId: string; ministryId: string },
  ) {
    if (auth.headers.volunteerId) {
      const caller = await auth.requireVolunteer();
      if (caller.id === row.volunteerId) {
        return;
      }
    }
    await auth.assertLeaderCanActOnMinistry(row.ministryId);
  }

  async updateUnavailability(input: UpdateUnavailabilityInput) {
    await assertSchedulingWriteAllowed(input.auth);

    const row = await this.prisma.unavailability.findUnique({
      where: { id: input.unavailabilityId },
    });
    if (!row) {
      throw new NotFoundException();
    }

    await this.assertCanMutateUnavailability(input.auth, row);

    const u0 = parseInstant('startsAtUtc', input.startsAtUtc);
    const u1 = parseInstant('endsAtUtc', input.endsAtUtc);
    if (!(u0 < u1)) {
      throw new BadRequestException({
        code: 'INVALID_UNAVAILABILITY_WINDOW',
        message:
          'Unavailability window must have startsAtUtc strictly before endsAtUtc.',
      });
    }

    const updated = await this.prisma.unavailability.update({
      where: { id: row.id },
      data: {
        startsAtUtc: u0,
        endsAtUtc: u1,
      },
    });

    return {
      id: updated.id,
      ministryId: updated.ministryId,
      window: {
        startsAtUtc: updated.startsAtUtc.toISOString(),
        endsAtUtc: updated.endsAtUtc.toISOString(),
      },
    };
  }

  async deleteUnavailability(input: DeleteUnavailabilityInput) {
    await assertSchedulingWriteAllowed(input.auth);

    const row = await this.prisma.unavailability.findUnique({
      where: { id: input.unavailabilityId },
    });
    if (!row) {
      throw new NotFoundException();
    }

    await this.assertCanMutateUnavailability(input.auth, row);

    await this.prisma.unavailability.delete({
      where: { id: row.id },
    });

    return { id: row.id };
  }
}
