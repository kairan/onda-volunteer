import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { useOrganization } from '@/organization/OrganizationContextProvider';
import { updateChurchMetadata } from '@/organization/churchMetadata';
import { Button } from '@/components/ui/button';

export function ChurchSettingsSection() {
  const { t } = useTranslation('ministries');
  const auth = useAuthSession();
  const { activeChurch, refresh } = useOrganization();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const [name, setName] = useState('');
  const [defaultTimezone, setDefaultTimezone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setName(activeChurch?.name ?? '');
    setDefaultTimezone(activeChurch?.defaultTimezone ?? '');
  }, [activeChurch?.id, activeChurch?.name, activeChurch?.defaultTimezone]);

  if (!activeChurch?.isAccreditedAdmin) {
    return null;
  }

  function errorMessage(err: unknown): string {
    if (err instanceof ApiRequestError) {
      if (err.code === 'ADMIN_NOT_ACCREDITED') {
        return t('churchSettings.errors.notAccredited');
      }
      if (err.code === 'CHURCH_NAME_REQUIRED') {
        return t('churchSettings.errors.nameRequired');
      }
      if (err.code === 'INVALID_TIMEZONE') {
        return t('churchSettings.errors.invalidTimezone');
      }
    }
    return err instanceof Error ? err.message : t('errorGeneric');
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !activeChurch || !name.trim()) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await updateChurchMetadata({
        churchId: activeChurch.id,
        actingVolunteerId,
        name: name.trim(),
        defaultTimezone: defaultTimezone.trim(),
      });
      setMessage(t('churchSettings.messages.saved'));
      await refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-4 border-2 border-border bg-surface p-4">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase">
          {t('churchSettings.title')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('churchSettings.body')}
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

      <form className="flex max-w-xl flex-col gap-4" onSubmit={(e) => void handleSave(e)}>
        <label className="flex flex-col gap-1 text-sm font-semibold uppercase">
          {t('churchSettings.nameLabel')}
          <input
            className="mt-1 border-2 border-border bg-background px-3 py-2 text-sm normal-case"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={busy}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold uppercase">
          {t('churchSettings.timezoneLabel')}
          <input
            className="mt-1 border-2 border-border bg-background px-3 py-2 font-mono text-sm normal-case"
            value={defaultTimezone}
            onChange={(e) => setDefaultTimezone(e.target.value)}
            disabled={busy}
          />
        </label>
        <p className="text-xs text-muted-foreground">{t('churchSettings.timezoneHint')}</p>
        <Button
          type="submit"
          disabled={busy || !name.trim() || !defaultTimezone.trim()}
          className="self-start"
        >
          {busy ? t('churchSettings.saving') : t('churchSettings.save')}
        </Button>
      </form>
    </section>
  );
}
