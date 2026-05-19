import type { ReactNode } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { SchedulingPage } from './scheduling';
import { AuthSessionContext } from '@/auth/AuthSessionProvider';
import { OrganizationContextProvider } from '@/organization/OrganizationContextProvider';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import * as fetchEvents from '@/events/fetchEvents';
import * as fetchOrgContext from '@/organization/fetchOrganizationContext';

vi.mock('@/events/fetchEvents');
vi.mock('@/organization/fetchOrganizationContext');
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...mod,
    Link: ({
      children,
      to,
      params,
    }: {
      children: ReactNode;
      to: string;
      params?: { eventId: string };
    }) => (
      <a
        href={
          params?.eventId && to.includes('$eventId')
            ? to.replace('$eventId', params.eventId)
            : to
        }
      >
        {children}
      </a>
    ),
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

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
        defaultTimezone: 'America/New_York',
        campuses: [],
      },
    ],
  };

  it('renders public and private events with links to detail', async () => {
    await initI18n();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(orgContext as any);
    vi.mocked(fetchEvents.fetchEvents).mockResolvedValue([
      {
        id: 'evt-public',
        kind: 'PUBLIC',
        title: 'Sunday Service',
        window: {
          startsAtUtc: '2026-06-01T14:00:00.000Z',
          endsAtUtc: '2026-06-01T16:00:00.000Z',
        },
        framing: {
          churchDefaultTimezone: 'America/New_York',
          startsDisplayInChurchTz: '2026-06-01T10:00:00-04:00',
          endsDisplayInChurchTz: '2026-06-01T12:00:00-04:00',
        },
        ministry: null,
      },
      {
        id: 'evt-private',
        kind: 'PRIVATE',
        title: 'Band Rehearsal',
        window: {
          startsAtUtc: '2026-06-02T18:00:00.000Z',
          endsAtUtc: '2026-06-02T20:00:00.000Z',
        },
        framing: {
          churchDefaultTimezone: 'America/New_York',
          startsDisplayInChurchTz: '2026-06-02T14:00:00-04:00',
          endsDisplayInChurchTz: '2026-06-02T16:00:00-04:00',
        },
        ministry: { id: 'min-band', name: 'Band' },
      },
    ]);

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <AuthSessionContext.Provider value={authState}>
            <OrganizationContextProvider enabled={true}>
              <SchedulingPage />
            </OrganizationContextProvider>
          </AuthSessionContext.Provider>
        </LocalTimeProvider>
      </I18nProvider>,
    );

    expect(screen.getByText('Carregando eventos...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Sunday Service')).toBeInTheDocument();
    });

    expect(screen.getByText('Band Rehearsal').closest('a')).toHaveAttribute(
      'href',
      '/events/evt-private',
    );
    expect(screen.getByText('Público')).toBeInTheDocument();
    expect(screen.getByText('Privado')).toBeInTheDocument();
    expect(screen.getByText('Band')).toBeInTheDocument();

    expect(fetchEvents.fetchEvents).toHaveBeenCalledWith({
      volunteerId: mockVolunteerId,
      churchId: mockChurchId,
    });
  });

  it('renders empty state when no events', async () => {
    await initI18n();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(orgContext as any);
    vi.mocked(fetchEvents.fetchEvents).mockResolvedValue([]);

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <AuthSessionContext.Provider value={authState}>
            <OrganizationContextProvider enabled={true}>
              <SchedulingPage />
            </OrganizationContextProvider>
          </AuthSessionContext.Provider>
        </LocalTimeProvider>
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Nenhum evento para exibir nesta igreja ainda/i),
      ).toBeInTheDocument();
    });
  });
});
