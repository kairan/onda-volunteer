export type EventListItem = {
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
  ministry: { id: string; name: string } | null;
  church?: { id: string; name: string };
};

export type MinistryMembershipRow = {
  volunteerId: string;
  displayName: string;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
};

export type MinistryRoleRow = {
  id: string;
  name: string;
  retired: boolean;
};

export type RosterRow = {
  roleId: string;
  roleName: string;
  slotIndex: number;
  slotKey: string;
  assignmentId?: string;
  volunteerId?: string;
  volunteerName?: string;
};
