import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import type { Volunteer } from '@prisma/client';
import { AdminInviteService } from '../system-admin/admin-invite.service';
import { StewardshipService } from '../organization/stewardship.service';
import {
  VolunteerInviteFulfillmentService,
  type FulfilledVolunteerInviteSummary,
} from '../organization/volunteer-invite-fulfillment.service';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthHeaders } from './authenticated-request-context';
import { SupabaseJwtVerifier } from './supabase-jwt-verifier';

function devHeadersAllowed(): boolean {
  return process.env.AUTH_ALLOW_DEV_HEADERS === 'true';
}

function autoLinkSeedVolunteerId(): string | undefined {
  return process.env.AUTH_AUTO_LINK_SEED_VOLUNTEER_ID?.trim() || undefined;
}

@Injectable()
export class IdentityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtVerifier: SupabaseJwtVerifier,
    private readonly adminInvites: AdminInviteService,
    @Inject(forwardRef(() => StewardshipService))
    private readonly stewardship: StewardshipService,
    private readonly volunteerInviteFulfillment: VolunteerInviteFulfillmentService,
  ) {}

  async getMe(auth: AuthHeaders) {
    const { volunteer, newlyFulfilledInvites } = await this.resolveVolunteer(
      auth,
      { attemptAutoLink: true },
    );
    const systemAdmin = await this.prisma.systemAdministrator.findUnique({
      where: { volunteerId: volunteer.id },
    });
    return {
      volunteer: {
        id: volunteer.id,
        displayName: volunteer.displayName,
        uiLocale: volunteer.uiLocale,
      },
      authSubjectId: volunteer.authSubjectId,
      isSystemAdmin: systemAdmin !== null,
      newlyFulfilledInvites,
    };
  }

  async updateMe(auth: AuthHeaders, data: { uiLocale?: string }) {
    const volunteer = await this.requireVolunteer(auth);
    return this.prisma.volunteer.update({
      where: { id: volunteer.id },
      data: {
        uiLocale: data.uiLocale,
      },
    });
  }

  async requireVolunteer(
    auth: AuthHeaders,
    options: { attemptAutoLink?: boolean } = {},
  ): Promise<Volunteer> {
    const { volunteer } = await this.resolveVolunteer(auth, {
      attemptAutoLink: options.attemptAutoLink ?? false,
    });
    return volunteer;
  }

  /** @deprecated Use AuthenticatedRequestContext at controller/service boundaries. */
  async requireVolunteerFromLegacyHeaders(input: {
    authorizationHeader: string | undefined;
    devVolunteerIdHeader: string | undefined;
  }): Promise<Volunteer> {
    return this.requireVolunteer({
      authorization: input.authorizationHeader,
      volunteerId: input.devVolunteerIdHeader,
    });
  }

  private async resolveVolunteer(
    auth: AuthHeaders,
    options: { attemptAutoLink: boolean },
  ): Promise<{
    volunteer: Volunteer;
    newlyFulfilledInvites: FulfilledVolunteerInviteSummary[];
  }> {
    if (auth.authorization?.startsWith('Bearer ')) {
      const { sub, email } = await this.jwtVerifier.verifyBearerToken(
        auth.authorization,
      );
      let volunteer = await this.prisma.volunteer.findUnique({
        where: { authSubjectId: sub },
      });
      let newlyFulfilledInvites: FulfilledVolunteerInviteSummary[] = [];
      if (email) {
        const adminFulfilled = await this.adminInvites.fulfillPendingInvites({
          authSubjectId: sub,
          email,
          existingVolunteer: volunteer,
        });
        if (adminFulfilled) {
          volunteer = adminFulfilled;
        }
        const inviteFulfilled =
          await this.volunteerInviteFulfillment.fulfillPendingInvites({
            authSubjectId: sub,
            email,
            existingVolunteer: volunteer,
          });
        if (inviteFulfilled.volunteer) {
          volunteer = inviteFulfilled.volunteer;
        }
        newlyFulfilledInvites = inviteFulfilled.newlyFulfilledInvites;
      }
      if (!volunteer && options.attemptAutoLink) {
        volunteer = await this.tryAutoLinkSeedVolunteer(sub);
      }
      if (!volunteer) {
        throw new ForbiddenException({
          code: 'PROFILE_NOT_LINKED',
          message:
            'No Volunteer profile is linked to this authenticated subject.',
        });
      }
      return { volunteer, newlyFulfilledInvites };
    }

    if (devHeadersAllowed() && auth.volunteerId?.trim()) {
      const volunteer = await this.prisma.volunteer.findUnique({
        where: { id: auth.volunteerId.trim() },
      });
      if (!volunteer) {
        throw new ForbiddenException({
          code: 'PROFILE_NOT_FOUND',
          message: 'Volunteer profile not found for dev header identity.',
        });
      }
      return { volunteer, newlyFulfilledInvites: [] };
    }

    throw new UnauthorizedException({
      code: 'AUTH_REQUIRED',
      message: devHeadersAllowed()
        ? 'Provide Authorization Bearer token or X-Volunteer-Id (dev only).'
        : 'Provide Authorization Bearer token.',
    });
  }

  private async tryAutoLinkSeedVolunteer(
    authSubjectId: string,
  ): Promise<Volunteer | null> {
    const seedVolunteerId = autoLinkSeedVolunteerId();
    if (!seedVolunteerId) {
      return null;
    }

    const seed = await this.prisma.volunteer.findUnique({
      where: { id: seedVolunteerId },
    });
    if (!seed) {
      return null;
    }
    if (seed.authSubjectId === authSubjectId) {
      return seed;
    }
    if (seed.authSubjectId) {
      return null;
    }

    return this.prisma.volunteer.update({
      where: { id: seedVolunteerId },
      data: { authSubjectId },
    });
  }

  async assertAdminAccreditedForChurch(
    auth: AuthHeaders,
    churchId: string,
  ): Promise<Volunteer> {
    return this.stewardship.assertAdminAccreditedForChurch(auth, churchId);
  }

  async assertLeaderCanActOnMinistry(
    auth: AuthHeaders,
    ministryId: string,
  ): Promise<void> {
    return this.stewardship.assertLeaderCanActOnMinistry(auth, ministryId);
  }
}
