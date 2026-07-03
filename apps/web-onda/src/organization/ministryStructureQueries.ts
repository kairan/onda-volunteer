import { queryOptions } from '@tanstack/react-query';
import { getJson } from '@/api/apiClient';
import type {
  MinistryMembershipRow,
  MinistryRoleRow,
} from '@/leader/types';
import { queryKeys } from '@/query/queryKeys';
import type {
  VolunteerInviteRow,
  VolunteerSearchResult,
} from './ministryStructureMutations';

export type MinistryLeaderRow = {
  volunteerId: string;
  displayName: string;
};

export async function fetchMinistryMemberships(input: {
  ministryId: string;
  actingVolunteerId: string;
}): Promise<MinistryMembershipRow[]> {
  return getJson<MinistryMembershipRow[]>(
    `/ministries/${input.ministryId}/memberships`,
    {
      volunteerId: input.actingVolunteerId,
      leaderMinistryId: input.ministryId,
    },
  );
}

export function ministryMembershipsQuery(input: {
  ministryId: string;
  actingVolunteerId: string;
}) {
  return queryOptions({
    queryKey: queryKeys.ministryMemberships(input.ministryId),
    queryFn: () => fetchMinistryMemberships(input),
    enabled: Boolean(input.ministryId && input.actingVolunteerId),
  });
}

export async function fetchMinistryRoles(input: {
  ministryId: string;
  actingVolunteerId: string;
}): Promise<MinistryRoleRow[]> {
  return getJson<MinistryRoleRow[]>(`/ministries/${input.ministryId}/roles`, {
    volunteerId: input.actingVolunteerId,
    leaderMinistryId: input.ministryId,
  });
}

export function ministryRolesQuery(input: {
  ministryId: string;
  actingVolunteerId: string;
}) {
  return queryOptions({
    queryKey: queryKeys.ministryRoles(input.ministryId),
    queryFn: () => fetchMinistryRoles(input),
    enabled: Boolean(input.ministryId && input.actingVolunteerId),
  });
}

export async function fetchMinistryLeaders(input: {
  ministryId: string;
  actingVolunteerId: string;
}): Promise<MinistryLeaderRow[]> {
  return getJson<MinistryLeaderRow[]>(
    `/ministries/${input.ministryId}/leaders`,
    { volunteerId: input.actingVolunteerId },
  );
}

export function ministryLeadersQuery(input: {
  ministryId: string;
  actingVolunteerId: string;
}) {
  return queryOptions({
    queryKey: queryKeys.ministryLeaders(input.ministryId),
    queryFn: () => fetchMinistryLeaders(input),
    enabled: Boolean(input.ministryId && input.actingVolunteerId),
  });
}

export async function fetchVolunteerInvites(input: {
  ministryId: string;
  actingVolunteerId: string;
}): Promise<VolunteerInviteRow[]> {
  const data = await getJson<{ invites: VolunteerInviteRow[] }>(
    `/ministries/${input.ministryId}/invites`,
    { volunteerId: input.actingVolunteerId },
  );
  return data.invites;
}

export function volunteerInvitesQuery(input: {
  ministryId: string;
  actingVolunteerId: string;
}) {
  return queryOptions({
    queryKey: queryKeys.volunteerInvites(input.ministryId),
    queryFn: () => fetchVolunteerInvites(input),
    enabled: Boolean(input.ministryId && input.actingVolunteerId),
  });
}

export async function searchVolunteers(input: {
  churchId: string;
  query: string;
  ministryId: string;
  actingVolunteerId: string;
}): Promise<VolunteerSearchResult[]> {
  const params = new URLSearchParams({
    q: input.query,
    ministryId: input.ministryId,
  });
  const data = await getJson<{ volunteers: VolunteerSearchResult[] }>(
    `/churches/${input.churchId}/volunteers/search?${params}`,
    { volunteerId: input.actingVolunteerId },
  );
  return data.volunteers;
}

export function volunteerSearchQuery(input: {
  churchId: string;
  ministryId: string;
  actingVolunteerId: string;
  query: string;
}) {
  return queryOptions({
    queryKey: queryKeys.volunteerSearch(
      input.churchId,
      input.ministryId,
      input.query,
    ),
    queryFn: () => searchVolunteers(input),
    enabled:
      Boolean(
        input.churchId &&
          input.ministryId &&
          input.actingVolunteerId &&
          input.query.length >= 2,
      ),
  });
}
