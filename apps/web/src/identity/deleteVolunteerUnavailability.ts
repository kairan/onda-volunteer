import { fetchWithProtectedHeaders } from '@/apiAuthHeaders';
import { apiErrorFromResponse } from '@/apiError';

export async function deleteVolunteerUnavailability(input: {
  unavailabilityId: string;
  leaderMinistryId: string;
  actingVolunteerId: string;
}): Promise<{ id: string }> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const res = await fetchWithProtectedHeaders(
    `${base}/unavailability/${input.unavailabilityId}`,
    {
      volunteerId: input.actingVolunteerId,
      leaderMinistryId: input.leaderMinistryId,
    },
    { method: 'DELETE' },
  );
  if (!res.ok) {
    throw await apiErrorFromResponse(res);
  }
  return res.json() as Promise<{ id: string }>;
}
