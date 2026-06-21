import { Link } from '@tanstack/react-router';
import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SchedulingTimeDisplay } from '@/settings/SchedulingTimeDisplay';
import type { DualTimeLabels } from '@/settings/formatSchedulingTime';

export type AssignmentCardProps = {
  eventId: string;
  eventTitle: string;
  ministryName: string;
  roleName: string;
  timeLabels: DualTimeLabels;
  status?: 'ROSTERED';
};

export function AssignmentCard({
  eventId,
  eventTitle,
  ministryName,
  roleName,
  timeLabels,
  status = 'ROSTERED',
}: AssignmentCardProps) {
  const { t } = useTranslation('dashboard');

  return (
    <Link
      to="/scheduling/events/$eventId"
      params={{ eventId }}
      className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="rounded-lg border border-border p-4 shadow-[var(--shadow-card)] transition-colors hover:bg-muted/20">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="font-medium">{eventTitle}</h4>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {ministryName} · {roleName}
            </p>
          </div>
          {status === 'ROSTERED' ? (
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/10 text-primary"
            >
              {t('preview.confirmed')}
            </Badge>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            <SchedulingTimeDisplay labels={timeLabels} />
          </span>
        </div>
      </Card>
    </Link>
  );
}

export function AssignmentCardSkeleton() {
  return (
    <Card
      className="rounded-lg border border-border p-4 shadow-[var(--shadow-card)]"
      aria-hidden
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-3 w-2/3" />
    </Card>
  );
}
