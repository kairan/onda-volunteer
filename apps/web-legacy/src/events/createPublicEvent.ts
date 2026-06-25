import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';
import type { EventListItem } from '@/events/fetchEvents';

export async function createPublicEvent(input: {
  actingVolunteerId: string;
  churchId: string;
  title: string;
  startsAtUtc: string;
  endsAtUtc: string;
}): Promise<EventListItem> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  return fetchJsonWithProtectedHeaders<EventListItem>(
    `${base}/events`,
    { volunteerId: input.actingVolunteerId },
    {
      method: 'POST',
      body: JSON.stringify({
        kind: 'PUBLIC',
        churchId: input.churchId,
        title: input.title,
        startsAtUtc: input.startsAtUtc,
        endsAtUtc: input.endsAtUtc,
      }),
    },
  );
}
