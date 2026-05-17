import { useTranslation } from 'react-i18next';
import { useParams, Link } from '@tanstack/react-router';
import { useEffect, useState, useMemo } from 'react';
import type { EventDetailPayload } from '@/eventDetailPayload';
import { useOrganization } from '@/organization/OrganizationContextProvider';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { Button } from '@/components/ui/button';
import { releaseAssignment, createAssignment } from '@/organization/schedulingActions';
import { cancelEvent } from '@/organization/cancelEvent';
import { useLocalTimeContext } from '@/settings/LocalTimeProvider';
import { fetchMinistryMembers, fetchMinistryRoles, type MinistryMember, type MinistryRole } from '@/organization/fetchMinistryDetails';
import { useToasts } from '@/feedback/ToastHost';
import { DestructiveConfirmDialog } from '@/components/DestructiveConfirmDialog';

export function EventDetailPage() {
  const { eventId } = useParams({ from: '/scheduling/events/$eventId' });
  const { t, i18n } = useTranslation(['scheduling', 'common']);
  const { activeChurch, activeCampus } = useOrganization();
  const { formatWithLocal } = useLocalTimeContext();
  const auth = useAuthSession();
  const toasts = useToasts();
  
  const [data, setData] = useState<EventDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Form state
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedMinistryId, setSelectedMinistryId] = useState('');
  const [members, setMembers] = useState<MinistryMember[]>([]);
  const [roles, setRoles] = useState<MinistryRole[]>([]);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  const volunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
      const res = await fetch(`${base}/events/${eventId}`);
      if (!res.ok) throw new Error('Failed to load event');
      const payload = await res.json();
      setData(payload);
      
      // Default times for assign form
      setStartsAt(payload.event.window.startsAtUtc.slice(0, 16));
      setEndsAt(payload.event.window.endsAtUtc.slice(0, 16));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [eventId]);

  const accessibleMinistries = useMemo(() => activeChurch?.ministries ?? [], [activeChurch]);

  useEffect(() => {
    if (showAssignForm && accessibleMinistries.length > 0 && !selectedMinistryId) {
      setSelectedMinistryId(accessibleMinistries[0].id);
    }
  }, [showAssignForm, accessibleMinistries, selectedMinistryId]);

  useEffect(() => {
    if (!selectedMinistryId) return;

    async function loadMinistryDetails() {
      try {
        const [m, r] = await Promise.all([
          fetchMinistryMembers({ ministryId: selectedMinistryId, volunteerId: volunteerId! }),
          fetchMinistryRoles({ ministryId: selectedMinistryId, volunteerId: volunteerId! }),
        ]);
        setMembers(m);
        setRoles(r);
        const firstActive = m.find(item => item.status === 'ACTIVE');
        if (firstActive) setSelectedVolunteerId(firstActive.volunteer.id);
        if (r.length > 0) setSelectedRoleId(r[0].id);
      } catch (err) {
        console.error(err);
      }
    }
    void loadMinistryDetails();
  }, [selectedMinistryId, volunteerId]);

  const handleRelease = async (assignmentId: string) => {
    if (!volunteerId) return;
    setBusy(true);
    try {
      await releaseAssignment({ assignmentId, volunteerId });
      toasts.push({
        id: crypto.randomUUID(),
        kind: 'success',
        message: 'Assignment released. Would you like to mark yourself as unavailable for this time?',
      });
      void load();
    } catch (err) {
      toasts.push({
        id: crypto.randomUUID(),
        kind: 'error',
        message: err instanceof Error ? err.message : 'Failed to release',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerId || !selectedMinistryId || !selectedVolunteerId || !selectedRoleId) return;

    setBusy(true);
    try {
      await createAssignment({
        eventId,
        volunteerId: selectedVolunteerId,
        ministryId: selectedMinistryId,
        roleId: selectedRoleId,
        startsAtUtc: new Date(startsAt).toISOString(),
        endsAtUtc: new Date(endsAt).toISOString(),
        leaderMinistryId: selectedMinistryId,
      });
      toasts.push({
        id: crypto.randomUUID(),
        kind: 'success',
        message: 'Volunteer assigned successfully',
      });
      setShowAssignForm(false);
      void load();
    } catch (err) {
      toasts.push({
        id: crypto.randomUUID(),
        kind: 'error',
        message: err instanceof Error ? err.message : 'Failed to assign',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleMarkUnavailable = async (volunteerIdToMark: string, ministryId: string, startsAtUtc: string, endsAtUtc: string) => {
    if (!volunteerId) return;
    setBusy(true);
    try {
      await createVolunteerUnavailability({
        volunteerId: volunteerIdToMark,
        ministryId,
        startsAtUtc,
        endsAtUtc,
      });
      toasts.push({
        id: crypto.randomUUID(),
        kind: 'success',
        message: 'Unavailability recorded for volunteer',
      });
      void load();
    } catch (err) {
      toasts.push({
        id: crypto.randomUUID(),
        kind: 'error',
        message: err instanceof Error ? err.message : 'Failed to record unavailability',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleCancelEvent = async () => {
    if (!volunteerId) return;
    setBusy(true);
    try {
      await cancelEvent({ eventId, volunteerId });
      toasts.push({
        id: crypto.randomUUID(),
        kind: 'success',
        message: 'Event cancelled successfully',
      });
      void load();
    } catch (err) {
      toasts.push({
        id: crypto.randomUUID(),
        kind: 'error',
        message: err instanceof Error ? err.message : 'Failed to cancel event',
      });
    } finally {
      setBusy(false);
    }
  };

  const timezone = activeCampus?.timezone ?? activeChurch?.defaultTimezone ?? data?.event.framing.churchDefaultTimezone ?? 'UTC';

  const formatDateTime = (iso: string) => {
    return formatWithLocal(iso, timezone, i18n.language, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeOnly = (iso: string) => {
    return formatWithLocal(iso, timezone, i18n.language, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-32 w-full bg-surface-2 border-2 border-border" />
        <div className="h-64 w-full bg-surface-2 border-2 border-border" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="border-2 border-destructive bg-surface p-8 text-center flex flex-col items-center gap-4">
        <p className="text-destructive font-bold">{error ?? 'Event not found'}</p>
        <Button onClick={() => void load()}>{t('common:retry')}</Button>
      </div>
    );
  }

  const isCancelled = !!data.event.voidedAtUtc;

  return (
    <section className="flex flex-col gap-8">
      <header className="border-2 border-border bg-surface p-6 shadow-[8px_8px_0_0_hsl(var(--border))]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to="/scheduling" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
                ← {t('title')}
              </Link>
              <span className="text-muted-foreground">/</span>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                {data.event.kind}
              </p>
              {isCancelled && (
                <>
                  <span className="text-muted-foreground">/</span>
                  <p className="text-xs font-bold uppercase tracking-widest text-destructive bg-destructive/10 px-1 border border-destructive">
                    CANCELLED
                  </p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isCancelled && (
                <DestructiveConfirmDialog
                  trigger={
                    <Button variant="outline" size="sm" disabled={busy}>
                      Cancel Event
                    </Button>
                  }
                  title="Cancel Event?"
                  description="Are you sure you want to cancel this event? This will void all current assignments."
                  onConfirm={handleCancelEvent}
                  confirmLabel="Yes, cancel event"
                />
              )}
              {!isCancelled && accessibleMinistries.length > 0 && (
                <Button size="sm" onClick={() => setShowAssignForm(!showAssignForm)} disabled={busy}>
                  {showAssignForm ? 'Close form' : 'Add to roster'}
                </Button>
              )}
            </div>
          </div>
          <h1 className={`font-display text-5xl font-black uppercase leading-none tracking-tight mt-2 ${isCancelled ? 'line-through text-muted-foreground' : ''}`}>
            {data.event.title}
          </h1>
          <p className="text-lg font-medium mt-2">
            {formatDateTime(data.event.window.startsAtUtc)}
          </p>
        </div>
      </header>

      {showAssignForm && (
        <div className="border-2 border-border bg-surface p-6">
          <h2 className="font-display text-xl font-bold uppercase tracking-tight mb-6">Assign Volunteer</h2>
          <form onSubmit={handleAssign} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
               Ministry
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

             <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
               Volunteer
               <select
                 className="mt-1 border-2 border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                 value={selectedVolunteerId}
                 onChange={e => setSelectedVolunteerId(e.target.value)}
                 required
               >
                 {members.filter(m => m.status === 'ACTIVE').map(m => (
                   <option key={m.volunteer.id} value={m.volunteer.id}>{m.volunteer.displayName}</option>
                 ))}
               </select>
             </label>

             <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
               Role
               <select
                 className="mt-1 border-2 border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                 value={selectedRoleId}
                 onChange={e => setSelectedRoleId(e.target.value)}
                 required
               >
                 {roles.map(r => (
                   <option key={r.id} value={r.id}>{r.name}</option>
                 ))}
               </select>
             </label>

             <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
               Starts at
               <input
                 type="datetime-local"
                 className="mt-1 border-2 border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                 value={startsAt}
                 onChange={e => setStartsAt(e.target.value)}
                 required
               />
             </label>

             <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
               Ends at
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
                 {busy ? 'Saving...' : 'Create Assignment'}
               </Button>
             </div>
          </form>
        </div>
      )}

      <div className="border-2 border-border bg-surface overflow-hidden">
        <div className="border-b-2 border-border bg-surface-2 px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-[0.15em]">Roster</h2>
        </div>
        
        {data.assignments.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm italic">
            No assignments yet.
          </div>
        ) : (
          <div className="divide-y-2 divide-border">
            {data.assignments.map((a) => {
              const isMine = a.volunteer.id === volunteerId;
              const canIRelease = isMine || accessibleMinistries.some(m => m.id === a.ministry.id);
              
              return (
                <article
                  key={a.id}
                  className="grid grid-cols-1 md:grid-cols-4 gap-2 px-4 py-4 transition-colors hover:bg-muted/50 group relative"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 transition-transform group-hover:scale-y-100" />
                  
                  <div className="flex flex-col">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                       {a.ministry.name}
                     </p>
                     <p className="font-bold text-sm uppercase">{a.role.name}</p>
                  </div>
                  
                  <div className="flex flex-col md:items-center justify-center">
                    <p className="font-display font-black uppercase text-xl">{a.volunteer.displayName}</p>
                  </div>

                  <div className="flex flex-col md:items-center justify-center text-xs text-muted-foreground font-medium">
                     <p>{formatTimeOnly(a.window.startsAtUtc)} — {formatTimeOnly(a.window.endsAtUtc)}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    {canIRelease && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isMine && (
                          <DestructiveConfirmDialog
                            trigger={
                              <Button variant="outline" size="sm">
                                Mark Unavailable
                              </Button>
                            }
                            title="Mark Volunteer Unavailable?"
                            description={`Record unavailability for ${a.volunteer.displayName} during this event time?`}
                            onConfirm={() => void handleMarkUnavailable(a.volunteer.id, a.ministry.id, a.window.startsAtUtc, a.window.endsAtUtc)}
                            confirmLabel="Yes, record"
                          />
                        )}
                        <DestructiveConfirmDialog
                          trigger={
                            <Button variant="outline" size="sm">
                              Release
                            </Button>
                          }
                          title="Release Assignment?"
                          description={`Are you sure you want to release ${isMine ? 'your' : a.volunteer.displayName + "'s"} assignment for ${data.event.title}?`}
                          onConfirm={() => void handleRelease(a.id)}
                          confirmLabel="Yes, release"
                        />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
