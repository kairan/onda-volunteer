import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Clock, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { fetchIdentityMe } from '@/identity/fetchIdentityMe';
import { useOrganization } from '@/organization/OrganizationProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { volunteerAssignmentsQuery } from '@/volunteer/volunteerAssignmentsQuery';
import { volunteerUnavailabilityQuery } from '@/volunteer/volunteerUnavailabilityQuery';

function useVolunteerId(): string | null {
  const auth = useAuthSession();
  if (auth.status === 'authenticated' || auth.status === 'dev-bypass') {
    return auth.volunteerId;
  }
  return null;
}

const intervalFormatOptions: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

function formatTimeAwayInterval(
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
  return `${start} → ${end}`;
}

export function DashboardPage() {
  const { t, i18n } = useTranslation('dashboard');
  const auth = useAuthSession();
  const volunteerId = useVolunteerId();
  const { activeChurch, activeCampus, loading: orgLoading } = useOrganization();

  const identityQuery = useQuery({
    queryKey: ['identity', 'me', volunteerId],
    queryFn: () => fetchIdentityMe({ volunteerId: volunteerId ?? undefined }),
    enabled: auth.status === 'dev-bypass' && Boolean(volunteerId),
  });

  const churchId = activeChurch?.id ?? null;
  const assignmentsQuery = useQuery(
    volunteerAssignmentsQuery({
      volunteerId: volunteerId ?? '',
      churchId: churchId ?? '',
    }),
  );
  const unavailabilityQuery = useQuery(
    volunteerUnavailabilityQuery({
      volunteerId: volunteerId ?? '',
      churchId: churchId ?? '',
    }),
  );

  const displayName =
    auth.status === 'authenticated'
      ? auth.displayName
      : identityQuery.data?.volunteer.displayName ?? volunteerId ?? '';

  const timezone =
    activeCampus?.timezone ?? activeChurch?.defaultTimezone ?? 'UTC';

  const assignmentCount = assignmentsQuery.data?.length ?? 0;
  const previewRows = useMemo(
    () => (unavailabilityQuery.data ?? []).slice(0, 3),
    [unavailabilityQuery.data],
  );

  const loading =
    orgLoading ||
    !churchId ||
    assignmentsQuery.isPending ||
    unavailabilityQuery.isPending ||
    identityQuery.isLoading;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        {loading ? (
          <>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-56" />
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">
              {t('preview.greeting', { name: displayName })}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('preview.assignmentCount', { count: assignmentCount })}
            </p>
          </>
        )}
      </header>

      <section aria-label={t('preview.timeAwayHeading')}>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">
              {t('preview.timeAwayHeading')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('preview.timeAwayBody')}
            </p>
          </div>
          <Button size="sm" type="button" asChild>
            <Link to="/time-away">
              <Plus className="h-4 w-4" aria-hidden />
              {t('preview.addPeriod')}
            </Link>
          </Button>
        </div>

        {loading ? (
          <Card className="overflow-hidden rounded-lg border border-border p-4 shadow-card">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="mt-3 h-12 w-full" />
          </Card>
        ) : previewRows.length === 0 ? (
          <Card className="rounded-lg border border-border p-6 text-center text-sm text-muted-foreground shadow-card">
            {t('preview.timeAwayEmpty')}
          </Card>
        ) : (
          <Card className="overflow-hidden rounded-lg border border-border p-0 shadow-card">
            <ul className="divide-y divide-border">
              {previewRows.map((period) => (
                <li
                  key={period.id}
                  className="flex items-center gap-4 px-4 py-3"
                >
                  <Clock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {formatTimeAwayInterval(
                        period.startsAtUtc,
                        period.endsAtUtc,
                        timezone,
                        i18n.language,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {period.ministry.name}
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" type="button" asChild>
                    <Link
                      to="/time-away"
                      aria-label={t('preview.editPeriod')}
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="icon" variant="ghost" type="button" asChild>
                    <Link
                      to="/time-away"
                      aria-label={t('preview.deletePeriod')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div className="mt-3">
          <Button variant="link" className="h-auto p-0" asChild>
            <Link to="/time-away">{t('preview.viewAll')}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
