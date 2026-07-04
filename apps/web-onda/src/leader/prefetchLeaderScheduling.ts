import { volunteerIdForProtectedRequests } from '@/auth/authSession';
import { fetchOrganizationContext } from '@/organization/fetchOrganizationContext';
import { readStoredActiveChurchId, readStoredActiveMinistryId } from '@/organization/organizationContextStorage';
import { leaderEventsQuery } from '@/leader/leaderEventsQuery';
import { ministryRolesQuery } from '@/organization/ministryStructureQueries';
import { queryClient } from '@/query/queryClient';

export async function prefetchLeaderSchedulingQueries(): Promise<void> {
  const volunteerId = volunteerIdForProtectedRequests();
  if (!volunteerId) {
    return;
  }

  let churchId = readStoredActiveChurchId();
  let ministryId = readStoredActiveMinistryId();
  if (!churchId || !ministryId) {
    const context = await fetchOrganizationContext({ volunteerId });
    const church = context.churches.find((row) => row.id === churchId) ??
      context.churches[0];
    churchId = church?.id ?? null;
    ministryId =
      ministryId ??
      church?.ministries.find((ministry) => ministry.isLeader)?.id ??
      null;
  }
  if (!churchId || !ministryId) {
    return;
  }

  await Promise.all([
    queryClient.ensureQueryData(
      leaderEventsQuery({ volunteerId, churchId, ministryId }),
    ),
    queryClient.ensureQueryData(
      ministryRolesQuery({ ministryId, actingVolunteerId: volunteerId }),
    ),
  ]);
}
