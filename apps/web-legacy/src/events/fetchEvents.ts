import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

export type EventListItem = {
  id: string;
  kind: 'PUBLIC' | 'PRIVATE';
  title: string;
  window: {
    startsAtUtc: string;
    endsAtUtc: string;
  };
  framing: {
    churchDefaultTimezone: string;
    startsDisplayInChurchTz: string;
    endsDisplayInChurchTz: string;
  };
  ministry: { id: string; name: string } | null;
  church?: { id: string; name: string };
};

export async function fetchEvents(input: {
  volunteerId: string;
  churchId: string;
}): Promise<EventListItem[]> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const url = new URL(`${base}/events`);
  url.searchParams.set('churchId', input.churchId);

  return fetchJsonWithProtectedHeaders<EventListItem[]>(url.toString(), {
    volunteerId: input.volunteerId,
  });
}
