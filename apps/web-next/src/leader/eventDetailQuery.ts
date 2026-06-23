import { queryOptions } from '@tanstack/react-query';
import { getJson } from '@/api/apiClient';
import type { EventDetailPayload } from '@/eventDetailPayload';
import { queryKeys } from '@/query/queryKeys';

export type EventDetailQueryInput = {
  eventId: string;
  volunteerId: string;
};

export async function fetchEventDetail(
  input: EventDetailQueryInput,
): Promise<EventDetailPayload> {
  return getJson<EventDetailPayload>(`/events/${input.eventId}`, {
    volunteerId: input.volunteerId,
  });
}

export function eventDetailQuery(input: EventDetailQueryInput) {
  return queryOptions({
    queryKey: queryKeys.eventDetail(input.eventId),
    queryFn: () => fetchEventDetail(input),
    enabled: Boolean(input.eventId && input.volunteerId),
  });
}
