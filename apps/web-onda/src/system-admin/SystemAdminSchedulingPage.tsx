// TODO: Onda design phase — port with neutral tokens for now
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { useLocalTimeContext } from '@/settings/LocalTimeProvider';
import { SchedulingTimeDisplay } from '@/settings/SchedulingTimeDisplay';
import { systemAdminEventsQuery } from './systemAdminQueries';

export function SystemAdminSchedulingPage() {
  const { t, i18n } = useTranslation('systemAdmin');
  const auth = useAuthSession();
  const { buildDualInterval } = useLocalTimeContext();
  const [churchFilter, setChurchFilter] = useState('');

  const volunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const eventsQuery = useQuery(
    systemAdminEventsQuery({
      volunteerId: volunteerId ?? '',
      churchId: churchFilter || undefined,
    }),
  );

  const events = eventsQuery.data ?? [];

  const churchOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const event of events) {
      if (event.church) {
        byId.set(event.church.id, event.church.name);
      }
    }
    return [...byId.entries()].map(([id, name]) => ({ id, name }));
  }, [events]);

  const intervalOptions = {
    weekday: 'short' as const,
    month: 'short' as const,
    day: 'numeric' as const,
    hour: '2-digit' as const,
    minute: '2-digit' as const,
  };
  const endOptions = { hour: '2-digit' as const, minute: '2-digit' as const };

  return (
    <section className="flex flex-col gap-8">
      <div className="rounded-md border border-border bg-surface p-6">
        <p className="text-xs font-medium text-muted-foreground">{t('scheduling.eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight">{t('scheduling.title')}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t('scheduling.intro')}
        </p>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground">
          {t('scheduling.presentationNotice')}
        </p>
        <p className="mt-3 text-xs font-medium text-muted-foreground">
          {t('scheduling.readOnlyNotice')}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-semibold">{t('scheduling.listHeading')}</h2>
          {churchOptions.length > 0 ? (
            <label className="flex flex-col gap-1 text-xs font-medium">
              {t('scheduling.churchFilter')}
              <select
                className="h-9 rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={churchFilter}
                onChange={(e) => setChurchFilter(e.target.value)}
              >
                <option value="">{t('scheduling.allChurches')}</option>
                {churchOptions.map((church) => (
                  <option key={church.id} value={church.id}>
                    {church.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        {eventsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">{t('scheduling.loading')}</p>
        ) : eventsQuery.isError ? (
          <div className="rounded-md border border-destructive bg-surface p-4 text-sm text-destructive">
            {t('scheduling.errors.loadFailed')}
          </div>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('scheduling.empty')}</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <li key={event.id}>
                <Link
                  to="/system-admin/scheduling/events/$eventId"
                  params={{ eventId: event.id }}
                  className="group flex flex-col gap-2 rounded-md border border-border bg-surface p-4 shadow-card transition-transform hover:-translate-y-0.5"
                >
                  {event.church ? (
                    <p className="text-xs font-medium text-muted-foreground">
                      {event.church.name}
                    </p>
                  ) : null}
                  <h3 className="text-lg font-semibold leading-tight">{event.title}</h3>
                  <p className="text-sm font-medium text-foreground">
                    <SchedulingTimeDisplay
                      labels={buildDualInterval(
                        event.window.startsAtUtc,
                        event.window.endsAtUtc,
                        event.framing.churchDefaultTimezone,
                        i18n.language,
                        intervalOptions,
                        endOptions,
                      )}
                    />
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p>
        <Link
          to="/system-admin"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {t('scheduling.backToDashboard')}
        </Link>
      </p>
    </section>
  );
}
