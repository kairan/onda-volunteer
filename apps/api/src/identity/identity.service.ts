import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Volunteer } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseJwtVerifier } from './supabase-jwt-verifier';

function devHeadersAllowed(): boolean {
  return process.env.AUTH_ALLOW_DEV_HEADERS === 'true';
}

@Injectable()
export class IdentityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtVerifier: SupabaseJwtVerifier,
  ) {}

  async requireVolunteer(input: {
    authorizationHeader: string | undefined;
    devVolunteerIdHeader: string | undefined;
  }): Promise<Volunteer> {
    if (input.authorizationHeader?.startsWith('Bearer ')) {
      const { sub } = this.jwtVerifier.verifyBearerToken(
        input.authorizationHeader,
      );
      const volunteer = await this.prisma.volunteer.findUnique({
        where: { authSubjectId: sub },
      });
      if (!volunteer) {
        throw new ForbiddenException({
          code: 'PROFILE_NOT_LINKED',
          message:
            'No Volunteer profile is linked to this authenticated subject.',
        });
      }
      return volunteer;
    }

    if (devHeadersAllowed() && input.devVolunteerIdHeader?.trim()) {
      const volunteer = await this.prisma.volunteer.findUnique({
        where: { id: input.devVolunteerIdHeader.trim() },
      });
      if (!volunteer) {
        throw new ForbiddenException({
          code: 'PROFILE_NOT_FOUND',
          message: 'Volunteer profile not found for dev header identity.',
        });
      }
      return volunteer;
    }

    throw new UnauthorizedException({
      code: 'AUTH_REQUIRED',
      message: devHeadersAllowed()
        ? 'Provide Authorization Bearer token or X-Volunteer-Id (dev only).'
        : 'Provide Authorization Bearer token.',
    });
  }

  async assertLeaderCanActOnMinistry(input: {
    authorizationHeader: string | undefined;
    devLeaderMinistryIdHeader: string | undefined;
    ministryId: string;
  }): Promise<void> {
    if (input.authorizationHeader?.startsWith('Bearer ')) {
      const volunteer = await this.requireVolunteer({
        authorizationHeader: input.authorizationHeader,
        devVolunteerIdHeader: undefined,
      });

      const leadership = await this.prisma.ministryLeader.findUnique({
        where: {
          volunteerId_ministryId: {
            volunteerId: volunteer.id,
            ministryId: input.ministryId,
          },
        },
      });
      if (leadership) {
        return;
      }

      const ministry = await this.prisma.ministry.findUnique({
        where: { id: input.ministryId },
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

    if (devHeadersAllowed() && input.devLeaderMinistryIdHeader?.trim()) {
      if (input.devLeaderMinistryIdHeader !== input.ministryId) {
        throw new ForbiddenException({
          code: 'LEADER_MINISTRY_MISMATCH',
          message:
            'Leader ministry scope does not match this action ministry.',
        });
      }
      return;
    }

    throw new UnauthorizedException({
      code: 'AUTH_REQUIRED',
      message: devHeadersAllowed()
        ? 'Provide Authorization Bearer token or X-Leader-Ministry-Id (dev only).'
        : 'Provide Authorization Bearer token.',
    });
  }
}
