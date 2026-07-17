import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import {
  AssignmentCard,
  AssignmentCardSkeleton,
} from '@/components/AssignmentCard';
import { BrandGrafismo } from '@/components/brand/BrandGrafismo';
import { useOrganization } from '@/organization/OrganizationProvider';
import { volunteerAssignmentsQuery } from '@/volunteer/volunteerAssignmentsQuery';
import type { VolunteerAssignment } from '@/volunteer/types';
import type { MinistrySummary } from '@/organization/types';

const intervalFormatOptions: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

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

function formatAssignmentInterval(
  startsAtUtc: string,
  endsAtUtc: string,
  timezone: string,
  locale: string,
): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    ...intervalFormatOptions,
  });
  const start = formatter.format(new Date(startsAtUtc));
  const end = formatter.format(new Date(endsAtUtc));
  return `${start} · ${end}`;
}

export function VolunteerMyAssignmentsPage() {
  const { t, i18n } = useTranslation(['dashboard', 'scheduling']);
  const auth = useAuthSession();
  const { activeChurch, activeCampus, loading: orgLoading } = useOrganization();

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

  const loading = orgLoading || assignmentsQuery.isPending;
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
        <div
          className="grid gap-3 md:grid-cols-2"
          data-testid="volunteer-assignments-loading"
        >
          <AssignmentCardSkeleton />
          <AssignmentCardSkeleton />
        </div>
      ) : assignments.length === 0 ? (
        <div
          data-testid="volunteer-assignments-empty"
          className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-card"
        >
          <BrandGrafismo
            variant="filled"
            className="mx-auto mb-4 h-16 w-16 object-contain"
          />
          {t('dashboard:emptyState')}
        </div>
      ) : (
        <div
          className="grid gap-3 md:grid-cols-2"
          data-testid="volunteer-assignments-grid"
        >
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
              timeLabel={formatAssignmentInterval(
                assignment.startsAtUtc,
                assignment.endsAtUtc,
                timezone,
                i18n.language,
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
