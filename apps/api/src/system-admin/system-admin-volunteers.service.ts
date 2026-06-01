import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

@Injectable()
export class SystemAdminVolunteersService {
  constructor(private readonly prisma: PrismaService) {}

  async searchVolunteers(input: { q?: string; limit?: number }) {
    const limit = Math.min(
      Math.max(input.limit ?? DEFAULT_LIMIT, 1),
      MAX_LIMIT,
    );
    const q = input.q?.trim();

    const rows = await this.prisma.volunteer.findMany({
      where: q
        ? {
            OR: [
              { displayName: { contains: q, mode: 'insensitive' } },
              { id: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      take: limit,
      orderBy: { displayName: 'asc' },
      select: {
        id: true,
        displayName: true,
        adminAccreditations: {
          select: {
            churchId: true,
            church: { select: { id: true, name: true } },
          },
        },
        ministryLeaderships: {
          select: {
            ministryId: true,
            ministry: {
              select: { id: true, name: true, churchId: true },
            },
          },
        },
        memberships: {
          where: { status: { in: ['ACTIVE', 'PENDING'] } },
          select: {
            status: true,
            ministry: {
              select: { id: true, name: true, churchId: true },
            },
          },
        },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      displayName: row.displayName,
      adminAccreditations: row.adminAccreditations.map((a) => ({
        churchId: a.churchId,
        churchName: a.church.name,
      })),
      leaderships: row.ministryLeaderships.map((l) => ({
        ministryId: l.ministryId,
        ministryName: l.ministry.name,
        churchId: l.ministry.churchId,
      })),
      memberships: row.memberships.map((m) => ({
        ministryId: m.ministry.id,
        ministryName: m.ministry.name,
        churchId: m.ministry.churchId,
        status: m.status,
      })),
    }));
  }

  async getVolunteer(volunteerId: string) {
    const row = await this.prisma.volunteer.findUnique({
      where: { id: volunteerId },
      select: {
        id: true,
        displayName: true,
        authSubjectId: true,
        adminAccreditations: {
          select: {
            churchId: true,
            church: { select: { id: true, name: true } },
          },
        },
        ministryLeaderships: {
          select: {
            ministryId: true,
            ministry: {
              select: { id: true, name: true, churchId: true },
            },
          },
        },
        memberships: {
          select: {
            status: true,
            ministry: {
              select: { id: true, name: true, churchId: true },
            },
          },
        },
      },
    });
    if (!row) {
      throw new NotFoundException({
        code: 'VOLUNTEER_NOT_FOUND',
        message: 'Volunteer not found.',
      });
    }
    return {
      id: row.id,
      displayName: row.displayName,
      authSubjectId: row.authSubjectId,
      adminAccreditations: row.adminAccreditations.map((a) => ({
        churchId: a.churchId,
        churchName: a.church.name,
      })),
      leaderships: row.ministryLeaderships.map((l) => ({
        ministryId: l.ministryId,
        ministryName: l.ministry.name,
        churchId: l.ministry.churchId,
      })),
      memberships: row.memberships.map((m) => ({
        ministryId: m.ministry.id,
        ministryName: m.ministry.name,
        churchId: m.ministry.churchId,
        status: m.status,
      })),
    };
  }

  async grantAdminAccreditation(input: {
    volunteerId: string;
    churchId: string;
  }) {
    const church = await this.prisma.church.findUnique({
      where: { id: input.churchId },
    });
    if (!church) {
      throw new NotFoundException({
        code: 'CHURCH_NOT_FOUND',
        message: 'Church not found.',
      });
    }
    const volunteer = await this.prisma.volunteer.findUnique({
      where: { id: input.volunteerId },
    });
    if (!volunteer) {
      throw new NotFoundException({
        code: 'VOLUNTEER_NOT_FOUND',
        message: 'Volunteer not found.',
      });
    }

    await this.prisma.adminAccreditation.upsert({
      where: {
        volunteerId_churchId: {
          volunteerId: input.volunteerId,
          churchId: input.churchId,
        },
      },
      create: {
        volunteerId: input.volunteerId,
        churchId: input.churchId,
      },
      update: {},
    });

    return {
      volunteerId: input.volunteerId,
      churchId: input.churchId,
    };
  }

  async revokeAdminAccreditation(input: {
    volunteerId: string;
    churchId: string;
  }) {
    const existing = await this.prisma.adminAccreditation.findUnique({
      where: {
        volunteerId_churchId: {
          volunteerId: input.volunteerId,
          churchId: input.churchId,
        },
      },
    });
    if (!existing) {
      throw new NotFoundException({
        code: 'ADMIN_ACCREDITATION_NOT_FOUND',
        message: 'Admin accreditation not found.',
      });
    }

    const adminCount = await this.prisma.adminAccreditation.count({
      where: { churchId: input.churchId },
    });
    if (adminCount <= 1) {
      throw new BadRequestException({
        code: 'LAST_ADMIN_ACCREDITATION',
        message:
          'Cannot revoke the last Admin accreditation for this Church. Grant another Admin first.',
      });
    }

    await this.prisma.adminAccreditation.delete({
      where: { id: existing.id },
    });

    return {
      volunteerId: input.volunteerId,
      churchId: input.churchId,
    };
  }
}
