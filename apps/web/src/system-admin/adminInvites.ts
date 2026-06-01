import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

const base = () => import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type AdminInviteSummary = {
  id: string;
  email: string;
  status: 'PENDING' | 'FULFILLED' | 'REVOKED';
  createdAt: string;
  fulfilledAt: string | null;
};

export async function fetchAdminInvites(input: {
  churchId: string;
}): Promise<AdminInviteSummary[]> {
  const page = await fetchJsonWithProtectedHeaders<{ items: AdminInviteSummary[] }>(
    `${base()}/system-admin/churches/${encodeURIComponent(input.churchId)}/admin-invites`,
  );
  return page.items;
}

export async function revokeAdminInvite(input: {
  churchId: string;
  inviteId: string;
}): Promise<AdminInviteSummary> {
  return fetchJsonWithProtectedHeaders<AdminInviteSummary>(
    `${base()}/system-admin/churches/${encodeURIComponent(input.churchId)}/admin-invites/${encodeURIComponent(input.inviteId)}`,
    undefined,
    { method: 'DELETE' },
  );
}
