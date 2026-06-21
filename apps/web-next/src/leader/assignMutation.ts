import type { QueryClient } from '@tanstack/react-query';
import { mutateJson } from '@/api/apiClient';
import { queryKeys } from '@/query/queryKeys';

export type CreateAssignmentInput = {
  eventId: string;
  volunteerId: string;
  ministryId: string;
  roleId: string;
  startsAtUtc: string;
  endsAtUtc: string;
  actingVolunteerId: string;
};

export type CreateAssignmentResult = {
  id: string;
  volunteerId: string;
  ministryId: string;
  roleId: string;
  window: {
    startsAtUtc: string;
    endsAtUtc: string;
  };
};

export async function createAssignment(
  input: CreateAssignmentInput,
): Promise<CreateAssignmentResult> {
  return mutateJson<CreateAssignmentResult>(
    `/events/${input.eventId}/assignments`,
    {
      volunteerId: input.actingVolunteerId,
      leaderMinistryId: input.ministryId,
    },
    {
      method: 'POST',
      body: JSON.stringify({
        volunteerId: input.volunteerId,
        ministryId: input.ministryId,
        roleId: input.roleId,
        startsAtUtc: input.startsAtUtc,
        endsAtUtc: input.endsAtUtc,
      }),
    },
  );
}

export function invalidateAfterAssignOrRelease(
  queryClient: QueryClient,
  input: { churchId: string; ministryId: string; eventId: string },
): void {
  void queryClient.invalidateQueries({
    queryKey: queryKeys.eventDetail(input.eventId),
  });
  void queryClient.invalidateQueries({
    queryKey: queryKeys.events({
      churchId: input.churchId,
      ministryId: input.ministryId,
    }),
  });
}
