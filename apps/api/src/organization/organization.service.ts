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
    ) => {
      const existing = entry.ministries.get(ministry.id);
      if (existing) {
        if (membershipStatus) {
          existing.membershipStatus = membershipStatus;
        }
        return;
      }
      entry.ministries.set(ministry.id, {
        id: ministry.id,
        name: ministry.name,
        membershipStatus,
      });
    };

    for (const membership of memberships) {
      const entry = ensureChurch(membership.ministry.church);
      addMinistry(entry, membership.ministry, membership.status);
    }

    for (const leadership of leaderships) {
      const entry = ensureChurch(leadership.ministry.church);
      addMinistry(entry, leadership.ministry);
    }

    for (const accreditation of accreditations) {
      const entry = ensureChurch(accreditation.church);
      for (const ministry of accreditation.church.ministries) {
        addMinistry(entry, ministry);
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
