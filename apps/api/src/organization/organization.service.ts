import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CLOCK, type Clock } from '../common/clock';
import { IdentityService } from '../identity/identity.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly identity: IdentityService,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async getAccessibleOrganizationContext(input: {
    authorizationHeader: string | undefined;
    devVolunteerIdHeader: string | undefined;
  }) {
    const volunteer = await this.identity.requireVolunteer({
      authorizationHeader: input.authorizationHeader,
      devVolunteerIdHeader: input.devVolunteerIdHeader,
    });

    const [memberships, leaderships, accreditations] = await Promise.all([
      this.prisma.ministryMembership.findMany({
        where: { volunteerId: volunteer.id },
        include: {
          ministry: {
            include: {
              church: { include: { campuses: true } },
            },
          },
        },
      }),
      this.prisma.ministryLeader.findMany({
        where: { volunteerId: volunteer.id },
        include: {
          ministry: {
            include: {
              church: { include: { campuses: true } },
            },
          },
        },
      }),
      this.prisma.adminAccreditation.findMany({
        where: { volunteerId: volunteer.id },
        include: {
          church: {
            include: { campuses: true, ministries: true },
          },
        },
      }),
    ]);

    type MinistryEntry = {
      id: string;
      name: string;
      membershipStatus?: 'PENDING' | 'ACTIVE' | 'INACTIVE';
      isLeader?: boolean;
    };

    type ChurchAccumulator = {
      id: string;
      name: string;
      defaultTimezone: string;
      campuses: Map<string, { id: string; name: string; timezone: string }>;
      ministries: Map<string, MinistryEntry>;
    };

    const churches = new Map<string, ChurchAccumulator>();

    const ensureChurch = (church: {
      id: string;
      name: string;
      defaultTimezone: string;
      campuses: { id: string; name: string; timezone: string }[];
    }) => {
      let entry = churches.get(church.id);
      if (!entry) {
        entry = {
          id: church.id,
          name: church.name,
          defaultTimezone: church.defaultTimezone,
          campuses: new Map(),
          ministries: new Map(),
        };
        churches.set(church.id, entry);
      }
      for (const campus of church.campuses) {
        entry.campuses.set(campus.id, {
          id: campus.id,
          name: campus.name,
          timezone: campus.timezone,
        });
      }
      return entry;
    };

    const addMinistry = (
      entry: ChurchAccumulator,
      ministry: { id: string; name: string },
      membershipStatus?: 'PENDING' | 'ACTIVE' | 'INACTIVE',
      isLeader = false,
    ) => {
      const existing = entry.ministries.get(ministry.id);
      if (existing) {
        if (membershipStatus) {
          existing.membershipStatus = membershipStatus;
        }
        if (isLeader) {
          existing.isLeader = true;
        }
        return;
      }
      entry.ministries.set(ministry.id, {
        id: ministry.id,
        name: ministry.name,
        membershipStatus,
        ...(isLeader ? { isLeader: true } : {}),
      });
    };

    for (const membership of memberships) {
      const entry = ensureChurch(membership.ministry.church);
      addMinistry(entry, membership.ministry, membership.status);
    }

    for (const leadership of leaderships) {
      const entry = ensureChurch(leadership.ministry.church);
      addMinistry(entry, leadership.ministry, undefined, true);
    }

    for (const accreditation of accreditations) {
      const entry = ensureChurch(accreditation.church);
      for (const ministry of accreditation.church.ministries) {
        addMinistry(entry, ministry, undefined, true);
      }
    }

    return {
      churches: [...churches.values()]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((church) => ({
          id: church.id,
          name: church.name,
          defaultTimezone: church.defaultTimezone,
          campuses: [...church.campuses.values()].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
          ministries: [...church.ministries.values()].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        })),
    };
  }

  async listMinistryMemberships(input: {
    ministryId: string;
    authorizationHeader: string | undefined;
    leaderMinistryIdHeader: string | undefined;
  }) {
    await this.identity.assertLeaderCanActOnMinistry({
      authorizationHeader: input.authorizationHeader,
      devLeaderMinistryIdHeader: input.leaderMinistryIdHeader,
      ministryId: input.ministryId,
    });

    const memberships = await this.prisma.ministryMembership.findMany({
      where: {
        ministryId: input.ministryId,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
      include: {
        volunteer: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        volunteer: { displayName: 'asc' },
      },
    });

    return memberships.map((row) => ({
      volunteerId: row.volunteer.id,
      displayName: row.volunteer.displayName,
      status: row.status,
    }));
  }

  async listMinistryLeaders(input: {
    ministryId: string;
    authorizationHeader: string | undefined;
    devVolunteerIdHeader: string | undefined;
  }) {
    const ministry = await this.prisma.ministry.findUnique({
      where: { id: input.ministryId },
      select: { churchId: true },
    });
    if (!ministry) {
      throw new NotFoundException();
    }
    await this.identity.assertAdminAccreditedForChurch({
      authorizationHeader: input.authorizationHeader,
      devVolunteerIdHeader: input.devVolunteerIdHeader,
      churchId: ministry.churchId,
    });

    const rows = await this.prisma.ministryLeader.findMany({
      where: { ministryId: input.ministryId },
      include: { volunteer: { select: { id: true, displayName: true } } },
      orderBy: { volunteer: { displayName: 'asc' } },
    });

    return rows.map((row) => ({
      volunteerId: row.volunteer.id,
      displayName: row.volunteer.displayName,
    }));
  }

  async grantMinistryLeader(input: {
    ministryId: string;
    volunteerId: string;
    authorizationHeader: string | undefined;
    devVolunteerIdHeader: string | undefined;
  }) {
    const ministry = await this.prisma.ministry.findUnique({
      where: { id: input.ministryId },
    });
    if (!ministry) {
      throw new NotFoundException();
    }
    await this.identity.assertAdminAccreditedForChurch({
      authorizationHeader: input.authorizationHeader,
      devVolunteerIdHeader: input.devVolunteerIdHeader,
      churchId: ministry.churchId,
    });

    const volunteer = await this.prisma.volunteer.findUnique({
      where: { id: input.volunteerId },
    });
    if (!volunteer) {
      throw new NotFoundException({
        code: 'VOLUNTEER_NOT_FOUND',
        message: 'Volunteer not found.',
      });
    }

    await this.prisma.ministryLeader.upsert({
      where: {
        volunteerId_ministryId: {
          volunteerId: input.volunteerId,
          ministryId: input.ministryId,
        },
      },
      create: {
        volunteerId: input.volunteerId,
        ministryId: input.ministryId,
      },
      update: {},
    });

    return {
      volunteerId: input.volunteerId,
      ministryId: input.ministryId,
    };
  }

  async revokeMinistryLeader(input: {
    ministryId: string;
    volunteerId: string;
    authorizationHeader: string | undefined;
    devVolunteerIdHeader: string | undefined;
  }) {
    const ministry = await this.prisma.ministry.findUnique({
      where: { id: input.ministryId },
    });
    if (!ministry) {
      throw new NotFoundException();
    }
    await this.identity.assertAdminAccreditedForChurch({
      authorizationHeader: input.authorizationHeader,
      devVolunteerIdHeader: input.devVolunteerIdHeader,
      churchId: ministry.churchId,
    });

    await this.prisma.ministryLeader.deleteMany({
      where: {
        volunteerId: input.volunteerId,
        ministryId: input.ministryId,
      },
    });

    return {
      volunteerId: input.volunteerId,
      ministryId: input.ministryId,
    };
  }

  async deactivateMinistryMembership(input: {
    ministryId: string;
    volunteerId: string;
    authorizationHeader: string | undefined;
    leaderMinistryIdHeader: string | undefined;
  }) {
    await this.identity.assertLeaderCanActOnMinistry({
      authorizationHeader: input.authorizationHeader,
      devLeaderMinistryIdHeader: input.leaderMinistryIdHeader,
      ministryId: input.ministryId,
    });

    const membership = await this.prisma.ministryMembership.findUnique({
      where: {
        volunteerId_ministryId: {
          volunteerId: input.volunteerId,
          ministryId: input.ministryId,
        },
      },
    });
    if (!membership) {
      throw new NotFoundException();
    }
    if (membership.status !== 'ACTIVE') {
      throw new BadRequestException({
        code: 'MEMBERSHIP_NOT_ACTIVE',
        message: 'Only Active ministry membership can be deactivated.',
      });
    }

    const now = this.clock.now();

    await this.prisma.$transaction(async (tx) => {
      await tx.ministryMembership.update({
        where: { id: membership.id },
        data: { status: 'INACTIVE' },
      });

      const assignments = await tx.assignment.findMany({
        where: {
          volunteerId: input.volunteerId,
          ministryId: input.ministryId,
          voidedAtUtc: null,
        },
        include: { event: true },
      });

      for (const assignment of assignments) {
        if (assignment.event.endsAtUtc > now) {
          await tx.assignment.update({
            where: { id: assignment.id },
            data: { voidedAtUtc: now },
          });
        }
      }
    });

    return {
      volunteerId: input.volunteerId,
      ministryId: input.ministryId,
      status: 'INACTIVE' as const,
    };
  }
}
