import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import type { EventDetailPayload } from '@/eventDetailPayload';

export function SchedulingEventDetailPending() {
  const { t } = useTranslation('scheduling');
  return (
    <section className="flex flex-col gap-4">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-32 w-full" />
      <p className="sr-only">{t('detail.loading')}</p>
    </section>
  );
}

export function SchedulingEventDetailView({ data }: { data: EventDetailPayload }) {
  const { t } = useTranslation('scheduling');
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{data.event.title}</h1>
      <p className="text-sm text-muted-foreground">
        {data.event.framing.startsDisplayInChurchTz} –{' '}
        {data.event.framing.endsDisplayInChurchTz}
      </p>
      <h2 className="text-lg font-semibold">{t('detail.rosterHeading')}</h2>
      {data.assignments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('detail.emptyRoster')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {data.assignments.map((assignment) => (
            <li
              key={assignment.id}
              className="rounded-md border border-border px-3 py-2 text-sm"
            >
              {assignment.role.name} — {assignment.volunteer.displayName}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
