// TODO(MIG-FND-04): throwaway preview — remove when T16/T20/T21 land
import { Clock, Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { volunteerDashboardPreview } from '@/__preview__/fixtures';

export function DashboardPage() {
  const { t, i18n } = useTranslation('dashboard');
  const { displayName, assignments, timeAway } = volunteerDashboardPreview;

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('preview.greeting', { name: displayName })}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('preview.assignmentCount', { count: assignments.length })}
        </p>
      </header>

      <section aria-label={t('preview.timeAwayHeading')}>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-base font-semibold">{t('preview.timeAwayHeading')}</h2>
            <p className="text-sm text-muted-foreground">{t('preview.timeAwayBody')}</p>
          </div>
          <Button size="sm" type="button">
            <Plus className="h-4 w-4" aria-hidden />
            {t('preview.addPeriod')}
          </Button>
        </div>
        <Card className="overflow-hidden rounded-lg border border-border p-0 shadow-[var(--shadow-card)]">
          <ul className="divide-y divide-border">
            {timeAway.map((period) => (
              <li key={period.id} className="flex items-center gap-4 px-4 py-3">
                <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {new Intl.DateTimeFormat(i18n.language, dateOptions).format(
                      new Date(period.startsAtUtc),
                    )}{' '}
                    –{' '}
                    {new Intl.DateTimeFormat(i18n.language, dateOptions).format(
                      new Date(period.endsAtUtc),
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{period.note}</p>
                </div>
                <Button size="icon" variant="ghost" type="button" aria-label={t('preview.editPeriod')}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" type="button" aria-label={t('preview.deletePeriod')}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section
        aria-label={t('preview.samplesHeading')}
        className="space-y-4 rounded-md border border-dashed border-border p-4"
      >
        <h2 className="text-sm font-medium text-muted-foreground">
          {t('preview.samplesHeading')}
        </h2>
        <div
          data-testid="dashboard-empty-preview"
          className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-[var(--shadow-card)]"
        >
          {t('emptyState')}
        </div>
        <div data-testid="dashboard-skeleton-preview" className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>
      </section>
    </div>
  );
}
