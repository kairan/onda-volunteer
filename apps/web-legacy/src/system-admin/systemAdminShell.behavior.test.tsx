import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { AuthSessionTestProvider } from '@/auth/AuthSessionProvider';
import type { AuthSessionState } from '@/auth/authSession';
import { ToastProvider } from '@/feedback/ToastHost';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { fetchIdentityMe } from '@/identity/fetchIdentityMe';
import { identityMeFixture, systemAdminIdentityMeFixture } from '@/identity/testFixtures';
import { buildTestRouteTree } from '@/router.testUtils';

vi.mock('@/identity/fetchIdentityMe', () => ({
  fetchIdentityMe: vi.fn(),
}));

vi.mock('@/organization/fetchOrganizationContext', () => ({
  fetchOrganizationContext: vi.fn(async () => ({ churches: [] })),
}));

const fetchIdentityMeMock = vi.mocked(fetchIdentityMe);

function renderSystemAdminRoute(
  session: AuthSessionState,
  initialPath = '/system-admin',
) {
  const { routeTree } = buildTestRouteTree();
  const history = createMemoryHistory({ initialEntries: [initialPath] });
  const routed = createRouter({ routeTree, history });
  render(
    <I18nProvider>
      <ToastProvider>
        <AuthSessionTestProvider state={session}>
          <RouterProvider router={routed} />
        </AuthSessionTestProvider>
      </ToastProvider>
    </I18nProvider>,
  );
  return { history };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('System Admin shell routing', () => {
  it('renders the operator dashboard for a system admin', async () => {
    await initI18n();
    fetchIdentityMeMock.mockResolvedValue(systemAdminIdentityMeFixture());

    renderSystemAdminRoute({
      status: 'dev-bypass',
      volunteerId: 'seed-volunteer-system-admin',
    });

    expect(
      await screen.findByRole('heading', {
        name: /operator dashboard|painel do operador/i,
      }),
    ).toBeInTheDocument();
  });

  it('shows a route error when identity/me fails', async () => {
    await initI18n();
    fetchIdentityMeMock.mockRejectedValue(new Error('Failed to fetch'));

    const { history } = renderSystemAdminRoute({
      status: 'dev-bypass',
      volunteerId: 'seed-volunteer-demo',
    });

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(history.location.pathname).toBe('/system-admin');
  });

  it('redirects a non-operator volunteer to the dashboard', async () => {
    await initI18n();
    fetchIdentityMeMock.mockResolvedValue(identityMeFixture());

    const { history } = renderSystemAdminRoute({
      status: 'dev-bypass',
      volunteerId: 'seed-volunteer-demo',
    });

    await waitFor(() => {
      expect(history.location.pathname).toBe('/dashboard');
    });
  });
});
