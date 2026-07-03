import { vi } from 'vitest';

function daysFromNowIso(days: number, hourUtc = 13): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hourUtc, 0, 0, 0);
  return date.toISOString();
}

export const volunteerRouteOrgContext = {
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

export const volunteerRouteAssignments = [
  {
    id: 'asg-1',
    ministryId: 'ministry-1',
    startsAtUtc: '2026-06-22T13:00:00.000Z',
    endsAtUtc: '2026-06-22T15:00:00.000Z',
    event: {
      id: 'evt-1',
      title: 'Sunday Service',
      startsAtUtc: '2026-06-22T13:00:00.000Z',
      endsAtUtc: '2026-06-22T15:00:00.000Z',
    },
    role: { id: 'role-1', name: 'Greeter' },
  },
];

export const volunteerRouteUnavailability = [
  {
    id: 'away-1',
    startsAtUtc: '2026-07-05T00:00:00.000Z',
    endsAtUtc: '2026-07-12T23:59:59.000Z',
    ministry: { id: 'ministry-1', name: 'Hospitality' },
  },
];

export const leaderRouteEvents = [
  {
    id: 'evt-1',
    kind: 'PUBLIC' as const,
    title: 'Sunday Service',
    window: {
      startsAtUtc: daysFromNowIso(2),
      endsAtUtc: daysFromNowIso(2, 15),
    },
    framing: {
      churchDefaultTimezone: 'UTC',
      startsDisplayInChurchTz: '13:00',
      endsDisplayInChurchTz: '15:00',
    },
    ministry: null,
  },
];

export const leaderRouteEventDetail = {
  church: { id: 'church-demo', name: 'Demo Church', defaultTimezone: 'UTC' },
  event: {
    id: 'evt-1',
    kind: 'PUBLIC' as const,
    title: 'Sunday Service',
    window: leaderRouteEvents[0].window,
    framing: leaderRouteEvents[0].framing,
    cancelledAtUtc: null,
  },
  ministry: null,
  assignments: [],
};

export const getJsonMock = vi.fn<(path: string, _scope?: unknown) => Promise<unknown>>(
  async (path: string) => {
    if (path.startsWith('/organization/context')) {
      return volunteerRouteOrgContext;
    }
    if (path.startsWith('/events?')) {
      return leaderRouteEvents;
    }
    if (path.startsWith('/events/evt-1')) {
      return leaderRouteEventDetail;
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
    if (path.includes('/ministries/') && path.endsWith('/invites')) {
      return { invites: [] };
    }
    if (path.includes('/volunteers/search')) {
      return { volunteers: [] };
    }
    if (path.includes('/assignments')) {
      return volunteerRouteAssignments;
    }
    if (path.includes('/unavailability')) {
      return volunteerRouteUnavailability;
    }
    throw new Error(`Unexpected getJson path: ${path}`);
  },
);

export const mutateJsonMock = vi.fn(async (_path: string, _scope: unknown, init?: RequestInit) => {
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

vi.mock('@/api/apiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/apiClient')>();
  return {
    ...actual,
    getJson: (...args: Parameters<typeof actual.getJson>) => getJsonMock(...args),
    mutateJson: (...args: Parameters<typeof actual.mutateJson>) =>
      mutateJsonMock(...args),
  };
});

vi.mock('@/volunteer/prefetchVolunteerDashboard', () => ({
  prefetchVolunteerDashboardQueries: vi.fn(async () => {}),
}));

vi.mock('@/leader/prefetchLeaderScheduling', () => ({
  prefetchLeaderSchedulingQueries: vi.fn(async () => {}),
}));
