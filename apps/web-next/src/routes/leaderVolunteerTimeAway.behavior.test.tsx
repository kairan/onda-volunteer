import '@/test/volunteerRouteTestSetup';
import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { initI18n } from '@/i18n/controller';
import {
  getJsonMock,
  volunteerRouteOrgContext,
  volunteerRouteUnavailability,
} from '@/test/volunteerRouteTestSetup';
import { renderAppRoute } from '@/test/routeTestUtils';

beforeEach(async () => {
  await initI18n(undefined, 'en');
  getJsonMock.mockImplementation(async (path: string) => {
    if (path.startsWith('/organization/context')) {
      return volunteerRouteOrgContext;
    }
    if (path.includes('/ministries/') && path.endsWith('/memberships')) {
      return [
        {
          volunteerId: 'vol-2',
          displayName: 'Alex Volunteer',
          status: 'ACTIVE',
        },
      ];
    }
    if (path.includes('/volunteers/') && path.includes('/unavailability')) {
      return volunteerRouteUnavailability;
    }
    throw new Error(`Unexpected getJson path: ${path}`);
  });
});

describe('LeaderVolunteerTimeAwayPage', () => {
  it('renders leader support copy and volunteer picker', async () => {
    await renderAppRoute('/leader/volunteer-time-away', {
      authState: {
        status: 'dev-bypass',
        volunteerId: 'seed-volunteer-demo',
      },
    });

    expect(
      await screen.findByRole('heading', { name: /volunteer time away/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByLabelText(/^ministry$/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/^volunteer$/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Alex Volunteer')).toBeInTheDocument();
    });
  });
});
