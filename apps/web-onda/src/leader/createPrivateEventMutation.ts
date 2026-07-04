import type { QueryClient } from '@tanstack/react-query';
import { mutateJson } from '@/api/apiClient';
import { queryKeys } from '@/query/queryKeys';
import type { EventListItem } from './types';

export type CreatePrivateEventInput = {
  actingVolunteerId: string;
  leaderMinistryId: string;
  ministryId: string;
  title: string;
  startsAtUtc: string;
  endsAtUtc: string;
};

export async function createPrivateEvent(
  input: CreatePrivateEventInput,
): Promise<EventListItem> {
  return mutateJson<EventListItem>(
    '/events',
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

export function invalidateAfterPrivateEventCreate(
  queryClient: QueryClient,
  input: { churchId: string; ministryId: string },
): void {
  void queryClient.invalidateQueries({
    queryKey: queryKeys.events({
      churchId: input.churchId,
      ministryId: input.ministryId,
    }),
  });
}
