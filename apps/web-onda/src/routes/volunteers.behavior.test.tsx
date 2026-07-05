import '@/test/volunteerRouteTestSetup';
import { cleanup, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { initI18n } from '@/i18n/controller';
import { syncAuthVolunteerId } from '@/auth/authSession';
import { adminRouteOrgContext } from '@/test/volunteerRouteTestSetup';
import {
  getJsonMock,
  renderVolunteerRoute,
} from '@/test/volunteerRouteTestUtils';

afterEach(() => {
  cleanup();
  syncAuthVolunteerId({ status: 'loading' });
});

describe('VolunteersPage', () => {
  it('renders ministry roster from live query data', async () => {
    await initI18n(undefined, 'en');
    getJsonMock.mockImplementation(async (path: string) => {
      if (path.startsWith('/organization/context')) {
        return adminRouteOrgContext;
      }
      if (path.includes('/memberships')) {
        return [{ volunteerId: 'vol-2', displayName: 'Sam Member', status: 'ACTIVE' }];
      }
      if (path.includes('/invites')) {
        return { invites: [] };
      }
      throw new Error(`Unexpected getJson path: ${path}`);
    });

    await renderVolunteerRoute('/volunteers');
    const main = document.getElementById('main');
    expect(main).not.toBeNull();

    await waitFor(() => {
      expect(within(main!).getByText('Sam Member')).toBeInTheDocument();
    });
    expect(
      within(main!).getByRole('heading', { name: 'Volunteers' }),
    ).toBeInTheDocument();
  });
});
