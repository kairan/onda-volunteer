import { fetchWithProtectedHeaders } from '@/apiAuthHeaders';
import { apiErrorFromResponse } from '@/apiError';

export type CreateUnavailabilityResult = {
  id: string;
  ministryId: string;
  window: {
    startsAtUtc: string;
    endsAtUtc: string;
  };
};

export async function createVolunteerUnavailability(input: {
  volunteerId: string;
  ministryId: string;
  startsAtUtc: string;
  endsAtUtc: string;
  /** When creating on behalf of another volunteer, scope to the led ministry. */
  leaderMinistryId?: string;
  /** Authenticated leader volunteer id for dev headers when acting on behalf of someone else. */
  actingVolunteerId?: string;
}): Promise<CreateUnavailabilityResult> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const scopeVolunteerId = input.actingVolunteerId ?? input.volunteerId;
  const res = await fetchWithProtectedHeaders(
    `${base}/volunteers/${input.volunteerId}/unavailability`,
    {
      volunteerId: scopeVolunteerId,
      leaderMinistryId: input.leaderMinistryId,
    },
    {
      method: 'POST',
      body: JSON.stringify({
        ministryId: input.ministryId,
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
