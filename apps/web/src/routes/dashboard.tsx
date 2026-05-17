import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { useOrganization } from '@/organization/OrganizationContextProvider';
import { useLocalTimeContext } from '@/settings/LocalTimeProvider';
import { fetchVolunteerAssignments, type VolunteerAssignment } from '@/identity/fetchVolunteerAssignments';

export function DashboardPage() {
  const { t, i18n } = useTranslation('dashboard');
  const auth = useAuthSession();
  const { activeChurch, activeCampus, churches } = useOrganization();
  const { formatWithLocal } = useLocalTimeContext();
  
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pendingMinistries = useMemo(() => {
    const church = churches.find(c => c.id === activeChurch?.id);
    return church?.ministries?.filter(m => (m as any).membershipStatus === 'PENDING') ?? [];
  }, [activeChurch, churches]);

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
        const data = await fetchVolunteerAssignments({
          volunteerId: volunteerId!,
          churchId: activeChurch!.id,
        });
        if (!cancelled) {
          setAssignments(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load assignments');
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

  const formatDateTime = (iso: string) => {
    return formatWithLocal(iso, timezone, i18n.language, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section className="flex flex-col gap-8">
      {pendingMinistries.length > 0 && (
        <div className="border-2 border-primary bg-primary/10 p-4 text-sm font-medium">
          <p>
            You have pending memberships in: {pendingMinistries.map(m => m.name).join(', ')}. 
            You will be able to serve once they are activated.
          </p>
        </div>
      )}
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
          {t('upcomingAssignments')}
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
        ) : assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-2 border-border bg-surface p-12 text-center text-muted-foreground">
            <p className="text-4xl mb-4" aria-hidden>📅</p>
            <p className="max-w-xs text-sm">{t('emptyState')}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {assignments.map((a) => (
              <article
                key={a.id}
                className="group relative border-2 border-border bg-surface p-4 transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0_0_hsl(var(--border))]"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {a.role.name}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary-foreground bg-primary px-1.5 py-0.5">
                      {activeCampus?.name ?? activeChurch?.name}
                    </p>
                  </div>
                  <h3 className="font-display text-xl font-black uppercase leading-tight">
                    {a.event.title}
                  </h3>
                  <p className="text-sm font-medium text-foreground">
                    {formatDateTime(a.startsAtUtc)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="grid border-2 border-border bg-surface divide-y-2 divide-border md:grid-cols-3 md:divide-x-2 md:divide-y-0">
        {['ministries', 'schedule', 'timeAway'].map((key) => (
          <article key={key} className="bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t(`stats.${key}.label`)}
            </p>
            <p className="mt-3 font-display text-4xl font-bold uppercase leading-none">
              {t(`stats.${key}.value`)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
