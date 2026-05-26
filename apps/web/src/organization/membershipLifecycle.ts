import { fetchJsonWithProtectedHeaders, fetchWithProtectedHeaders } from '@/apiAuthHeaders';

const base = () => import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function addMinistryMembership(input: {
  ministryId: string;
  actingVolunteerId: string;
  volunteerId: string;
  status: 'PENDING' | 'ACTIVE';
}) {
  return fetchJsonWithProtectedHeaders<{
    volunteerId: string;
    ministryId: string;
    status: string;
  }>(`${base()}/ministries/${input.ministryId}/memberships`, {
    volunteerId: input.actingVolunteerId,
  }, {
    method: 'POST',
    body: JSON.stringify({
      volunteerId: input.volunteerId,
      status: input.status,
    }),
  });
}

export async function activateMinistryMembership(input: {
  ministryId: string;
  actingVolunteerId: string;
  volunteerId: string;
}) {
  return fetchJsonWithProtectedHeaders(
    `${base()}/ministries/${input.ministryId}/memberships/${input.volunteerId}/activate`,
    { volunteerId: input.actingVolunteerId },
    { method: 'POST' },
  );
}

export async function deactivateMinistryMembership(input: {
  ministryId: string;
  actingVolunteerId: string;
  volunteerId: string;
  leaderMinistryId: string;
}) {
  const res = await fetchWithProtectedHeaders(
    `${base()}/ministries/${input.ministryId}/memberships/${input.volunteerId}/deactivate`,
    {
      volunteerId: input.actingVolunteerId,
      leaderMinistryId: input.leaderMinistryId,
    },
    { method: 'POST' },
  );
  if (!res.ok) {
    const { apiErrorFromResponse } = await import('@/apiError');
    throw await apiErrorFromResponse(res);
  }
  return res.json();
}
