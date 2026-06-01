import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';
import { volunteerIdForProtectedRequests } from '@/auth/authSession';
import type { SystemAdminChurchSummary } from './fetchSystemAdminChurches';

export type SystemAdminChurchCreated = SystemAdminChurchSummary & {
  campuses: Array<{ id: string; name: string; timezone: string }>;
};

const base = () => import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function createSystemAdminChurch(input: {
  name: string;
  defaultTimezone: string;
}): Promise<SystemAdminChurchCreated> {
  return fetchJsonWithProtectedHeaders<SystemAdminChurchCreated>(
    `${base()}/system-admin/churches`,
    { volunteerId: volunteerIdForProtectedRequests() },
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}
