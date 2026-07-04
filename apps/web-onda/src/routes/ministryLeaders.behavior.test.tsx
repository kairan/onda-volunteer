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

describe('MinistryLeadersPage', () => {
  it('renders delegated leaders from live query data', async () => {
    await initI18n(undefined, 'en');
    getJsonMock.mockImplementation(async (path: string) => {
      if (path.startsWith('/organization/context')) {
        return adminRouteOrgContext;
      }
      if (path.includes('/leaders')) {
        return [{ volunteerId: 'leader-1', displayName: 'Pat Leader' }];
      }
      throw new Error(`Unexpected getJson path: ${path}`);
    });

    await renderVolunteerRoute('/ministry-leaders');
    const main = document.getElementById('main');
    expect(main).not.toBeNull();

    expect(
      await within(main!).findByRole('heading', { name: 'Delegate leaders' }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(within(main!).getByText(/Pat Leader/)).toBeInTheDocument();
    });
    expect(within(main!).getByRole('button', { name: 'Revoke' })).toBeInTheDocument();
  });
});
