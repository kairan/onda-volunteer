import type { EventDetailPayload } from '@/eventDetailPayload';
import { volunteerIdForProtectedRequests } from '@/auth/authSession';
import { fetchEventDetail } from './fetchEventDetail';

export async function loadSchedulingEventDetail(input: {
  eventId: string;
  volunteerId?: string;
}): Promise<EventDetailPayload> {
  const volunteerId = input.volunteerId ?? volunteerIdForProtectedRequests();
  return fetchEventDetail({
    eventId: input.eventId,
    volunteerId,
  });
}
