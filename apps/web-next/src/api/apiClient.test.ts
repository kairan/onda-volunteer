import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getJson,
  mutateJson,
  fetchWithProtectedHeaders,
} from './apiClient';
import { ApiRequestError } from './apiError';
import * as authSession from '@/auth/authSession';
import * as supabaseModule from '@/supabaseClient';

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
  vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
  vi.stubEnv('VITE_AUTH_USE_DEV_HEADERS', 'true');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('apiClient', () => {
  it('getJson returns parsed JSON on success', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    await expect(
      getJson<{ ok: boolean }>('/identity/me', { volunteerId: 'vol-1' }),
    ).resolves.toEqual({ ok: true });
  });

  it('getJson throws ApiRequestError on 4xx', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Not found' }), { status: 404 }),
    );

    await expect(
      getJson('/missing', { volunteerId: 'vol-1' }),
    ).rejects.toBeInstanceOf(ApiRequestError);
  });

  it('retries with dev headers after 401 when volunteer scope is set', async () => {
    vi.spyOn(supabaseModule, 'getAccessToken').mockResolvedValue('bearer-token');
    vi.spyOn(authSession, 'shouldForceDevHeadersForApi').mockReturnValue(false);
    mockFetch
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );

    const res = await fetchWithProtectedHeaders(
      'http://localhost:3000/identity/me',
      { volunteerId: 'vol-1' },
    );

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(200);
    const secondCallInit = mockFetch.mock.calls[1]?.[1] as RequestInit;
    const secondCallHeaders = secondCallInit.headers as Record<string, string>;
    expect(secondCallHeaders['X-Volunteer-Id']).toBe('vol-1');
    expect(secondCallHeaders.Authorization).toBeUndefined();
  });

  it('mutateJson sets Content-Type application/json', async () => {
    vi.spyOn(authSession, 'shouldForceDevHeadersForApi').mockReturnValue(true);
    vi.spyOn(supabaseModule, 'getAccessToken').mockResolvedValue(null);
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: '1' }), { status: 200 }),
    );

    await mutateJson(
      '/events',
      { volunteerId: 'vol-1' },
      { method: 'POST', body: JSON.stringify({ title: 'Test' }) },
    );

    const firstCallInit = mockFetch.mock.calls[0]?.[1] as RequestInit;
    const headers = firstCallInit.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
  });
});
