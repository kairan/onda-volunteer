import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

export type EventSummary = {
  id: string;
  kind: 'PUBLIC' | 'PRIVATE';
  title: string;
  voidedAtUtc: string | null;
  startsAtUtc: string;
  endsAtUtc: string;
  churchId: string;
  ministryId: string | null;
  ministry: {
    id: string;
    name: string;
  } | null;
};

export async function fetchEvents(input: {
  churchId: string;
  volunteerId?: string;
}): Promise<EventSummary[]> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const url = new URL(`${base}/events`);
  url.searchParams.set('churchId', input.churchId);
  
  return fetchJsonWithProtectedHeaders<EventSummary[]>(
    url.toString(),
    { volunteerId: input.volunteerId }
  );
}
