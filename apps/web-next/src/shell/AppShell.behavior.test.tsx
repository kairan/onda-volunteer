import type { ReactElement } from 'react';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthSessionTestProvider } from '@/auth/AuthSessionProvider';
import { syncAuthVolunteerId } from '@/auth/authSession';
import { ToastProvider } from '@/feedback/ToastHost';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import { buildRouteTree } from '@/router';
import { fetchIdentityMe } from '@/identity/fetchIdentityMe';
import { useIsMobile } from '@/hooks/use-mobile';

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

vi.mock('@/volunteer/prefetchVolunteerDashboard', () => ({
  prefetchVolunteerDashboardQueries: vi.fn(async () => {}),
}));

vi.mock('@/identity/fetchIdentityMe', () => ({
  fetchIdentityMe: vi.fn(),
}));

vi.mock('@/organization/fetchOrganizationContext', () => ({
  fetchOrganizationContext: vi.fn(async () => ({
    churches: [
      {
        id: 'church-demo',
        name: 'Demo Church',
        defaultTimezone: 'UTC',
        isAccreditedAdmin: false,
        campuses: [{ id: 'campus-1', name: 'Main', timezone: 'UTC' }],
        ministries: [
          { id: 'ministry-worship', name: 'Worship', isLeader: true },
        ],
      },
    ],
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
        <LocalTimeProvider>
          <ToastProvider>
            <AuthSessionTestProvider state={authState}>{ui}</AuthSessionTestProvider>
          </ToastProvider>
        </LocalTimeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

afterEach(() => {
  cleanup();
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
  it('renders the Onda wordmark in the shell chrome', async () => {
    await initI18n(undefined, 'en');
    syncAuthVolunteerId({
      status: 'dev-bypass',
      volunteerId: 'seed-volunteer-demo',
    });
    const routeTree = buildRouteTree();
    const history = createMemoryHistory({ initialEntries: ['/dashboard'] });
    const routed = createRouter({ routeTree, history });

    render(shellTestProviders(<RouterProvider router={routed} />));

    expect((await screen.findAllByText('Onda')).length).toBeGreaterThan(0);
    expect(screen.queryByText('ON/DA')).not.toBeInTheDocument();
  });

  it('renders grant-gated nav items for a leader volunteer', async () => {
    await initI18n(undefined, 'en');
    syncAuthVolunteerId({
      status: 'dev-bypass',
      volunteerId: 'seed-volunteer-demo',
    });
    const routeTree = buildRouteTree();
    const history = createMemoryHistory({ initialEntries: ['/dashboard'] });
    const routed = createRouter({ routeTree, history });

    render(shellTestProviders(<RouterProvider router={routed} />));

    const primaryNav = await screen.findByRole('navigation', { name: 'Primary' });
    await waitFor(() => {
      expect(
        within(primaryNav).getByRole('link', { name: 'Events' }),
      ).toBeInTheDocument();
    });
    expect(
      within(primaryNav).getByRole('link', { name: 'Volunteers' }),
    ).toBeInTheDocument();
    expect(
      within(primaryNav).queryByRole('link', { name: 'My assignments' }),
    ).not.toBeInTheDocument();
    expect(
      within(primaryNav).queryByRole('link', { name: 'Roster' }),
    ).not.toBeInTheDocument();
  });

  it('opens the mobile sidebar sheet from the trigger button', async () => {
    vi.mocked(useIsMobile).mockReturnValue(true);
    await initI18n(undefined, 'en');
    syncAuthVolunteerId({
      status: 'dev-bypass',
      volunteerId: 'seed-volunteer-demo',
    });
    const user = userEvent.setup();
    const routeTree = buildRouteTree();
    const history = createMemoryHistory({ initialEntries: ['/dashboard'] });
    const routed = createRouter({ routeTree, history });

    render(shellTestProviders(<RouterProvider router={routed} />));

    const toggleButton = await screen.findByRole('button', {
      name: /toggle sidebar/i,
    });
    await user.click(toggleButton);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
  });
});
