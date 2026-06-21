import '@/test/volunteerRouteTestSetup';
import { cleanup, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { initI18n } from '@/i18n/controller';
import { syncAuthVolunteerId } from '@/auth/authSession';
import {
  getJsonMock,
  renderVolunteerRoute,
} from '@/test/volunteerRouteTestUtils';

afterEach(() => {
  cleanup();
  syncAuthVolunteerId({ status: 'loading' });
});

describe('VolunteerDashboardPage', () => {
  it('renders greeting by display name', async () => {
    await initI18n(undefined, 'en');
    await renderVolunteerRoute('/dashboard');

    expect(
      await screen.findByRole('heading', { name: /hi alex volunteer/i }),
    ).toBeInTheDocument();
  });

  it('shows assignment count summary including non-zero values', async () => {
    await initI18n(undefined, 'en');
    await renderVolunteerRoute('/dashboard');

    expect(await screen.findByText('1 upcoming assignments')).toBeInTheDocument();
  });

  it('shows time-away preview rows and view-all link', async () => {
    await initI18n(undefined, 'en');
    await renderVolunteerRoute('/dashboard');

    expect(await screen.findByText('Hospitality')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all' })).toHaveAttribute(
      'href',
      '/time-away',
    );
  });

  it('shows empty time-away state when none returned', async () => {
    await initI18n(undefined, 'en');
    getJsonMock.mockImplementation(async (path: string) => {
      if (path.startsWith('/organization/context')) {
        return {
          churches: [
            {
              id: 'church-demo',
              name: 'Demo Church',
              defaultTimezone: 'UTC',
              isAccreditedAdmin: false,
              campuses: [{ id: 'campus-1', name: 'Main', timezone: 'UTC' }],
              ministries: [{ id: 'ministry-1', name: 'Hospitality' }],
            },
          ],
        };
      }
      if (path.includes('/assignments')) {
        return [];
      }
      if (path.includes('/unavailability')) {
        return [];
      }
      throw new Error(`Unexpected getJson path: ${path}`);
    });
    await renderVolunteerRoute('/dashboard');

    expect(
      await screen.findByText('No upcoming time away recorded.'),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('0 upcoming assignments')).toBeInTheDocument();
    });
  });
});
