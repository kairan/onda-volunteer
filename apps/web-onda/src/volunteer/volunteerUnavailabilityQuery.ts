import { queryOptions } from '@tanstack/react-query';
import { getJson } from '@/api/apiClient';
import { queryKeys } from '@/query/queryKeys';
import type { VolunteerUnavailability } from './types';

export type VolunteerUnavailabilityQueryInput = {
  volunteerId: string;
  churchId: string;
  leaderMinistryId?: string;
  actingVolunteerId?: string;
};

export async function fetchVolunteerUnavailability(
  input: VolunteerUnavailabilityQueryInput,
): Promise<VolunteerUnavailability[]> {
  const params = new URLSearchParams();
  params.set('churchId', input.churchId);
  const scopeVolunteerId = input.actingVolunteerId ?? input.volunteerId;
  return getJson<VolunteerUnavailability[]>(
    `/volunteers/${input.volunteerId}/unavailability?${params.toString()}`,
    {
      volunteerId: scopeVolunteerId,
      leaderMinistryId: input.leaderMinistryId,
    },
  );
}

export function volunteerUnavailabilityQuery(
  input: VolunteerUnavailabilityQueryInput,
) {
  return queryOptions({
    queryKey: queryKeys.unavailability(input.volunteerId, input.churchId),
    queryFn: () => fetchVolunteerUnavailability(input),
    enabled: Boolean(input.volunteerId && input.churchId),
  });
}
