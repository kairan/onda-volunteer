import '@/test/volunteerRouteTestSetup';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { initI18n } from '@/i18n/controller';
import { syncAuthVolunteerId } from '@/auth/authSession';
import { renderVolunteerRoute } from '@/test/volunteerRouteTestUtils';

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
