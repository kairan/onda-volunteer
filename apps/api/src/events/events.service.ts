import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CLOCK, type Clock } from '../common/clock';
import { DateTime } from 'luxon';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { PrismaService } from '../prisma/prisma.service';
import { assertMinistryAcceptsWrites } from '../organization/ministry-write-guard';
import { StewardshipService } from '../organization/stewardship.service';
import { assertSchedulingWriteAllowed } from '../scheduling/scheduling-write-guard';

export type EventDetailResponse = {
  church: {
    id: string;
    name: string;
    defaultTimezone: string;
  };
  event: {
    id: string;
    kind: 'PUBLIC' | 'PRIVATE';
    title: string;
    window: {
      startsAtUtc: string;
      endsAtUtc: string;
    };
    framing: {
      churchDefaultTimezone: string;
      startsDisplayInChurchTz: string;
      endsDisplayInChurchTz: string;
    };
    cancelledAtUtc: string | null;
  };
  ministry: { id: string; name: string } | null;
  assignments: Array<{
    id: string;
    volunteer: { id: string; displayName: string };
    ministry: { id: string; name: string };
    role: { id: string; name: string };
    window: { startsAtUtc: string; endsAtUtc: string };
  }>;
  roleCapacities: Array<{
    ministryId: string;
    roleId: string;
    capacity: number;
  }>;
};

export type EventListItem = {
  id: string;
  kind: 'PUBLIC' | 'PRIVATE';
  title: string;
  window: {
    startsAtUtc: string;
    endsAtUtc: string;
  };
  framing: {
    churchDefaultTimezone: string;
    startsDisplayInChurchTz: string;
    endsDisplayInChurchTz: string;
  };
  ministry: { id: string; name: string } | null;
  church?: { id: string; name: string };
};

function churchFraming(
  startsAtUtc: Date,
  endsAtUtc: Date,
  zone: string,
): EventListItem['framing'] {
  const startsDisplayInChurchTz = DateTime.fromJSDate(startsAtUtc, {
    zone: 'utc',
  })
    .setZone(zone)
    .toISO({ suppressMilliseconds: true, includeOffset: true });

  const endsDisplayInChurchTz = DateTime.fromJSDate(endsAtUtc, {
    zone: 'utc',
  })
    .setZone(zone)
    .toISO({ suppressMilliseconds: true, includeOffset: true });

  if (!startsDisplayInChurchTz || !endsDisplayInChurchTz) {
    throw new NotFoundException();
  }

  return {
    churchDefaultTimezone: zone,
    startsDisplayInChurchTz,
    endsDisplayInChurchTz,
  };
}

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stewardship: StewardshipService,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  private parseInstant(label: string, iso: string): Date {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      throw new BadRequestException({
        code: 'INVALID_INSTANT',
        message: `${label} must be a valid ISO-8601 instant`,
      });
    }
    return d;
  }

  private validateEventWindow(title: string, startsAtUtc: string, endsAtUtc: string) {
    const trimmed = title?.trim();
    if (!trimmed) {
      throw new BadRequestException({
        code: 'TITLE_REQUIRED',
        message: 'Event title is required.',
      });
    }
    const start = this.parseInstant('startsAtUtc', startsAtUtc);
    const end = this.parseInstant('endsAtUtc', endsAtUtc);
    if (!(start < end)) {
      throw new BadRequestException({
        code: 'INVALID_EVENT_WINDOW',
        message: 'Event window must have startsAtUtc strictly before endsAtUtc.',
      });
    }
    return { title: trimmed, startsAtUtc: start, endsAtUtc: end };
  }

  async createPublicEvent(input: {
    churchId: string;
    title: string;
    startsAtUtc: string;
    endsAtUtc: string;
    auth: AuthenticatedRequestContext;
  }) {
    await assertSchedulingWriteAllowed(input.auth);
    await input.auth.assertAdminAccreditedForChurch(input.churchId);

    const { title, startsAtUtc, endsAtUtc } = this.validateEventWindow(
      input.title,
      input.startsAtUtc,
      input.endsAtUtc,
    );

    const church = await this.prisma.church.findUnique({
      where: { id: input.churchId },
    });
    if (!church) {
      throw new NotFoundException({
        code: 'CHURCH_NOT_FOUND',
        message: 'Church not found.',
      });
    }

    const row = await this.prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title,
        startsAtUtc,
        endsAtUtc,
        churchId: input.churchId,
        ministryId: null,
      },
      include: { church: true, ministry: true },
    });

    return this.toEventListItem(row);
  }

  async createPrivateEvent(input: {
    ministryId: string;
    title: string;
    startsAtUtc: string;
    endsAtUtc: string;
    auth: AuthenticatedRequestContext;
  }) {
    await assertSchedulingWriteAllowed(input.auth);
    await input.auth.assertLeaderCanActOnMinistry(input.ministryId);
    await assertMinistryAcceptsWrites(this.prisma, input.ministryId);

    const { title, startsAtUtc, endsAtUtc } = this.validateEventWindow(
      input.title,
      input.startsAtUtc,
      input.endsAtUtc,
    );

    const ministry = await this.prisma.ministry.findUnique({
      where: { id: input.ministryId },
      include: { church: true },
    });
    if (!ministry) {
      throw new NotFoundException({ code: 'MINISTRY_NOT_FOUND', message: 'Ministry not found.' });
    }

    const row = await this.prisma.event.create({
      data: {
        kind: 'PRIVATE',
        title,
        startsAtUtc,
        endsAtUtc,
        churchId: ministry.churchId,
        ministryId: ministry.id,
      },
      include: { church: true, ministry: true },
    });

    const activeRoles = await this.prisma.ministryRole.findMany({
      where: { ministryId: ministry.id, retired: false },
      select: { id: true },
    });
    if (activeRoles.length > 0) {
      await this.prisma.eventRoleCapacity.createMany({
        data: activeRoles.map((role) => ({
          eventId: row.id,
          ministryId: ministry.id,
          roleId: role.id,
          capacity: 1,
        })),
      });
    }

    return this.toEventListItem(row);
  }

  private toEventListItem(
    row: {
      id: string;
      kind: 'PUBLIC' | 'PRIVATE';
      title: string;
      startsAtUtc: Date;
      endsAtUtc: Date;
      church: { id: string; name: string; defaultTimezone: string };
      ministry: { id: string; name: string } | null;
    },
    includeChurch = false,
  ): EventListItem {
    const item: EventListItem = {
      id: row.id,
      kind: row.kind,
      title: row.title,
      window: {
        startsAtUtc: row.startsAtUtc.toISOString(),
        endsAtUtc: row.endsAtUtc.toISOString(),
      },
      framing: churchFraming(row.startsAtUtc, row.endsAtUtc, row.church.defaultTimezone),
      ministry: row.ministry
        ? { id: row.ministry.id, name: row.ministry.name }
        : null,
    };

    if (includeChurch) {
      item.church = { id: row.church.id, name: row.church.name };
    }

    return item;
  }

  async listEvents(input: {
    churchId: string | undefined;
    auth: AuthenticatedRequestContext;
  }) {
    const volunteer = await input.auth.requireVolunteer();
    const isSystemAdmin = await input.auth.isSystemAdmin();

    if (isSystemAdmin) {
      const rows = await this.prisma.event.findMany({
        where: {
          ...(input.churchId ? { churchId: input.churchId } : {}),
          cancelledAtUtc: null,
        },
        include: {
          church: true,
          ministry: true,
        },
        orderBy: { startsAtUtc: 'asc' },
      });

      return rows.map((row) => this.toEventListItem(row, !input.churchId));
    }

    if (!input.churchId) {
      throw new BadRequestException({
        code: 'CHURCH_ID_REQUIRED',
        message: 'churchId query parameter is required.',
      });
    }

    const stewardship = await this.stewardship.getChurchStewardship(
      volunteer.id,
      input.churchId,
    );

    const visibilityOr: Array<
      | { kind: 'PUBLIC' }
      | { kind: 'PRIVATE' }
      | { kind: 'PRIVATE'; ministryId: { in: string[] } }
    > = [{ kind: 'PUBLIC' }];

    if (stewardship.isAccreditedAdmin) {
      visibilityOr.push({ kind: 'PRIVATE' });
    } else if (stewardship.accessibleMinistryIds.length > 0) {
      visibilityOr.push({
        kind: 'PRIVATE',
        ministryId: { in: stewardship.accessibleMinistryIds },
      });
    }

    const rows = await this.prisma.event.findMany({
      where: {
        churchId: input.churchId,
        cancelledAtUtc: null,
        OR: visibilityOr,
      },
      include: {
        church: true,
        ministry: true,
      },
      orderBy: { startsAtUtc: 'asc' },
    });

    return rows.map((row) => this.toEventListItem(row));
  }

  async getEventDetail(input: {
    id: string;
    auth: AuthenticatedRequestContext;
  }): Promise<EventDetailResponse> {
    const volunteer = await input.auth.requireVolunteer();

    const row = await this.prisma.event.findUnique({
      where: { id: input.id },
      include: {
        church: true,
        ministry: true,
        assignments: {
          where: { voidedAtUtc: null },
          orderBy: { startsAtUtc: 'asc' },
          include: {
            volunteer: true,
            ministry: true,
            role: true,
          },
        },
        roleCapacities: true,
      },
    });

    if (!row) {
      throw new NotFoundException();
    }

    if (!(await input.auth.isSystemAdmin())) {
      const stewardship = await this.stewardship.getChurchStewardship(
        volunteer.id,
        row.churchId,
      );
      if (!this.stewardship.canViewEvent(row, stewardship)) {
        throw new NotFoundException();
      }
    }

    const zone = row.church.defaultTimezone;
    const framing = churchFraming(row.startsAtUtc, row.endsAtUtc, zone);

    return {
      church: {
        id: row.church.id,
        name: row.church.name,
        defaultTimezone: row.church.defaultTimezone,
      },
      event: {
        id: row.id,
        kind: row.kind,
        title: row.title,
        window: {
          startsAtUtc: row.startsAtUtc.toISOString(),
          endsAtUtc: row.endsAtUtc.toISOString(),
        },
        framing,
        cancelledAtUtc: row.cancelledAtUtc?.toISOString() ?? null,
      },
      ministry: row.ministry
        ? { id: row.ministry.id, name: row.ministry.name }
        : null,
      assignments: row.assignments.map((a) => ({
        id: a.id,
        volunteer: {
          id: a.volunteer.id,
          displayName: a.volunteer.displayName,
        },
        ministry: { id: a.ministry.id, name: a.ministry.name },
        role: { id: a.role.id, name: a.role.name },
        window: {
          startsAtUtc: a.startsAtUtc.toISOString(),
          endsAtUtc: a.endsAtUtc.toISOString(),
        },
      })),
      roleCapacities: row.roleCapacities.map((c) => ({
        ministryId: c.ministryId,
        roleId: c.roleId,
        capacity: c.capacity,
      })),
    };
  }

  async editEvent(input: {
    eventId: string;
    title?: string;
    startsAtUtc?: string;
    endsAtUtc?: string;
    auth: AuthenticatedRequestContext;
  }) {
    await assertSchedulingWriteAllowed(input.auth);

    const hasTitle = input.title !== undefined;
    const hasStart = input.startsAtUtc !== undefined;
    const hasEnd = input.endsAtUtc !== undefined;
    if (!hasTitle && !hasStart && !hasEnd) {
      throw new BadRequestException({
        code: 'EVENT_EDIT_EMPTY',
        message: 'At least one field (title, startsAtUtc, endsAtUtc) is required.',
      });
    }

    const event = await this.prisma.event.findUnique({
      where: { id: input.eventId },
      include: { ministry: true, church: true },
    });
    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: 'Event not found.',
      });
    }

    if (event.cancelledAtUtc) {
      throw new BadRequestException({
        code: 'EVENT_ALREADY_CANCELLED',
        message: 'Event is already cancelled.',
      });
    }

    if (event.kind === 'PUBLIC') {
      try {
        await input.auth.assertAdminAccreditedForChurch(event.churchId);
      } catch (err) {
        if (
          err instanceof ForbiddenException &&
          (err.getResponse() as { code?: string }).code === 'ADMIN_NOT_ACCREDITED'
        ) {
          const volunteer = await input.auth.requireVolunteer();
          const leadership = await this.prisma.ministryLeader.findFirst({
            where: {
              volunteerId: volunteer.id,
              ministry: { churchId: event.churchId },
            },
          });
          if (leadership) {
            throw new ForbiddenException({
              code: 'LEADER_CANNOT_EDIT_PUBLIC_EVENT',
              message:
                'Only an Admin accredited for this Church may edit a Public event.',
            });
          }
        }
        throw err;
      }
    } else {
      try {
        await input.auth.assertLeaderCanActOnMinistry(event.ministryId!);
      } catch {
        await input.auth.assertAdminAccreditedForChurch(event.churchId);
      }
    }

    let trimmedTitle: string | undefined;
    if (hasTitle) {
      trimmedTitle = input.title!.trim();
      if (!trimmedTitle) {
        throw new BadRequestException({
          code: 'EVENT_TITLE_REQUIRED',
          message: 'Event title is required.',
        });
      }
      if (trimmedTitle.length > 200) {
        throw new BadRequestException({
          code: 'EVENT_TITLE_TOO_LONG',
          message: 'Event title must be 200 characters or fewer.',
        });
      }
    }

    let newStart: Date | undefined;
    let newEnd: Date | undefined;
    const isReschedule = hasStart || hasEnd;
    if (isReschedule) {
      newStart = hasStart
        ? this.parseInstant('startsAtUtc', input.startsAtUtc!)
        : event.startsAtUtc;
      newEnd = hasEnd
        ? this.parseInstant('endsAtUtc', input.endsAtUtc!)
        : event.endsAtUtc;
      if (!(newStart < newEnd)) {
        throw new BadRequestException({
          code: 'INVALID_EVENT_WINDOW',
          message: 'Event window must have startsAtUtc strictly before endsAtUtc.',
        });
      }
    }

    const now = this.clock.now();
    let voidedAssignmentCount = 0;

    const updateData: Record<string, unknown> = {};
    if (trimmedTitle !== undefined) updateData.title = trimmedTitle;
    if (newStart !== undefined) updateData.startsAtUtc = newStart;
    if (newEnd !== undefined) updateData.endsAtUtc = newEnd;

    if (isReschedule) {
      await this.prisma.$transaction(async (tx) => {
        const orphaned = await tx.assignment.findMany({
          where: {
            eventId: event.id,
            voidedAtUtc: null,
            OR: [
              { startsAtUtc: { lt: newStart } },
              { endsAtUtc: { gt: newEnd } },
            ],
          },
          select: { id: true },
        });
        if (orphaned.length > 0) {
          await tx.assignment.updateMany({
            where: { id: { in: orphaned.map((a) => a.id) } },
            data: { voidedAtUtc: now },
          });
          voidedAssignmentCount = orphaned.length;
        }
        await tx.event.update({
          where: { id: event.id },
          data: updateData,
        });
      });
    } else {
      await this.prisma.event.update({
        where: { id: event.id },
        data: updateData,
      });
    }

    const updated = await this.prisma.event.findUniqueOrThrow({
      where: { id: event.id },
    });

    return {
      id: updated.id,
      title: updated.title,
      kind: updated.kind,
      window: {
        startsAtUtc: updated.startsAtUtc.toISOString(),
        endsAtUtc: updated.endsAtUtc.toISOString(),
      },
      cancelledAtUtc: updated.cancelledAtUtc?.toISOString() ?? null,
      voidedAssignmentCount,
    };
  }

  async updateRoleCapacities(input: {
    eventId: string;
    ministryId: string;
    capacities: Array<{ roleId: string; capacity: number }>;
    auth: AuthenticatedRequestContext;
  }) {
    await assertSchedulingWriteAllowed(input.auth);

    if (!input.capacities.length) {
      throw new BadRequestException({
        code: 'ROLE_CAPACITIES_EMPTY',
        message: 'At least one role capacity update is required.',
      });
    }

    const event = await this.prisma.event.findUnique({
      where: { id: input.eventId },
    });
    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: 'Event not found.',
      });
    }
    if (event.cancelledAtUtc) {
      throw new BadRequestException({
        code: 'EVENT_ALREADY_CANCELLED',
        message: 'Cannot update capacities on a cancelled event.',
      });
    }

    if (event.kind === 'PRIVATE' && event.ministryId !== input.ministryId) {
      throw new BadRequestException({
        code: 'PRIVATE_EVENT_MINISTRY_MISMATCH',
        message: 'Private event capacities must use the event ministry.',
      });
    }

    try {
      await input.auth.assertLeaderCanActOnMinistry(input.ministryId);
    } catch {
      await input.auth.assertAdminAccreditedForChurch(event.churchId);
    }

    await assertMinistryAcceptsWrites(this.prisma, input.ministryId);

    const roleIds = input.capacities.map((row) => row.roleId);
    const roles = await this.prisma.ministryRole.findMany({
      where: { id: { in: roleIds }, ministryId: input.ministryId },
    });
    if (roles.length !== roleIds.length) {
      throw new BadRequestException({
        code: 'ROLE_NOT_IN_MINISTRY',
        message: 'Each role must belong to the ministry.',
      });
    }

    for (const row of input.capacities) {
      if (!Number.isInteger(row.capacity) || row.capacity < 1) {
        throw new BadRequestException({
          code: 'INVALID_ROLE_CAPACITY',
          message: 'Capacity must be an integer of at least 1.',
        });
      }
    }

    const filledCounts = await this.prisma.assignment.groupBy({
      by: ['roleId'],
      where: {
        eventId: input.eventId,
        ministryId: input.ministryId,
        roleId: { in: roleIds },
        voidedAtUtc: null,
      },
      _count: { _all: true },
    });
    const filledByRoleId = new Map(
      filledCounts.map((row) => [row.roleId, row._count._all]),
    );

    for (const row of input.capacities) {
      const filled = filledByRoleId.get(row.roleId) ?? 0;
      if (row.capacity < filled) {
        throw new BadRequestException({
          code: 'CAPACITY_BELOW_FILLED_SLOTS',
          message:
            'Capacity cannot be set below the number of active assignments for this role.',
        });
      }
    }

    await this.prisma.$transaction(async (tx) => {
      for (const row of input.capacities) {
        await tx.eventRoleCapacity.upsert({
          where: {
            eventId_ministryId_roleId: {
              eventId: input.eventId,
              ministryId: input.ministryId,
              roleId: row.roleId,
            },
          },
          create: {
            eventId: input.eventId,
            ministryId: input.ministryId,
            roleId: row.roleId,
            capacity: row.capacity,
          },
          update: { capacity: row.capacity },
        });
      }
    });

    const updated = await this.prisma.eventRoleCapacity.findMany({
      where: { eventId: input.eventId, ministryId: input.ministryId },
      orderBy: { roleId: 'asc' },
    });

    return {
      roleCapacities: updated.map((row) => ({
        roleId: row.roleId,
        capacity: row.capacity,
      })),
    };
  }

  async cancelEvent(input: {
    eventId: string;
    auth: AuthenticatedRequestContext;
  }) {
    await assertSchedulingWriteAllowed(input.auth);

    const event = await this.prisma.event.findUnique({
      where: { id: input.eventId },
    });
    if (!event) {
      throw new NotFoundException();
    }
    if (event.cancelledAtUtc) {
      throw new BadRequestException({
        code: 'EVENT_ALREADY_CANCELLED',
        message: 'Event is already cancelled.',
      });
    }

    await input.auth.assertAdminAccreditedForChurch(event.churchId);

    const now = this.clock.now();

    await this.prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: { id: event.id },
        data: { cancelledAtUtc: now },
      });
      await tx.assignment.updateMany({
        where: { eventId: event.id, voidedAtUtc: null },
        data: { voidedAtUtc: now },
      });
    });

    return {
      eventId: event.id,
      cancelledAtUtc: now.toISOString(),
    };
  }
}
