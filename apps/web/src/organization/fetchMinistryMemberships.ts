import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

export type MinistryMembershipRow = {
  volunteerId: string;
  displayName: string;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
};

export async function fetchMinistryMemberships(input: {
  ministryId: string;
  actingVolunteerId: string;
}): Promise<MinistryMembershipRow[]> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  return fetchJsonWithProtectedHeaders<MinistryMembershipRow[]>(
    `${base}/ministries/${input.ministryId}/memberships`,
    {
      volunteerId: input.actingVolunteerId,
      leaderMinistryId: input.ministryId,
    },
  );
}
