import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

export type VolunteerUnavailability = {
  id: string;
  startsAtUtc: string;
  endsAtUtc: string;
  ministry: {
    id: string;
    name: string;
  };
};

export async function fetchVolunteerUnavailability(input: {
  volunteerId: string;
  churchId?: string;
}): Promise<VolunteerUnavailability[]> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const url = new URL(`${base}/volunteers/${input.volunteerId}/unavailability`);
  if (input.churchId) {
    url.searchParams.set('churchId', input.churchId);
  }

  return fetchJsonWithProtectedHeaders<VolunteerUnavailability[]>(
    url.toString(),
    { volunteerId: input.volunteerId },
  );
}
