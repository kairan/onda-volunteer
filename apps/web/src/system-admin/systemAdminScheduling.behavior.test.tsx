import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { AuthSessionTestProvider } from '@/auth/AuthSessionProvider';
import { ToastProvider } from '@/feedback/ToastHost';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n, resetI18nForTests } from '@/i18n/controller';
import { fetchIdentityMe } from '@/identity/fetchIdentityMe';
import { systemAdminIdentityMeFixture } from '@/identity/testFixtures';
import { buildTestRouteTree } from '@/router.testUtils';
import { fetchSystemAdminEvents } from './systemAdminScheduling';

vi.mock('@/identity/fetchIdentityMe', () => ({
  fetchIdentityMe: vi.fn(),
}));

vi.mock('./systemAdminScheduling', () => ({
  fetchSystemAdminEvents: vi.fn(),
}));

vi.mock('@/organization/fetchOrganizationContext', () => ({
  fetchOrganizationContext: vi.fn(async () => ({ churches: [] })),
}));

const fetchIdentityMeMock = vi.mocked(fetchIdentityMe);
const fetchEventsMock = vi.mocked(fetchSystemAdminEvents);

function renderSchedulingPage() {
  const { routeTree } = buildTestRouteTree();
  const history = createMemoryHistory({
    initialEntries: ['/system-admin/scheduling'],
  });
  const routed = createRouter({ routeTree, history });
  render(
    <I18nProvider>
      <ToastProvider>
        <AuthSessionTestProvider
          state={{
            status: 'dev-bypass',
            volunteerId: 'seed-volunteer-system-admin',
          }}
        >
          <RouterProvider router={routed} />
        </AuthSessionTestProvider>
      </ToastProvider>
    </I18nProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  resetI18nForTests();
});

describe('System Admin scheduling page', () => {
  it('lists events read-only without write actions', async () => {
    await initI18n();
    fetchIdentityMeMock.mockResolvedValue(systemAdminIdentityMeFixture());

    fetchEventsMock.mockResolvedValue([
      {
        id: 'event-1',
        kind: 'PUBLIC',
        title: 'Sunday Service',
        window: {
          startsAtUtc: '2026-06-01T14:00:00.000Z',
          endsAtUtc: '2026-06-01T16:00:00.000Z',
        },
        framing: {
          churchDefaultTimezone: 'UTC',
          startsDisplayInChurchTz: '2026-06-01T14:00:00+00:00',
          endsDisplayInChurchTz: '2026-06-01T16:00:00+00:00',
        },
        ministry: null,
        church: { id: 'church-1', name: 'Alpha Church' },
      },
    ]);

    renderSchedulingPage();

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /scheduling support|suporte à agenda/i,
      }),
    ).toBeInTheDocument();

    expect(await screen.findByText('Sunday Service')).toBeInTheDocument();
    expect(screen.getAllByText(/read-only|somente leitura/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: /create|criar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /assign|designar/i })).not.toBeInTheDocument();

    await waitFor(() => {
      expect(fetchEventsMock).toHaveBeenCalledWith({
        volunteerId: 'seed-volunteer-system-admin',
        churchId: undefined,
      });
    });
  });
});
