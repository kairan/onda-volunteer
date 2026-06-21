// TODO(MIG-FND-04): throwaway preview — remove when T16/T20/T21 land
import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { volunteerDashboardPreview } from '@/__preview__/fixtures';

export function PreviewAssignmentCard({
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
    <Card className="rounded-lg border border-border p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-medium">{eventTitle}</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {ministryName} · {roleName}
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-primary/20 bg-primary/10 text-primary"
        >
          {t('preview.confirmed')}
        </Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" aria-hidden />
          {whenLabel}
        </span>
      </div>
    </Card>
  );
}

export function VolunteerMyAssignmentsPreview() {
  const { t, i18n } = useTranslation(['dashboard', 'scheduling']);
  const { assignments } = volunteerDashboardPreview;

  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

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

      <div className="grid gap-3 md:grid-cols-2">
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
  );
}
