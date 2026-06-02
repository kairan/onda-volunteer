import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Volunteer } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IdentityService } from '../identity/identity.service';
import type { AuthHeaders } from '../identity/authenticated-request-context';

export type ChurchStewardship = {
  isAccreditedAdmin: boolean;
  accessibleMinistryIds: string[];
};

function devHeadersAllowed(): boolean {
  return process.env.AUTH_ALLOW_DEV_HEADERS === 'true';
}

@Injectable()
export class StewardshipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly identity: IdentityService,
  ) {}

  async getChurchStewardship(
    volunteerId: string,
    churchId: string,
  ): Promise<ChurchStewardship> {
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
      isAccreditedAdmin: accreditations.length > 0,
      accessibleMinistryIds: [
        ...new Set([
          ...memberships.map((row) => row.ministryId),
          ...leaderships.map((row) => row.ministryId),
        ]),
      ],
    };
  }

  canViewEvent(
    event: { kind: 'PUBLIC' | 'PRIVATE'; ministryId: string | null },
    stewardship: ChurchStewardship,
  ): boolean {
    if (event.kind === 'PUBLIC') {
      return true;
    }
    if (stewardship.isAccreditedAdmin) {
      return true;
    }
    if (
      event.ministryId &&
      stewardship.accessibleMinistryIds.includes(event.ministryId)
    ) {
      return true;
    }
    return false;
  }

  async assertAdminAccreditedForChurch(
    headers: AuthHeaders,
    churchId: string,
  ): Promise<Volunteer> {
    const volunteer = await this.identity.requireVolunteer({
      authorization: headers.authorization,
      volunteerId: headers.volunteerId,
    });
    return this.assertAdminAccreditedForVolunteer(volunteer, churchId);
  }

  async assertAdminAccreditedForVolunteer(
    volunteer: Volunteer,
    churchId: string,
  ): Promise<Volunteer> {
    const accreditation = await this.prisma.adminAccreditation.findUnique({
      where: {
        volunteerId_churchId: {
          volunteerId: volunteer.id,
          churchId,
        },
      },
    });
    if (!accreditation) {
      throw new ForbiddenException({
        code: 'ADMIN_NOT_ACCREDITED',
        message:
          'Authenticated volunteer is not an Admin accredited for this Church.',
      });
    }
    return volunteer;
  }

  private async assertVolunteerLeaderOrAdminForMinistry(
    volunteer: Volunteer,
    ministryId: string,
  ): Promise<void> {
    const leadership = await this.prisma.ministryLeader.findUnique({
      where: {
        volunteerId_ministryId: {
          volunteerId: volunteer.id,
          ministryId,
        },
      },
    });
    if (leadership) {
      return;
    }

    const ministry = await this.prisma.ministry.findUnique({
      where: { id: ministryId },
      select: { churchId: true },
    });
    if (!ministry) {
      throw new ForbiddenException({
        code: 'MINISTRY_NOT_FOUND',
        message: 'Ministry not found.',
      });
    }

    const accreditation = await this.prisma.adminAccreditation.findUnique({
      where: {
        volunteerId_churchId: {
          volunteerId: volunteer.id,
          churchId: ministry.churchId,
        },
      },
    });
    if (accreditation) {
      return;
    }

    throw new ForbiddenException({
      code: 'LEADER_NOT_AUTHORIZED',
      message:
        'Authenticated volunteer is not a Leader for this Ministry and is not an Admin accredited for its Church.',
    });
  }

  async assertLeaderCanActOnMinistry(
    headers: AuthHeaders,
    ministryId: string,
    requireVolunteer?: () => Promise<Volunteer>,
  ): Promise<void> {
    if (headers.authorization?.startsWith('Bearer ')) {
      const volunteer = requireVolunteer
        ? await requireVolunteer()
        : await this.identity.requireVolunteer({
            authorization: headers.authorization,
            volunteerId: undefined,
          });
      await this.assertVolunteerLeaderOrAdminForMinistry(volunteer, ministryId);
      return;
    }

    if (devHeadersAllowed() && headers.leaderMinistryId?.trim()) {
      if (headers.leaderMinistryId !== ministryId) {
        throw new ForbiddenException({
          code: 'LEADER_MINISTRY_MISMATCH',
          message: 'Leader ministry scope does not match this action ministry.',
        });
      }
      return;
    }

    if (devHeadersAllowed() && headers.volunteerId?.trim()) {
      const volunteer = requireVolunteer
        ? await requireVolunteer()
        : await this.identity.requireVolunteer({
            authorization: undefined,
            volunteerId: headers.volunteerId,
          });
      await this.assertVolunteerLeaderOrAdminForMinistry(volunteer, ministryId);
      return;
    }

    throw new UnauthorizedException({
      code: 'AUTH_REQUIRED',
      message: devHeadersAllowed()
        ? 'Provide Authorization Bearer token, X-Volunteer-Id, or X-Leader-Ministry-Id (dev only).'
        : 'Provide Authorization Bearer token.',
    });
  }

  async loadOrganizationRelations(volunteerId: string) {
    return Promise.all([
      this.prisma.ministryMembership.findMany({
        where: { volunteerId },
        include: {
          ministry: {
            include: {
              church: { include: { campuses: true } },
            },
          },
        },
      }),
      this.prisma.ministryLeader.findMany({
        where: { volunteerId },
        include: {
          ministry: {
            include: {
              church: { include: { campuses: true } },
            },
          },
        },
      }),
      this.prisma.adminAccreditation.findMany({
        where: { volunteerId },
        include: {
          church: {
            include: { campuses: true, ministries: true },
          },
        },
      }),
    ]);
  }
}
