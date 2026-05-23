import { fetchWithProtectedHeaders } from '@/apiAuthHeaders';
import { apiErrorFromResponse } from '@/apiError';

export type BulkUnavailabilityFailure = {
  ministryId: string;
  code: string;
  message: string;
};

export type BulkUnavailabilityResult = {
  createdCount: number;
  created: Array<{ id: string; ministryId: string }>;
  failed: BulkUnavailabilityFailure[];
};

export async function createBulkVolunteerUnavailability(input: {
  volunteerId: string;
  ministryIds: string[];
  startsAtUtc: string;
  endsAtUtc: string;
}): Promise<BulkUnavailabilityResult> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const res = await fetchWithProtectedHeaders(
    `${base}/volunteers/${input.volunteerId}/unavailability/bulk`,
    { volunteerId: input.volunteerId },
    {
      method: 'POST',
      body: JSON.stringify({
        ministryIds: input.ministryIds,
        startsAtUtc: input.startsAtUtc,
        endsAtUtc: input.endsAtUtc,
      }),
    },
  );
  if (!res.ok) {
    throw await apiErrorFromResponse(res);
  }
  return res.json() as Promise<BulkUnavailabilityResult>;
}
