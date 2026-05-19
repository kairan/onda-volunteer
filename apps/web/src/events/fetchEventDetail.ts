import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';
import type { EventDetailPayload } from '@/eventDetailPayload';

export async function fetchEventDetail(input: {
  eventId: string;
  volunteerId?: string;
}): Promise<EventDetailPayload> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  return fetchJsonWithProtectedHeaders<EventDetailPayload>(
    `${base}/events/${input.eventId}`,
    { volunteerId: input.volunteerId },
  );
}
