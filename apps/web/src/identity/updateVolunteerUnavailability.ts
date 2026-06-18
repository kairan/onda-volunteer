import { fetchWithProtectedHeaders } from '@/apiAuthHeaders';
import { apiErrorFromResponse } from '@/apiError';
import type { CreateUnavailabilityResult } from './createVolunteerUnavailability';

export async function updateVolunteerUnavailability(input: {
  unavailabilityId: string;
  actingVolunteerId: string;
  startsAtUtc: string;
  endsAtUtc: string;
  /** Required when a leader updates on behalf of a volunteer. */
  leaderMinistryId?: string;
}): Promise<CreateUnavailabilityResult> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const res = await fetchWithProtectedHeaders(
    `${base}/unavailability/${input.unavailabilityId}`,
    {
      volunteerId: input.actingVolunteerId,
      leaderMinistryId: input.leaderMinistryId,
    },
    {
      method: 'PATCH',
      body: JSON.stringify({
        startsAtUtc: input.startsAtUtc,
        endsAtUtc: input.endsAtUtc,
      }),
    },
  );
  if (!res.ok) {
    throw await apiErrorFromResponse(res);
  }
  return res.json() as Promise<CreateUnavailabilityResult>;
}
