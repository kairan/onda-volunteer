import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { changeLocale, initI18n } from '@/i18n/controller';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import { SchedulingEventDetailView } from './schedulingEventDetail';
import type { EventDetailPayload } from '@/eventDetailPayload';
import { ApiRequestError } from '@/apiError';
import * as editEventModule from '@/events/editEvent';
import * as releaseAssignmentModule from '@/events/releaseAssignment';
import * as voidAssignmentModule from '@/events/voidAssignment';
import * as fetchMembershipsModule from '@/organization/fetchMinistryMemberships';
import * as fetchRolesModule from '@/organization/fetchMinistryRoles';

const mockVolunteerId = 'seed-volunteer-demo';
const leaderMinistryId = 'min-leader';

const mockOrganization = {
  activeChurch: {
    id: 'church-1',
    name: 'Demo Church',
    isAccreditedAdmin: true,
    defaultTimezone: 'America/New_York',
    ministries: [] as Array<{
      id: string;
      name: string;
      isLeader?: boolean;
    }>,
  },
  activeCampus: null as { id: string; name: string; timezone: string } | null,
};

vi.mock('@/auth/AuthSessionProvider', () => ({
  useAuthSession: () => ({ status: 'dev-bypass', volunteerId: mockVolunteerId }),
}));

vi.mock('@/events/editEvent');
vi.mock('@/events/releaseAssignment');
vi.mock('@/events/voidAssignment');
vi.mock('@/organization/fetchMinistryMemberships');
vi.mock('@/organization/fetchMinistryRoles');

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useRouter: () => ({ invalidate: async () => {} }),
}));

const mockToastPush = vi.fn();
vi.mock('@/feedback/ToastHost', () => ({
  useToasts: () => ({ push: mockToastPush }),
}));

vi.mock('@/organization/OrganizationContextProvider', () => ({
  useOrganization: () => mockOrganization,
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
  church: {
    id: 'church-1',
    name: 'Demo Church',
    defaultTimezone: 'America/New_York',
  },
  event: {
    id: 'evt-1',
    kind: 'PUBLIC',
    title: 'Sunday Service',
    window: {
      startsAtUtc: '2026-06-01T14:00:00.000Z',
      endsAtUtc: '2026-06-01T16:00:00.000Z',
    },
    framing: {
      churchDefaultTimezone: 'America/New_York',
      startsDisplayInChurchTz: 'Sun, Jun 1, 10:00 AM',
      endsDisplayInChurchTz: '12:00 PM',
    },
    cancelledAtUtc: null,
  },
  ministry: null,
  assignments: [
    {
      id: 'asg-1',
      ministry: { id: leaderMinistryId, name: 'Band' },
      volunteer: { id: mockVolunteerId, displayName: 'Demo Volunteer' },
      role: { id: 'role-1', name: 'Guitar' },
      window: {
        startsAtUtc: '2026-06-01T14:30:00.000Z',
        endsAtUtc: '2026-06-01T15:30:00.000Z',
      },
    },
    {
      id: 'asg-2',
      ministry: { id: leaderMinistryId, name: 'Band' },
      volunteer: { id: 'other-volunteer', displayName: 'Other Volunteer' },
      role: { id: 'role-2', name: 'Drums' },
      window: {
        startsAtUtc: '2026-06-01T14:30:00.000Z',
        endsAtUtc: '2026-06-01T15:30:00.000Z',
      },
    },
  ],
};

function renderView(data: EventDetailPayload = payload) {
  return render(
    <I18nProvider>
      <LocalTimeProvider>
        <SchedulingEventDetailView data={data} />
      </LocalTimeProvider>
    </I18nProvider>,
  );
}

beforeEach(() => {
  mockOrganization.activeChurch = {
    id: 'church-1',
    name: 'Demo Church',
    isAccreditedAdmin: false,
    defaultTimezone: 'America/New_York',
    ministries: [],
  };
  mockOrganization.activeCampus = null;
});

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.clearAllMocks();
});

describe('SchedulingEventDetailView campus timezone', () => {
  it('uses active campus zone for label and event time display', async () => {
    await initI18n();
    await changeLocale('en');
    sessionStorage.setItem('onda.useLocalTime', 'false');

    mockOrganization.activeCampus = {
      id: 'campus-porto',
      name: 'Campus Porto',
      timezone: 'Europe/Lisbon',
    };

    renderView();

    expect(screen.getByText(/Campus timezone Europe\/Lisbon/i)).toBeInTheDocument();
    expect(screen.getByText(/3:00\s*PM/i)).toBeInTheDocument();
    expect(screen.queryByText(/10:00\s*AM/i)).not.toBeInTheDocument();
  });

  it('falls back to church default label when no campus is active', async () => {
    await initI18n();
    await changeLocale('en');
    sessionStorage.setItem('onda.useLocalTime', 'false');

    renderView();

    expect(
      screen.getByText(/Church default timezone America\/New_York/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/10:00\s*AM/i)).toBeInTheDocument();
  });
});

describe('SchedulingEventDetailView dual time', () => {
  it('shows personal-local companion when toggle is on and zones differ', async () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      ...new Intl.DateTimeFormat().resolvedOptions(),
      timeZone: 'Europe/London',
    });

    await initI18n();
    await changeLocale('pt-BR');
    sessionStorage.setItem('onda.useLocalTime', 'true');

    renderView();

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

    renderView();

    expect(screen.getAllByText(/Your time:/i).length).toBeGreaterThan(0);
  });

  it('hides personal-local line when toggle is off', async () => {
    await initI18n();
    await changeLocale('pt-BR');
    sessionStorage.setItem('onda.useLocalTime', 'false');

    renderView();

    expect(screen.queryByText(/Seu horário:/i)).toBeNull();
    expect(screen.getByText('Sunday Service')).toBeInTheDocument();
  });
});

describe('SchedulingEventDetailView release assignment', () => {
  it('releases the volunteer own assignment when Liberar is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(releaseAssignmentModule.releaseAssignment).mockResolvedValue({
      ministryId: leaderMinistryId,
      window: {
        startsAtUtc: '2026-06-01T14:30:00.000Z',
        endsAtUtc: '2026-06-01T15:30:00.000Z',
      },
    });

    await initI18n();
    await changeLocale('pt-BR');
    renderView();

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
    renderView();

    await user.click(screen.getByRole('button', { name: 'Liberar' }));

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/só pode liberar a sua própria designação/i);
  });
});

describe('SchedulingEventDetailView leader roster assignment', () => {
  it('does not render the assignment form for non-leaders', async () => {
    await initI18n(undefined, 'en');
    renderView();

    expect(screen.queryByRole('heading', { name: 'Assign volunteer' })).toBeNull();
  });

  it('renders production pickers for a leader', async () => {
    mockOrganization.activeChurch.ministries = [
      { id: leaderMinistryId, name: 'Band', isLeader: true },
    ];
    vi.mocked(fetchMembershipsModule.fetchMinistryMemberships).mockResolvedValue([
      {
        volunteerId: 'vol-active',
        displayName: 'Active Member',
        status: 'ACTIVE',
      },
      {
        volunteerId: 'vol-pending',
        displayName: 'Pending Member',
        status: 'PENDING',
      },
    ]);
    vi.mocked(fetchRolesModule.fetchMinistryRoles).mockResolvedValue([
      { id: 'role-active', name: 'Keys', retired: false },
      { id: 'role-retired', name: 'Retired Role', retired: true },
    ]);

    await initI18n(undefined, 'en');
    renderView();

    expect(
      await screen.findByRole('heading', { name: 'Assign volunteer' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Volunteer')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Active Member' })).toBeInTheDocument();
    });
    expect(screen.queryByRole('option', { name: 'Pending Member' })).toBeNull();
    expect(screen.getByRole('option', { name: 'Keys' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Retired Role' })).toBeNull();
  });

  it('shows a load error when picker data fails to fetch', async () => {
    mockOrganization.activeChurch.ministries = [
      { id: leaderMinistryId, name: 'Band', isLeader: true },
    ];
    vi.mocked(fetchMembershipsModule.fetchMinistryMemberships).mockRejectedValue(
      new ApiRequestError(403, 'Leader ministry scope mismatch.', 'LEADER_MINISTRY_MISMATCH'),
    );
    vi.mocked(fetchRolesModule.fetchMinistryRoles).mockResolvedValue([]);

    await initI18n(undefined, 'en');
    renderView();

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/leader ministry scope mismatch/i);
  });

  it('calls voidAssignment after confirming remove on another volunteer row', async () => {
    const user = userEvent.setup();
    mockOrganization.activeChurch.ministries = [
      { id: leaderMinistryId, name: 'Band', isLeader: true },
    ];
    vi.mocked(fetchMembershipsModule.fetchMinistryMemberships).mockResolvedValue([]);
    vi.mocked(fetchRolesModule.fetchMinistryRoles).mockResolvedValue([]);
    vi.mocked(voidAssignmentModule.voidAssignment).mockResolvedValue({
      id: 'asg-2',
      voidedAtUtc: '2026-06-01T15:00:00.000Z',
    });

    await initI18n(undefined, 'en');
    renderView();

    await user.click(await screen.findByRole('button', { name: 'Remove' }));
    expect(
      screen.getByRole('dialog', { name: 'Remove this assignment?' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Yes, remove' }));

    await waitFor(() => {
      expect(voidAssignmentModule.voidAssignment).toHaveBeenCalledWith({
        assignmentId: 'asg-2',
        actingVolunteerId: mockVolunteerId,
      });
    });
  });
});

describe('SchedulingEventDetailView edit section', () => {
  it('does not render edit button for non-editor role', async () => {
    await initI18n(undefined, 'en');
    renderView();

    expect(screen.queryByRole('button', { name: 'Edit event' })).toBeNull();
  });

  it('renders edit button for admin', async () => {
    mockOrganization.activeChurch = {
      isAccreditedAdmin: true,
      ministries: [],
    };

    await initI18n(undefined, 'en');
    renderView();

    expect(screen.getByRole('button', { name: 'Edit event' })).toBeInTheDocument();
  });

  it('renders edit form pre-filled when button is clicked', async () => {
    const user = userEvent.setup();
    mockOrganization.activeChurch = {
      isAccreditedAdmin: true,
      ministries: [],
    };

    await initI18n(undefined, 'en');
    renderView();

    await user.click(screen.getByRole('button', { name: 'Edit event' }));

    expect(screen.getByRole('heading', { name: 'Edit event' })).toBeInTheDocument();

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
    expect(titleInput.value).toBe('Sunday Service');

    const startsInput = screen.getByLabelText('Starts (UTC ISO)') as HTMLInputElement;
    expect(startsInput.value).toBe('2026-06-01T14:00:00.000Z');

    const endsInput = screen.getByLabelText('Ends (UTC ISO)') as HTMLInputElement;
    expect(endsInput.value).toBe('2026-06-01T16:00:00.000Z');
  });

  it('submit dispatches editEvent with changed fields', async () => {
    const user = userEvent.setup();
    mockOrganization.activeChurch = {
      isAccreditedAdmin: true,
      ministries: [],
    };
    vi.mocked(editEventModule.editEvent).mockResolvedValue({
      id: 'evt-1',
      title: 'Updated Title',
      kind: 'PUBLIC',
      window: {
        startsAtUtc: '2026-06-01T14:00:00.000Z',
        endsAtUtc: '2026-06-01T16:00:00.000Z',
      },
      voidedAssignmentCount: 0,
    });

    await initI18n(undefined, 'en');
    renderView();

    await user.click(screen.getByRole('button', { name: 'Edit event' }));

    const titleInput = screen.getByLabelText('Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Title');

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(editEventModule.editEvent).toHaveBeenCalledWith({
        eventId: 'evt-1',
        actingVolunteerId: mockVolunteerId,
        title: 'Updated Title',
      });
    });
  });

  it('shows voided count toast when voidedAssignmentCount > 0', async () => {
    const user = userEvent.setup();
    vi.mocked(editEventModule.editEvent).mockResolvedValue({
      id: 'evt-1',
      title: 'Sunday Service',
      kind: 'PUBLIC',
      window: {
        startsAtUtc: '2026-06-01T15:00:00.000Z',
        endsAtUtc: '2026-06-01T16:00:00.000Z',
      },
      voidedAssignmentCount: 2,
    });

    mockOrganization.activeChurch = {
      isAccreditedAdmin: true,
      ministries: [],
    };

    await initI18n(undefined, 'en');
    renderView();

    await user.click(screen.getByRole('button', { name: 'Edit event' }));

    const startsInput = screen.getByLabelText('Starts (UTC ISO)');
    await user.clear(startsInput);
    await user.type(startsInput, '2026-06-01T15:00:00.000Z');

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(mockToastPush).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'warning',
          message: expect.stringContaining('2'),
        }),
      );
    });
  });

  it('does not render edit section for cancelled event', async () => {
    mockOrganization.activeChurch = {
      isAccreditedAdmin: true,
      ministries: [],
    };

    const cancelledPayload: EventDetailPayload = {
      ...payload,
      event: {
        ...payload.event,
        cancelledAtUtc: '2026-06-01T12:00:00.000Z',
      },
    };

    await initI18n(undefined, 'en');
    renderView(cancelledPayload);

    expect(screen.queryByRole('button', { name: 'Edit event' })).toBeNull();
  });

  it('shows error message when API returns error', async () => {
    const user = userEvent.setup();
    mockOrganization.activeChurch = {
      isAccreditedAdmin: true,
      ministries: [],
    };
    vi.mocked(editEventModule.editEvent).mockRejectedValue(
      new ApiRequestError(400, 'Start time must be before end time.', 'INVALID_EVENT_WINDOW'),
    );

    await initI18n(undefined, 'en');
    renderView();

    await user.click(screen.getByRole('button', { name: 'Edit event' }));

    const startsInput = screen.getByLabelText('Starts (UTC ISO)');
    await user.clear(startsInput);
    await user.type(startsInput, '2026-06-01T18:00:00.000Z');

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/start time must be before end time/i);
  });

  it('renders edit button for leader on private event', async () => {
    mockOrganization.activeChurch = {
      isAccreditedAdmin: false,
      ministries: [{ id: 'min-private', name: 'Worship', isLeader: true }],
    };

    const privatePayload: EventDetailPayload = {
      ...payload,
      event: {
        ...payload.event,
        kind: 'PRIVATE',
      },
      ministry: { id: 'min-private', name: 'Worship' },
    };

    await initI18n(undefined, 'en');
    renderView(privatePayload);

    expect(screen.getByRole('button', { name: 'Edit event' })).toBeInTheDocument();
  });
});
