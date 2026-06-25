import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';
import type { EventListItem } from '@/events/fetchEvents';

export async function fetchSystemAdminEvents(input: {
  volunteerId: string;
  churchId?: string;
}): Promise<EventListItem[]> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const url = new URL(`${base}/events`);
  if (input.churchId) {
    url.searchParams.set('churchId', input.churchId);
  }

  return fetchJsonWithProtectedHeaders<EventListItem[]>(url.toString(), {
    volunteerId: input.volunteerId,
  });
}
