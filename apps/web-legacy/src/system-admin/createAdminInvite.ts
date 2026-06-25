import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';
import { volunteerIdForProtectedRequests } from '@/auth/authSession';

export type AdminInviteCreated = {
  id: string;
  email: string;
  churchId: string;
  status: string;
  createdAt: string;
};

const base = () => import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function createAdminInvite(input: {
  churchId: string;
  email: string;
}): Promise<AdminInviteCreated> {
  return fetchJsonWithProtectedHeaders<AdminInviteCreated>(
    `${base()}/system-admin/churches/${encodeURIComponent(input.churchId)}/admin-invites`,
    { volunteerId: volunteerIdForProtectedRequests() },
    {
      method: 'POST',
      body: JSON.stringify({ email: input.email }),
    },
  );
}
