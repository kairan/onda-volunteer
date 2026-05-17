import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CLOCK, type Clock } from '../common/clock';
import { IdentityService } from '../identity/identity.service';
import { PrismaService } from '../prisma/prisma.service';

export type CreateAssignmentInput = {
  eventId: string;
  authorizationHeader: string | undefined;
  leaderMinistryIdHeader: string | undefined;
  volunteerId: string;
  ministryId: string;
  roleId: string;
  startsAtUtc: string;
  endsAtUtc: string;
};

function parseInstant(label: string, iso: string): Date {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException({
      code: 'INVALID_INSTANT',
      message: `${label} must be a valid ISO-8601 instant`,
    });
  }
  return d;
}

/** Half-open overlap on UTC instants: [a0,a1) overlaps [b0,b1) iff a0 < b1 && b0 < a1 */
function halfOpenIntervalsOverlap(a0: Date, a1: Date, b0: Date, b1: Date): boolean {
  return a0 < b1 && b0 < a1;
}

export type ReleaseAssignmentInput = {
  assignmentId: string;
  authorizationHeader: string | undefined;
  volunteerIdHeader: string | undefined;
};

export type CreateUnavailabilityInput = {
  volunteerId: string;
  authorizationHeader: string | undefined;
  volunteerIdHeader: string | undefined;
  leaderMinistryIdHeader: string | undefined;
  ministryId: string;
  startsAtUtc: string;
  endsAtUtc: string;
};

export type GetVolunteerAssignmentsInput = {
  volunteerId: string;
  churchId?: string;
  authorizationHeader: string | undefined;
  volunteerIdHeader: string | undefined;
};

export type GetVolunteerUnavailabilityInput = {
  volunteerId: string;
  churchId?: string;
  authorizationHeader: string | undefined;
  volunteerIdHeader: string | undefined;
};

export type CreateBulkUnavailabilityInput = {
  volunteerId: string;
  authorizationHeader: string | undefined;
  volunteerIdHeader: string | undefined;
  ministryIds: string[];
  startsAtUtc: string;
  endsAtUtc: string;
};

@Injectable()
export class SchedulingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly identity: IdentityService,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async createBulkUnavailability(input: CreateBulkUnavailabilityInput) {
    const volunteer = await this.identity.requireVolunteer({
      authorizationHeader: input.authorizationHeader,
      devVolunteerIdHeader: input.volunteerIdHeader,
    });
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

    const memberships = await this.prisma.ministryMembership.findMany({
      where: {
        volunteerId: input.volunteerId,
        ministryId: { in: input.ministryIds },
        status: 'ACTIVE',
      },
    });

    if (memberships.length !== input.ministryIds.length) {
      throw new BadRequestException({
        code: 'MEMBERSHIP_REQUIRED',
        message:
          'Volunteer must have Active ministry membership for all requested ministries.',
      });
    }

    const result = await this.prisma.unavailability.createMany({
      data: input.ministryIds.map((ministryId) => ({
        volunteerId: input.volunteerId,
        ministryId,
        startsAtUtc: u0,
        endsAtUtc: u1,
      })),
    });

    return {
      count: result.count,
    };
  }

  async getVolunteerUnavailability(input: GetVolunteerUnavailabilityInput) {
    const caller = await this.identity.requireVolunteer({
      authorizationHeader: input.authorizationHeader,
      devVolunteerIdHeader: input.volunteerIdHeader,
    });

    if (caller.id !== input.volunteerId) {
      throw new ForbiddenException({
        code: 'VOLUNTEER_MISMATCH',
        message: 'You may only view your own unavailability.',
      });
    }

    const now = this.clock.now();

    return this.prisma.unavailability.findMany({
      where: {
        volunteerId: input.volunteerId,
        endsAtUtc: { gt: now },
        ...(input.churchId ? { ministry: { churchId: input.churchId } } : {}),
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
    const caller = await this.identity.requireVolunteer({
      authorizationHeader: input.authorizationHeader,
      devVolunteerIdHeader: input.volunteerIdHeader,
    });

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
    await this.identity.assertLeaderCanActOnMinistry({
      authorizationHeader: input.authorizationHeader,
      devLeaderMinistryIdHeader: input.leaderMinistryIdHeader,
      ministryId: input.ministryId,
    });

    const event = await this.prisma.event.findUnique({
      where: { id: input.eventId },
      include: { church: true },
    });
    if (!event) {
      throw new NotFoundException();
    }
    if (event.kind !== 'PUBLIC') {
      throw new BadRequestException({
        code: 'EVENT_NOT_PUBLIC',
        message: 'Assignments in this slice are limited to public events.',
      });
    }

    const a0 = parseInstant('startsAtUtc', input.startsAtUtc);
    const a1 = parseInstant('endsAtUtc', input.endsAtUtc);
    if (!(a0 < a1)) {
      throw new BadRequestException({
        code: 'INVALID_ASSIGNMENT_WINDOW',
        message: 'Assignment window must have startsAtUtc strictly before endsAtUtc.',
      });
    }

    if (a0 < event.startsAtUtc || a1 > event.endsAtUtc) {
      throw new BadRequestException({
        code: 'ASSIGNMENT_OUTSIDE_EVENT',
        message: 'Assignment interval must lie fully within the event UTC window.',
      });
    }

    const ministry = await this.prisma.ministry.findUnique({
      where: { id: input.ministryId },
    });
    if (!ministry || ministry.churchId !== event.churchId) {
      throw new BadRequestException({
        code: 'MINISTRY_NOT_ON_EVENT_CHURCH',
        message: 'Ministry must belong to the same church as the event.',
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
    if (!membership || membership.status !== 'ACTIVE') {
      throw new BadRequestException({
        code: 'MEMBERSHIP_NOT_ACTIVE',
        message: 'Volunteer must have Active ministry membership for this ministry.',
      });
    }

    const role = await this.prisma.ministryRole.findUnique({
      where: { id: input.roleId },
    });
    if (!role || role.ministryId !== input.ministryId) {
      throw new BadRequestException({
        code: 'ROLE_NOT_IN_MINISTRY',
        message: 'Role must belong to the assignment ministry.',
      });
    }
    if (role.retired) {
      throw new BadRequestException({
        code: 'ROLE_RETIRED',
        message: 'Retired roles cannot be used for new assignments.',
      });
    }

    const blocks = await this.prisma.unavailability.findMany({
      where: {
        volunteerId: input.volunteerId,
        ministryId: input.ministryId,
      },
    });
    for (const u of blocks) {
      if (halfOpenIntervalsOverlap(a0, a1, u.startsAtUtc, u.endsAtUtc)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            code: 'UNAVAILABILITY_BLOCKS_ASSIGN',
            message:
              'This volunteer is unavailable for this ministry during the selected time.',
          },
          HttpStatus.CONFLICT,
        );
      }
    }

    const otherMinistryAssignments = await this.prisma.assignment.findMany({
      where: {
        volunteerId: input.volunteerId,
        ministryId: { not: input.ministryId },
        voidedAtUtc: null,
      },
    });
    for (const ex of otherMinistryAssignments) {
      if (halfOpenIntervalsOverlap(a0, a1, ex.startsAtUtc, ex.endsAtUtc)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            code: 'CROSS_MINISTRY_DOUBLE_BOOKING',
            message:
              'This volunteer is already rostered in another ministry for an overlapping time (UTC half-open intervals).',
          },
          HttpStatus.CONFLICT,
        );
      }
    }

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

  async releaseAssignment(input: ReleaseAssignmentInput) {
    const volunteer = await this.identity.requireVolunteer({
      authorizationHeader: input.authorizationHeader,
      devVolunteerIdHeader: input.volunteerIdHeader,
    });

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
    const caller = await this.identity.requireVolunteer({
      authorizationHeader: input.authorizationHeader,
      devVolunteerIdHeader: input.volunteerIdHeader,
    });

    if (caller.id !== input.volunteerId) {
      // If not acting on self, must be a leader of the target ministry
      await this.identity.assertLeaderCanActOnMinistry({
        authorizationHeader: input.authorizationHeader,
        devLeaderMinistryIdHeader: input.leaderMinistryIdHeader,
        ministryId: input.ministryId,
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
}
