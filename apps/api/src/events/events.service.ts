import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DateTime } from 'luxon';
import { IdentityService } from '../identity/identity.service';
import { PrismaService } from '../prisma/prisma.service';

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

type ChurchEventAccess = {
  isAdmin: boolean;
  accessibleMinistryIds: string[];
};

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly identity: IdentityService,
  ) {}

  private async churchEventAccess(
    volunteerId: string,
    churchId: string,
  ): Promise<ChurchEventAccess> {
    const [memberships, leaderships, accreditations] = await Promise.all([
      this.prisma.ministryMembership.findMany({
        where: {
          volunteerId,
          ministry: { churchId },
        },
        select: { ministryId: true },
      }),
      this.prisma.ministryLeader.findMany({
        where: {
          volunteerId,
          ministry: { churchId },
        },
        select: { ministryId: true },
      }),
      this.prisma.adminAccreditation.findMany({
        where: {
          volunteerId,
          churchId,
        },
      }),
    ]);

    return {
      isAdmin: accreditations.length > 0,
      accessibleMinistryIds: [
        ...new Set([
          ...memberships.map((row) => row.ministryId),
          ...leaderships.map((row) => row.ministryId),
        ]),
      ],
    };
  }

  private canViewEvent(
    event: { kind: 'PUBLIC' | 'PRIVATE'; ministryId: string | null },
    access: ChurchEventAccess,
  ): boolean {
    if (event.kind === 'PUBLIC') {
      return true;
    }
    if (access.isAdmin) {
      return true;
    }
    if (
      event.ministryId &&
      access.accessibleMinistryIds.includes(event.ministryId)
    ) {
      return true;
    }
    return false;
  }

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

  async createPublicEvent(input: {
    churchId: string;
    title: string;
    startsAtUtc: string;
    endsAtUtc: string;
    authorizationHeader: string | undefined;
    devVolunteerIdHeader: string | undefined;
  }) {
    await this.identity.assertAdminAccreditedForChurch({
      authorizationHeader: input.authorizationHeader,
      devVolunteerIdHeader: input.devVolunteerIdHeader,
      churchId: input.churchId,
    });

    const title = input.title?.trim();
    if (!title) {
      throw new BadRequestException({
        code: 'TITLE_REQUIRED',
        message: 'Event title is required.',
      });
    }

    const startsAtUtc = this.parseInstant('startsAtUtc', input.startsAtUtc);
    const endsAtUtc = this.parseInstant('endsAtUtc', input.endsAtUtc);
    if (!(startsAtUtc < endsAtUtc)) {
      throw new BadRequestException({
        code: 'INVALID_EVENT_WINDOW',
        message: 'Event window must have startsAtUtc strictly before endsAtUtc.',
      });
    }

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
      include: { church: true },
    });

    return {
      id: row.id,
      kind: row.kind,
      title: row.title,
      window: {
        startsAtUtc: row.startsAtUtc.toISOString(),
        endsAtUtc: row.endsAtUtc.toISOString(),
      },
      framing: churchFraming(
        row.startsAtUtc,
        row.endsAtUtc,
        row.church.defaultTimezone,
      ),
      ministry: null,
    };
  }

  async listEvents(input: {
    churchId: string | undefined;
    authorizationHeader: string | undefined;
    volunteerIdHeader: string | undefined;
  }) {
    const volunteer = await this.identity.requireVolunteer({
      authorizationHeader: input.authorizationHeader,
      devVolunteerIdHeader: input.volunteerIdHeader,
    });

    if (!input.churchId) {
      throw new BadRequestException({
        code: 'CHURCH_ID_REQUIRED',
        message: 'churchId query parameter is required.',
      });
    }

    const access = await this.churchEventAccess(volunteer.id, input.churchId);

    const visibilityOr: Array<
      | { kind: 'PUBLIC' }
      | { kind: 'PRIVATE' }
      | { kind: 'PRIVATE'; ministryId: { in: string[] } }
    > = [{ kind: 'PUBLIC' }];

    if (access.isAdmin) {
      visibilityOr.push({ kind: 'PRIVATE' });
    } else if (access.accessibleMinistryIds.length > 0) {
      visibilityOr.push({
        kind: 'PRIVATE',
        ministryId: { in: access.accessibleMinistryIds },
      });
    }

    const rows = await this.prisma.event.findMany({
      where: {
        churchId: input.churchId,
        OR: visibilityOr,
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
    authorizationHeader: string | undefined;
    volunteerIdHeader: string | undefined;
  }): Promise<EventDetailResponse> {
    const volunteer = await this.identity.requireVolunteer({
      authorizationHeader: input.authorizationHeader,
      devVolunteerIdHeader: input.volunteerIdHeader,
    });

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

    const access = await this.churchEventAccess(volunteer.id, row.churchId);
    if (!this.canViewEvent(row, access)) {
      throw new NotFoundException();
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
}
