import { useOrganization } from '@/organization/OrganizationProvider';
import { placeholderPage } from '@/routes/placeholders';
import { VolunteerMyAssignmentsPage } from '@/routes/VolunteerMyAssignmentsPage';

const LeaderSchedulingPlaceholder = placeholderPage('Scheduling');

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
    return <LeaderSchedulingPlaceholder />;
  }

  return <VolunteerMyAssignmentsPage />;
}
