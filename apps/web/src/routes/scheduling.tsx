import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { useOrganization } from '@/organization/OrganizationContextProvider';
import { useLocalTimeContext } from '@/settings/LocalTimeProvider';
import { SchedulingTimeDisplay } from '@/settings/SchedulingTimeDisplay';
import { fetchEvents, type EventListItem } from '@/events/fetchEvents';

export function SchedulingPage() {
  const { t, i18n } = useTranslation('scheduling');
  const auth = useAuthSession();
  const { activeChurch, activeCampus } = useOrganization();
  const { buildDualInterval } = useLocalTimeContext();
  
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const volunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  useEffect(() => {
    if (!volunteerId || !activeChurch) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchEvents({
          volunteerId: volunteerId!,
          churchId: activeChurch!.id,
        });
        if (!cancelled) {
          setEvents(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(t('errors.loadFailed'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [volunteerId, activeChurch]);

  const timezone = activeCampus?.timezone ?? activeChurch?.defaultTimezone ?? 'UTC';

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
      <div className="border-2 border-border bg-surface p-6 shadow-[8px_8px_0_0_hsl(var(--border))]">
        <div className="flex flex-col items-start gap-3">
          <p className="inline-block border-2 border-border bg-background px-2 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-foreground">
            {t('eyebrow')}
          </p>
          <h1 className="inline-block max-w-3xl border-2 border-border bg-primary px-3 py-2 font-display text-6xl font-extrabold uppercase leading-[0.95] tracking-tight">
            {t('title')}
          </h1>
        </div>
        <p className="mt-5 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {t('body')}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
          {t('listHeading')}
        </h2>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 w-full animate-pulse border-2 border-border bg-surface-2"
                aria-hidden
              />
            ))}
            <p className="sr-only">{t('loading')}</p>
          </div>
        ) : error ? (
          <div className="border-2 border-destructive bg-surface p-4 text-sm text-destructive">
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-2 border-border bg-surface p-12 text-center text-muted-foreground">
            <p className="max-w-xs text-sm">{t('emptyState')}</p>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <li key={event.id}>
                <Link
                  to="/scheduling/events/$eventId"
                  params={{ eventId: event.id }}
                  className="group relative flex flex-col gap-2 border-2 border-border bg-surface p-4 transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0_0_hsl(var(--border))]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {event.kind === 'PRIVATE'
                        ? t('visibility.private')
                        : t('visibility.public')}
                    </p>
                    {event.ministry ? (
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary-foreground bg-primary px-1.5 py-0.5">
                        {event.ministry.name}
                      </p>
                    ) : null}
                  </div>
                  <h3 className="font-display text-xl font-black uppercase leading-tight">
                    {event.title}
                  </h3>
                  <p className="text-sm font-medium text-foreground">
                    <SchedulingTimeDisplay
                      labels={buildDualInterval(
                        event.window.startsAtUtc,
                        event.window.endsAtUtc,
                        timezone,
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
    </section>
  );
}
