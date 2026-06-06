import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { Button } from '@/components/ui/button';
import { useOrganization } from '@/organization/OrganizationContextProvider';
import { updateCampusMetadata } from '@/organization/campusMetadata';

export function CampusSettingsSection() {
  const { t } = useTranslation('ministries');
  const auth = useAuthSession();
  const { activeChurch, activeCampus, refresh } = useOrganization();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [loadedTimezone, setLoadedTimezone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setName(activeCampus?.name ?? '');
    const tz = activeCampus?.timezone ?? '';
    setTimezone(tz);
    setLoadedTimezone(tz);
  }, [activeCampus?.id, activeCampus?.name, activeCampus?.timezone]);

  if (!activeChurch?.isAccreditedAdmin || !activeCampus) {
    return null;
  }

  function errorMessage(err: unknown): string {
    if (err instanceof ApiRequestError) {
      if (err.code === 'ADMIN_NOT_ACCREDITED') {
        return t('campusSettings.errors.notAccredited');
      }
      if (err.code === 'CAMPUS_NAME_REQUIRED') {
        return t('campusSettings.errors.nameRequired');
      }
      if (err.code === 'INVALID_TIMEZONE') {
        return t('campusSettings.errors.invalidTimezone');
      }
    }
    return err instanceof Error ? err.message : t('errorGeneric');
  }

  async function performSave() {
    if (!actingVolunteerId || !activeCampus || !name.trim()) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await updateCampusMetadata({
        campusId: activeCampus.id,
        actingVolunteerId,
        name: name.trim(),
        timezone: timezone.trim(),
      });
      setLoadedTimezone(timezone.trim());
      setMessage(t('campusSettings.messages.saved'));
      await refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !activeCampus || !name.trim()) return;
    const timezoneChanged = timezone.trim() !== loadedTimezone;
    if (timezoneChanged) {
      setConfirmOpen(true);
      return;
    }
    void performSave();
  }

  return (
    <section className="flex flex-col gap-4 border-2 border-border bg-surface p-4">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase">
          {t('campusSettings.title')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('campusSettings.body')}
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="border-2 border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      {message ? (
        <p
          role="status"
          className="border-2 border-primary bg-primary/10 px-4 py-3 text-sm font-semibold text-primary"
        >
          {message}
        </p>
      ) : null}

      <form className="flex max-w-xl flex-col gap-4" onSubmit={handleSave}>
        <label className="flex flex-col gap-1 text-sm font-semibold uppercase">
          {t('campusSettings.nameLabel')}
          <input
            className="mt-1 border-2 border-border bg-background px-3 py-2 text-sm normal-case"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={busy}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold uppercase">
          {t('campusSettings.timezoneLabel')}
          <input
            className="mt-1 border-2 border-border bg-background px-3 py-2 font-mono text-sm normal-case"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            disabled={busy}
          />
        </label>
        <p className="text-xs text-muted-foreground">{t('campusSettings.timezoneHint')}</p>
        <Button
          type="submit"
          disabled={busy || !name.trim() || !timezone.trim()}
          className="self-start"
        >
          {busy ? t('campusSettings.saving') : t('campusSettings.save')}
        </Button>
      </form>

      {confirmOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="campus-timezone-confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
        >
          <div className="w-full max-w-md border border-border bg-background p-4">
            <h3
              id="campus-timezone-confirm-title"
              className="text-lg font-semibold"
            >
              {t('campusSettings.confirm.title')}
            </h3>
            <p className="mt-2 text-sm">{t('campusSettings.confirm.body')}</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirmOpen(false)}
                disabled={busy}
              >
                {t('campusSettings.confirm.cancel')}
              </Button>
              <Button
                type="button"
                onClick={() => void performSave()}
                disabled={busy}
              >
                {t('campusSettings.confirm.confirm')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
