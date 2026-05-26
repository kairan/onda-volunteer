import type { Volunteer } from '@prisma/client';

export type AuthMode = 'bearer' | 'dev_volunteer' | 'dev_leader';

export type AuthHeaders = {
  authorization?: string;
  volunteerId?: string;
  leaderMinistryId?: string;
};

/**
 * Request-scoped auth resolved once per HTTP request.
 * Volunteer identity is memoized after the first requireVolunteer() call.
 */
export type AuthenticatedRequestContext = {
  headers: AuthHeaders;
  requireVolunteer: (options?: { attemptAutoLink?: boolean }) => Promise<Volunteer>;
  assertAdminAccreditedForChurch: (churchId: string) => Promise<Volunteer>;
  assertLeaderCanActOnMinistry: (ministryId: string) => Promise<void>;
};

export function authHeadersFromRequest(request: {
  headers: Record<string, string | string[] | undefined>;
}): AuthHeaders {
  const authorization = headerValue(request.headers.authorization);
  const volunteerId = headerValue(request.headers['x-volunteer-id']);
  const leaderMinistryId = headerValue(request.headers['x-leader-ministry-id']);
  return { authorization, volunteerId, leaderMinistryId };
}

function headerValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0]?.trim() || undefined;
  }
  return value?.trim() || undefined;
}
