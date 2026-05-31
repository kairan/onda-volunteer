import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

const base = () => import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type MinistryStructureRow = {
  id: string;
  churchId: string;
  name: string;
};

export async function createMinistry(input: {
  churchId: string;
  actingVolunteerId: string;
  name: string;
}): Promise<MinistryStructureRow> {
  return fetchJsonWithProtectedHeaders(
    `${base()}/churches/${input.churchId}/ministries`,
    { volunteerId: input.actingVolunteerId },
    {
      method: 'POST',
      body: JSON.stringify({ name: input.name }),
    },
  );
}

export async function renameMinistry(input: {
  ministryId: string;
  actingVolunteerId: string;
  name: string;
}): Promise<MinistryStructureRow> {
  return fetchJsonWithProtectedHeaders(
    `${base()}/ministries/${input.ministryId}`,
    { volunteerId: input.actingVolunteerId },
    {
      method: 'PATCH',
      body: JSON.stringify({ name: input.name }),
    },
  );
}
