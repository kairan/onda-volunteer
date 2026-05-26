export type Campus = {
  id: string;
  name: string;
  timezone: string;
};

export type MinistrySummary = {
  id: string;
  name: string;
  membershipStatus?: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  isLeader?: boolean;
};

export type Church = {
  id: string;
  name: string;
  defaultTimezone: string;
  isAdminAccredited: boolean;
  campuses: Campus[];
  ministries: MinistrySummary[];
};

export type OrganizationContextPayload = {
  churches: Church[];
};
