import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { useOrganization } from '@/organization/OrganizationContextProvider';
import { useLocalTimeContext } from '@/settings/LocalTimeProvider';
import { fetchVolunteerUnavailability, type VolunteerUnavailability } from '@/identity/fetchVolunteerUnavailability';
import { createVolunteerUnavailability } from '@/identity/createVolunteerUnavailability';
import { createBulkVolunteerUnavailability } from '@/identity/createBulkVolunteerUnavailability';
import { useToasts } from '@/feedback/ToastHost';
import { Button } from '@/components/ui/button';

export function TimeAwayPage() {
  const { t, i18n } = useTranslation('timeAway');
  const auth = useAuthSession();
  const { activeChurch, activeCampus } = useOrganization();
  const { formatWithLocal } = useLocalTimeContext();
  const toasts = useToasts();
  
  const [unavailabilities, setUnavailabilities] = useState<VolunteerUnavailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [selectedMinistryId, setSelectedMinistryId] = useState<string>('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [mirror, setMirror] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const volunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const accessibleMinistries = activeChurch?.ministries ?? [];

  useEffect(() => {
    if (accessibleMinistries.length > 0 && !selectedMinistryId) {
      setSelectedMinistryId(accessibleMinistries[0].id);
    }
  }, [accessibleMinistries, selectedMinistryId]);

  const loadUnavailabilities = async () => {
    if (!volunteerId || !activeChurch) return;
    setLoading(true);
    try {
      const data = await fetchVolunteerUnavailability({
        volunteerId,
        churchId: activeChurch.id,
      });
      setUnavailabilities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUnavailabilities();
  }, [volunteerId, activeChurch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerId || !selectedMinistryId || !startsAt || !endsAt) return;

    setSaving(true);
    setFormError(null);
    try {
      if (mirror && accessibleMinistries.length > 1) {
        const res = await createBulkVolunteerUnavailability({
          volunteerId,
          ministryIds: accessibleMinistries.map(m => m.id),
          startsAtUtc: new Date(startsAt).toISOString(),
          endsAtUtc: new Date(endsAt).toISOString(),
        });
        toasts.push({
          id: crypto.randomUUID(),
          kind: 'success',
          message: t('successBulkToast', { count: res.count }),
        });
      } else {
        await createVolunteerUnavailability({
          volunteerId,
          ministryId: selectedMinistryId,
          startsAtUtc: new Date(startsAt).toISOString(),
          endsAtUtc: new Date(endsAt).toISOString(),
        });
        toasts.push({
          id: crypto.randomUUID(),
          kind: 'success',
          message: t('successToast'),
        });
      }
      setStartsAt('');
      setEndsAt('');
      setMirror(false);
      void loadUnavailabilities();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
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
      <div className="border-2 border-border bg-surface p-6 shadow-[8px_8px_0_0_hsl(var(--border))]">
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('body')}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Creation Form */}
        <div className="border-2 border-border bg-surface p-6">
          <h2 className="font-display text-xl font-bold uppercase tracking-tight mb-6">
            {t('createTitle')}
          </h2>
          
          {accessibleMinistries.length === 0 ? (
            <p className="text-sm text-destructive">{t('noMinistries')}</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t('ministryLabel')}
                <select
                  className="mt-1 border-2 border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
                  value={selectedMinistryId}
                  onChange={(e) => setSelectedMinistryId(e.target.value)}
                  disabled={mirror}
                  required={!mirror}
                >
                  {accessibleMinistries.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </label>

              {accessibleMinistries.length > 1 && (
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={mirror}
                    onChange={(e) => setMirror(e.target.checked)}
                  />
                  {t('mirrorLabel')}
                </label>
              )}

              <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t('startsAtLabel')}
                <input
                  type="datetime-local"
                  className="mt-1 border-2 border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  required
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t('endsAtLabel')}
                <input
                  type="datetime-local"
                  className="mt-1 border-2 border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  required
                />
              </label>

              {formError && (
                <p className="text-sm text-destructive border-2 border-destructive p-3 bg-destructive/10">
                  {formError}
                </p>
              )}

              <Button type="submit" disabled={saving} className="mt-2">
                {saving ? t('saving') : t('submit')}
              </Button>
            </form>
          )}
        </div>

        {/* List */}
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold uppercase tracking-tight">
            {t('upcoming')}
          </h2>

          {loading ? (
             <div className="flex flex-col gap-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-16 w-full animate-pulse border-2 border-border bg-surface-2" />
               ))}
             </div>
          ) : unavailabilities.length === 0 ? (
            <div className="border-2 border-border border-dashed p-12 text-center text-muted-foreground">
              <p className="text-sm">{t('emptyState')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {unavailabilities.map((u) => (
                <article key={u.id} className="border-2 border-border bg-surface p-3 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {u.ministry.name}
                    </p>
                    <p className="text-sm font-medium">
                      {formatDateTime(u.startsAtUtc)} — {formatDateTime(u.endsAtUtc)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
