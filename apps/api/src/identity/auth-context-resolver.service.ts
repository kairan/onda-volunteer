import { ForbiddenException, Inject, Injectable, forwardRef } from '@nestjs/common';
import type { Volunteer } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StewardshipService } from '../organization/stewardship.service';
import {
  type AuthenticatedRequestContext,
  type AuthHeaders,
} from './authenticated-request-context';
import { IdentityService } from './identity.service';

@Injectable()
export class AuthContextResolverService {
  constructor(
    private readonly identity: IdentityService,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => StewardshipService))
    private readonly stewardship: StewardshipService,
  ) {}

  fromHeaders(headers: AuthHeaders): AuthenticatedRequestContext {
    let volunteerPromise: Promise<Volunteer> | undefined;
    let cachedVolunteer: Volunteer | undefined;

    const requireVolunteer = async (options?: {
      attemptAutoLink?: boolean;
    }): Promise<Volunteer> => {
      if (cachedVolunteer) {
        return cachedVolunteer;
      }
      if (!volunteerPromise) {
        volunteerPromise = this.identity
          .requireVolunteer(headers, options)
          .then((volunteer) => {
            cachedVolunteer = volunteer;
            return volunteer;
          });
      }
      return volunteerPromise;
    };

    let systemAdminPromise: Promise<boolean> | undefined;

    const isSystemAdmin = async (): Promise<boolean> => {
      if (systemAdminPromise) {
        return systemAdminPromise;
      }
      systemAdminPromise = (async () => {
        const volunteer = await requireVolunteer();
        const row = await this.prisma.systemAdministrator.findUnique({
          where: { volunteerId: volunteer.id },
        });
        return row !== null;
      })();
      return systemAdminPromise;
    };

    return {
      headers,
      requireVolunteer,
      assertAdminAccreditedForChurch: async (churchId: string) => {
        const volunteer = await requireVolunteer();
        return this.stewardship.assertAdminAccreditedForVolunteer(
          volunteer,
          churchId,
        );
      },
      assertLeaderCanActOnMinistry: (ministryId: string) =>
        this.stewardship.assertLeaderCanActOnMinistry(
          headers,
          ministryId,
          requireVolunteer,
        ),
      isSystemAdmin,
      assertSystemAdmin: async () => {
        const volunteer = await requireVolunteer();
        if (!(await isSystemAdmin())) {
          throw new ForbiddenException({
            code: 'NOT_SYSTEM_ADMIN',
            message: 'System Admin grant required for this operation.',
          });
        }
        return volunteer;
      },
    };
  }
}
