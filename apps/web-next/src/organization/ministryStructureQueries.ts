import { queryOptions } from '@tanstack/react-query';
import { getJson } from '@/api/apiClient';
import type {
  MinistryMembershipRow,
  MinistryRoleRow,
} from '@/leader/types';
import { queryKeys } from '@/query/queryKeys';

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
