import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CLOCK, type Clock } from '../common/clock';
import { DateTime } from 'luxon';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { PrismaService } from '../prisma/prisma.service';
import { StewardshipService } from '../organization/stewardship.service';
import { assertSchedulingWriteAllowed } from '../scheduling/scheduling-write.guard';

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

    return this.toEventListItem(row);
  }

  private toEventListItem(row: {
    id: string;
    kind: 'PUBLIC' | 'PRIVATE';
    title: string;
    startsAtUtc: Date;
    endsAtUtc: Date;
    church: { defaultTimezone: string };
    ministry: { id: string; name: string } | null;
  }): EventListItem {
    return {
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
  }

  async listEvents(input: {
    churchId: string | undefined;
    auth: AuthenticatedRequestContext;
  }) {
    const volunteer = await input.auth.requireVolunteer();
    const systemAdmin = await input.auth.isSystemAdmin();

    if (!systemAdmin && !input.churchId) {
      throw new BadRequestException({
        code: 'CHURCH_ID_REQUIRED',
        message: 'churchId query parameter is required.',
      });
    }

    let visibilityOr: Array<
      | { kind: 'PUBLIC' }
      | { kind: 'PRIVATE' }
      | { kind: 'PRIVATE'; ministryId: { in: string[] } }
    > | undefined;

    if (!systemAdmin) {
      const stewardship = await this.stewardship.getChurchStewardship(
        volunteer.id,
        input.churchId!,
      );

      visibilityOr = [{ kind: 'PUBLIC' }];
      if (stewardship.isAccreditedAdmin) {
        visibilityOr.push({ kind: 'PRIVATE' });
      } else if (stewardship.accessibleMinistryIds.length > 0) {
        visibilityOr.push({
          kind: 'PRIVATE',
          ministryId: { in: stewardship.accessibleMinistryIds },
        });
      }
    }

    const rows = await this.prisma.event.findMany({
      where: {
        ...(input.churchId ? { churchId: input.churchId } : {}),
        cancelledAtUtc: null,
        ...(visibilityOr ? { OR: visibilityOr } : {}),
      },
      include: {
        church: true,
        ministry: true,
      },
      orderBy: { startsAtUtc: 'asc' },
    });

    return rows.map((row) => ({
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
    }));
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
      },
    });

    if (!row) {
      throw new NotFoundException();
    }

    const systemAdmin = await input.auth.isSystemAdmin();
    if (!systemAdmin) {
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
    };
  }

  async cancelEvent(input: {
    eventId: string;
    auth: AuthenticatedRequestContext;
  }) {
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

    await assertSchedulingWriteAllowed(input.auth);
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
