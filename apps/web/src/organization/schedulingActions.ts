import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

export async function releaseAssignment(input: {
  assignmentId: string;
  volunteerId: string;
}) {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const url = `${base}/assignments/${input.assignmentId}/release`;
  
  return fetchJsonWithProtectedHeaders(
    url,
    { volunteerId: input.volunteerId },
    { method: 'POST' }
  );
}

export async function createAssignment(input: {
  eventId: string;
  volunteerId: string;
  ministryId: string;
  roleId: string;
  startsAtUtc: string;
  endsAtUtc: string;
  leaderMinistryId: string;
}) {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const url = `${base}/events/${input.eventId}/assignments`;
  
  return fetchJsonWithProtectedHeaders(
    url,
    { volunteerId: input.volunteerId, leaderMinistryId: input.leaderMinistryId },
    {
      method: 'POST',
      body: JSON.stringify({
        volunteerId: input.volunteerId,
        ministryId: input.ministryId,
        roleId: input.roleId,
        startsAtUtc: input.startsAtUtc,
        endsAtUtc: input.endsAtUtc,
      }),
    }
  );
}
