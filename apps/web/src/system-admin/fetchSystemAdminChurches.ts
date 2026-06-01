import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';
import { volunteerIdForProtectedRequests } from '@/auth/authSession';

export type SystemAdminChurchSummary = {
  id: string;
  name: string;
  defaultTimezone: string;
};

const base = () => import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function protectedScope() {
  return { volunteerId: volunteerIdForProtectedRequests() };
}

export async function fetchSystemAdminChurches(): Promise<SystemAdminChurchSummary[]> {
  return fetchJsonWithProtectedHeaders<SystemAdminChurchSummary[]>(
    `${base()}/system-admin/churches`,
    protectedScope(),
  );
}

export async function fetchSystemAdminChurch(
  churchId: string,
): Promise<SystemAdminChurchSummary> {
  return fetchJsonWithProtectedHeaders<SystemAdminChurchSummary>(
    `${base()}/system-admin/churches/${encodeURIComponent(churchId)}`,
    protectedScope(),
  );
}
