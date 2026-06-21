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

export type PreviewTimeAway = {
  id: string;
  startsAtUtc: string;
  endsAtUtc: string;
  note: string;
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
      eventTitle: 'Sunday Service',
      ministryName: 'Worship',
      roleName: 'Lead Vocalist',
      startsAtUtc: '2026-06-22T13:00:00.000Z',
      endsAtUtc: '2026-06-22T15:00:00.000Z',
      status: 'ROSTERED' as const,
    },
    {
      id: 'asg-2',
      eventTitle: 'Wednesday Prayer',
      ministryName: 'Prayer',
      roleName: 'Intercessor',
      startsAtUtc: '2026-06-25T22:00:00.000Z',
      endsAtUtc: '2026-06-26T00:00:00.000Z',
      status: 'ROSTERED' as const,
    },
    {
      id: 'asg-3',
      eventTitle: 'Community Dinner',
      ministryName: 'Hospitality',
      roleName: 'Greeter',
      startsAtUtc: '2026-06-27T21:00:00.000Z',
      endsAtUtc: '2026-06-27T23:00:00.000Z',
      status: 'ROSTERED' as const,
    },
  ] satisfies PreviewAssignment[],
  timeAway: [
    {
      id: 'away-1',
      startsAtUtc: '2026-07-05T00:00:00.000Z',
      endsAtUtc: '2026-07-12T23:59:59.000Z',
      note: 'Family vacation',
    },
    {
      id: 'away-2',
      startsAtUtc: '2026-08-02T00:00:00.000Z',
      endsAtUtc: '2026-08-03T23:59:59.000Z',
      note: 'Wedding out of town',
    },
  ] satisfies PreviewTimeAway[],
};

export type SchedulingPreviewRole = 'leader' | 'volunteer';

/** Brand checkpoint default: leader roster on /scheduling */
export const schedulingPreviewRole: SchedulingPreviewRole = 'leader';

export const leaderSchedulingPreview = {
  ministryName: 'Worship',
  eventsThisWeek: 2,
  openSlots: 3,
  rosterEvents: [
    {
      id: 'evt-preview-1',
      title: 'Sunday Service',
      startsAtUtc: '2026-06-22T13:00:00.000Z',
      endsAtUtc: '2026-06-22T15:00:00.000Z',
      roster: [
        { roleName: 'Lead Vocalist', volunteerName: 'Sarah Chen' },
        { roleName: 'Acoustic Guitar', volunteerName: 'Michael Torres' },
        { roleName: 'Keys', volunteerName: 'Priya Patel' },
        { roleName: 'Drums', volunteerName: null },
        { roleName: 'Bass', volunteerName: null },
      ],
    },
    {
      id: 'evt-preview-2',
      title: 'Evening Worship Night',
      startsAtUtc: '2026-06-28T22:00:00.000Z',
      endsAtUtc: '2026-06-29T01:00:00.000Z',
      roster: [
        { roleName: 'Lead Vocalist', volunteerName: "James O'Connor" },
        { roleName: 'Keys', volunteerName: 'Priya Patel' },
        { roleName: 'Guitar', volunteerName: null },
      ],
    },
  ] satisfies PreviewRosterEvent[],
};

export function rosterFillCounts(roster: PreviewRosterRow[]): {
  filled: number;
  total: number;
} {
  const total = roster.length;
  const filled = roster.filter((row) => row.volunteerName).length;
  return { filled, total };
}
