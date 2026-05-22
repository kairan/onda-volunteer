import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { EventDetailPayload } from '@/eventDetailPayload';
import { useLocalTimeContext } from '@/settings/LocalTimeProvider';
import { cn } from '@/lib/utils';

export function SchedulingEventDetailPending() {
  const { t } = useTranslation('scheduling');
  return (
    <section className="flex flex-col gap-8" aria-busy="true">
      <div className="h-32 w-full animate-pulse border-2 border-border bg-surface-2" aria-hidden />
      <div className="h-48 w-full animate-pulse border-2 border-border bg-surface-2" aria-hidden />
      <p className="sr-only">{t('detail.loading')}</p>
    </section>
  );
}

export function SchedulingEventDetailView({ data }: { data: EventDetailPayload }) {
  const { t, i18n } = useTranslation('scheduling');
  const { formatWithLocal } = useLocalTimeContext();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(
    null,
  );

  const timezone = data.church.defaultTimezone;

  const formatInterval = (startsAtUtc: string, endsAtUtc: string) => {
    const start = formatWithLocal(startsAtUtc, timezone, i18n.language, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const end = formatWithLocal(endsAtUtc, timezone, i18n.language, {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${start} → ${end}`;
  };

  const formatEventWindow = () =>
    formatInterval(data.event.window.startsAtUtc, data.event.window.endsAtUtc);

  return (
    <section className="flex flex-col gap-8">
      <div className="border-2 border-border bg-surface p-6 shadow-[8px_8px_0_0_hsl(var(--border))]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {data.church.name} · {t('detail.timezoneLabel', { tz: data.church.defaultTimezone })}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <p className="inline-block border-2 border-border bg-background px-2 py-1 text-xs font-semibold uppercase tracking-[0.24em]">
            {data.event.kind === 'PRIVATE'
              ? t('visibility.private')
              : t('visibility.public')}
          </p>
          {data.ministry ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary-foreground bg-primary px-1.5 py-0.5">
              {data.ministry.name}
            </p>
          ) : null}
        </div>
        <h1 className="mt-3 font-display text-4xl font-extrabold uppercase leading-tight tracking-tight md:text-5xl">
          {data.event.title}
        </h1>
        <p className="mt-3 text-sm font-medium text-foreground">{formatEventWindow()}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {t('detail.utcWindow', {
            start: data.event.window.startsAtUtc,
            end: data.event.window.endsAtUtc,
          })}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
            {t('detail.rosterHeading')}
          </h2>
          <Link
            to="/scheduling"
            className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            {t('detail.backToList')}
          </Link>
        </div>

        {data.assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-2 border-border bg-surface p-12 text-center text-muted-foreground">
            <p className="max-w-xs text-sm">{t('detail.emptyRoster')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto border-2 border-border bg-surface">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-2 border-border bg-surface-2">
                  <th className="px-4 py-3 font-semibold normal-case tracking-normal">
                    {t('detail.columns.ministry')}
                  </th>
                  <th className="px-4 py-3 font-semibold normal-case tracking-normal">
                    {t('detail.columns.volunteer')}
                  </th>
                  <th className="px-4 py-3 font-semibold normal-case tracking-normal">
                    {t('detail.columns.role')}
                  </th>
                  <th className="px-4 py-3 font-semibold normal-case tracking-normal">
                    {t('detail.columns.interval')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.assignments.map((assignment) => {
                  const selected = selectedAssignmentId === assignment.id;
                  return (
                    <tr
                      key={assignment.id}
                      tabIndex={0}
                      onClick={() => setSelectedAssignmentId(assignment.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedAssignmentId(assignment.id);
                        }
                      }}
                      className={cn(
                        'cursor-pointer border-b border-border/40 transition-colors hover:bg-foreground/5',
                        selected &&
                          'border-l-2 border-l-foreground bg-foreground/5 hover:bg-foreground/5',
                      )}
                      aria-selected={selected}
                    >
                      <td className="px-4 py-3 font-medium">{assignment.ministry.name}</td>
                      <td className="px-4 py-3">{assignment.volunteer.displayName}</td>
                      <td className="px-4 py-3">{assignment.role.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatInterval(
                          assignment.window.startsAtUtc,
                          assignment.window.endsAtUtc,
                        )}
                        <span className="mt-1 block font-mono text-[11px] text-muted-foreground/80">
                          {assignment.window.startsAtUtc} → {assignment.window.endsAtUtc}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
