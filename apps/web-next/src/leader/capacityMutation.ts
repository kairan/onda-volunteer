import type { QueryClient } from '@tanstack/react-query';
import { mutateJson } from '@/api/apiClient';
import { queryKeys } from '@/query/queryKeys';

export type UpdateRoleCapacitiesInput = {
  eventId: string;
  ministryId: string;
  actingVolunteerId: string;
  capacities: Array<{ roleId: string; capacity: number }>;
};

export type UpdateRoleCapacitiesResult = {
  roleCapacities: Array<{ roleId: string; capacity: number }>;
};

export async function updateRoleCapacities(
  input: UpdateRoleCapacitiesInput,
): Promise<UpdateRoleCapacitiesResult> {
  return mutateJson<UpdateRoleCapacitiesResult>(
    `/events/${input.eventId}/role-capacities`,
    {
      volunteerId: input.actingVolunteerId,
      leaderMinistryId: input.ministryId,
    },
    {
      method: 'PATCH',
      body: JSON.stringify({
        ministryId: input.ministryId,
        capacities: input.capacities,
      }),
    },
  );
}

export function invalidateAfterCapacityUpdate(
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
