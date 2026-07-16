import '@/test/volunteerRouteTestSetup';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { ApiRequestError } from '@/api/apiError';
import { initI18n } from '@/i18n/controller';
import { syncAuthVolunteerId } from '@/auth/authSession';
import { writeStoredWorkingContext } from '@/organization/organizationContextStorage';
import {
  leaderRouteEvents,
  volunteerRouteAssignments,
  volunteerRouteOrgContext,
  volunteerRouteUnavailability,
} from '@/test/volunteerRouteTestSetup';
import {
  getJsonMock,
  mutateJsonMock,
  renderVolunteerRoute,
} from '@/test/volunteerRouteTestUtils';

function restoreVolunteerRouteMocks() {
  getJsonMock.mockImplementation(async (path: string) => {
    if (path.startsWith('/organization/context')) {
      return volunteerRouteOrgContext;
    }
    if (path.startsWith('/events?')) {
      return leaderRouteEvents;
    }
    if (path.includes('/assignments')) {
      return volunteerRouteAssignments;
    }
    if (path.includes('/unavailability')) {
      return volunteerRouteUnavailability;
    }
    throw new Error(`Unexpected getJson path: ${path}`);
  });
  mutateJsonMock.mockImplementation(async (_path: string, _scope: unknown, init?: RequestInit) => {
    if (init?.method === 'DELETE') {
      return { id: 'away-1' };
    }
    return {
      id: 'away-2',
      ministryId: 'ministry-1',
      window: {
        startsAtUtc: '2026-08-01T00:00:00.000Z',
        endsAtUtc: '2026-08-02T00:00:00.000Z',
      },
    };
  });
}

afterEach(() => {
  cleanup();
  syncAuthVolunteerId({ status: 'loading' });
  restoreVolunteerRouteMocks();
});

describe('TimeAwayPage', () => {
  it('renders unavailability rows grouped by ministry', async () => {
    await initI18n(undefined, 'en');
    await renderVolunteerRoute('/time-away');

    expect(await screen.findByRole('heading', { name: 'Hospitality' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Time away' })).toBeInTheDocument();
  });

  it('submits create form via mutation', async () => {
    await initI18n(undefined, 'en');
    const user = userEvent.setup();
    await renderVolunteerRoute('/time-away');

    await screen.findByRole('heading', { name: 'Hospitality' });
    await user.click(screen.getByRole('button', { name: 'Add period' }));

    const dialog = await screen.findByRole('dialog');
    await user.selectOptions(within(dialog).getByLabelText('Ministry'), 'ministry-1');
    await user.type(within(dialog).getByLabelText('Starts'), '2026-08-01T09:00');
    await user.type(within(dialog).getByLabelText('Ends'), '2026-08-02T09:00');
    await user.type(
      within(dialog).getByLabelText('Description (optional)'),
      'Family vacation',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Save unavailability' }));

    await waitFor(() => {
      expect(mutateJsonMock).toHaveBeenCalledWith(
        '/volunteers/vol-1/unavailability',
        { volunteerId: 'vol-1' },
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"description":"Family vacation"'),
        }),
      );
    });
  });

  it('pre-selects ministry from volunteer working context in create dialog', async () => {
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
              ministries: [
                { id: 'ministry-1', name: 'Hospitality', membershipStatus: 'ACTIVE' },
                { id: 'ministry-2', name: 'Kids', isLeader: true },
              ],
            },
          ],
        };
      }
      if (path.includes('/unavailability')) {
        return [];
      }
      if (path.includes('/assignments')) {
        return [];
      }
      throw new Error(`Unexpected getJson path: ${path}`);
    });
    writeStoredWorkingContext('church-demo', {
      ministryId: 'ministry-1',
      mode: 'volunteer',
    });

    const user = userEvent.setup();
    await renderVolunteerRoute('/time-away');

    await screen.findByText('No upcoming unavailability recorded for this church.');
    const emptyState = screen.getByTestId('time-away-empty');
    const grafismo = within(emptyState).getByTestId('brand-grafismo');
    expect(grafismo).toHaveAttribute('aria-hidden', 'true');
    expect(grafismo).toHaveAttribute('data-variant', 'filled');
    await user.click(screen.getByRole('button', { name: 'Add period' }));

    const dialog = await screen.findByRole('dialog');
    const ministrySelect = within(dialog).getByLabelText('Ministry') as HTMLSelectElement;
    await waitFor(() => {
      expect(ministrySelect.value).toBe('ministry-1');
    });
  });

  it('shows inline error when create mutation fails', async () => {
    await initI18n(undefined, 'en');
    mutateJsonMock.mockRejectedValueOnce(
      new ApiRequestError(400, 'Overlaps existing unavailability'),
    );
    const user = userEvent.setup();
    await renderVolunteerRoute('/time-away');

    await screen.findByRole('heading', { name: 'Hospitality' });
    await user.click(screen.getByRole('button', { name: 'Add period' }));

    const dialog = await screen.findByRole('dialog');
    await user.selectOptions(within(dialog).getByLabelText('Ministry'), 'ministry-1');
    await user.type(within(dialog).getByLabelText('Starts'), '2026-08-01T09:00');
    await user.type(within(dialog).getByLabelText('Ends'), '2026-08-02T09:00');
    await user.click(within(dialog).getByRole('button', { name: 'Save unavailability' }));

    expect(
      await within(dialog).findByRole('alert'),
    ).toHaveTextContent('Overlaps existing unavailability');
    expect(
      screen.getAllByRole('button', { name: 'Remove', hidden: true }),
    ).toHaveLength(1);
  });

  it('updates list only after successful delete mutation', async () => {
    await initI18n(undefined, 'en');
    let unavailabilityFetchCount = 0;
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
      if (path.includes('/unavailability')) {
        unavailabilityFetchCount += 1;
        return unavailabilityFetchCount >= 2 ? [] : volunteerRouteUnavailability;
      }
      if (path.includes('/assignments')) {
        return [];
      }
      throw new Error(`Unexpected getJson path: ${path}`);
    });

    const user = userEvent.setup();
    await renderVolunteerRoute('/time-away');

    expect(await screen.findByRole('heading', { name: 'Hospitality' })).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Remove' })[0]!);
    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { name: 'Remove unavailability?' }),
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() => {
      expect(mutateJsonMock).toHaveBeenCalledWith(
        '/unavailability/away-1',
        { volunteerId: 'vol-1' },
        { method: 'DELETE' },
      );
    });
    expect(
      await screen.findByText('No upcoming unavailability recorded for this church.'),
    ).toBeInTheDocument();
  });

  it('submits edit form via PATCH and closes dialog after refetch', async () => {
    await initI18n(undefined, 'en');
    let unavailabilityFetchCount = 0;
    getJsonMock.mockImplementation(async (path: string) => {
      if (path.startsWith('/organization/context')) {
        return volunteerRouteOrgContext;
      }
      if (path.includes('/unavailability')) {
        unavailabilityFetchCount += 1;
        if (unavailabilityFetchCount >= 2) {
          return [
            {
              id: 'away-1',
              startsAtUtc: '2026-08-01T00:00:00.000Z',
              endsAtUtc: '2026-08-02T00:00:00.000Z',
              ministry: { id: 'ministry-1', name: 'Hospitality' },
            },
          ];
        }
        return volunteerRouteUnavailability;
      }
      if (path.includes('/assignments')) {
        return [];
      }
      throw new Error(`Unexpected getJson path: ${path}`);
    });
    mutateJsonMock.mockImplementationOnce(
      async (_path: string, _scope: unknown, init?: RequestInit) => {
        expect(init?.method).toBe('PATCH');
        return {
          id: 'away-1',
          ministryId: 'ministry-1',
          window: {
            startsAtUtc: '2026-08-01T00:00:00.000Z',
            endsAtUtc: '2026-08-02T00:00:00.000Z',
          },
        };
      },
    );

    const user = userEvent.setup();
    await renderVolunteerRoute('/time-away');

    await screen.findByRole('heading', { name: 'Hospitality' });
    await user.click(screen.getByRole('button', { name: 'Edit' }));

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { name: 'Edit unavailability' }),
    ).toBeInTheDocument();

    const starts = within(dialog).getByLabelText('Starts');
    const ends = within(dialog).getByLabelText('Ends');
    await waitFor(() => {
      expect(starts).toHaveValue('2026-07-05T00:00');
    });
    await user.clear(starts);
    await user.type(starts, '2026-08-01T09:00');
    await user.clear(ends);
    await user.type(ends, '2026-08-02T09:00');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(mutateJsonMock).toHaveBeenCalledWith(
        '/unavailability/away-1',
        { volunteerId: 'vol-1' },
        expect.objectContaining({ method: 'PATCH' }),
      );
    });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(unavailabilityFetchCount).toBeGreaterThanOrEqual(2);
  });

  it('shows delete confirm dialog before removing a row', async () => {
    await initI18n(undefined, 'en');
    const user = userEvent.setup();
    await renderVolunteerRoute('/time-away');

    await screen.findByRole('heading', { name: 'Hospitality' });
    await user.click(screen.getAllByRole('button', { name: 'Remove' })[0]!);
    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { name: 'Remove unavailability?' }),
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() => {
      expect(mutateJsonMock).toHaveBeenCalledWith(
        '/unavailability/away-1',
        { volunteerId: 'vol-1' },
        { method: 'DELETE' },
      );
    });
  });
});
