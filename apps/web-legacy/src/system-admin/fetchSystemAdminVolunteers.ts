import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';
import { volunteerIdForProtectedRequests } from '@/auth/authSession';

export type SystemAdminVolunteerSummary = {
  id: string;
  displayName: string;
  adminAccreditations: Array<{ churchId: string; churchName: string }>;
  leaderships: Array<{
    ministryId: string;
    ministryName: string;
    churchId: string;
  }>;
  memberships: Array<{
    ministryId: string;
    ministryName: string;
    churchId: string;
    status: string;
  }>;
};

export type SystemAdminVolunteerDetail = SystemAdminVolunteerSummary & {
  authSubjectId: string | null;
};

const base = () => import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function protectedScope() {
  return { volunteerId: volunteerIdForProtectedRequests() };
}

export async function fetchSystemAdminVolunteers(
  q?: string,
): Promise<SystemAdminVolunteerSummary[]> {
  const url = new URL(`${base()}/system-admin/volunteers`);
  if (q?.trim()) {
    url.searchParams.set('q', q.trim());
  }
  return fetchJsonWithProtectedHeaders<SystemAdminVolunteerSummary[]>(
    url.toString(),
    protectedScope(),
  );
}

export async function fetchSystemAdminVolunteer(
  volunteerId: string,
): Promise<SystemAdminVolunteerDetail> {
  return fetchJsonWithProtectedHeaders<SystemAdminVolunteerDetail>(
    `${base()}/system-admin/volunteers/${encodeURIComponent(volunteerId)}`,
    protectedScope(),
  );
}

export async function grantSystemAdminAccreditation(input: {
  volunteerId: string;
  churchId: string;
}): Promise<void> {
  await fetchJsonWithProtectedHeaders(
    `${base()}/system-admin/volunteers/${encodeURIComponent(input.volunteerId)}/churches/${encodeURIComponent(input.churchId)}/admin-accreditation`,
    protectedScope(),
    { method: 'PUT' },
  );
}

export async function revokeSystemAdminAccreditation(input: {
  volunteerId: string;
  churchId: string;
}): Promise<void> {
  await fetchJsonWithProtectedHeaders(
    `${base()}/system-admin/volunteers/${encodeURIComponent(input.volunteerId)}/churches/${encodeURIComponent(input.churchId)}/admin-accreditation`,
    protectedScope(),
    { method: 'DELETE' },
  );
}
