import { vi } from 'vitest';

export const volunteerRouteOrgContext = {
  churches: [
    {
      id: 'church-demo',
      name: 'Demo Church',
      defaultTimezone: 'UTC',
      isAccreditedAdmin: false,
      campuses: [{ id: 'campus-1', name: 'Main', timezone: 'UTC' }],
      ministries: [{ id: 'ministry-1', name: 'Hospitality' }],
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

export const getJsonMock = vi.fn(async (path: string, _scope?: unknown) => {
  if (path.startsWith('/organization/context')) {
    return volunteerRouteOrgContext;
  }
  if (path.includes('/assignments')) {
    return volunteerRouteAssignments;
  }
  if (path.includes('/unavailability')) {
    return volunteerRouteUnavailability;
  }
  throw new Error(`Unexpected getJson path: ${path}`);
});

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
