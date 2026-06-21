import { volunteerIdForProtectedRequests } from '@/auth/authSession';
import { fetchOrganizationContext } from '@/organization/fetchOrganizationContext';
import { readStoredActiveChurchId } from '@/organization/organizationContextStorage';
import { queryClient } from '@/query/queryClient';
import { volunteerAssignmentsQuery } from './volunteerAssignmentsQuery';
import { volunteerUnavailabilityQuery } from './volunteerUnavailabilityQuery';

export async function prefetchVolunteerDashboardQueries(): Promise<void> {
  const volunteerId = volunteerIdForProtectedRequests();
  if (!volunteerId) {
    return;
  }

  let churchId = readStoredActiveChurchId();
  if (!churchId) {
    const context = await fetchOrganizationContext({ volunteerId });
    churchId = context.churches[0]?.id ?? null;
  }
  if (!churchId) {
    return;
  }

  await Promise.all([
    queryClient.ensureQueryData(
      volunteerAssignmentsQuery({ volunteerId, churchId }),
    ),
    queryClient.ensureQueryData(
      volunteerUnavailabilityQuery({ volunteerId, churchId }),
    ),
  ]);
}
