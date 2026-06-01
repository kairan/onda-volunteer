import type { ReactElement } from 'react';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { AuthSessionTestProvider } from '@/auth/AuthSessionProvider';
import { ToastProvider } from '@/feedback/ToastHost';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { buildTestRouteTree } from '@/router.testUtils';
import { fetchIdentityMe } from '@/identity/fetchIdentityMe';

vi.mock('@/identity/fetchIdentityMe', () => ({
  fetchIdentityMe: vi.fn(),
}));

vi.mock('@/organization/fetchOrganizationContext', () => ({
  fetchOrganizationContext: vi.fn(async () => ({ churches: [] })),
}));

const fetchIdentityMeMock = vi.mocked(fetchIdentityMe);

function shellTestProviders(ui: ReactElement) {
  return (
    <I18nProvider>
      <ToastProvider>
        <AuthSessionTestProvider
          state={{ status: 'dev-bypass', volunteerId: 'seed-volunteer-demo' }}
        >
          {ui}
        </AuthSessionTestProvider>
      </ToastProvider>
    </I18nProvider>
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  fetchIdentityMeMock.mockResolvedValue({
    volunteer: {
      id: 'seed-volunteer-demo',
      displayName: 'Demo',
      uiLocale: null,
    },
    authSubjectId: null,
    isSystemAdmin: false,
  });
});

describe('App shell routing', () => {
  it('renders /dashboard inside the shell with skip link targeting main', async () => {
    await initI18n();
    const { routeTree } = buildTestRouteTree();
    const history = createMemoryHistory({ initialEntries: ['/dashboard'] });
    const routed = createRouter({ routeTree, history });

    render(shellTestProviders(<RouterProvider router={routed} />));

    const skip = await screen.findByRole('link', { name: /conteúdo principal/i });
    expect(skip).toHaveAttribute('href', '#main');
    const main = document.getElementById('main');
    expect(main).toBeTruthy();
    expect(within(main!).getByRole('heading', { level: 1 })).toHaveTextContent(
      'Painel',
    );
  });

  it('renders HOPE shell chrome without losing routed navigation', async () => {
    await initI18n();
    const { routeTree } = buildTestRouteTree();
    const history = createMemoryHistory({ initialEntries: ['/dashboard'] });
    const routed = createRouter({ routeTree, history });

    render(shellTestProviders(<RouterProvider router={routed} />));

    const primaryNav = await screen.findByRole('navigation', { name: 'Primary' });
    expect(primaryNav.closest('aside')?.className).toContain('border-r-2');

    const brand = screen.getAllByText('ON/DA')[0].parentElement;
    expect(brand?.className).toContain('border-2');
    expect(brand?.className).toContain('shadow-[4px_4px_0_0_hsl(var(--border))]');

    const activeDashboardLink = within(primaryNav).getByRole('link', {
      name: 'Painel',
    });
    expect(activeDashboardLink.className).toContain('bg-primary');
    expect(activeDashboardLink.className).toContain('shadow-[4px_4px_0_0_hsl(var(--border))]');
    expect(activeDashboardLink.className).toContain('normal-case');
  });

  it('keeps legacy / home outside the shell chrome', async () => {
    await initI18n();
    const { routeTree } = buildTestRouteTree();
    const history = createMemoryHistory({ initialEntries: ['/'] });
    const routed = createRouter({ routeTree, history });

    render(shellTestProviders(<RouterProvider router={routed} />));

    expect(await screen.findByRole('heading', { name: /volunteer roster/i })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument();
  });

  it('keeps inaccessible scheduling events inside the shell with a retry affordance', async () => {
    await initI18n();
    const { routeTree, schedulingEventDetailLoader } = buildTestRouteTree();
    const { ApiRequestError } = await import('@/apiError');
    schedulingEventDetailLoader.mockRejectedValue(
      new ApiRequestError(404, 'Event not found'),
    );
    const history = createMemoryHistory({
      initialEntries: ['/scheduling/events/forbidden'],
    });
    const routed = createRouter({ routeTree, history });

    render(shellTestProviders(<RouterProvider router={routed} />));

    expect(await screen.findByRole('alert')).toHaveTextContent('Event not found');
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
  });

  it('shows System Admin nav link when identity reports operator', async () => {
    await initI18n();
    fetchIdentityMeMock.mockResolvedValue({
      volunteer: {
        id: 'seed-volunteer-demo',
        displayName: 'Demo',
        uiLocale: null,
      },
      authSubjectId: null,
      isSystemAdmin: true,
    });
    const { routeTree } = buildTestRouteTree();
    const history = createMemoryHistory({ initialEntries: ['/dashboard'] });
    const routed = createRouter({ routeTree, history });

    render(shellTestProviders(<RouterProvider router={routed} />));

    const primaryNav = await screen.findByRole('navigation', { name: 'Primary' });
    expect(
      within(primaryNav).getByRole('link', { name: /system admin|admin do sistema/i }),
    ).toHaveAttribute('href', '/system-admin');
  });

  it('retries identity fetch once before hiding System Admin nav', async () => {
    await initI18n();
    fetchIdentityMeMock
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({
        volunteer: {
          id: 'seed-volunteer-demo',
          displayName: 'Demo',
          uiLocale: null,
        },
        authSubjectId: null,
        isSystemAdmin: true,
      });
    const { routeTree } = buildTestRouteTree();
    const history = createMemoryHistory({ initialEntries: ['/dashboard'] });
    const routed = createRouter({ routeTree, history });

    render(shellTestProviders(<RouterProvider router={routed} />));

    const primaryNav = await screen.findByRole('navigation', { name: 'Primary' });
    await waitFor(() => {
      expect(
        within(primaryNav).getByRole('link', { name: /system admin|admin do sistema/i }),
      ).toHaveAttribute('href', '/system-admin');
    });
    expect(fetchIdentityMeMock).toHaveBeenCalledTimes(2);
  });

  it('hides System Admin nav link for non-operators', async () => {
    await initI18n();
    const { routeTree } = buildTestRouteTree();
    const history = createMemoryHistory({ initialEntries: ['/dashboard'] });
    const routed = createRouter({ routeTree, history });

    render(shellTestProviders(<RouterProvider router={routed} />));

    const primaryNav = await screen.findByRole('navigation', { name: 'Primary' });
    expect(
      within(primaryNav).queryByRole('link', { name: /system admin|admin do sistema/i }),
    ).not.toBeInTheDocument();
  });

  it('redirects legacy /events/:id to shell scheduling detail', async () => {
    await initI18n();
    const { routeTree, schedulingEventDetailLoader } = buildTestRouteTree();
    schedulingEventDetailLoader.mockImplementation(async () => ({
      church: { name: 'Demo Church', defaultTimezone: 'America/Sao_Paulo' },
      event: {
        id: 'evt-1',
        title: 'Sunday',
        kind: 'PUBLIC',
        window: { startsAtUtc: '2026-01-01T10:00:00Z', endsAtUtc: '2026-01-01T12:00:00Z' },
        framing: {
          churchDefaultTimezone: 'America/Sao_Paulo',
          startsDisplayInChurchTz: '07:00',
          endsDisplayInChurchTz: '09:00',
        },
      },
      ministry: null,
      assignments: [],
    }));
    const history = createMemoryHistory({ initialEntries: ['/events/evt-1'] });
    const routed = createRouter({ routeTree, history });

    render(shellTestProviders(<RouterProvider router={routed} />));

    await waitFor(() => {
      expect(history.location.pathname).toBe('/scheduling/events/evt-1');
    });
    expect(await screen.findByRole('heading', { name: 'Sunday' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
  });
});
