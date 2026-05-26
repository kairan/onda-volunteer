import { cleanup, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { LeaderVolunteerTimeAwayPage } from './leaderVolunteerTimeAway';
import { AuthSessionContext } from '@/auth/AuthSessionProvider';
import { OrganizationContextProvider } from '@/organization/OrganizationContextProvider';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import * as fetchOrgContext from '@/organization/fetchOrganizationContext';
import * as fetchMembers from '@/organization/fetchMinistryMemberships';
import * as fetchUnavailability from '@/identity/fetchVolunteerUnavailability';
import * as createUnavailability from '@/identity/createVolunteerUnavailability';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

vi.mock('@/organization/fetchOrganizationContext');
vi.mock('@/organization/fetchMinistryMemberships');
vi.mock('@/identity/fetchVolunteerUnavailability');
vi.mock('@/identity/createVolunteerUnavailability');
vi.mock('@/identity/updateVolunteerUnavailability');
vi.mock('@/identity/deleteVolunteerUnavailability');

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('LeaderVolunteerTimeAwayPage', () => {
  const leaderId = 'leader-1';
  const churchId = 'church-1';
  const ministryId = 'min-led';

  const authState = {
    status: 'authenticated' as const,
    volunteerId: leaderId,
    displayName: 'Lee',
    uiLocale: 'en',
    refresh: async () => {},
  };

  const orgContext = {
    churches: [
      {
        id: churchId,
        name: 'Test Church',
        defaultTimezone: 'UTC',
        isAccreditedAdmin: false,
        campuses: [],
        ministries: [
          { id: ministryId, name: 'Greeters', isLeader: true },
          { id: 'min-member', name: 'Band', membershipStatus: 'ACTIVE' as const },
        ],
      },
    ],
  };

  it('shows leader support copy distinct from self-service', async () => {
    await initI18n();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(
      orgContext as never,
    );

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <AuthSessionContext.Provider value={authState}>
            <OrganizationContextProvider enabled={true}>
              <LeaderVolunteerTimeAwayPage />
            </OrganizationContextProvider>
          </AuthSessionContext.Provider>
        </LocalTimeProvider>
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Tempo livre do voluntário' }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(/autoatendimento Tempo livre/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /seu tempo livre/i })).toHaveAttribute(
      'href',
      '/time-away',
    );
  });

  it('creates unavailability on behalf of a selected volunteer', async () => {
    await initI18n();
    const user = userEvent.setup();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(
      orgContext as never,
    );
    vi.mocked(fetchMembers.fetchMinistryMemberships).mockResolvedValue([
      { volunteerId: 'vol-2', displayName: 'Sam', status: 'ACTIVE' },
    ]);
    vi.mocked(fetchUnavailability.fetchVolunteerUnavailability).mockResolvedValue([]);
    vi.mocked(createUnavailability.createVolunteerUnavailability).mockResolvedValue({
      id: 'new-1',
      ministryId,
      window: {
        startsAtUtc: '2026-06-01T10:00:00.000Z',
        endsAtUtc: '2026-06-01T12:00:00.000Z',
      },
    });

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <AuthSessionContext.Provider value={authState}>
            <OrganizationContextProvider enabled={true}>
              <LeaderVolunteerTimeAwayPage />
            </OrganizationContextProvider>
          </AuthSessionContext.Provider>
        </LocalTimeProvider>
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^Ministério que você lidera/i)).toBeInTheDocument();
    });

    await user.selectOptions(
      screen.getByLabelText(/^Ministério que você lidera/i),
      ministryId,
    );
    await waitFor(() => {
      expect(fetchMembers.fetchMinistryMemberships).toHaveBeenCalled();
    });
    await user.selectOptions(screen.getByLabelText(/^Voluntário/i), 'vol-2');
    await user.type(screen.getByLabelText(/^Início/i), '2026-06-01T10:00');
    await user.type(screen.getByLabelText(/^Fim/i), '2026-06-01T12:00');
    await user.click(screen.getByRole('button', { name: 'Salvar para o voluntário' }));

    await waitFor(() => {
      expect(createUnavailability.createVolunteerUnavailability).toHaveBeenCalledWith(
        expect.objectContaining({
          volunteerId: 'vol-2',
          ministryId,
          leaderMinistryId: ministryId,
          actingVolunteerId: leaderId,
        }),
      );
    });
  });
});
