// TODO(MIG-FND-04): throwaway preview — remove when T16/T20/T21 land
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { volunteerDashboardPreview } from '@/__preview__/fixtures';

function PreviewAssignmentCard({
  eventTitle,
  ministryName,
  roleName,
  whenLabel,
}: {
  eventTitle: string;
  ministryName: string;
  roleName: string;
  whenLabel: string;
}) {
  const { t } = useTranslation('dashboard');
  return (
    <Card>
      <CardHeader className="gap-1">
        <CardTitle className="text-base">{eventTitle}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {ministryName} · {roleName}
        </p>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{whenLabel}</p>
        <Badge variant="secondary">{t('preview.confirmed')}</Badge>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { t, i18n } = useTranslation('dashboard');
  const { displayName, assignments } = volunteerDashboardPreview;

  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">{t('eyebrow')}</p>
        <h1 className="text-3xl font-semibold leading-tight">
          {t('preview.greeting', { name: displayName })}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('preview.assignmentCount', { count: assignments.length })}
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">{t('upcomingAssignments')}</h2>
        <div className="flex flex-col gap-3">
          {assignments.map((assignment) => (
            <PreviewAssignmentCard
              key={assignment.id}
              eventTitle={assignment.eventTitle}
              ministryName={assignment.ministryName}
              roleName={assignment.roleName}
              whenLabel={new Intl.DateTimeFormat(i18n.language, dateTimeOptions).format(
                new Date(assignment.startsAtUtc),
              )}
            />
          ))}
        </div>
      </div>

      <section
        aria-label={t('preview.samplesHeading')}
        className="flex flex-col gap-4 rounded-md border border-dashed border-border p-4"
      >
        <h2 className="text-sm font-medium text-muted-foreground">
          {t('preview.samplesHeading')}
        </h2>
        <div
          data-testid="dashboard-empty-preview"
          className="rounded-md border border-border bg-surface p-8 text-center text-sm text-muted-foreground"
        >
          {t('emptyState')}
        </div>
        <div data-testid="dashboard-skeleton-preview" className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </section>
    </section>
  );
}
