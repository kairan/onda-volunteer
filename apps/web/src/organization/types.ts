export type Campus = {
  id: string;
  name: string;
  timezone: string;
};

export type MinistrySummary = {
  id: string;
  name: string;
  archivedAt?: string | null;
  membershipStatus?: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  isLeader?: boolean;
  isChurchAdmin?: boolean;
};

export type Church = {
  id: string;
  name: string;
  defaultTimezone: string;
  isAccreditedAdmin: boolean;
  campuses: Campus[];
  ministries: MinistrySummary[];
};

export type OrganizationContextPayload = {
  churches: Church[];
};
