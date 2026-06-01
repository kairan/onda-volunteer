import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_LIST_LIMIT = 50;
const MAX_LIST_LIMIT = 100;

export type SystemAdminVolunteerSummary = {
  id: string;
  displayName: string;
  accreditations: { churchId: string; churchName: string }[];
  leaderships: {
    ministryId: string;
    ministryName: string;
    churchId: string;
    churchName: string;
  }[];
  memberships: {
    ministryId: string;
    ministryName: string;
    churchId: string;
    churchName: string;
    status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  }[];
};

export type SystemAdminVolunteerListPage = {
  items: SystemAdminVolunteerSummary[];
  nextCursor: string | null;
};

@Injectable()
export class SystemAdminVolunteersService {
  constructor(private readonly prisma: PrismaService) {}

  private toSummary(volunteer: {
    id: string;
    displayName: string;
    adminAccreditations: {
      churchId: string;
      church: { name: string };
    }[];
    ministryLeaderships: {
      ministryId: string;
      ministry: {
        name: string;
        churchId: string;
        church: { name: string };
      };
    }[];
    memberships: {
      ministryId: string;
      status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
      ministry: {
        name: string;
        churchId: string;
        church: { name: string };
      };
    }[];
  }): SystemAdminVolunteerSummary {
    return {
      id: volunteer.id,
      displayName: volunteer.displayName,
      accreditations: volunteer.adminAccreditations
        .map((row) => ({
          churchId: row.churchId,
          churchName: row.church.name,
        }))
        .sort((a, b) => a.churchName.localeCompare(b.churchName)),
      leaderships: volunteer.ministryLeaderships
        .map((row) => ({
          ministryId: row.ministryId,
          ministryName: row.ministry.name,
          churchId: row.ministry.churchId,
          churchName: row.ministry.church.name,
        }))
        .sort((a, b) => a.ministryName.localeCompare(b.ministryName)),
      memberships: volunteer.memberships
        .map((row) => ({
          ministryId: row.ministryId,
          ministryName: row.ministry.name,
          churchId: row.ministry.churchId,
          churchName: row.ministry.church.name,
          status: row.status,
        }))
        .sort((a, b) => a.ministryName.localeCompare(b.ministryName)),
    };
  }

  private volunteerInclude = {
    adminAccreditations: {
      include: { church: { select: { name: true } } },
    },
    ministryLeaderships: {
      include: {
        ministry: {
          include: { church: { select: { name: true } } },
        },
      },
    },
    memberships: {
      include: {
        ministry: {
          include: { church: { select: { name: true } } },
        },
      },
    },
  } as const;

  async list(input: {
    q?: string;
    limit?: number;
    cursor?: string;
  }): Promise<SystemAdminVolunteerListPage> {
    const q = input.q?.trim();
    const limit = Math.min(
      Math.max(input.limit ?? DEFAULT_LIST_LIMIT, 1),
      MAX_LIST_LIMIT,
    );
    const cursor = input.cursor?.trim() || undefined;

    const rows = await this.prisma.volunteer.findMany({
      where: {
        ...(q
          ? {
              OR: [
                { displayName: { contains: q, mode: 'insensitive' as const } },
                { id: { contains: q, mode: 'insensitive' as const } },
              ],
            }
          : {}),
        ...(cursor ? { id: { gt: cursor } } : {}),
      },
      orderBy: { id: 'asc' },
      take: limit + 1,
      include: this.volunteerInclude,
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;

    return {
      items: page.map((row) => this.toSummary(row)),
      nextCursor: hasMore ? page[page.length - 1]!.id : null,
    };
  }

  async getById(volunteerId: string): Promise<SystemAdminVolunteerSummary> {
    const volunteer = await this.prisma.volunteer.findUnique({
      where: { id: volunteerId },
      include: this.volunteerInclude,
    });
    if (!volunteer) {
      throw new NotFoundException({
        code: 'VOLUNTEER_NOT_FOUND',
        message: 'Volunteer not found.',
      });
    }
    return this.toSummary(volunteer);
  }
}
