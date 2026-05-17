import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

export type VolunteerAssignment = {
  id: string;
  startsAtUtc: string;
  endsAtUtc: string;
  event: {
    id: string;
    title: string;
    startsAtUtc: string;
    endsAtUtc: string;
  };
  role: {
    id: string;
    name: string;
  };
};

export async function fetchVolunteerAssignments(input: {
  volunteerId: string;
  churchId?: string;
}): Promise<VolunteerAssignment[]> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const url = new URL(`${base}/volunteers/${input.volunteerId}/assignments`);
  if (input.churchId) {
    url.searchParams.set('churchId', input.churchId);
  }
  
  return fetchJsonWithProtectedHeaders<VolunteerAssignment[]>(
    url.toString(),
    { volunteerId: input.volunteerId }
  );
}
