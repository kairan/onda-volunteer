import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

export async function createMinistryRole(input: {
  ministryId: string;
  name: string;
  volunteerId?: string;
}) {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const url = `${base}/ministries/${input.ministryId}/roles`;
  
  return fetchJsonWithProtectedHeaders(
    url,
    { volunteerId: input.volunteerId, leaderMinistryId: input.ministryId },
    {
      method: 'POST',
      body: JSON.stringify({ name: input.name }),
    }
  );
}

export async function updateMinistryRole(input: {
  ministryId: string;
  roleId: string;
  name?: string;
  retired?: boolean;
  volunteerId?: string;
}) {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const url = `${base}/ministries/${input.ministryId}/roles/${input.roleId}`;
  
  return fetchJsonWithProtectedHeaders(
    url,
    { volunteerId: input.volunteerId, leaderMinistryId: input.ministryId },
    {
      method: 'PATCH',
      body: JSON.stringify({ name: input.name, retired: input.retired }),
    }
  );
}
