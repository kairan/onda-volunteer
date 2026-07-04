import { mutateJson } from '@/api/apiClient';

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
  return mutateJson<CampusMetadataRow>(
    `/campuses/${input.campusId}`,
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
