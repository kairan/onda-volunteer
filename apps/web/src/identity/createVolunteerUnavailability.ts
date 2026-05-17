import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

export type CreateUnavailabilityInput = {
  volunteerId: string;
  ministryId: string;
  startsAtUtc: string;
  endsAtUtc: string;
};

export async function createVolunteerUnavailability(input: CreateUnavailabilityInput) {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const url = `${base}/volunteers/${input.volunteerId}/unavailability`;
  
  return fetchJsonWithProtectedHeaders(
    url,
    { volunteerId: input.volunteerId },
    {
      method: 'POST',
      body: JSON.stringify({
        ministryId: input.ministryId,
        startsAtUtc: input.startsAtUtc,
        endsAtUtc: input.endsAtUtc,
      }),
    }
  );
}
