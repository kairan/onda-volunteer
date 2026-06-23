import { useOrganization } from '@/organization/OrganizationProvider';
import { LeaderSchedulingPage } from '@/routes/LeaderSchedulingPage';
import { VolunteerMyAssignmentsPage } from '@/routes/VolunteerMyAssignmentsPage';

function useSchedulingViewRole(previewRole?: string): 'leader' | 'volunteer' {
  const { activeChurch } = useOrganization();
  const isLeader =
    activeChurch?.ministries.some((ministry) => ministry.isLeader) ?? false;

  if (previewRole === 'volunteer') {
    return 'volunteer';
  }
  if (previewRole === 'leader') {
    return 'leader';
  }
  return isLeader ? 'leader' : 'volunteer';
}

export function SchedulingPage({ previewRole }: { previewRole?: string } = {}) {
  const viewRole = useSchedulingViewRole(previewRole);

  if (viewRole === 'leader') {
    return <LeaderSchedulingPage />;
  }

  return <VolunteerMyAssignmentsPage />;
}
