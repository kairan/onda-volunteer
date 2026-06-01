import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { Button } from '@/components/ui/button';
import { useOrganization } from '@/organization/OrganizationContextProvider';
import { updateChurchMetadata } from '@/organization/updateChurchMetadata';

export function ChurchSettingsSection() {
  const { t } = useTranslation('ministries');
  const auth = useAuthSession();
  const { activeChurch, refresh } = useOrganization();
  const [name, setName] = useState(activeChurch?.name ?? '');
  const [timezone, setTimezone] = useState(activeChurch?.defaultTimezone ?? '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const volunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  if (!activeChurch?.isAccreditedAdmin || !volunteerId) {
    return null;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await updateChurchMetadata({
        churchId: activeChurch.id,
        volunteerId,
        name,
        defaultTimezone: timezone,
      });
      await refresh();
      setMessage(t('churchSettings.saved'));
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t('churchSettings.errors.generic'),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border-2 border-border bg-surface p-6 shadow-[8px_8px_0_0_hsl(var(--border))]">
      <h2 className="font-display text-xl font-bold uppercase tracking-tight">
        {t('churchSettings.title')}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{t('churchSettings.intro')}</p>
      <form className="mt-4 flex max-w-md flex-col gap-3" onSubmit={(e) => void onSubmit(e)}>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('churchSettings.nameLabel')}</span>
          <input
            className="border border-border bg-background px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('churchSettings.timezoneLabel')}</span>
          <input
            className="border border-border bg-background px-3 py-2"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            required
          />
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message ? <p className="text-sm text-primary">{message}</p> : null}
        <Button type="submit" disabled={busy}>
          {busy ? t('churchSettings.saving') : t('churchSettings.save')}
        </Button>
      </form>
    </section>
  );
}
