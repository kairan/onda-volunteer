export type Campus = {
  id: string;
  name: string;
  timezone: string;
};

export type MinistrySummary = {
  id: string;
  name: string;
  membershipStatus?: 'PENDING' | 'ACTIVE' | 'INACTIVE';
};

export type Church = {
  id: string;
  name: string;
  defaultTimezone: string;
  campuses: Campus[];
  ministries: MinistrySummary[];
};

export type OrganizationContextPayload = {
  churches: Church[];
};
