import { redirect } from '@tanstack/react-router';
import { fetchOrganizationContext } from '@/organization/fetchOrganizationContext';
import { volunteerIdForProtectedRequests } from '@/auth/authSession';

export async function ensureLeaderRouteAccess(): Promise<void> {
  const volunteerId = volunteerIdForProtectedRequests();
  if (!volunteerId) {
    throw redirect({ to: '/', search: { auth: 'required' } });
  }

  const context = await fetchOrganizationContext({ volunteerId });
  const hasLeaderGrant = context.churches.some((church) =>
    church.ministries.some((ministry) => ministry.isLeader),
  );
  if (!hasLeaderGrant) {
    throw redirect({ to: '/dashboard' });
  }
}
