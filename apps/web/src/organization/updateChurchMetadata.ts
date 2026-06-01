import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

export type ChurchMetadata = {
  id: string;
  name: string;
  defaultTimezone: string;
};

export async function updateChurchMetadata(input: {
  churchId: string;
  volunteerId: string;
  name?: string;
  defaultTimezone?: string;
}): Promise<ChurchMetadata> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  return fetchJsonWithProtectedHeaders<ChurchMetadata>(
    `${base}/churches/${encodeURIComponent(input.churchId)}`,
    { volunteerId: input.volunteerId },
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
