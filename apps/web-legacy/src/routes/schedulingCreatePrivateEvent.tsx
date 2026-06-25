import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { createPrivateEvent } from '@/events/createPrivateEvent';
import { ministriesForWritePickers } from '@/organization/ministryArchive';
import { useOrganization } from '@/organization/OrganizationContextProvider';
import { datetimeLocalToUtcIso } from '@/settings/datetimeLocalUtc';
import { Button } from '@/components/ui/button';

export function SchedulingCreatePrivateEventPage() {
  const { t } = useTranslation('scheduling');
  const navigate = useNavigate();
  const auth = useAuthSession();
  const { activeChurch, activeCampus } = useOrganization();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const ledMinistries = useMemo(
    () =>
      ministriesForWritePickers(
        activeChurch?.ministries.filter((m) => m.isLeader) ?? [],
      ),
    [activeChurch?.ministries],
  );

  const [ministryId, setMinistryId] = useState('');
  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timezone =
    activeCampus?.timezone ?? activeChurch?.defaultTimezone ?? 'UTC';

  useEffect(() => {
    if (ledMinistries.length === 1 && !ministryId) {
      setMinistryId(ledMinistries[0].id);
    }
  }, [ledMinistries, ministryId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !ministryId) return;
    setBusy(true);
    setError(null);
    try {
      const created = await createPrivateEvent({
        actingVolunteerId,
        leaderMinistryId: ministryId,
        ministryId,
        title,
        startsAtUtc: datetimeLocalToUtcIso(startsAt, timezone),
        endsAtUtc: datetimeLocalToUtcIso(endsAt, timezone),
      });
      await navigate({
        to: '/scheduling/events/$eventId',
        params: { eventId: created.id },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('createPrivate.errors.failed'));
    } finally {
      setBusy(false);
    }
  }

  if (!actingVolunteerId) {
    return <p className="text-sm text-muted-foreground">{t('createPrivate.signInRequired')}</p>;
  }

  if (ledMinistries.length === 0) {
    return (
      <section className="border-2 border-border bg-surface p-6">
        <p className="text-sm text-muted-foreground">{t('createPrivate.notLeader')}</p>
      </section>
    );
  }

  return (
    <section className="flex max-w-xl flex-col gap-6">
      <h1 className="font-display text-3xl font-bold uppercase">{t('createPrivate.title')}</h1>
      <form
        className="flex flex-col gap-4 border-2 border-border bg-surface p-6"
        onSubmit={(e) => void handleSubmit(e)}
      >
        <label className="flex flex-col gap-1 text-sm font-semibold uppercase">
          {t('createPrivate.ministryLabel')}
          <select
            className="border-2 border-border bg-background px-3 py-2 normal-case"
            value={ministryId}
            onChange={(e) => setMinistryId(e.target.value)}
            required
          >
            <option value="">{t('createPrivate.ministryPlaceholder')}</option>
            {ledMinistries.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold uppercase">
          {t('createPrivate.titleLabel')}
          <input
            className="border-2 border-border bg-background px-3 py-2 normal-case"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={busy}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold uppercase">
          {t('createPrivate.startsLabel')}
          <input
            type="datetime-local"
            className="border-2 border-border bg-background px-3 py-2 normal-case"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
            disabled={busy}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold uppercase">
          {t('createPrivate.endsLabel')}
          <input
            type="datetime-local"
            className="border-2 border-border bg-background px-3 py-2 normal-case"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            required
            disabled={busy}
          />
        </label>
        <Button type="submit" disabled={busy} className="self-start">
          {busy ? t('detail.saving') : t('createPrivate.submit')}
        </Button>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </form>
      <Link to="/scheduling" className="text-sm font-semibold underline">
        {t('detail.backToList')}
      </Link>
    </section>
  );
}
