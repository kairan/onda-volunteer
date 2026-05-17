import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

export type MinistryMember = {
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  volunteer: {
    id: string;
    displayName: string;
  };
};

export type MinistryRole = {
  id: string;
  name: string;
};

export async function fetchMinistryMembers(input: {
  ministryId: string;
  volunteerId?: string;
  leaderMinistryId?: string;
}): Promise<MinistryMember[]> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const url = `${base}/ministries/${input.ministryId}/members`;
  
  return fetchJsonWithProtectedHeaders<MinistryMember[]>(
    url,
    { volunteerId: input.volunteerId, leaderMinistryId: input.leaderMinistryId }
  );
}

export async function fetchMinistryRoles(input: {
  ministryId: string;
  volunteerId?: string;
  leaderMinistryId?: string;
}): Promise<MinistryRole[]> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const url = `${base}/ministries/${input.ministryId}/roles`;
  
  return fetchJsonWithProtectedHeaders<MinistryRole[]>(
    url,
    { volunteerId: input.volunteerId, leaderMinistryId: input.leaderMinistryId }
  );
}
