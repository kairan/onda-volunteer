import { Injectable, NotFoundException } from '@nestjs/common';
import { DateTime } from 'luxon';
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
};

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async getEventDetail(id: string): Promise<EventDetailResponse> {
    const row = await this.prisma.event.findUnique({
      where: { id },
      include: {
        church: true,
        ministry: true,
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
    };
  }
}
