import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { EventDetailPayload } from '@/eventDetailPayload';
import { useLocalTimeContext } from '@/settings/LocalTimeProvider';
import { SchedulingTimeDisplay } from '@/settings/SchedulingTimeDisplay';

export function SystemAdminSchedulingEventDetailPage({
  data,
}: {
  data: EventDetailPayload;
}) {
  const { t, i18n } = useTranslation('systemAdmin');
  const { buildDualInterval } = useLocalTimeContext();

  const timezone = data.church.defaultTimezone;
  const intervalStartOptions = {
    weekday: 'short' as const,
    month: 'short' as const,
    day: 'numeric' as const,
    hour: '2-digit' as const,
    minute: '2-digit' as const,
  };
  const intervalEndOptions = { hour: '2-digit' as const, minute: '2-digit' as const };

  const isCancelled = Boolean(data.event.cancelledAtUtc);

  return (
    <section className="flex flex-col gap-8">
      <div className="border border-border bg-background p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {data.church.name} ·{' '}
          {t('scheduling.detail.churchDefaultTimezoneLabel', {
            tz: data.church.defaultTimezone,
          })}
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-tight tracking-tight">
          {data.event.title}
        </h1>
        {isCancelled ? (
          <p className="mt-3 text-sm font-semibold text-destructive">
            {t('scheduling.detail.cancelled')}
          </p>
        ) : null}
        <p className="mt-3 text-sm font-medium text-foreground">
          <SchedulingTimeDisplay
            labels={buildDualInterval(
              data.event.window.startsAtUtc,
              data.event.window.endsAtUtc,
              timezone,
              i18n.language,
              intervalStartOptions,
              intervalEndOptions,
            )}
          />
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {t('scheduling.readOnlyNotice')}
        </p>
      </div>

      <div className="border border-border bg-surface p-6">
        <h2 className="font-display text-xl font-bold uppercase tracking-tight">
          {t('scheduling.detail.assignmentsHeading')}
        </h2>
        {data.assignments.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {t('scheduling.detail.noAssignments')}
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {data.assignments.map((assignment) => (
              <li
                key={assignment.id}
                className="border border-border bg-background px-4 py-3 text-sm"
              >
                <p className="font-semibold">{assignment.volunteer.displayName}</p>
                <p className="text-muted-foreground">
                  {assignment.ministry.name} · {assignment.role.name}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p>
        <Link
          to="/system-admin/scheduling"
          className="text-sm font-semibold uppercase tracking-[0.12em] text-primary underline-offset-4 hover:underline"
        >
          {t('scheduling.detail.backToList')}
        </Link>
      </p>
    </section>
  );
}
