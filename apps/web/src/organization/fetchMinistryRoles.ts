import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

export type MinistryRoleRow = {
  id: string;
  name: string;
  retired: boolean;
};

export async function fetchMinistryRoles(input: {
  ministryId: string;
  actingVolunteerId: string;
}): Promise<MinistryRoleRow[]> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  return fetchJsonWithProtectedHeaders<MinistryRoleRow[]>(
    `${base}/ministries/${input.ministryId}/roles`,
    {
      volunteerId: input.actingVolunteerId,
      leaderMinistryId: input.ministryId,
    },
  );
}
