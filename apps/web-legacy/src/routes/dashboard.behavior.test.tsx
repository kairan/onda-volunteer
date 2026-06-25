import type { ReactNode } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { DashboardPage } from './dashboard';
import {
  AuthSessionContext,
  authSessionContextFixture,
} from '@/auth/AuthSessionProvider';
import { OrganizationContextProvider } from '@/organization/OrganizationContextProvider';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import * as fetchAssignments from '@/identity/fetchVolunteerAssignments';
import * as fetchOrgContext from '@/organization/fetchOrganizationContext';

vi.mock('@/identity/fetchVolunteerAssignments');
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
});

describe('DashboardPage', () => {
  const mockVolunteerId = 'vol-123';
  const mockChurchId = 'church-456';

  const authState = {
    status: 'authenticated' as const,
    volunteerId: mockVolunteerId,
    displayName: 'Sam',
    uiLocale: 'pt-BR',
    isSystemAdmin: false,
    newlyFulfilledInvites: [],
  };

  const orgContext = {
    churches: [
      {
        id: mockChurchId,
        name: 'Test Church',
        defaultTimezone: 'UTC',
        isAccreditedAdmin: false,
        campuses: [],
      },
    ],
  };

  it('renders assignments when loaded', async () => {
    await initI18n();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(orgContext as any);
    vi.mocked(fetchAssignments.fetchVolunteerAssignments).mockResolvedValue([
      {
        id: 'assign-1',
        startsAtUtc: '2026-06-01T10:00:00Z',
        endsAtUtc: '2026-06-01T11:00:00Z',
        event: { id: 'evt-1', title: 'Sunday Morning', startsAtUtc: '2026-06-01T10:00:00Z', endsAtUtc: '2026-06-01T12:00:00Z' },
        role: { id: 'role-1', name: 'Greeter' },
      },
    ]);

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <AuthSessionContext.Provider value={authSessionContextFixture(authState)}>
            <OrganizationContextProvider enabled={true}>
              <DashboardPage />
            </OrganizationContextProvider>
          </AuthSessionContext.Provider>
        </LocalTimeProvider>
      </I18nProvider>,
    );

    // Initial loading state
    expect(screen.getByText('Carregando escalas...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Sunday Morning')).toBeInTheDocument();
    });

    expect(screen.getByText('Greeter')).toBeInTheDocument();
    expect(screen.getByText('Sunday Morning').closest('a')).toHaveAttribute(
      'href',
      '/scheduling/events/evt-1',
    );
    expect(screen.queryByText('Carregando escalas...')).not.toBeInTheDocument();
  });

  it('renders empty state when no assignments', async () => {
    await initI18n();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(orgContext as any);
    vi.mocked(fetchAssignments.fetchVolunteerAssignments).mockResolvedValue([]);

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <AuthSessionContext.Provider value={authSessionContextFixture(authState)}>
            <OrganizationContextProvider enabled={true}>
              <DashboardPage />
            </OrganizationContextProvider>
          </AuthSessionContext.Provider>
        </LocalTimeProvider>
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Sem escalas futuras/)).toBeInTheDocument();
    });
  });
});
