import type { ReactElement } from 'react';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthSessionTestProvider } from '@/auth/AuthSessionProvider';
import { syncAuthVolunteerId } from '@/auth/authSession';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { ProtectedAppShell } from '@/shell/ProtectedAppShell';
import { fetchIdentityMe } from '@/identity/fetchIdentityMe';
import { useIsMobile } from '@/hooks/use-mobile';
import { clearStoredOrganizationSelection } from '@/organization/organizationContextStorage';

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

vi.mock('@/identity/fetchIdentityMe', () => ({
  fetchIdentityMe: vi.fn(),
}));

const dualRoleChurch = {
  id: 'church-demo',
  name: 'Demo Church',
  defaultTimezone: 'UTC',
  isAccreditedAdmin: false,
  campuses: [{ id: 'campus-1', name: 'Main', timezone: 'UTC' }],
  ministries: [
    {
      id: 'min-louvor',
      name: 'Louvor',
      isLeader: true,
      membershipStatus: 'ACTIVE' as const,
    },
    {
      id: 'min-kids',
      name: 'Kids',
      membershipStatus: 'ACTIVE' as const,
    },
  ],
};

vi.mock('@/organization/fetchOrganizationContext', () => ({
  fetchOrganizationContext: vi.fn(async () => ({
    churches: [dualRoleChurch],
  })),
}));

const fetchIdentityMeMock = vi.mocked(fetchIdentityMe);

function shellTestProviders(
  ui: ReactElement,
  authState: Parameters<typeof AuthSessionTestProvider>[0]['state'] = {
    status: 'dev-bypass',
    volunteerId: 'seed-volunteer-demo',
  },
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthSessionTestProvider state={authState}>{ui}</AuthSessionTestProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

function buildTestRouter() {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });
  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    component: () => (
      <ProtectedAppShell>
        <h1>Dashboard</h1>
      </ProtectedAppShell>
    ),
  });
  const routeTree = rootRoute.addChildren([dashboardRoute]);
  const history = createMemoryHistory({ initialEntries: ['/dashboard'] });
  return createRouter({ routeTree, history });
}

afterEach(() => {
  cleanup();
  clearStoredOrganizationSelection();
  vi.clearAllMocks();
  vi.mocked(useIsMobile).mockReturnValue(false);
  syncAuthVolunteerId({ status: 'loading' });
});

beforeEach(() => {
  fetchIdentityMeMock.mockResolvedValue({
    volunteer: {
      id: 'seed-volunteer-demo',
      displayName: 'Demo Volunteer',
      uiLocale: null,
    },
    authSubjectId: 'auth-subject-demo',
    isSystemAdmin: false,
    newlyFulfilledInvites: [],
  });
});

describe('AppShell', () => {
  it('renders the Onda wordmark and church name from organization context', async () => {
    await initI18n(undefined, 'en');
    syncAuthVolunteerId({
      status: 'dev-bypass',
      volunteerId: 'seed-volunteer-demo',
    });
    const router = buildTestRouter();

    render(shellTestProviders(<RouterProvider router={router} />));

    expect((await screen.findAllByText('Onda')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('Demo Church')).length).toBeGreaterThan(0);
    expect(screen.queryByLabelText(/switch role/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/search/i)).not.toBeInTheDocument();
  });

  it('renders leader nav when working context is leader', async () => {
    await initI18n(undefined, 'en');
    syncAuthVolunteerId({
      status: 'dev-bypass',
      volunteerId: 'seed-volunteer-demo',
    });
    const router = buildTestRouter();

    render(shellTestProviders(<RouterProvider router={router} />));

    const primaryNav = await screen.findByRole('navigation', { name: 'Primary' });
    await waitFor(() => {
      expect(
        within(primaryNav).getByRole('link', { name: 'Events' }),
      ).toBeInTheDocument();
    });
    expect(
      within(primaryNav).queryByRole('link', { name: 'My assignments' }),
    ).not.toBeInTheDocument();
  });

  it('updates nav when working context switches to volunteer', async () => {
    await initI18n(undefined, 'en');
    syncAuthVolunteerId({
      status: 'dev-bypass',
      volunteerId: 'seed-volunteer-demo',
    });
    const user = userEvent.setup();
    const router = buildTestRouter();

    render(shellTestProviders(<RouterProvider router={router} />));

    const primaryNav = await screen.findByRole('navigation', { name: 'Primary' });
    await waitFor(() => {
      expect(
        within(primaryNav).getByRole('link', { name: 'Events' }),
      ).toBeInTheDocument();
    });

    const contextSelect = await screen.findByLabelText('Act as');
    await user.selectOptions(contextSelect, 'min-kids:volunteer');

    await waitFor(() => {
      expect(
        within(primaryNav).getByRole('link', { name: 'My assignments' }),
      ).toBeInTheDocument();
      expect(
        within(primaryNav).queryByRole('link', { name: 'Events' }),
      ).not.toBeInTheDocument();
    });
  });
});
