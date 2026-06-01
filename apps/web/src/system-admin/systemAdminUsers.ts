import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

const base = () => import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type SystemAdminVolunteerSummary = {
  id: string;
  displayName: string;
  accreditations: { churchId: string; churchName: string }[];
  leaderships: {
    ministryId: string;
    ministryName: string;
    churchId: string;
    churchName: string;
  }[];
  memberships: {
    ministryId: string;
    ministryName: string;
    churchId: string;
    churchName: string;
    status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  }[];
};

export type SystemAdminVolunteerListPage = {
  items: SystemAdminVolunteerSummary[];
  nextCursor: string | null;
};

export async function fetchSystemAdminVolunteers(input: {
  volunteerId: string;
  q?: string;
  limit?: number;
  cursor?: string;
}): Promise<SystemAdminVolunteerListPage> {
  const params = new URLSearchParams();
  if (input.q) params.set('q', input.q);
  if (input.limit !== undefined) params.set('limit', String(input.limit));
  if (input.cursor) params.set('cursor', input.cursor);
  const query = params.toString();

  return fetchJsonWithProtectedHeaders<SystemAdminVolunteerListPage>(
    `${base()}/system-admin/volunteers${query ? `?${query}` : ''}`,
    { volunteerId: input.volunteerId },
  );
}

export async function fetchSystemAdminVolunteerDetail(input: {
  volunteerId: string;
  targetVolunteerId: string;
}): Promise<SystemAdminVolunteerSummary> {
  return fetchJsonWithProtectedHeaders<SystemAdminVolunteerSummary>(
    `${base()}/system-admin/volunteers/${input.targetVolunteerId}`,
    { volunteerId: input.volunteerId },
  );
}

export async function grantSystemAdminAccreditation(input: {
  volunteerId: string;
  targetVolunteerId: string;
  churchId: string;
}): Promise<{ volunteerId: string; churchId: string }> {
  return fetchJsonWithProtectedHeaders<{ volunteerId: string; churchId: string }>(
    `${base()}/system-admin/volunteers/${input.targetVolunteerId}/churches/${input.churchId}/admin-accreditation`,
    { volunteerId: input.volunteerId },
    { method: 'PUT' },
  );
}

export async function revokeSystemAdminAccreditation(input: {
  volunteerId: string;
  targetVolunteerId: string;
  churchId: string;
}): Promise<{ volunteerId: string; churchId: string }> {
  return fetchJsonWithProtectedHeaders<{ volunteerId: string; churchId: string }>(
    `${base()}/system-admin/volunteers/${input.targetVolunteerId}/churches/${input.churchId}/admin-accreditation`,
    { volunteerId: input.volunteerId },
    { method: 'DELETE' },
  );
}
