import { getAccessToken } from './supabaseClient';
import { apiErrorFromResponse } from './apiError';

export type ProtectedScope = {
  leaderMinistryId?: string;
  volunteerId?: string;
};

function devHeadersAllowed(): boolean {
  return import.meta.env.VITE_AUTH_USE_DEV_HEADERS !== 'false';
}

function applyDevHeaders(
  headers: Record<string, string>,
  scope: ProtectedScope,
): void {
  if (!devHeadersAllowed()) {
    return;
  }
  if (scope.leaderMinistryId) {
    headers['X-Leader-Ministry-Id'] = scope.leaderMinistryId;
  }
  if (scope.volunteerId) {
    headers['X-Volunteer-Id'] = scope.volunteerId;
  }
}

export async function buildProtectedHeaders(
  scope: ProtectedScope,
  options?: {
    json?: boolean;
    forceDev?: boolean;
    /** Skip getAccessToken(); use this Bearer when already resolved from getSession(). */
    bearerAccessToken?: string;
  },
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  if (options?.json) {
    headers['Content-Type'] = 'application/json';
  }

  if (options?.forceDev) {
    applyDevHeaders(headers, scope);
    return headers;
  }

  const token =
    options?.bearerAccessToken ?? (await getAccessToken());
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  applyDevHeaders(headers, scope);
  return headers;
}

/** Fetch with protected headers; on 401, retry once with dev headers when allowed. */
export async function fetchWithProtectedHeaders(
  url: string,
  scope: ProtectedScope,
  init?: RequestInit,
  bearerAccessToken?: string,
): Promise<Response> {
  const headers = await buildProtectedHeaders(scope, {
    json: init?.body !== undefined && init?.body !== null,
    bearerAccessToken,
  });
  let res = await fetch(url, {
    ...init,
    headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
  });

  const canRetryWithDev =
    res.status === 401 &&
    devHeadersAllowed() &&
    Boolean(scope.volunteerId || scope.leaderMinistryId) &&
    Boolean(headers.Authorization);

  if (canRetryWithDev) {
    const devHeaders = await buildProtectedHeaders(scope, {
      json: headers['Content-Type'] === 'application/json',
      forceDev: true,
    });
    res = await fetch(url, {
      ...init,
      headers: {
        ...devHeaders,
        ...(init?.headers as Record<string, string> | undefined),
      },
    });
  }

  return res;
}

export async function fetchJsonWithProtectedHeaders<T>(
  url: string,
  scope: ProtectedScope,
  init?: RequestInit,
  bearerAccessToken?: string,
): Promise<T> {
  const res = await fetchWithProtectedHeaders(url, scope, init, bearerAccessToken);
  if (!res.ok) {
    throw await apiErrorFromResponse(res);
  }
  return res.json() as Promise<T>;
}
