import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchIdentityMe } from '@/identity/fetchIdentityMe';
import { systemAdminIdentityMeFixture } from '@/identity/testFixtures';
import { ensureSystemAdminRouteAccess } from './ensureSystemAdminRouteAccess';

vi.mock('@/identity/fetchIdentityMe', () => ({
  fetchIdentityMe: vi.fn(),
}));

vi.mock('@/auth/authSession', () => ({
  volunteerIdForProtectedRequests: vi.fn(() => 'seed-volunteer-system-admin'),
}));

vi.mock('@tanstack/react-router', () => ({
  redirect: (args: unknown) => {
    throw Object.assign(new Error('redirect'), { redirect: args });
  },
}));

const fetchIdentityMeMock = vi.mocked(fetchIdentityMe);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ensureSystemAdminRouteAccess', () => {
  it('allows system administrators through', async () => {
    fetchIdentityMeMock.mockResolvedValue(systemAdminIdentityMeFixture());
    await expect(ensureSystemAdminRouteAccess()).resolves.toBeUndefined();
  });

  it('redirects non-system-admin volunteers', async () => {
    fetchIdentityMeMock.mockResolvedValue({
      ...systemAdminIdentityMeFixture(),
      isSystemAdmin: false,
    });

    await expect(ensureSystemAdminRouteAccess()).rejects.toMatchObject({
      redirect: { to: '/dashboard' },
    });
  });
});
