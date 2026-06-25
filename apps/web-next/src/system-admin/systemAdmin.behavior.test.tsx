import '@/test/volunteerRouteTestSetup';
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initI18n } from '@/i18n/controller';
import { fetchIdentityMe } from '@/identity/fetchIdentityMe';
import { systemAdminIdentityMeFixture } from '@/identity/testFixtures';
import {
  getJsonMock,
  mutateJsonMock,
} from '@/test/volunteerRouteTestSetup';
import { renderSystemAdminRoute } from '@/test/systemAdminRouteTestUtils';

vi.mock('@/identity/fetchIdentityMe', () => ({
  fetchIdentityMe: vi.fn(),
}));

vi.mock('@/organization/fetchOrganizationContext', () => ({
  fetchOrganizationContext: vi.fn(async () => ({ churches: [] })),
}));

const fetchIdentityMeMock = vi.mocked(fetchIdentityMe);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  fetchIdentityMeMock.mockResolvedValue(systemAdminIdentityMeFixture());
});

describe('SystemAdminDashboardPage', () => {
  it('renders dashboard links for a system admin', async () => {
    await initI18n(undefined, 'en');
    await renderSystemAdminRoute('/system-admin');

    expect(
      await screen.findByRole('heading', { name: /operator dashboard/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /users/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /churches/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /scheduling/i })).toBeInTheDocument();
  });
});

describe('SystemAdminChurchesPage', () => {
  it('lists churches and refreshes after create', async () => {
    await initI18n(undefined, 'en');
    let churchListCalls = 0;
    getJsonMock.mockImplementation(async (path: string) => {
      if (path.startsWith('/system-admin/churches')) {
        churchListCalls += 1;
        if (churchListCalls === 1) {
          return { items: [], nextCursor: null };
        }
        return {
          items: [
            {
              id: 'church-1',
              name: 'New Parish',
              defaultTimezone: 'UTC',
              campuses: [{ id: 'c1', name: 'Principal', timezone: 'UTC' }],
            },
          ],
          nextCursor: null,
        };
      }
      throw new Error(`Unexpected getJson path: ${path}`);
    });
    mutateJsonMock.mockResolvedValue({
      id: 'church-1',
      name: 'New Parish',
      defaultTimezone: 'UTC',
      campuses: [{ id: 'c1', name: 'Principal', timezone: 'UTC' }],
    } as never);

    await renderSystemAdminRoute('/system-admin/churches');

    expect(
      await screen.findByRole('heading', { level: 1, name: /^churches$/i }),
    ).toBeInTheDocument();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/church name/i), 'New Parish');
    await user.click(screen.getByRole('button', { name: /create church/i }));

    await waitFor(() => {
      expect(mutateJsonMock).toHaveBeenCalled();
    });

    expect(await screen.findByText('New Parish')).toBeInTheDocument();
  });
});

const volunteerListFixture = {
  id: 'vol-alice',
  displayName: 'Alice Admin',
  accreditations: [{ churchId: 'church-1', churchName: 'Grace Chapel' }],
  leaderships: [],
  memberships: [],
};

const volunteerDetailFixture = {
  ...volunteerListFixture,
  accreditations: [],
  leaderships: [],
  memberships: [],
};

describe('SystemAdminUsersPage', () => {
  it('lists volunteers from search results', async () => {
    await initI18n(undefined, 'en');
    getJsonMock.mockImplementation(async (path: string) => {
      if (path.startsWith('/system-admin/volunteers')) {
        return { items: [volunteerListFixture], nextCursor: null };
      }
      throw new Error(`Unexpected getJson path: ${path}`);
    });

    await renderSystemAdminRoute('/system-admin/users');

    expect(
      await screen.findByRole('heading', { level: 1, name: /^users$/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Alice Admin')).toBeInTheDocument();
  });

  it('loads additional pages when nextCursor is present', async () => {
    await initI18n(undefined, 'en');
    let volunteerCalls = 0;
    getJsonMock.mockImplementation(async (path: string) => {
      if (path.startsWith('/system-admin/volunteers')) {
        volunteerCalls += 1;
        if (volunteerCalls === 1) {
          return { items: [volunteerListFixture], nextCursor: 'vol-alice' };
        }
        return {
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
        };
      }
      throw new Error(`Unexpected getJson path: ${path}`);
    });

    await renderSystemAdminRoute('/system-admin/users');

    expect(await screen.findByText('Alice Admin')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /load more/i }));

    await waitFor(() => {
      expect(screen.getByText('Bob Leader')).toBeInTheDocument();
    });
  });
});

describe('SystemAdminUserDetailPage', () => {
  it('renders volunteer stewardship details', async () => {
    await initI18n(undefined, 'en');
    getJsonMock.mockImplementation(async (path: string) => {
      if (path === '/system-admin/volunteers/vol-alice') {
        return volunteerDetailFixture;
      }
      throw new Error(`Unexpected getJson path: ${path}`);
    });

    await renderSystemAdminRoute('/system-admin/users/vol-alice');

    expect(
      await screen.findByRole('heading', { name: /alice admin/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('vol-alice')).toBeInTheDocument();
  });
});

describe('SystemAdminChurchDetailPage', () => {
  it('renders church detail and pending invites', async () => {
    await initI18n(undefined, 'en');
    getJsonMock.mockImplementation(async (path: string) => {
      if (path === '/system-admin/churches/church-1') {
        return {
          id: 'church-1',
          name: 'Grace Chapel',
          defaultTimezone: 'UTC',
          campuses: [{ id: 'c1', name: 'Principal', timezone: 'UTC' }],
        };
      }
      if (path === '/system-admin/churches/church-1/admin-invites') {
        return {
          items: [
            {
              id: 'invite-1',
              email: 'admin@example.com',
              status: 'PENDING',
              sentAtUtc: '2026-06-01T12:00:00.000Z',
            },
          ],
        };
      }
      throw new Error(`Unexpected getJson path: ${path}`);
    });

    await renderSystemAdminRoute('/system-admin/churches/church-1');

    expect(
      await screen.findByRole('heading', { name: /grace chapel/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });
});
