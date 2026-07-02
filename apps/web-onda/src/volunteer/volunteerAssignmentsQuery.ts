import { queryOptions } from '@tanstack/react-query';
import { getJson } from '@/api/apiClient';
import { queryKeys } from '@/query/queryKeys';
import type { VolunteerAssignment } from './types';

export type VolunteerAssignmentsQueryInput = {
  volunteerId: string;
  churchId: string;
};

export async function fetchVolunteerAssignments(
  input: VolunteerAssignmentsQueryInput,
): Promise<VolunteerAssignment[]> {
  const params = new URLSearchParams();
  params.set('churchId', input.churchId);
  return getJson<VolunteerAssignment[]>(
    `/volunteers/${input.volunteerId}/assignments?${params.toString()}`,
    { volunteerId: input.volunteerId },
  );
}

export function volunteerAssignmentsQuery(input: VolunteerAssignmentsQueryInput) {
  return queryOptions({
    queryKey: queryKeys.assignments(input.volunteerId, input.churchId),
    queryFn: () => fetchVolunteerAssignments(input),
    enabled: Boolean(input.volunteerId && input.churchId),
  });
}
