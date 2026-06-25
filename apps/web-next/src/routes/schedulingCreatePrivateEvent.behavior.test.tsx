import '@/test/volunteerRouteTestSetup';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { initI18n } from '@/i18n/controller';
import {
  getJsonMock,
  leaderRouteEvents,
  volunteerRouteOrgContext,
} from '@/test/volunteerRouteTestSetup';
import { renderAppRoute } from '@/test/routeTestUtils';

beforeEach(async () => {
  await initI18n(undefined, 'en');
  getJsonMock.mockImplementation(async (path: string) => {
    if (path.startsWith('/organization/context')) {
      return volunteerRouteOrgContext;
    }
    if (path.startsWith('/events?')) {
      return leaderRouteEvents;
    }
    throw new Error(`Unexpected getJson path: ${path}`);
  });
});

describe('SchedulingCreatePrivateEventPage', () => {
  it('renders the private event form for led ministries', async () => {
    await renderAppRoute('/scheduling/events/new-private', {
      authState: {
        status: 'dev-bypass',
        volunteerId: 'seed-volunteer-demo',
      },
    });

    expect(
      await screen.findByRole('heading', { name: /new private ministry event/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/starts/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ends/i)).toBeInTheDocument();
  });
});
