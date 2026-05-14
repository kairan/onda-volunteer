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
};
