import '@/test/volunteerRouteTestSetup';
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError } from '@/api/apiError';
import { initI18n } from '@/i18n/controller';
import { syncAuthVolunteerId } from '@/auth/authSession';
import {
  getJsonMock,
  mutateJsonMock,
  renderVolunteerRoute,
} from '@/test/volunteerRouteTestUtils';

afterEach(() => {
  cleanup();
  syncAuthVolunteerId({ status: 'loading' });
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
});
