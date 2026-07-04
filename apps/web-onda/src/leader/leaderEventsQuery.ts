import { queryOptions } from '@tanstack/react-query';
import { getJson } from '@/api/apiClient';
import { queryKeys } from '@/query/queryKeys';
import type { EventListItem } from './types';

export type LeaderEventsQueryInput = {
  volunteerId: string;
  churchId: string;
  ministryId: string;
};

export async function fetchLeaderEvents(
  input: Pick<LeaderEventsQueryInput, 'volunteerId' | 'churchId'>,
): Promise<EventListItem[]> {
  const params = new URLSearchParams();
  params.set('churchId', input.churchId);
  return getJson<EventListItem[]>(`/events?${params.toString()}`, {
    volunteerId: input.volunteerId,
  });
}

export function leaderEventsQuery(input: LeaderEventsQueryInput) {
  return queryOptions({
    queryKey: queryKeys.events({
      churchId: input.churchId,
      ministryId: input.ministryId,
    }),
    queryFn: () => fetchLeaderEvents(input),
    enabled: Boolean(input.volunteerId && input.churchId && input.ministryId),
  });
}
