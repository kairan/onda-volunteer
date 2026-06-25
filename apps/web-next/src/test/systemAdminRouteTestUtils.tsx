import { renderAppRoute } from '@/test/routeTestUtils';
import type { AuthSessionState } from '@/auth/authSession';

export async function renderSystemAdminRoute(
  initialEntry: string,
  authState: AuthSessionState = {
    status: 'dev-bypass',
    volunteerId: 'seed-volunteer-system-admin',
  },
) {
  return renderAppRoute(initialEntry, { authState });
}
