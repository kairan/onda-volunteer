import { fetchJsonWithProtectedHeaders, fetchWithProtectedHeaders } from '@/apiAuthHeaders';

const base = () => import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type VolunteerSearchResult = {
  id: string;
  displayName: string;
  email: string | null;
};

export type VolunteerInviteRow = {
  id: string;
  email: string;
  sentAtUtc: string;
  expiresAtUtc: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
};

export type SendInviteSuccess = {
  id: string;
  email: string;
  sentAtUtc: string;
  expiresAtUtc: string;
  status: string;
};

export type SendInviteAlreadyExists = {
  code: 'VOLUNTEER_ALREADY_EXISTS';
  existingVolunteerId: string;
  displayName: string;
};

export type SendInviteResult = SendInviteSuccess | SendInviteAlreadyExists;

export function isSendInviteAlreadyExists(
  result: SendInviteResult,
): result is SendInviteAlreadyExists {
  return (
    typeof result === 'object' &&
    result !== null &&
    'code' in result &&
    (result as { code: string }).code === 'VOLUNTEER_ALREADY_EXISTS'
  );
}

export async function searchVolunteers(input: {
  churchId: string;
  query: string;
  ministryId: string;
  actingVolunteerId: string;
}): Promise<VolunteerSearchResult[]> {
  const params = new URLSearchParams({ q: input.query, ministryId: input.ministryId });
  const data = await fetchJsonWithProtectedHeaders<{ volunteers: VolunteerSearchResult[] }>(
    `${base()}/churches/${input.churchId}/volunteers/search?${params}`,
    { volunteerId: input.actingVolunteerId },
  );
  return data.volunteers;
}

export async function sendVolunteerInvite(input: {
  ministryId: string;
  email: string;
  actingVolunteerId: string;
}): Promise<SendInviteResult> {
  const res = await fetchWithProtectedHeaders(
    `${base()}/ministries/${input.ministryId}/invites`,
    { volunteerId: input.actingVolunteerId },
    { method: 'POST', body: JSON.stringify({ email: input.email }) },
  );
  if (!res.ok) {
    const { apiErrorFromResponse } = await import('@/apiError');
    throw await apiErrorFromResponse(res);
  }
  return (await res.json()) as SendInviteResult;
}

export async function listVolunteerInvites(input: {
  ministryId: string;
  actingVolunteerId: string;
}): Promise<VolunteerInviteRow[]> {
  const data = await fetchJsonWithProtectedHeaders<{ invites: VolunteerInviteRow[] }>(
    `${base()}/ministries/${input.ministryId}/invites`,
    { volunteerId: input.actingVolunteerId },
  );
  return data.invites;
}
