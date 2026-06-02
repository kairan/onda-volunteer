import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { VolunteersPage } from './volunteers';
import { AuthSessionContext } from '@/auth/AuthSessionProvider';
import { OrganizationContextProvider } from '@/organization/OrganizationContextProvider';
import * as fetchOrgContext from '@/organization/fetchOrganizationContext';
import * as fetchMembers from '@/organization/fetchMinistryMemberships';
import * as membershipLifecycle from '@/organization/membershipLifecycle';
import { ApiRequestError } from '@/apiError';

vi.mock('@/organization/fetchOrganizationContext');
vi.mock('@/organization/fetchMinistryMemberships');
vi.mock('@/organization/membershipLifecycle');

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('VolunteersPage', () => {
  const adminId = 'admin-1';
  const churchId = 'church-1';
  const greetersId = 'min-greeters';

  const authState = {
    status: 'authenticated' as const,
    volunteerId: adminId,
    displayName: 'Pat Admin',
    uiLocale: 'en',
    refresh: async () => {},
  };

  const orgContext = {
    churches: [
      {
        id: churchId,
        name: 'Test Church',
        defaultTimezone: 'UTC',
        campuses: [],
        ministries: [
          {
            id: greetersId,
            name: 'Greeters',
            membershipStatus: 'ACTIVE' as const,
            isChurchAdmin: true,
          },
          {
            id: 'min-band',
            name: 'Band',
            isChurchAdmin: true,
          },
        ],
      },
    ],
  };

  it('lists ministries where the admin is also a member', async () => {
    await initI18n(undefined, 'en');
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(
      orgContext as never,
    );
    vi.mocked(fetchMembers.fetchMinistryMemberships).mockResolvedValue([]);

    render(
      <I18nProvider>
        <AuthSessionContext.Provider value={authState}>
          <OrganizationContextProvider enabled={true}>
            <VolunteersPage />
          </OrganizationContextProvider>
        </AuthSessionContext.Provider>
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Greeters' })).toBeInTheDocument();
    });
    expect(screen.getByRole('option', { name: 'Band' })).toBeInTheDocument();
  });

  it('shows action errors with alert styling', async () => {
    await initI18n(undefined, 'en');
    const user = userEvent.setup();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(
      orgContext as never,
    );
    vi.mocked(fetchMembers.fetchMinistryMemberships).mockResolvedValue([]);
    vi.mocked(membershipLifecycle.addMinistryMembership).mockRejectedValue(
      new ApiRequestError(
        403,
        'You are not accredited for this church.',
        'ADMIN_NOT_ACCREDITED',
      ),
    );

    render(
      <I18nProvider>
        <AuthSessionContext.Provider value={authState}>
          <OrganizationContextProvider enabled={true}>
            <VolunteersPage />
          </OrganizationContextProvider>
        </AuthSessionContext.Provider>
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Greeters' })).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText('Ministry'), greetersId);
    await user.type(screen.getByLabelText('Volunteer ID'), 'vol-2');
    await user.click(screen.getByRole('button', { name: 'Add to ministry' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /not accredited for this church/i,
      );
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('lets a leader select a led ministry, add a member, and deactivate', async () => {
    await initI18n(undefined, 'en');
    const user = userEvent.setup();
    const leaderId = 'leader-1';
    const ledMinistryId = 'min-greeters';
    const memberId = 'vol-member';

    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue({
      churches: [
        {
          id: churchId,
          name: 'Test Church',
          defaultTimezone: 'UTC',
          isAccreditedAdmin: false,
          campuses: [],
          ministries: [
            {
              id: ledMinistryId,
              name: 'Greeters',
              isLeader: true,
            },
            {
              id: 'min-band',
              name: 'Band',
              membershipStatus: 'ACTIVE' as const,
            },
          ],
        },
      ],
    } as never);

    vi.mocked(fetchMembers.fetchMinistryMemberships).mockResolvedValue([
      {
        volunteerId: memberId,
        displayName: 'Sam Member',
        status: 'ACTIVE',
      },
    ]);
    vi.mocked(membershipLifecycle.addMinistryMembership).mockResolvedValue({
      volunteerId: memberId,
      ministryId: ledMinistryId,
      status: 'PENDING',
    });
    vi.mocked(membershipLifecycle.deactivateMinistryMembership).mockResolvedValue(
      {},
    );

    render(
      <I18nProvider>
        <AuthSessionContext.Provider
          value={{
            ...authState,
            volunteerId: leaderId,
            displayName: 'Lee Leader',
          }}
        >
          <OrganizationContextProvider enabled={true}>
            <VolunteersPage />
          </OrganizationContextProvider>
        </AuthSessionContext.Provider>
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Greeters' })).toBeInTheDocument();
    });
    expect(screen.queryByRole('option', { name: 'Band' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Add membership' })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Ministry'), ledMinistryId);
    await user.type(screen.getByLabelText('Volunteer ID'), memberId);
    await user.click(screen.getByRole('button', { name: 'Add to ministry' }));

    await waitFor(() => {
      expect(membershipLifecycle.addMinistryMembership).toHaveBeenCalledWith({
        ministryId: ledMinistryId,
        actingVolunteerId: leaderId,
        volunteerId: memberId,
        status: 'PENDING',
      });
    });

    await user.click(screen.getByRole('button', { name: 'Deactivate' }));

    await waitFor(() => {
      expect(membershipLifecycle.deactivateMinistryMembership).toHaveBeenCalledWith({
        ministryId: ledMinistryId,
        actingVolunteerId: leaderId,
        volunteerId: memberId,
        leaderMinistryId: ledMinistryId,
      });
    });
  });
});
