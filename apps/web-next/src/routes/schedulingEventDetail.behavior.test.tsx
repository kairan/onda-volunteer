import '@/test/volunteerRouteTestSetup';
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { ApiRequestError } from '@/api/apiError';
import { initI18n } from '@/i18n/controller';
import { syncAuthVolunteerId } from '@/auth/authSession';
import {
  leaderRouteEvents,
  volunteerRouteOrgContext,
} from '@/test/volunteerRouteTestSetup';
import {
  getJsonMock,
  mutateJsonMock,
  renderVolunteerRoute,
} from '@/test/volunteerRouteTestUtils';

afterEach(() => {
  cleanup();
  syncAuthVolunteerId({ status: 'loading' });
  getJsonMock.mockReset();
  mutateJsonMock.mockReset();
});

describe('SchedulingEventDetailView route', () => {
  it('renders event title and roster fill badge', async () => {
    await initI18n(undefined, 'en');
    await renderVolunteerRoute('/scheduling/events/evt-1');

    expect(
      await screen.findByRole('heading', { name: 'Sunday Service', level: 1 }),
    ).toBeInTheDocument();
    expect(await screen.findByTestId('roster-fill-badge')).toHaveTextContent(
      /0\/1 filled/,
    );
  });

  it('opens assign form when assign is clicked', async () => {
    await initI18n(undefined, 'en');
    await renderVolunteerRoute('/scheduling/events/evt-1');
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: /assign/i }));
    expect(screen.getByRole('heading', { name: 'Assign volunteer' })).toBeInTheDocument();
  });

  it('shows capacity editor on private event detail and surfaces save errors', async () => {
    await initI18n(undefined, 'en');
    mutateJsonMock.mockRejectedValueOnce(
      new ApiRequestError(400, 'Cannot reduce', 'CAPACITY_BELOW_FILLED_SLOTS'),
    );
    await renderVolunteerRoute('/scheduling/events/evt-private', {
      status: 'authenticated',
      volunteerId: 'vol-1',
      displayName: 'Pat Leader',
      uiLocale: 'en',
      isSystemAdmin: false,
      newlyFulfilledInvites: [],
    });
    const user = userEvent.setup();

    expect(await screen.findByTestId('role-capacity-editor')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /save slot counts/i }));
    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/cannot reduce slots below the number already filled/i);
  });

  it('saves capacity and refreshes roster slots', async () => {
    await initI18n(undefined, 'en');
    let roleCapacity = 1;

    getJsonMock.mockImplementation(async (path: string) => {
      if (path.startsWith('/events/evt-private')) {
        return {
          church: volunteerRouteOrgContext.churches[0],
          event: {
            id: 'evt-private',
            kind: 'PRIVATE' as const,
            title: 'Rehearsal',
            window: leaderRouteEvents[0].window,
            framing: leaderRouteEvents[0].framing,
            cancelledAtUtc: null,
          },
          ministry: { id: 'ministry-1', name: 'Hospitality' },
          assignments: [],
          roleCapacities: [
            { ministryId: 'ministry-1', roleId: 'role-1', capacity: roleCapacity },
          ],
        };
      }
      if (path.startsWith('/organization/context')) {
        return volunteerRouteOrgContext;
      }
      if (path.endsWith('/roles')) {
        return [{ id: 'role-1', name: 'Greeter', retired: false }];
      }
      if (path.includes('/ministries/') && path.endsWith('/memberships')) {
        return [{ volunteerId: 'vol-2', displayName: 'Alex', status: 'ACTIVE' }];
      }
      if (path.includes('/ministries/') && path.endsWith('/leaders')) {
        return [{ volunteerId: 'leader-1', displayName: 'Pat Leader' }];
      }
      throw new Error(`Unexpected getJson path: ${path}`);
    });

    mutateJsonMock.mockImplementation(
      async (path: string, _scope: unknown, init?: RequestInit) => {
        if (path.includes('/role-capacities') && init?.method === 'PATCH') {
          roleCapacity = 2;
          return { roleCapacities: [{ roleId: 'role-1', capacity: 2 }] };
        }
        return {
          id: 'away-2',
          ministryId: 'ministry-1',
          window: {
            startsAtUtc: '2026-08-01T00:00:00.000Z',
            endsAtUtc: '2026-08-02T00:00:00.000Z',
          },
        };
      },
    );

    await renderVolunteerRoute('/scheduling/events/evt-private', {
      status: 'authenticated',
      volunteerId: 'vol-1',
      displayName: 'Pat Leader',
      uiLocale: 'en',
      isSystemAdmin: false,
      newlyFulfilledInvites: [],
    });
    const user = userEvent.setup();

    expect(await screen.findByTestId('role-capacity-editor')).toBeInTheDocument();
    const capacityInput = await screen.findByRole('spinbutton');
    await waitFor(() => expect(capacityInput).toHaveValue(1));
    await user.clear(capacityInput);
    await user.type(capacityInput, '2');
    await user.click(screen.getByRole('button', { name: /save slot counts/i }));

    expect(await screen.findByText('Slot counts updated.')).toBeInTheDocument();
    expect(await screen.findByText('Greeter (2)')).toBeInTheDocument();
    expect(screen.getByTestId('roster-fill-badge')).toHaveTextContent('0/2 filled');
    expect(screen.getAllByRole('button', { name: /assign/i })).toHaveLength(2);
  });

  it('shows capacity editor in pt-BR', async () => {
    await initI18n(undefined, 'pt-BR');
    await renderVolunteerRoute('/scheduling/events/evt-private', {
      status: 'authenticated',
      volunteerId: 'vol-1',
      displayName: 'Pat Leader',
      uiLocale: 'pt-BR',
      isSystemAdmin: false,
      newlyFulfilledInvites: [],
    });

    expect(
      await screen.findByRole('heading', {
        name: 'Vagas por função neste evento',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar vagas' })).toBeInTheDocument();
  });
});
