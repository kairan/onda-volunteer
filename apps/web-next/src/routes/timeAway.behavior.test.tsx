import '@/test/volunteerRouteTestSetup';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
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
    const main = document.getElementById('main');
    expect(main).not.toBeNull();
    await user.selectOptions(
      within(main!).getByLabelText('Ministry'),
      'ministry-1',
    );
    await user.type(within(main!).getByLabelText('Starts'), '2026-08-01T09:00');
    await user.type(within(main!).getByLabelText('Ends'), '2026-08-02T09:00');
    await user.click(
      within(main!).getByRole('button', { name: 'Save unavailability' }),
    );

    await waitFor(() => {
      expect(mutateJsonMock).toHaveBeenCalledWith(
        '/volunteers/vol-1/unavailability',
        { volunteerId: 'vol-1' },
        expect.objectContaining({ method: 'POST' }),
      );
    });
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
