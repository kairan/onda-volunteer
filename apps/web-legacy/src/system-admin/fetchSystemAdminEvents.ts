import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';
import { volunteerIdForProtectedRequests } from '@/auth/authSession';
import type { EventListItem } from '@/events/fetchEvents';

const base = () => import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function fetchSystemAdminEvents(input?: {
  churchId?: string;
}): Promise<EventListItem[]> {
  const url = new URL(`${base()}/events`);
  if (input?.churchId) {
    url.searchParams.set('churchId', input.churchId);
  }
  return fetchJsonWithProtectedHeaders<EventListItem[]>(url.toString(), {
    volunteerId: volunteerIdForProtectedRequests(),
  });
}
