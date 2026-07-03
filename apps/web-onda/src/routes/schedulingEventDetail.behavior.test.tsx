import '@/test/volunteerRouteTestSetup';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { initI18n } from '@/i18n/controller';
import { syncAuthVolunteerId } from '@/auth/authSession';
import {
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
});

describe('LeaderVolunteerTimeAwayPage route', () => {
  it('shows leader support copy distinct from self-service', async () => {
    await initI18n(undefined, 'en');
    await renderVolunteerRoute('/leader/volunteer-time-away');

    expect(
      await screen.findByRole('heading', { name: 'Volunteer time away' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/separate from a volunteer.s own Time away self-service/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /your own time away/i })).toHaveAttribute(
      'href',
      '/time-away',
    );
  });

  it('creates unavailability on behalf of a selected volunteer', async () => {
    await initI18n(undefined, 'en');
    const user = userEvent.setup();
    mutateJsonMock.mockImplementation(async (_path, _scope, init) => {
      if (init?.method === 'POST') {
        return {
          id: 'new-1',
          ministryId: 'ministry-1',
          window: {
            startsAtUtc: '2026-08-01T10:00:00.000Z',
            endsAtUtc: '2026-08-01T12:00:00.000Z',
          },
        };
      }
      return { id: 'away-1' };
    });

    await renderVolunteerRoute('/leader/volunteer-time-away');

    await user.selectOptions(
      await screen.findByRole('combobox', { name: /ministry you lead/i }),
      'ministry-1',
    );
    await user.selectOptions(
      await screen.findByRole('combobox', { name: /^volunteer$/i }),
      'vol-2',
    );
    await user.type(screen.getByLabelText(/^starts$/i), '2026-08-01T10:00');
    await user.type(screen.getByLabelText(/^ends$/i), '2026-08-01T12:00');
    await user.click(screen.getByRole('button', { name: 'Save for volunteer' }));

    expect(mutateJsonMock).toHaveBeenCalledWith(
      expect.stringContaining('/volunteers/vol-2/unavailability'),
      expect.objectContaining({
        leaderMinistryId: 'ministry-1',
      }),
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
