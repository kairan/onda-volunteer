import { getAccessToken } from './supabaseClient';

type ProtectedScope = {
  leaderMinistryId?: string;
  volunteerId?: string;
};

function devHeadersAllowed(): boolean {
  return import.meta.env.VITE_AUTH_USE_DEV_HEADERS !== 'false';
}

export async function buildProtectedHeaders(
  scope: ProtectedScope,
  options?: { json?: boolean },
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  if (options?.json) {
    headers['Content-Type'] = 'application/json';
  }

  const token = await getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  if (devHeadersAllowed()) {
    if (scope.leaderMinistryId) {
      headers['X-Leader-Ministry-Id'] = scope.leaderMinistryId;
    }
    if (scope.volunteerId) {
      headers['X-Volunteer-Id'] = scope.volunteerId;
    }
  }

  return headers;
}
