// TODO(MIG-FND-04): throwaway preview — remove when T16/T20/T21 land

export type PreviewAssignment = {
  id: string;
  eventTitle: string;
  ministryName: string;
  roleName: string;
  startsAtUtc: string;
  endsAtUtc: string;
  status: 'ROSTERED';
};

export type PreviewRosterRow = {
  roleName: string;
  volunteerName: string | null;
};

export type PreviewRosterEvent = {
  id: string;
  title: string;
  startsAtUtc: string;
  endsAtUtc: string;
  roster: PreviewRosterRow[];
};

export const volunteerDashboardPreview = {
  displayName: 'Alex Volunteer',
  assignments: [
    {
      id: 'asg-1',
      eventTitle: 'Sunday Morning Service',
      ministryName: 'Worship',
      roleName: 'Vocals',
      startsAtUtc: '2026-06-21T14:00:00.000Z',
      endsAtUtc: '2026-06-21T16:00:00.000Z',
      status: 'ROSTERED' as const,
    },
    {
      id: 'asg-2',
      eventTitle: 'Youth Night',
      ministryName: 'Youth',
      roleName: 'Greeter',
      startsAtUtc: '2026-06-28T23:00:00.000Z',
      endsAtUtc: '2026-06-29T01:00:00.000Z',
      status: 'ROSTERED' as const,
    },
  ] satisfies PreviewAssignment[],
};

export const leaderSchedulingPreview = {
  ministryName: 'Worship',
  eventCount: 2,
  rosterEvent: {
    id: 'evt-preview-1',
    title: 'Sunday Morning Service',
    startsAtUtc: '2026-06-21T14:00:00.000Z',
    endsAtUtc: '2026-06-21T16:00:00.000Z',
    roster: [
      { roleName: 'Vocals', volunteerName: 'Alex Volunteer' },
      { roleName: 'Keys', volunteerName: 'Jordan Keys' },
      { roleName: 'Drums', volunteerName: null },
      { roleName: 'Bass', volunteerName: null },
    ],
  } satisfies PreviewRosterEvent,
};

export function rosterFillCounts(roster: PreviewRosterRow[]): {
  filled: number;
  total: number;
} {
  const total = roster.length;
  const filled = roster.filter((row) => row.volunteerName).length;
  return { filled, total };
}
