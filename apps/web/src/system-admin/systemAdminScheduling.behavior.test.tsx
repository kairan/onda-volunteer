import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { AuthSessionTestProvider } from '@/auth/AuthSessionProvider';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { fetchIdentityMe } from '@/identity/fetchIdentityMe';
import { buildTestRouteTree } from '@/router.testUtils';
import { fetchSystemAdminEvents } from './fetchSystemAdminEvents';

vi.mock('@/identity/fetchIdentityMe', () => ({
  fetchIdentityMe: vi.fn(),
}));

vi.mock('@/organization/fetchOrganizationContext', () => ({
  fetchOrganizationContext: vi.fn(async () => ({ churches: [] })),
}));

vi.mock('./fetchSystemAdminEvents', () => ({
  fetchSystemAdminEvents: vi.fn(),
}));

const fetchIdentityMeMock = vi.mocked(fetchIdentityMe);
const fetchEventsMock = vi.mocked(fetchSystemAdminEvents);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('System Admin scheduling page', () => {
  it('lists events without write actions', async () => {
    await initI18n();
    fetchIdentityMeMock.mockResolvedValue({
      volunteer: {
        id: 'seed-volunteer-system-admin',
        displayName: 'Operator',
        uiLocale: null,
      },
      authSubjectId: null,
      isSystemAdmin: true,
    });
    fetchEventsMock.mockResolvedValue([
      {
        id: 'ev-1',
        kind: 'PUBLIC',
        title: 'Sunday',
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
      },
    ]);

    const { routeTree } = buildTestRouteTree();
    const history = createMemoryHistory({
      initialEntries: ['/system-admin/scheduling'],
    });
    const routed = createRouter({ routeTree, history });
    render(
      <I18nProvider>
        <AuthSessionTestProvider
          state={{ status: 'dev-bypass', volunteerId: 'seed-volunteer-system-admin' }}
        >
          <RouterProvider router={routed} />
        </AuthSessionTestProvider>
      </I18nProvider>,
    );

    expect(await screen.findByText('Sunday')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create/i })).not.toBeInTheDocument();
  });
});
