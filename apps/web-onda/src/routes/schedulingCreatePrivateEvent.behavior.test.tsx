import '@/test/volunteerRouteTestSetup';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { initI18n } from '@/i18n/controller';
import { syncAuthVolunteerId } from '@/auth/authSession';
import {
  leaderRouteEvents,
  mutateJsonMock,
  renderVolunteerRoute,
} from '@/test/volunteerRouteTestUtils';

const navigateMock = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

afterEach(() => {
  cleanup();
  syncAuthVolunteerId({ status: 'loading' });
  navigateMock.mockReset();
});

describe('SchedulingCreatePrivateEventPage route', () => {
  it('submits private event create and navigates to event detail', async () => {
    await initI18n(undefined, 'en');
    const user = userEvent.setup();
    mutateJsonMock.mockImplementation(async (path, _scope, init) => {
      if (init?.method === 'POST' && path === '/events') {
        return {
          id: 'evt-private-new',
          kind: 'PRIVATE',
          title: 'Team rehearsal',
          window: leaderRouteEvents[0].window,
          framing: leaderRouteEvents[0].framing,
          ministry: { id: 'ministry-1', name: 'Hospitality' },
        };
      }
      throw new Error(`Unexpected mutateJson path: ${path}`);
    });

    await renderVolunteerRoute('/scheduling/events/new-private', undefined, {
      churchId: 'church-demo',
      campusId: 'campus-1',
      workingContext: { ministryId: 'ministry-1', mode: 'leader' },
    });

    expect(
      await screen.findByRole('heading', { name: 'New private ministry event' }),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^title$/i), 'Team rehearsal');
    await user.type(screen.getByLabelText(/^starts$/i), '2026-08-10T10:00');
    await user.type(screen.getByLabelText(/^ends$/i), '2026-08-10T12:00');
    await user.click(screen.getByRole('button', { name: 'Create private event' }));

    expect(mutateJsonMock).toHaveBeenCalledWith(
      '/events',
      expect.objectContaining({
        volunteerId: 'vol-1',
        leaderMinistryId: 'ministry-1',
      }),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"kind":"PRIVATE"'),
      }),
    );
    expect(mutateJsonMock).toHaveBeenCalledWith(
      '/events',
      expect.anything(),
      expect.objectContaining({
        body: expect.stringContaining('"title":"Team rehearsal"'),
      }),
    );
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/scheduling/events/$eventId',
      params: { eventId: 'evt-private-new' },
    });
  });
});
