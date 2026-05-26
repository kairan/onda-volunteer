import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { createPublicEvent } from '@/events/createPublicEvent';
import { useOrganization } from '@/organization/OrganizationContextProvider';
import { datetimeLocalToUtcIso } from '@/settings/datetimeLocalUtc';
import { Button } from '@/components/ui/button';

export function SchedulingCreateEventPage() {
  const { t } = useTranslation('scheduling');
  const navigate = useNavigate();
  const auth = useAuthSession();
  const { activeChurch, activeCampus } = useOrganization();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const isAccreditedAdmin = activeChurch?.isAccreditedAdmin ?? false;

  const timezone =
    activeCampus?.timezone ?? activeChurch?.defaultTimezone ?? 'UTC';

  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !activeChurch) return;
    setBusy(true);
    setError(null);
    try {
      const created = await createPublicEvent({
        actingVolunteerId,
        churchId: activeChurch.id,
        title,
        startsAtUtc: datetimeLocalToUtcIso(startsAt, timezone),
        endsAtUtc: datetimeLocalToUtcIso(endsAt, timezone),
      });
      await navigate({
        to: '/scheduling/events/$eventId',
        params: { eventId: created.id },
      });
    } catch (err) {
      const code = err instanceof ApiRequestError ? err.code : undefined;
      setError(
        code === 'ADMIN_NOT_ACCREDITED'
          ? t('create.errors.notAccredited')
          : err instanceof Error
            ? err.message
            : t('create.errors.failed'),
      );
    } finally {
      setBusy(false);
    }
  }

  if (!actingVolunteerId) {
    return (
      <p className="text-sm text-muted-foreground">{t('create.signInRequired')}</p>
    );
  }

  if (!isAccreditedAdmin) {
    return (
      <section className="border-2 border-border bg-surface p-6">
        <p className="text-sm text-muted-foreground">{t('create.notAdmin')}</p>
        <Link to="/scheduling" className="mt-4 inline-block text-sm font-semibold underline">
          {t('detail.backToList')}
        </Link>
      </section>
    );
  }

  return (
    <section className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold uppercase">{t('create.title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('create.timezoneHint', { tz: timezone, church: activeChurch?.name })}
        </p>
      </div>

      <form
        className="flex flex-col gap-4 border-2 border-border bg-surface p-6"
        onSubmit={(e) => void handleSubmit(e)}
      >
        <label className="flex flex-col gap-1 text-sm font-semibold uppercase">
          {t('create.titleLabel')}
          <input
            className="border-2 border-border bg-background px-3 py-2 normal-case"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={busy}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold uppercase">
          {t('create.startsLabel')}
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
          {t('create.endsLabel')}
          <input
            type="datetime-local"
            className="border-2 border-border bg-background px-3 py-2 normal-case"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            required
            disabled={busy}
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={busy}>
            {busy ? t('detail.saving') : t('create.submit')}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/scheduling">{t('create.cancel')}</Link>
          </Button>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-destructive font-semibold">
            {error}
          </p>
        ) : null}
      </form>
    </section>
  );
}
