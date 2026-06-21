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
  unavailability: (volunteerId: string) => ['unavailability', volunteerId] as const,
  ministryMemberships: (ministryId: string) =>
    ['ministry-memberships', ministryId] as const,
  assignments: (volunteerId: string, churchId?: string | null) =>
    ['assignments', volunteerId, churchId ?? null] as const,
  systemAdmin: {
    churches: () => ['system-admin', 'churches'] as const,
    church: (churchId: string) => ['system-admin', 'church', churchId] as const,
    volunteers: () => ['system-admin', 'volunteers'] as const,
    volunteer: (volunteerId: string) =>
      ['system-admin', 'volunteer', volunteerId] as const,
    events: () => ['system-admin', 'events'] as const,
    eventDetail: (eventId: string) =>
      ['system-admin', 'event-detail', eventId] as const,
  },
} as const;
