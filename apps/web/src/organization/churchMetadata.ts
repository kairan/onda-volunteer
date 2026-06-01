import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

const base = () => import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type ChurchMetadataRow = {
  id: string;
  name: string;
  defaultTimezone: string;
};

export async function updateChurchMetadata(input: {
  churchId: string;
  actingVolunteerId: string;
  name?: string;
  defaultTimezone?: string;
}): Promise<ChurchMetadataRow> {
  return fetchJsonWithProtectedHeaders(
    `${base()}/churches/${input.churchId}`,
    { volunteerId: input.actingVolunteerId },
    {
      method: 'PATCH',
      body: JSON.stringify({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.defaultTimezone !== undefined
          ? { defaultTimezone: input.defaultTimezone }
          : {}),
      }),
    },
  );
}
