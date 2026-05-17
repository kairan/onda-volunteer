import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { useOrganization } from '@/organization/OrganizationContextProvider';
import { useLocalTimeContext } from '@/settings/LocalTimeProvider';
import { fetchEvents, type EventSummary } from '@/organization/fetchEvents';
import { createEvent } from '@/organization/createEvent';
import { Button } from '@/components/ui/button';
import { useToasts } from '@/feedback/ToastHost';

export function SchedulingPage() {
  const { t, i18n } = useTranslation('scheduling');
  const auth = useAuthSession();
  const { activeChurch, activeCampus } = useOrganization();
  const { formatWithLocal } = useLocalTimeContext();
  const toasts = useToasts();
  
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [kind, setKind] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE');
  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [selectedMinistryId, setSelectedMinistryId] = useState('');
  const [busy, setBusy] = useState(false);

  const volunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : undefined;

  const accessibleMinistries = useMemo(() => activeChurch?.ministries ?? [], [activeChurch]);

  useEffect(() => {
    if (accessibleMinistries.length > 0 && !selectedMinistryId) {
      setSelectedMinistryId(accessibleMinistries[0].id);
    }
  }, [accessibleMinistries, selectedMinistryId]);

  const loadEvents = async () => {
    if (!activeChurch) return;
    setLoading(true);
    try {
      const data = await fetchEvents({
        churchId: activeChurch.id,
        volunteerId,
      });
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, [activeChurch, volunteerId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChurch || !title || !startsAt || !endsAt) return;

    setBusy(true);
    try {
      await createEvent({
        kind,
        title,
        startsAtUtc: new Date(startsAt).toISOString(),
        endsAtUtc: new Date(endsAt).toISOString(),
        churchId: activeChurch.id,
        ministryId: kind === 'PRIVATE' ? selectedMinistryId : undefined,
        volunteerId,
      });
      toasts.push({
        id: crypto.randomUUID(),
        kind: 'success',
        message: t('successToast'),
      });
      setShowForm(false);
      setTitle('');
      void loadEvents();
    } catch (err) {
      toasts.push({
        id: crypto.randomUUID(),
        kind: 'error',
        message: err instanceof Error ? err.message : 'Failed to create event',
      });
    } finally {
      setBusy(false);
    }
  };

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
      <header className="border-2 border-border bg-surface p-6 shadow-[8px_8px_0_0_hsl(var(--border))]">
        <div className="flex flex-col gap-2">
           <div className="flex items-center justify-between">
              <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight">
                {t('title')}
              </h1>
              {accessibleMinistries.length > 0 && (
                <Button size="sm" onClick={() => setShowForm(!showForm)}>
                  {showForm ? 'Cancel' : t('createTitle')}
                </Button>
              )}
           </div>
           <p className="mt-2 text-sm text-muted-foreground">{t('body')}</p>
        </div>
      </header>

      {showForm && (
        <div className="border-2 border-border bg-surface p-6">
          <h2 className="font-display text-xl font-bold uppercase tracking-tight mb-6">{t('createTitle')}</h2>
          <form onSubmit={handleCreate} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
               {t('kindLabel')}
               <select
                 className="mt-1 border-2 border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                 value={kind}
                 onChange={e => setKind(e.target.value as any)}
                 required
               >
                 <option value="PRIVATE">PRIVATE</option>
                 <option value="PUBLIC">PUBLIC</option>
               </select>
             </label>

             <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
               {t('titleLabel')}
               <input
                 type="text"
                 className="mt-1 border-2 border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                 value={title}
                 onChange={e => setTitle(e.target.value)}
                 required
               />
             </label>

             {kind === 'PRIVATE' && (
               <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                 {t('ministryLabel')}
                 <select
                   className="mt-1 border-2 border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                   value={selectedMinistryId}
                   onChange={e => setSelectedMinistryId(e.target.value)}
                   required
                 >
                   {accessibleMinistries.map(m => (
                     <option key={m.id} value={m.id}>{m.name}</option>
                   ))}
                 </select>
               </label>
             )}

             <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
               {t('startsAtLabel')}
               <input
                 type="datetime-local"
                 className="mt-1 border-2 border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                 value={startsAt}
                 onChange={e => setStartsAt(e.target.value)}
                 required
               />
             </label>

             <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
               {t('endsAtLabel')}
               <input
                 type="datetime-local"
                 className="mt-1 border-2 border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                 value={endsAt}
                 onChange={e => setEndsAt(e.target.value)}
                 required
               />
             </label>

             <div className="flex items-end">
               <Button type="submit" disabled={busy} className="w-full">
                 {busy ? 'Saving...' : t('submit')}
               </Button>
             </div>
          </form>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 w-full animate-pulse border-2 border-border bg-surface-2" />
            ))}
          </div>
        ) : error ? (
          <div className="border-2 border-destructive bg-surface p-4 text-sm text-destructive">
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="border-2 border-border border-dashed p-12 text-center text-muted-foreground">
            <p className="text-sm">{t('emptyState')}</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {events.map((e) => {
              const isCancelled = !!e.voidedAtUtc;
              return (
                <Link
                  key={e.id}
                  to="/scheduling/events/$eventId"
                  params={{ eventId: e.id }}
                  className={`group border-2 border-border bg-surface p-4 flex justify-between items-center transition-all ${isCancelled ? 'opacity-60' : 'hover:bg-primary hover:shadow-[4px_4px_0_0_hsl(var(--border))]'}`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-[10px] font-bold uppercase tracking-widest text-muted-foreground ${!isCancelled && 'group-hover:text-primary-foreground/80'}`}>
                        {e.kind === 'PRIVATE' ? `${e.kind} · ${e.ministry?.name}` : e.kind}
                      </p>
                      {isCancelled && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-destructive bg-destructive/10 px-1 border border-destructive">
                          CANCELLED
                        </p>
                      )}
                    </div>
                    <h3 className={`font-display text-lg font-black uppercase leading-tight ${isCancelled ? 'line-through text-muted-foreground' : 'group-hover:text-primary-foreground'}`}>
                      {e.title}
                    </h3>
                    <p className={`text-sm font-medium ${isCancelled ? 'text-muted-foreground' : 'group-hover:text-primary-foreground'}`}>
                      {formatDateTime(e.startsAtUtc)}
                    </p>
                  </div>
                  <div className={`text-2xl transition-transform ${!isCancelled && 'group-hover:translate-x-1'}`}>
                    →
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
