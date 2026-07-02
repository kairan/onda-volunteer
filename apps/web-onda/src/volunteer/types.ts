export type VolunteerAssignment = {
  id: string;
  ministryId: string;
  startsAtUtc: string;
  endsAtUtc: string;
  event: {
    id: string;
    title: string;
    startsAtUtc: string;
    endsAtUtc: string;
  };
  role: {
    id: string;
    name: string;
  };
};

export type VolunteerUnavailability = {
  id: string;
  startsAtUtc: string;
  endsAtUtc: string;
  ministry: {
    id: string;
    name: string;
  };
};

export type CreateUnavailabilityResult = {
  id: string;
  ministryId: string;
  window: {
    startsAtUtc: string;
    endsAtUtc: string;
  };
};
