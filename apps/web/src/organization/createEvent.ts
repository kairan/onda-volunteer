import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

export type CreateEventInput = {
  kind: 'PUBLIC' | 'PRIVATE';
  title: string;
  startsAtUtc: string;
  endsAtUtc: string;
  churchId: string;
  ministryId?: string;
  volunteerId?: string;
};

export async function createEvent(input: CreateEventInput) {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const url = `${base}/events`;
  
  return fetchJsonWithProtectedHeaders(
    url,
    { volunteerId: input.volunteerId },
    {
      method: 'POST',
      body: JSON.stringify({
        kind: input.kind,
        title: input.title,
        startsAtUtc: input.startsAtUtc,
        endsAtUtc: input.endsAtUtc,
        churchId: input.churchId,
        ministryId: input.ministryId,
      }),
    }
  );
}
