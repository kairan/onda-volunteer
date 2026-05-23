import { fetchWithProtectedHeaders } from '@/apiAuthHeaders';
import { apiErrorFromResponse } from '@/apiError';

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

export async function createAssignment(input: {
  eventId: string;
  volunteerId: string;
  ministryId: string;
  roleId: string;
  startsAtUtc: string;
  endsAtUtc: string;
}): Promise<CreateAssignmentResult> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const res = await fetchWithProtectedHeaders(
    `${base}/events/${input.eventId}/assignments`,
    { leaderMinistryId: input.ministryId },
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
  if (!res.ok) {
    throw await apiErrorFromResponse(res);
  }
  return res.json() as Promise<CreateAssignmentResult>;
}
