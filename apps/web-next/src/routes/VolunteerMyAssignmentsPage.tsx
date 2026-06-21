import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { AssignmentCard, AssignmentCardSkeleton } from '@/components/AssignmentCard';
import { useOrganization } from '@/organization/OrganizationProvider';
import { useLocalTimeContext } from '@/settings/LocalTimeProvider';
import { volunteerAssignmentsQuery } from '@/volunteer/volunteerAssignmentsQuery';
import type { VolunteerAssignment } from '@/volunteer/types';
import type { MinistrySummary } from '@/organization/types';

function ministryNameForAssignment(
  assignment: VolunteerAssignment,
  ministries: MinistrySummary[],
  unknownMinistryLabel: string,
): string {
  return (
    ministries.find((ministry) => ministry.id === assignment.ministryId)?.name ??
    unknownMinistryLabel
  );
}

export function VolunteerMyAssignmentsPage() {
  const { t, i18n } = useTranslation(['dashboard', 'scheduling']);
  const auth = useAuthSession();
  const { activeChurch, activeCampus, loading: orgLoading } = useOrganization();
  const { buildDualInterval } = useLocalTimeContext();

  const volunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;
  const churchId = activeChurch?.id ?? null;

  const assignmentsQuery = useQuery(
    volunteerAssignmentsQuery({
      volunteerId: volunteerId ?? '',
      churchId: churchId ?? '',
    }),
  );

  const timezone =
    activeCampus?.timezone ?? activeChurch?.defaultTimezone ?? 'UTC';
  const intervalOptions = {
    weekday: 'short' as const,
    month: 'short' as const,
    day: 'numeric' as const,
    hour: '2-digit' as const,
    minute: '2-digit' as const,
  };

  const loading = orgLoading || assignmentsQuery.isLoading;
  const assignments = assignmentsQuery.data ?? [];
  const ministries = activeChurch?.ministries ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('dashboard:upcomingAssignments')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('dashboard:preview.next30Days')}
        </p>
      </header>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          <AssignmentCardSkeleton />
          <AssignmentCardSkeleton />
        </div>
      ) : assignments.length === 0 ? (
        <div
          data-testid="volunteer-assignments-empty"
          className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-[var(--shadow-card)]"
        >
          {t('dashboard:emptyState')}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              eventId={assignment.event.id}
              eventTitle={assignment.event.title}
              ministryName={ministryNameForAssignment(
                assignment,
                ministries,
                t('dashboard:unknownMinistry'),
              )}
              roleName={assignment.role.name}
              timeLabels={buildDualInterval(
                assignment.startsAtUtc,
                assignment.endsAtUtc,
                timezone,
                i18n.language,
                intervalOptions,
                intervalOptions,
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
