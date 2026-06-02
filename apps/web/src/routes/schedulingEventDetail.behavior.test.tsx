import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { changeLocale, initI18n } from '@/i18n/controller';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import { SchedulingEventDetailView } from './schedulingEventDetail';
import type { EventDetailPayload } from '@/eventDetailPayload';
import { ApiRequestError } from '@/apiError';
import * as releaseAssignmentModule from '@/events/releaseAssignment';

const mockVolunteerId = 'seed-volunteer-demo';

vi.mock('@/auth/AuthSessionProvider', () => ({
  useAuthSession: () => ({ status: 'dev-bypass', volunteerId: mockVolunteerId }),
}));

vi.mock('@/events/releaseAssignment');

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useRouter: () => ({ invalidate: async () => {} }),
}));

vi.mock('@/feedback/ToastHost', () => ({
  useToasts: () => ({ push: vi.fn() }),
}));

vi.mock('@/organization/OrganizationContextProvider', () => ({
  useOrganization: () => ({
    activeChurch: { isAccreditedAdmin: false },
  }),
}));

vi.mock('@/auth/authSession', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/auth/authSession')>();
  return {
    ...actual,
    devAuthBypassAllowed: () => true,
    volunteerIdForProtectedRequests: () => mockVolunteerId,
  };
});

const payload: EventDetailPayload = {
  church: { name: 'Demo Church', defaultTimezone: 'America/New_York' },
  event: {
    id: 'evt-1',
    kind: 'PUBLIC',
    title: 'Sunday Service',
    window: {
      startsAtUtc: '2026-06-01T14:00:00.000Z',
      endsAtUtc: '2026-06-01T16:00:00.000Z',
    },
    cancelledAtUtc: null,
  },
  ministry: null,
  assignments: [
    {
      id: 'asg-1',
      ministry: { id: 'min-1', name: 'Band' },
      volunteer: { id: mockVolunteerId, displayName: 'Demo Volunteer' },
      role: { id: 'role-1', name: 'Guitar' },
      window: {
        startsAtUtc: '2026-06-01T14:30:00.000Z',
        endsAtUtc: '2026-06-01T15:30:00.000Z',
      },
    },
  ],
};

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe('SchedulingEventDetailView dual time', () => {
  it('shows personal-local companion when toggle is on and zones differ', async () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      ...new Intl.DateTimeFormat().resolvedOptions(),
      timeZone: 'Europe/London',
    });

    await initI18n();
    sessionStorage.setItem('onda.useLocalTime', 'true');

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <SchedulingEventDetailView data={payload} />
        </LocalTimeProvider>
      </I18nProvider>,
    );

    expect(screen.getAllByText(/Seu horário:/i).length).toBeGreaterThan(0);
  });

  it('shows English personal-local companion when locale is en', async () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      ...new Intl.DateTimeFormat().resolvedOptions(),
      timeZone: 'Europe/London',
    });

    await initI18n();
    await changeLocale('en');
    sessionStorage.setItem('onda.useLocalTime', 'true');

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <SchedulingEventDetailView data={payload} />
        </LocalTimeProvider>
      </I18nProvider>,
    );

    expect(screen.getAllByText(/Your time:/i).length).toBeGreaterThan(0);
  });

  it('hides personal-local line when toggle is off', async () => {
    await initI18n();
    sessionStorage.setItem('onda.useLocalTime', 'false');

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <SchedulingEventDetailView data={payload} />
        </LocalTimeProvider>
      </I18nProvider>,
    );

    expect(screen.queryByText(/Seu horário:/i)).toBeNull();
    expect(screen.getByText('Sunday Service')).toBeInTheDocument();
  });
});

describe('SchedulingEventDetailView release assignment', () => {
  it('releases the volunteer own assignment when Liberar is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(releaseAssignmentModule.releaseAssignment).mockResolvedValue({
      ministryId: 'min-1',
      window: {
        startsAtUtc: '2026-06-01T14:30:00.000Z',
        endsAtUtc: '2026-06-01T15:30:00.000Z',
      },
    });

    await initI18n();
    await changeLocale('pt-BR');
    render(
      <I18nProvider>
        <LocalTimeProvider>
          <SchedulingEventDetailView data={payload} />
        </LocalTimeProvider>
      </I18nProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Liberar' }));

    await waitFor(() => {
      expect(releaseAssignmentModule.releaseAssignment).toHaveBeenCalledWith({
        assignmentId: 'asg-1',
        volunteerId: mockVolunteerId,
      });
    });
  });

  it('shows a clear error when the API rejects release', async () => {
    const user = userEvent.setup();
    vi.mocked(releaseAssignmentModule.releaseAssignment).mockRejectedValue(
      new ApiRequestError(
        403,
        'Volunteers may only release their own assignments.',
        'ASSIGNMENT_NOT_OWNED',
      ),
    );

    await initI18n();
    await changeLocale('pt-BR');
    render(
      <I18nProvider>
        <LocalTimeProvider>
          <SchedulingEventDetailView data={payload} />
        </LocalTimeProvider>
      </I18nProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Liberar' }));

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/só pode liberar a sua própria designação/i);
  });
});
