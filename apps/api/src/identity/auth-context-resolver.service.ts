import { Inject, Injectable, forwardRef } from '@nestjs/common';
import type { Volunteer } from '@prisma/client';
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

    return {
      headers,
      requireVolunteer,
      assertAdminAccreditedForChurch: (churchId: string) =>
        this.stewardship.assertAdminAccreditedForChurch(headers, churchId),
      assertLeaderCanActOnMinistry: (ministryId: string) =>
        this.stewardship.assertLeaderCanActOnMinistry(headers, ministryId),
    };
  }
}
