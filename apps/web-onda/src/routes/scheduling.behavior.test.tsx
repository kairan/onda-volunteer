import '@/test/volunteerRouteTestSetup';
import { cleanup, screen, within } from '@testing-library/react';
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

describe('VolunteerMyAssignmentsPage at /scheduling', () => {
  it('renders assignment cards in a serve-well grid with confirmed badge', async () => {
    await initI18n(undefined, 'en');
    await renderVolunteerRoute('/scheduling?previewRole=volunteer');

    const grid = await screen.findByTestId('volunteer-assignments-grid');
    expect(grid).toHaveClass('md:grid-cols-2');

    expect(screen.getByText('Sunday Service')).toBeInTheDocument();
    expect(screen.getByText('Hospitality · Greeter')).toBeInTheDocument();
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Sunday Service/i }),
    ).toHaveAttribute('href', '/scheduling/events/evt-1');

    const card = screen.getByRole('link', { name: /Sunday Service/i });
    expect(within(card).queryByRole('button', { name: /accept/i })).toBeNull();
    expect(within(card).queryByRole('button', { name: /decline/i })).toBeNull();
    expect(screen.queryByText(/pending/i)).toBeNull();
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
    ).toHaveTextContent(
      'No upcoming assignments. Check scheduling for open opportunities.',
    );
  });

  it('shows loading skeletons while assignments load', async () => {
    await initI18n(undefined, 'en');
    let resolveAssignments: (value: unknown) => void;
    const assignmentsPromise = new Promise((resolve) => {
      resolveAssignments = resolve;
    });
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
        return assignmentsPromise;
      }
      if (path.includes('/unavailability')) {
        return [];
      }
      throw new Error(`Unexpected getJson path: ${path}`);
    });

    await renderVolunteerRoute('/scheduling?previewRole=volunteer');
    expect(
      await screen.findByTestId('volunteer-assignments-loading'),
    ).toBeInTheDocument();

    resolveAssignments!([]);
    expect(
      await screen.findByTestId('volunteer-assignments-empty'),
    ).toBeInTheDocument();
  });

  it('renders leader scheduling when previewRole=leader', async () => {
    await initI18n(undefined, 'en');
    await renderVolunteerRoute(
      '/scheduling?previewRole=leader',
      undefined,
      {
        churchId: 'church-demo',
        campusId: 'campus-1',
        workingContext: { ministryId: 'ministry-1', mode: 'leader' },
      },
    );

    expect(await screen.findByText('1 events this week · 1 open slots')).toBeInTheDocument();
    expect(screen.getByTestId('leader-roster-section')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Roster' })).toBeInTheDocument();
    expect(screen.getByTestId('roster-event-card')).toBeInTheDocument();
    expect(screen.getByText('Sunday Service')).toBeInTheDocument();
    expect(screen.getByTestId('roster-fill-badge')).toHaveTextContent('0/1 filled');
    expect(screen.getByRole('button', { name: /assign/i })).toBeInTheDocument();
  });

  it('shows leader scheduling empty state when no upcoming events', async () => {
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
              ministries: [{ id: 'ministry-1', name: 'Hospitality', isLeader: true }],
            },
          ],
        };
      }
      if (path.startsWith('/events?')) {
        return [];
      }
      if (path.endsWith('/roles')) {
        return [{ id: 'role-1', name: 'Greeter', retired: false }];
      }
      if (path.includes('/assignments')) {
        return [];
      }
      if (path.includes('/unavailability')) {
        return [];
      }
      throw new Error(`Unexpected getJson path: ${path}`);
    });
    await renderVolunteerRoute(
      '/scheduling?previewRole=leader',
      undefined,
      {
        churchId: 'church-demo',
        campusId: 'campus-1',
        workingContext: { ministryId: 'ministry-1', mode: 'leader' },
      },
    );

    expect(await screen.findByTestId('leader-ministry-hero')).toBeInTheDocument();
    expect(await screen.findByText('0 events this week · 0 open slots')).toBeInTheDocument();
    expect(await screen.findByTestId('leader-scheduling-empty')).toBeInTheDocument();
  });
});
