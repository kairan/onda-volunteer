import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { SchedulingPage } from './scheduling';
import { AuthSessionContext } from '@/auth/AuthSessionProvider';
import { OrganizationContextProvider } from '@/organization/OrganizationContextProvider';
import { ToastProvider } from '@/feedback/ToastHost';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import * as fetchEvents from '@/organization/fetchEvents';
import * as fetchOrgContext from '@/organization/fetchOrganizationContext';

vi.mock('@/organization/fetchEvents');
vi.mock('@/organization/fetchOrganizationContext');

describe('SchedulingPage', () => {
  const mockVolunteerId = 'vol-123';
  const mockChurchId = 'church-456';

  const authState = {
    status: 'authenticated' as const,
    volunteerId: mockVolunteerId,
    displayName: 'Sam',
    uiLocale: 'pt-BR',
    refresh: async () => {},
  };

  const orgContext = {
    churches: [
      {
        id: mockChurchId,
        name: 'Test Church',
        defaultTimezone: 'UTC',
        campuses: [],
        ministries: [],
      },
    ],
  };

  it('lists events for the active church', async () => {
    await initI18n();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(orgContext);
    vi.mocked(fetchEvents.fetchEvents).mockResolvedValue([
      {
        id: 'evt-1',
        kind: 'PUBLIC',
        title: 'Sunday Service',
        startsAtUtc: '2026-06-01T10:00:00Z',
        endsAtUtc: '2026-06-01T12:00:00Z',
        churchId: mockChurchId,
        ministryId: null,
        ministry: null,
      },
    ]);

    const rootRoute = createRootRoute({ component: SchedulingPage });
    const router = createRouter({
      routeTree: rootRoute,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <ToastProvider>
            <AuthSessionContext.Provider value={authState}>
              <OrganizationContextProvider enabled={true}>
                <RouterProvider router={router} />
              </OrganizationContextProvider>
            </AuthSessionContext.Provider>
          </ToastProvider>
        </LocalTimeProvider>
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Sunday Service')).toBeInTheDocument();
    });

    expect(screen.getByText('PUBLIC')).toBeInTheDocument();
  });
});
