/** Types shared with ministryStructureQueries (mutations ported in admin slice). */

export type VolunteerSearchResult = {
  id: string;
  displayName: string;
  email: string | null;
};

export type VolunteerInviteRow = {
  id: string;
  email: string;
  sentAtUtc: string;
  expiresAtUtc: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
};
