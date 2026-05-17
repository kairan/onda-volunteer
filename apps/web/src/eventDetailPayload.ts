export type EventDetailPayload = {
  church: {
    id: string;
    name: string;
    defaultTimezone: string;
  };
  event: {
    id: string;
    kind: 'PUBLIC' | 'PRIVATE';
    title: string;
    voidedAtUtc: string | null;
    window: {
      startsAtUtc: string;
      endsAtUtc: string;
    };
    framing: {
      churchDefaultTimezone: string;
      startsDisplayInChurchTz: string;
      endsDisplayInChurchTz: string;
    };
  };
  ministry: { id: string; name: string } | null;
  assignments: Array<{
    id: string;
    volunteer: { id: string; displayName: string };
    ministry: { id: string; name: string };
    role: { id: string; name: string };
    window: { startsAtUtc: string; endsAtUtc: string };
  }>;
};
