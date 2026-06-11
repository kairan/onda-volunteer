import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { VolunteersPage } from './volunteers';
import {
  AuthSessionContext,
  authSessionContextFixture,
} from '@/auth/AuthSessionProvider';
import { OrganizationContextProvider } from '@/organization/OrganizationContextProvider';
import * as fetchOrgContext from '@/organization/fetchOrganizationContext';
import * as fetchMembers from '@/organization/fetchMinistryMemberships';
import * as membershipLifecycle from '@/organization/membershipLifecycle';
import * as volunteerInvite from '@/organization/volunteerInvite';

vi.mock('@/organization/fetchOrganizationContext');
vi.mock('@/organization/fetchMinistryMemberships');
vi.mock('@/organization/membershipLifecycle');
vi.mock('@/organization/volunteerInvite', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/organization/volunteerInvite')>();
  return {
    ...actual,
    searchVolunteers: vi.fn().mockResolvedValue([]),
    sendVolunteerInvite: vi.fn().mockResolvedValue({ id: 'inv-1', email: 'x@y.com', sentAtUtc: '2026-06-06T00:00:00Z', expiresAtUtc: '2026-06-13T00:00:00Z', status: 'PENDING' }),
    listVolunteerInvites: vi.fn().mockResolvedValue([]),
  };
});

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
    isSystemAdmin: false,
    newlyFulfilledInvites: [],
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

  function renderPage(authOverrides = {}) {
    return render(
      <I18nProvider>
        <AuthSessionContext.Provider
          value={authSessionContextFixture({ ...authState, ...authOverrides })}
        >
          <OrganizationContextProvider enabled={true}>
            <VolunteersPage />
          </OrganizationContextProvider>
        </AuthSessionContext.Provider>
      </I18nProvider>,
    );
  }

  it('lists ministries where the admin is also a member', async () => {
    await initI18n(undefined, 'en');
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(orgContext as never);
    vi.mocked(fetchMembers.fetchMinistryMemberships).mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Greeters' })).toBeInTheDocument();
    });
    expect(screen.getByRole('option', { name: 'Band' })).toBeInTheDocument();
  });

  it('debounces search and shows results', async () => {
    await initI18n(undefined, 'en');
    const user = userEvent.setup();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(orgContext as never);
    vi.mocked(fetchMembers.fetchMinistryMemberships).mockResolvedValue([]);
    vi.mocked(volunteerInvite.searchVolunteers).mockResolvedValue([
      { id: 'vol-1', displayName: 'Alice Smith', email: 'alice@test.com' },
      { id: 'vol-2', displayName: 'Bob Jones', email: 'bob@test.com' },
    ]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Greeters' })).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText('Ministry'), greetersId);
    const searchInput = screen.getByPlaceholderText(/search by name/i);
    await user.type(searchInput, 'ali');

    await waitFor(() => {
      expect(volunteerInvite.searchVolunteers).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'ali', ministryId: greetersId }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Alice Smith/)).toBeInTheDocument();
    });
  });

  it('selects a search result and adds to ministry', async () => {
    await initI18n(undefined, 'en');
    const user = userEvent.setup();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(orgContext as never);
    vi.mocked(fetchMembers.fetchMinistryMemberships).mockResolvedValue([]);
    vi.mocked(volunteerInvite.searchVolunteers).mockResolvedValue([
      { id: 'vol-1', displayName: 'Alice Smith', email: 'alice@test.com' },
    ]);
    vi.mocked(membershipLifecycle.addMinistryMembership).mockResolvedValue({
      volunteerId: 'vol-1',
      ministryId: greetersId,
      status: 'PENDING',
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Greeters' })).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText('Ministry'), greetersId);
    const searchInput = screen.getByPlaceholderText(/search by name/i);
    await user.type(searchInput, 'alice');

    await waitFor(() => {
      expect(screen.getByText(/Alice Smith/)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/Alice Smith/));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add to ministry/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add to ministry/i }));

    await waitFor(() => {
      expect(membershipLifecycle.addMinistryMembership).toHaveBeenCalledWith({
        ministryId: greetersId,
        actingVolunteerId: adminId,
        volunteerId: 'vol-1',
        status: 'PENDING',
      });
    });
  });

  it('shows no-results state and invite section', async () => {
    await initI18n(undefined, 'en');
    const user = userEvent.setup();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(orgContext as never);
    vi.mocked(fetchMembers.fetchMinistryMemberships).mockResolvedValue([]);
    vi.mocked(volunteerInvite.searchVolunteers).mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Greeters' })).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText('Ministry'), greetersId);
    const searchInput = screen.getByPlaceholderText(/search by name/i);
    await user.type(searchInput, 'nobody');

    await waitFor(() => {
      expect(screen.getByText(/no volunteers found/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: /invite by email/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/volunteer@example/i)).toBeInTheDocument();
  });

  it('sends invite and shows success', async () => {
    await initI18n(undefined, 'en');
    const user = userEvent.setup();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(orgContext as never);
    vi.mocked(fetchMembers.fetchMinistryMemberships).mockResolvedValue([]);
    vi.mocked(volunteerInvite.sendVolunteerInvite).mockResolvedValue({
      id: 'inv-1',
      email: 'new@person.com',
      sentAtUtc: '2026-06-06T00:00:00Z',
      expiresAtUtc: '2026-06-13T00:00:00Z',
      status: 'PENDING',
    });
    vi.mocked(volunteerInvite.listVolunteerInvites).mockResolvedValue([
      { id: 'inv-1', email: 'new@person.com', sentAtUtc: '2026-06-06T00:00:00Z', expiresAtUtc: '2026-06-13T00:00:00Z', status: 'PENDING' },
    ]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Greeters' })).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText('Ministry'), greetersId);

    await user.click(screen.getByRole('button', { name: /invite by email/i }));

    const emailInput = screen.getByPlaceholderText(/volunteer@example/i);
    await user.type(emailInput, 'new@person.com');
    await user.click(screen.getByRole('button', { name: /send invite/i }));

    await waitFor(() => {
      expect(volunteerInvite.sendVolunteerInvite).toHaveBeenCalledWith({
        ministryId: greetersId,
        email: 'new@person.com',
        actingVolunteerId: adminId,
      });
    });

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/invite sent/i);
    });
  });

  it('handles VOLUNTEER_ALREADY_EXISTS by auto-populating search', async () => {
    await initI18n(undefined, 'en');
    const user = userEvent.setup();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(orgContext as never);
    vi.mocked(fetchMembers.fetchMinistryMemberships).mockResolvedValue([]);
    vi.mocked(volunteerInvite.sendVolunteerInvite).mockResolvedValue({
      code: 'VOLUNTEER_ALREADY_EXISTS',
      existingVolunteerId: 'vol-existing',
      displayName: 'Existing Person',
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Greeters' })).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText('Ministry'), greetersId);

    await user.click(screen.getByRole('button', { name: /invite by email/i }));
    const emailInput = screen.getByPlaceholderText(/volunteer@example/i);
    await user.type(emailInput, 'existing@person.com');
    await user.click(screen.getByRole('button', { name: /send invite/i }));

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search by name/i);
      expect(searchInput).toHaveValue('Existing Person');
    });

    expect(screen.getByRole('alert')).toHaveTextContent(/already has an account/i);
  });

  it('shows deactivate button for active members', async () => {
    await initI18n(undefined, 'en');
    const user = userEvent.setup();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(orgContext as never);
    vi.mocked(fetchMembers.fetchMinistryMemberships).mockResolvedValue([
      { volunteerId: 'vol-1', displayName: 'Sam Member', status: 'ACTIVE' },
    ]);
    vi.mocked(membershipLifecycle.deactivateMinistryMembership).mockResolvedValue({});

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Greeters' })).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText('Ministry'), greetersId);

    await waitFor(() => {
      expect(screen.getByText('Sam Member')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Deactivate' }));

    await waitFor(() => {
      expect(membershipLifecycle.deactivateMinistryMembership).toHaveBeenCalledWith({
        ministryId: greetersId,
        actingVolunteerId: adminId,
        volunteerId: 'vol-1',
        leaderMinistryId: greetersId,
      });
    });
  });
});
