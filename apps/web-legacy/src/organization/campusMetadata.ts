import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

const base = () => import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type CampusMetadataRow = {
  id: string;
  churchId: string;
  name: string;
  timezone: string;
};

export async function updateCampusMetadata(input: {
  campusId: string;
  actingVolunteerId: string;
  name?: string;
  timezone?: string;
}): Promise<CampusMetadataRow> {
  return fetchJsonWithProtectedHeaders(
    `${base()}/campuses/${input.campusId}`,
    { volunteerId: input.actingVolunteerId },
    {
      method: 'PATCH',
      body: JSON.stringify({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
      }),
    },
  );
}
