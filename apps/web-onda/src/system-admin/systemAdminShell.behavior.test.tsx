import { cleanup, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { initI18n } from '@/i18n/controller';
import { fetchIdentityMe } from '@/identity/fetchIdentityMe';
import {
  identityMeFixture,
  systemAdminIdentityMeFixture,
} from '@/identity/testFixtures';
import { renderSystemAdminRoute } from '@/test/systemAdminRouteTestUtils';

vi.mock('@/identity/fetchIdentityMe', () => ({
  fetchIdentityMe: vi.fn(),
}));

vi.mock('@/organization/fetchOrganizationContext', () => ({
  fetchOrganizationContext: vi.fn(async () => ({ churches: [] })),
}));

const fetchIdentityMeMock = vi.mocked(fetchIdentityMe);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('System Admin shell routing', () => {
  it('renders the operator dashboard for a system admin', async () => {
    await initI18n(undefined, 'en');
    fetchIdentityMeMock.mockResolvedValue(systemAdminIdentityMeFixture());

    await renderSystemAdminRoute('/system-admin');

    expect(
      await screen.findByRole('heading', {
        name: /operator dashboard/i,
      }),
    ).toBeInTheDocument();
  });

  it('redirects a non-operator volunteer to the dashboard', async () => {
    await initI18n(undefined, 'en');
    fetchIdentityMeMock.mockResolvedValue(identityMeFixture());

    const { router } = await renderSystemAdminRoute('/system-admin', {
      status: 'dev-bypass',
      volunteerId: 'seed-volunteer-demo',
    });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/dashboard');
    });
  });
});
