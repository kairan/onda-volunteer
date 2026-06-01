import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/apiError';
import type { EventListItem } from '@/events/fetchEvents';
import { RouteErrorPanel } from '@/shell/RouteErrorPanel';
import { fetchSystemAdminEvents } from './fetchSystemAdminEvents';

export function SystemAdminSchedulingPage() {
  const { t } = useTranslation('systemAdmin');
  const [events, setEvents] = useState<EventListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await fetchSystemAdminEvents();
        if (!cancelled) {
          setEvents(rows);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiRequestError
              ? err.message
              : t('scheduling.loadError'),
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  if (error) {
    return <RouteErrorPanel message={error} onRetry={() => window.location.reload()} />;
  }

  if (!events) {
    return (
      <p className="text-sm text-muted-foreground">{t('scheduling.loading')}</p>
    );
  }

  return (
    <section className="border border-border bg-background p-6">
      <h1 className="font-display text-3xl font-bold uppercase leading-none tracking-tight">
        {t('scheduling.title')}
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        {t('scheduling.intro')}
      </p>
      {events.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{t('scheduling.empty')}</p>
      ) : (
        <ul className="mt-6 divide-y divide-border border border-border">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                to="/scheduling/events/$eventId"
                params={{ eventId: event.id }}
                className="flex flex-col gap-2 px-4 py-3 hover:bg-muted/40"
              >
                <span className="font-medium">{event.title}</span>
                <span className="text-xs text-muted-foreground">
                  {event.framing.startsDisplayInChurchTz} —{' '}
                  {event.framing.endsDisplayInChurchTz}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
