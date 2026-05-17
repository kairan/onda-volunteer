import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { EventDetailPage } from './eventDetail';
import { AuthSessionContext } from '@/auth/AuthSessionProvider';
import { OrganizationContextProvider } from '@/organization/OrganizationContextProvider';
import { ToastProvider } from '@/feedback/ToastHost';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';

describe('EventDetailPage', () => {
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

  it('renders event details and roster', async () => {
    await initI18n();
    
    const mockEvent = {
      church: { id: mockChurchId, name: 'Test Church', defaultTimezone: 'UTC' },
      event: {
        id: 'evt-1',
        kind: 'PUBLIC',
        title: 'Sunday Service',
        window: { startsAtUtc: '2026-06-01T10:00:00Z', endsAtUtc: '2026-06-01T12:00:00Z' },
        framing: { churchDefaultTimezone: 'UTC', startsDisplayInChurchTz: '', endsDisplayInChurchTz: '' },
      },
      ministry: null,
      assignments: [
        {
          id: 'a-1',
          volunteer: { id: 'v-1', displayName: 'John Doe' },
          ministry: { id: 'm-1', name: 'Music' },
          role: { id: 'r-1', name: 'Singer' },
          window: { startsAtUtc: '2026-06-01T10:00:00Z', endsAtUtc: '2026-06-01T11:00:00Z' },
        }
      ],
    };

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockEvent,
    } as Response);

    const rootRoute = createRootRoute();
    const detailRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/scheduling/events/$eventId',
        component: EventDetailPage,
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([detailRoute]),
      history: createMemoryHistory({ initialEntries: ['/scheduling/events/evt-1'] }),
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

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Singer')).toBeInTheDocument();
  });
});
