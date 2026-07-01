export type QueryScope = {
  churchId: string | null;
  campusId: string | null;
  ministryId: string | null;
};

export const queryKeys = {
  organizationContext: (
    sessionVolunteerId?: string | null,
    devVolunteerId?: string,
  ) =>
    [
      'org-context',
      sessionVolunteerId ?? 'anonymous',
      devVolunteerId ?? 'default',
    ] as const,
  events: (scope: Pick<QueryScope, 'churchId' | 'ministryId'>) =>
    ['events', scope.churchId, scope.ministryId] as const,
  eventDetail: (eventId: string) => ['event-detail', eventId] as const,
  unavailability: (volunteerId: string, churchId?: string | null) =>
    ['unavailability', volunteerId, churchId ?? null] as const,
  ministryMemberships: (ministryId: string) =>
    ['ministry-memberships', ministryId] as const,
  ministryRoles: (ministryId: string) => ['ministry-roles', ministryId] as const,
  ministryLeaders: (ministryId: string) =>
    ['ministry-leaders', ministryId] as const,
  volunteerInvites: (ministryId: string) =>
    ['volunteer-invites', ministryId] as const,
  volunteerSearch: (
    churchId: string,
    ministryId: string,
    query: string,
  ) => ['volunteer-search', churchId, ministryId, query] as const,
  assignments: (volunteerId: string, churchId?: string | null) =>
    ['assignments', volunteerId, churchId ?? null] as const,
  systemAdmin: {
    churches: () => ['system-admin', 'churches'] as const,
    church: (churchId: string) => ['system-admin', 'church', churchId] as const,
    adminInvites: (churchId: string) =>
      ['system-admin', 'admin-invites', churchId] as const,
    volunteers: (q?: string) =>
      ['system-admin', 'volunteers', q ?? ''] as const,
    volunteer: (volunteerId: string) =>
      ['system-admin', 'volunteer', volunteerId] as const,
    events: (churchId?: string) =>
      ['system-admin', 'events', churchId ?? ''] as const,
    eventDetail: (eventId: string) =>
      ['system-admin', 'event-detail', eventId] as const,
  },
} as const;
