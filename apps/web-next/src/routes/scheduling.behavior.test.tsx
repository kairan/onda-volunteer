import '@/test/volunteerRouteTestSetup';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { initI18n } from '@/i18n/controller';
import { syncAuthVolunteerId } from '@/auth/authSession';
import { getJsonMock, renderVolunteerRoute } from '@/test/volunteerRouteTestUtils';

afterEach(() => {
  cleanup();
  syncAuthVolunteerId({ status: 'loading' });
});

describe('VolunteerMyAssignmentsPage', () => {
  it('renders assignment cards in a grid', async () => {
    await initI18n(undefined, 'en');
    await renderVolunteerRoute('/scheduling?previewRole=volunteer');

    expect(await screen.findByText('Sunday Service')).toBeInTheDocument();
    expect(screen.getByText('Hospitality · Greeter')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sunday Service/i })).toHaveAttribute(
      'href',
      '/scheduling/events/evt-1',
    );
  });

  it('shows empty state when no assignments', async () => {
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
    await renderVolunteerRoute('/scheduling?previewRole=volunteer');

    expect(
      await screen.findByTestId('volunteer-assignments-empty'),
    ).toBeInTheDocument();
  });

  it('keeps leader preview when previewRole=leader', async () => {
    await initI18n(undefined, 'en');
    await renderVolunteerRoute('/scheduling?previewRole=leader');

    expect((await screen.findAllByTestId('roster-fill-badge'))[0]).toBeInTheDocument();
  });
});
