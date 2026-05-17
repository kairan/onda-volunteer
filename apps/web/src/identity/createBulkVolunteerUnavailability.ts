import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

export type CreateBulkUnavailabilityInput = {
  volunteerId: string;
  ministryIds: string[];
  startsAtUtc: string;
  endsAtUtc: string;
};

export async function createBulkVolunteerUnavailability(input: CreateBulkUnavailabilityInput) {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const url = `${base}/volunteers/${input.volunteerId}/unavailability/bulk`;
  
  return fetchJsonWithProtectedHeaders<{ count: number }>(
    url,
    { volunteerId: input.volunteerId },
    {
      method: 'POST',
      body: JSON.stringify({
        ministryIds: input.ministryIds,
        startsAtUtc: input.startsAtUtc,
        endsAtUtc: input.endsAtUtc,
      }),
    }
  );
}
