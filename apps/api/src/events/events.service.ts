import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { DateTime } from 'luxon';
import { PrismaService } from '../prisma/prisma.service';
import { IdentityService } from '../identity/identity.service';
import { CLOCK, type Clock } from '../common/clock';

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
    voidedAtUtc: string | null;
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

export type GetEventsInput = {
  churchId: string;
  authorizationHeader: string | undefined;
  devVolunteerIdHeader: string | undefined;
};

export type CreateEventInput = {
  kind: 'PUBLIC' | 'PRIVATE';
  title: string;
  startsAtUtc: string;
  endsAtUtc: string;
  churchId: string;
  ministryId?: string;
  authorizationHeader: string | undefined;
  devVolunteerIdHeader: string | undefined;
};

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly identity: IdentityService,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async cancelEvent(input: {
    eventId: string;
    authorizationHeader: string | undefined;
    devVolunteerIdHeader: string | undefined;
  }) {
    const event = await this.prisma.event.findUnique({
      where: { id: input.eventId },
      select: { churchId: true },
    });
    if (!event) {
      throw new NotFoundException();
    }

    await this.identity.assertAdminCanActOnChurch({
      authorizationHeader: input.authorizationHeader,
      devVolunteerIdHeader: input.devVolunteerIdHeader,
      churchId: event.churchId,
    });

    const now = this.clock.now();

    await this.prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: { id: input.eventId },
        data: { voidedAtUtc: now },
      });

      await tx.assignment.updateMany({
        where: { eventId: input.eventId, voidedAtUtc: null },
        data: { voidedAtUtc: now },
      });
    });
  }

  async createEvent(input: CreateEventInput) {
    if (input.kind === 'PUBLIC') {
      await this.identity.assertAdminCanActOnChurch({
        authorizationHeader: input.authorizationHeader,
        devVolunteerIdHeader: input.devVolunteerIdHeader,
        churchId: input.churchId,
      });
    } else {
      if (!input.ministryId) {
        throw new BadRequestException({
          code: 'MINISTRY_ID_REQUIRED',
          message: 'Private events must be owned by a ministry.',
        });
      }
      // Accredited Admin or Leader of the ministry
      try {
        await this.identity.assertAdminCanActOnChurch({
          authorizationHeader: input.authorizationHeader,
          devVolunteerIdHeader: input.devVolunteerIdHeader,
          churchId: input.churchId,
        });
      } catch {
        await this.identity.assertLeaderCanActOnMinistry({
          authorizationHeader: input.authorizationHeader,
          devLeaderMinistryIdHeader: input.devVolunteerIdHeader,
          ministryId: input.ministryId,
        });
      }
    }

    return this.prisma.event.create({
      data: {
        kind: input.kind,
        title: input.title,
        startsAtUtc: new Date(input.startsAtUtc),
        endsAtUtc: new Date(input.endsAtUtc),
        churchId: input.churchId,
        ministryId: input.ministryId,
      },
    });
  }

  async getEvents(input: GetEventsInput) {
    const volunteer = await this.identity.requireVolunteer({
      authorizationHeader: input.authorizationHeader,
      devVolunteerIdHeader: input.devVolunteerIdHeader,
    });

    const [memberships, leaderships, accreditations] = await Promise.all([
      this.prisma.ministryMembership.findMany({
        where: { volunteerId: volunteer.id, status: 'ACTIVE' },
        select: { ministryId: true },
      }),
      this.prisma.ministryLeader.findMany({
        where: { volunteerId: volunteer.id },
        select: { ministryId: true },
      }),
      this.prisma.adminAccreditation.findMany({
        where: { volunteerId: volunteer.id, churchId: input.churchId },
      }),
    ]);

    const myMinistryIds = [
      ...new Set([
        ...memberships.map((m) => m.ministryId),
        ...leaderships.map((l) => l.ministryId),
      ]),
    ];
    const isAdmin = accreditations.length > 0;

    return this.prisma.event.findMany({
      where: {
        churchId: input.churchId,
        OR: [
          { kind: 'PUBLIC' },
          isAdmin
            ? { kind: 'PRIVATE' }
            : { kind: 'PRIVATE', ministryId: { in: myMinistryIds } },
        ],
      },
      include: {
        ministry: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { startsAtUtc: 'asc' },
    });
  }

  async getEventDetail(id: string): Promise<EventDetailResponse> {
    const row = await this.prisma.event.findUnique({
      where: { id },
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

    const zone = row.church.defaultTimezone;
    const startsDisplayInChurchTz = DateTime.fromJSDate(row.startsAtUtc, {
      zone: 'utc',
    })
      .setZone(zone)
      .toISO({ suppressMilliseconds: true, includeOffset: true });

    const endsDisplayInChurchTz = DateTime.fromJSDate(row.endsAtUtc, {
      zone: 'utc',
    })
      .setZone(zone)
      .toISO({ suppressMilliseconds: true, includeOffset: true });

    if (!startsDisplayInChurchTz || !endsDisplayInChurchTz) {
      throw new NotFoundException();
    }

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
        voidedAtUtc: row.voidedAtUtc ? row.voidedAtUtc.toISOString() : null,
        window: {
          startsAtUtc: row.startsAtUtc.toISOString(),
          endsAtUtc: row.endsAtUtc.toISOString(),
        },
        framing: {
          churchDefaultTimezone: zone,
          startsDisplayInChurchTz,
          endsDisplayInChurchTz,
        },
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
