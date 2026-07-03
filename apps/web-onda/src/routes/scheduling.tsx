import { useOrganization } from '@/organization/OrganizationProvider';
import { LeaderSchedulingPage } from '@/routes/LeaderSchedulingPage';
import { VolunteerMyAssignmentsPage } from '@/routes/VolunteerMyAssignmentsPage';

function useSchedulingViewRole(
  previewRole?: 'volunteer' | 'leader',
): 'leader' | 'volunteer' {
  const { workingContext } = useOrganization();

  if (previewRole === 'volunteer') {
    return 'volunteer';
  }
  if (previewRole === 'leader') {
    return 'leader';
  }
  return workingContext?.mode === 'leader' ? 'leader' : 'volunteer';
}

export function SchedulingPage({
  previewRole,
}: { previewRole?: 'volunteer' | 'leader' } = {}) {
  const viewRole = useSchedulingViewRole(previewRole);

  if (viewRole === 'leader') {
    return <LeaderSchedulingPage />;
  }

  return <VolunteerMyAssignmentsPage />;
}
