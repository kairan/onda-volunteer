import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CLOCK, type Clock } from '../common/clock';
import { parseIanaTimezone } from '../common/iana-timezone';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { PrismaService } from '../prisma/prisma.service';
import { StewardshipService } from './stewardship.service';

type OrganizationActorOptions = {
  asSystemAdmin?: boolean;
};

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stewardship: StewardshipService,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async getAccessibleOrganizationContext(auth: AuthenticatedRequestContext) {
    const volunteer = await auth.requireVolunteer();
    const [memberships, leaderships, accreditations] =
      await this.stewardship.loadOrganizationRelations(volunteer.id);

    type MinistryEntry = {
      id: string;
      name: string;
      membershipStatus?: 'PENDING' | 'ACTIVE' | 'INACTIVE';
      isLeader?: boolean;
      isChurchAdmin?: boolean;
    };

    type ChurchAccumulator = {
      id: string;
      name: string;
      defaultTimezone: string;
      isAccreditedAdmin: boolean;
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
          isAccreditedAdmin: false,
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
      isChurchAdmin = false,
    ) => {
      const existing = entry.ministries.get(ministry.id);
      if (existing) {
        if (membershipStatus) {
          existing.membershipStatus = membershipStatus;
        }
        if (isLeader) {
          existing.isLeader = true;
        }
        if (isChurchAdmin) {
          existing.isChurchAdmin = true;
        }
        return;
      }
      entry.ministries.set(ministry.id, {
        id: ministry.id,
        name: ministry.name,
        membershipStatus,
        ...(isLeader ? { isLeader: true } : {}),
        ...(isChurchAdmin ? { isChurchAdmin: true } : {}),
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
      entry.isAccreditedAdmin = true;
      for (const ministry of accreditation.church.ministries) {
        addMinistry(entry, ministry, undefined, false, true);
      }
    }

    return {
      churches: [...churches.values()]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((church) => ({
          id: church.id,
          name: church.name,
          defaultTimezone: church.defaultTimezone,
          isAccreditedAdmin: church.isAccreditedAdmin,
          campuses: [...church.campuses.values()].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
          ministries: [...church.ministries.values()].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        })),
    };
  }

  private async ministryChurchId(ministryId: string): Promise<string> {
    const ministry = await this.prisma.ministry.findUnique({
      where: { id: ministryId },
      select: { churchId: true },
    });
    if (!ministry) {
      throw new NotFoundException();
    }
    return ministry.churchId;
  }

  private ministryNameConflict(): BadRequestException {
    return new BadRequestException({
      code: 'MINISTRY_NAME_CONFLICT',
      message: 'A ministry with this name already exists in this Church.',
    });
  }

  private rethrowMinistryNameConflict(err: unknown): never {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw this.ministryNameConflict();
    }
    throw err;
  }

  private async assertUniqueMinistryName(input: {
    churchId: string;
    name: string;
    excludeMinistryId?: string;
  }) {
    const duplicate = await this.prisma.ministry.findFirst({
      where: {
        churchId: input.churchId,
        name: { equals: input.name, mode: 'insensitive' },
        ...(input.excludeMinistryId
          ? { NOT: { id: input.excludeMinistryId } }
          : {}),
      },
    });
    if (duplicate) {
      throw this.ministryNameConflict();
    }
  }

  private parseMinistryName(name: string | undefined): string {
    const parsed = name?.trim();
    if (!parsed) {
      throw new BadRequestException({
        code: 'MINISTRY_NAME_REQUIRED',
        message: 'Ministry name is required.',
      });
    }
    return parsed;
  }

  private parseChurchName(name: string | undefined): string {
    const parsed = name?.trim();
    if (!parsed) {
      throw new BadRequestException({
        code: 'CHURCH_NAME_REQUIRED',
        message: 'Church name is required.',
      });
    }
    return parsed;
  }

  private async assertChurchAdminActor(
    auth: AuthenticatedRequestContext,
    churchId: string,
    options?: OrganizationActorOptions,
  ): Promise<void> {
    if (options?.asSystemAdmin) {
      await auth.assertSystemAdmin();
      return;
    }
    await auth.assertAdminAccreditedForChurch(churchId);
  }

  private async assertLeaderOrSystemAdmin(
    auth: AuthenticatedRequestContext,
    ministryId: string,
    options?: OrganizationActorOptions,
  ): Promise<void> {
    if (options?.asSystemAdmin) {
      await auth.assertSystemAdmin();
      return;
    }
    await auth.assertLeaderCanActOnMinistry(ministryId);
  }

  async updateChurchMetadata(input: {
    churchId: string;
    name?: string;
    defaultTimezone?: string;
    auth: AuthenticatedRequestContext;
  }) {
    await input.auth.assertAdminAccreditedForChurch(input.churchId);

    const church = await this.prisma.church.findUnique({
      where: { id: input.churchId },
    });
    if (!church) {
      throw new NotFoundException({
        code: 'CHURCH_NOT_FOUND',
        message: 'Church not found.',
      });
    }

    const data: { name?: string; defaultTimezone?: string } = {};
    if (input.name !== undefined) {
      data.name = this.parseChurchName(input.name);
    }
    if (input.defaultTimezone !== undefined) {
      data.defaultTimezone = parseIanaTimezone(
        input.defaultTimezone,
        'defaultTimezone',
      );
    }
    if (Object.keys(data).length === 0) {
      throw new BadRequestException({
        code: 'CHURCH_UPDATE_EMPTY',
        message: 'Provide name and/or defaultTimezone to update.',
      });
    }

    const updated = await this.prisma.church.update({
      where: { id: input.churchId },
      data,
    });

    return {
      id: updated.id,
      name: updated.name,
      defaultTimezone: updated.defaultTimezone,
    };
  }

  async createMinistry(input: {
    churchId: string;
    name: string | undefined;
    auth: AuthenticatedRequestContext;
  }) {
    const church = await this.prisma.church.findUnique({
      where: { id: input.churchId },
      select: { id: true },
    });
    if (!church) {
      throw new NotFoundException();
    }

    await input.auth.assertAdminAccreditedForChurch(input.churchId);
    const name = this.parseMinistryName(input.name);
    await this.assertUniqueMinistryName({ churchId: input.churchId, name });

    let ministry;
    try {
      ministry = await this.prisma.ministry.create({
        data: { churchId: input.churchId, name },
      });
    } catch (err) {
      this.rethrowMinistryNameConflict(err);
    }

    return {
      id: ministry.id,
      churchId: ministry.churchId,
      name: ministry.name,
    };
  }

  async renameMinistry(input: {
    ministryId: string;
    name: string | undefined;
    auth: AuthenticatedRequestContext;
  }) {
    const ministry = await this.prisma.ministry.findUnique({
      where: { id: input.ministryId },
    });
    if (!ministry) {
      throw new NotFoundException();
    }

    await input.auth.assertAdminAccreditedForChurch(ministry.churchId);
    const name = this.parseMinistryName(input.name);
    await this.assertUniqueMinistryName({
      churchId: ministry.churchId,
      name,
      excludeMinistryId: ministry.id,
    });

    let updated;
    try {
      updated = await this.prisma.ministry.update({
        where: { id: ministry.id },
        data: { name },
      });
    } catch (err) {
      this.rethrowMinistryNameConflict(err);
    }

    return {
      id: updated.id,
      churchId: updated.churchId,
      name: updated.name,
    };
  }

  async addMinistryMembership(input: {
    ministryId: string;
    volunteerId: string;
    status: 'PENDING' | 'ACTIVE';
    auth: AuthenticatedRequestContext;
    asSystemAdmin?: boolean;
  }) {
    const churchId = await this.ministryChurchId(input.ministryId);
    await this.assertChurchAdminActor(input.auth, churchId, {
      asSystemAdmin: input.asSystemAdmin,
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

    const existing = await this.prisma.ministryMembership.findUnique({
      where: {
        volunteerId_ministryId: {
          volunteerId: input.volunteerId,
          ministryId: input.ministryId,
        },
      },
    });
    if (existing) {
      if (existing.status === 'INACTIVE') {
        const row = await this.prisma.ministryMembership.update({
          where: { id: existing.id },
          data: { status: input.status },
        });
        return {
          volunteerId: row.volunteerId,
          ministryId: row.ministryId,
          status: row.status,
        };
      }
      throw new BadRequestException({
        code: 'MEMBERSHIP_EXISTS',
        message: 'Volunteer already has membership for this ministry.',
      });
    }

    const row = await this.prisma.ministryMembership.create({
      data: {
        volunteerId: input.volunteerId,
        ministryId: input.ministryId,
        status: input.status,
      },
    });

    return {
      volunteerId: row.volunteerId,
      ministryId: row.ministryId,
      status: row.status,
    };
  }

  async activateMinistryMembership(input: {
    ministryId: string;
    volunteerId: string;
    auth: AuthenticatedRequestContext;
    asSystemAdmin?: boolean;
  }) {
    const churchId = await this.ministryChurchId(input.ministryId);
    await this.assertChurchAdminActor(input.auth, churchId, {
      asSystemAdmin: input.asSystemAdmin,
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
    if (membership.status !== 'PENDING') {
      throw new BadRequestException({
        code: 'MEMBERSHIP_NOT_PENDING',
        message: 'Only Pending ministry membership can be activated.',
      });
    }

    const row = await this.prisma.ministryMembership.update({
      where: { id: membership.id },
      data: { status: 'ACTIVE' },
    });

    return {
      volunteerId: row.volunteerId,
      ministryId: row.ministryId,
      status: row.status,
    };
  }

  async listMinistryMemberships(input: {
    ministryId: string;
    auth: AuthenticatedRequestContext;
  }) {
    await input.auth.assertLeaderCanActOnMinistry(input.ministryId);

    const memberships = await this.prisma.ministryMembership.findMany({
      where: {
        ministryId: input.ministryId,
        status: { in: ['ACTIVE', 'PENDING', 'INACTIVE'] },
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
    auth: AuthenticatedRequestContext;
  }) {
    const ministry = await this.prisma.ministry.findUnique({
      where: { id: input.ministryId },
      select: { churchId: true },
    });
    if (!ministry) {
      throw new NotFoundException();
    }
    await input.auth.assertAdminAccreditedForChurch(ministry.churchId);

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
    auth: AuthenticatedRequestContext;
    asSystemAdmin?: boolean;
  }) {
    const ministry = await this.prisma.ministry.findUnique({
      where: { id: input.ministryId },
    });
    if (!ministry) {
      throw new NotFoundException();
    }
    await this.assertChurchAdminActor(input.auth, ministry.churchId, {
      asSystemAdmin: input.asSystemAdmin,
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
    auth: AuthenticatedRequestContext;
    asSystemAdmin?: boolean;
  }) {
    const ministry = await this.prisma.ministry.findUnique({
      where: { id: input.ministryId },
    });
    if (!ministry) {
      throw new NotFoundException();
    }
    await this.assertChurchAdminActor(input.auth, ministry.churchId, {
      asSystemAdmin: input.asSystemAdmin,
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
    auth: AuthenticatedRequestContext;
    asSystemAdmin?: boolean;
  }) {
    await this.assertLeaderOrSystemAdmin(input.auth, input.ministryId, {
      asSystemAdmin: input.asSystemAdmin,
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
