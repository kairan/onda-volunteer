import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { AuthSessionTestProvider } from '@/auth/AuthSessionProvider';
import { ToastProvider } from '@/feedback/ToastHost';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { fetchIdentityMe } from '@/identity/fetchIdentityMe';
import { systemAdminIdentityMeFixture } from '@/identity/testFixtures';
import { buildTestRouteTree } from '@/router.testUtils';
import {
  addSystemAdminMinistryMembership,
  grantSystemAdminMinistryLeader,
  patchSystemAdminMinistryMembership,
  revokeSystemAdminMinistryLeader,
} from './systemAdminOrganization';
import {
  fetchSystemAdminVolunteerDetail,
  fetchSystemAdminVolunteers,
  grantSystemAdminAccreditation,
  revokeSystemAdminAccreditation,
} from './systemAdminUsers';

vi.mock('@/identity/fetchIdentityMe', () => ({
  fetchIdentityMe: vi.fn(),
}));

vi.mock('@/organization/fetchOrganizationContext', () => ({
  fetchOrganizationContext: vi.fn(async () => ({ churches: [] })),
}));

vi.mock('./systemAdminUsers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./systemAdminUsers')>();
  return {
    ...actual,
    fetchSystemAdminVolunteers: vi.fn(),
    fetchSystemAdminVolunteerDetail: vi.fn(),
    grantSystemAdminAccreditation: vi.fn(),
    revokeSystemAdminAccreditation: vi.fn(),
  };
});

vi.mock('./systemAdminOrganization', () => ({
  grantSystemAdminMinistryLeader: vi.fn(),
  revokeSystemAdminMinistryLeader: vi.fn(),
  addSystemAdminMinistryMembership: vi.fn(),
  patchSystemAdminMinistryMembership: vi.fn(),
}));

const fetchIdentityMeMock = vi.mocked(fetchIdentityMe);
const fetchVolunteersMock = vi.mocked(fetchSystemAdminVolunteers);
const fetchDetailMock = vi.mocked(fetchSystemAdminVolunteerDetail);
const grantMock = vi.mocked(grantSystemAdminAccreditation);
const revokeMock = vi.mocked(revokeSystemAdminAccreditation);
const grantLeaderMock = vi.mocked(grantSystemAdminMinistryLeader);
const revokeLeaderMock = vi.mocked(revokeSystemAdminMinistryLeader);
const addMembershipMock = vi.mocked(addSystemAdminMinistryMembership);
const patchMembershipMock = vi.mocked(patchSystemAdminMinistryMembership);

function renderUsersRoute(initialPath = '/system-admin/users') {
  const { routeTree } = buildTestRouteTree();
  const history = createMemoryHistory({ initialEntries: [initialPath] });
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
  return { history };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('System Admin users pages', () => {
  beforeEach(async () => {
    await initI18n();
    fetchIdentityMeMock.mockResolvedValue(systemAdminIdentityMeFixture());
  });

  it('lists volunteers from search results', async () => {
    fetchVolunteersMock.mockResolvedValue({
      items: [
        {
          id: 'vol-alice',
          displayName: 'Alice Admin',
          accreditations: [{ churchId: 'church-1', churchName: 'Grace Chapel' }],
          leaderships: [],
          memberships: [],
        },
      ],
      nextCursor: null,
    });

    renderUsersRoute();

    expect(
      await screen.findByRole('heading', { name: /users|usuários/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Alice Admin')).toBeInTheDocument();
  });

  it('loads additional pages when nextCursor is present', async () => {
    fetchVolunteersMock
      .mockResolvedValueOnce({
        items: [
          {
            id: 'vol-alice',
            displayName: 'Alice Admin',
            accreditations: [],
            leaderships: [],
            memberships: [],
          },
        ],
        nextCursor: 'vol-alice',
      })
      .mockResolvedValueOnce({
        items: [
          {
            id: 'vol-bob',
            displayName: 'Bob Leader',
            accreditations: [],
            leaderships: [],
            memberships: [],
          },
        ],
        nextCursor: null,
      });

    renderUsersRoute();

    expect(await screen.findByText('Alice Admin')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /load more|carregar mais/i }));

    await waitFor(() => {
      expect(screen.getByText('Bob Leader')).toBeInTheDocument();
    });

    expect(fetchVolunteersMock).toHaveBeenLastCalledWith({
      volunteerId: 'seed-volunteer-system-admin',
      q: undefined,
      limit: 50,
      cursor: 'vol-alice',
    });
  });

  it('reflects grant and revoke after refetch on detail page', async () => {
    fetchVolunteersMock.mockResolvedValue({
      items: [
        {
          id: 'vol-alice',
          displayName: 'Alice Admin',
          accreditations: [],
          leaderships: [],
          memberships: [],
        },
      ],
      nextCursor: null,
    });

    fetchDetailMock
      .mockResolvedValueOnce({
        id: 'vol-alice',
        displayName: 'Alice Admin',
        accreditations: [],
        leaderships: [],
        memberships: [],
      })
      .mockResolvedValueOnce({
        id: 'vol-alice',
        displayName: 'Alice Admin',
        accreditations: [{ churchId: 'church-1', churchName: 'Grace Chapel' }],
        leaderships: [],
        memberships: [],
      })
      .mockResolvedValueOnce({
        id: 'vol-alice',
        displayName: 'Alice Admin',
        accreditations: [],
        leaderships: [],
        memberships: [],
      });

    grantMock.mockResolvedValue({
      volunteerId: 'vol-alice',
      churchId: 'church-1',
    });
    revokeMock.mockResolvedValue({
      volunteerId: 'vol-alice',
      churchId: 'church-1',
    });

    renderUsersRoute('/system-admin/users/vol-alice');

    expect(await screen.findByText('Alice Admin')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText(/church id|id da igreja/i),
      'church-1',
    );
    await user.click(screen.getByRole('button', { name: /grant admin|conceder admin/i }));

    await waitFor(() => {
      expect(grantMock).toHaveBeenCalledWith({
        volunteerId: 'seed-volunteer-system-admin',
        targetVolunteerId: 'vol-alice',
        churchId: 'church-1',
      });
    });

    expect(await screen.findByText('Grace Chapel')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /revoke admin|revogar admin/i }));

    await waitFor(() => {
      expect(revokeMock).toHaveBeenCalledWith({
        volunteerId: 'seed-volunteer-system-admin',
        targetVolunteerId: 'vol-alice',
        churchId: 'church-1',
      });
    });

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /revoke admin|revogar admin/i }),
      ).not.toBeInTheDocument();
    });
  });

  it('grants ministry leader via stewardship form', async () => {
    fetchDetailMock
      .mockResolvedValueOnce({
        id: 'vol-alice',
        displayName: 'Alice Admin',
        accreditations: [],
        leaderships: [],
        memberships: [],
      })
      .mockResolvedValueOnce({
        id: 'vol-alice',
        displayName: 'Alice Admin',
        accreditations: [],
        leaderships: [
          {
            ministryId: 'min-1',
            ministryName: 'Worship',
            churchId: 'church-1',
            churchName: 'Grace Chapel',
          },
        ],
        memberships: [],
      });

    grantLeaderMock.mockResolvedValue({});

    renderUsersRoute('/system-admin/users/vol-alice');

    expect(await screen.findByText('Alice Admin')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText(/grant leader|conceder líder/i),
      'min-1',
    );
    await user.click(
      screen.getByRole('button', { name: /grant leader|conceder líder/i }),
    );

    await waitFor(() => {
      expect(grantLeaderMock).toHaveBeenCalledWith({
        volunteerId: 'seed-volunteer-system-admin',
        ministryId: 'min-1',
        targetVolunteerId: 'vol-alice',
      });
    });

    expect(await screen.findByText('Worship')).toBeInTheDocument();
    expect(revokeLeaderMock).not.toHaveBeenCalled();
    expect(addMembershipMock).not.toHaveBeenCalled();
    expect(patchMembershipMock).not.toHaveBeenCalled();
  });
});
