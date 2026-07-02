import { redirect } from '@tanstack/react-router';
import { volunteerIdForProtectedRequests } from '@/auth/authSession';
import { fetchIdentityMe } from '@/identity/fetchIdentityMe';
import { markSystemAdminAccessDenied } from './accessDenied';

export async function ensureSystemAdminRouteAccess(): Promise<void> {
  const volunteerId = volunteerIdForProtectedRequests();
  if (!volunteerId) {
    throw redirect({ to: '/auth' });
  }

  const me = await fetchIdentityMe({ volunteerId });

  if (!me.isSystemAdmin) {
    markSystemAdminAccessDenied();
    throw redirect({ to: '/dashboard' });
  }
}
