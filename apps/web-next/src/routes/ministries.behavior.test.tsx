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

describe('MinistriesPage', () => {
  it('renders ministry roles from live query data', async () => {
    await initI18n(undefined, 'en');
    getJsonMock.mockImplementation(async (path: string) => {
      if (path.startsWith('/organization/context')) {
        return adminRouteOrgContext;
      }
      if (path.includes('/roles')) {
        return [{ id: 'role-1', name: 'Greeter', retired: false }];
      }
      throw new Error(`Unexpected getJson path: ${path}`);
    });

    await renderVolunteerRoute('/ministries');
    const main = document.getElementById('main');
    expect(main).not.toBeNull();

    expect(
      await within(main!).findByRole('heading', { name: 'Ministries' }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(within(main!).getByText('Greeter')).toBeInTheDocument();
    });
  });
});
