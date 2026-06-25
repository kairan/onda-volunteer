import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';
import type { EventListItem } from '@/events/fetchEvents';

export async function createPrivateEvent(input: {
  actingVolunteerId: string;
  leaderMinistryId: string;
  ministryId: string;
  title: string;
  startsAtUtc: string;
  endsAtUtc: string;
}): Promise<EventListItem> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  return fetchJsonWithProtectedHeaders<EventListItem>(
    `${base}/events`,
    {
      volunteerId: input.actingVolunteerId,
      leaderMinistryId: input.leaderMinistryId,
    },
    {
      method: 'POST',
      body: JSON.stringify({
        kind: 'PRIVATE',
        ministryId: input.ministryId,
        title: input.title,
        startsAtUtc: input.startsAtUtc,
        endsAtUtc: input.endsAtUtc,
      }),
    },
  );
}
