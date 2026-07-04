import { useMutation } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/api/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateChurchMetadata } from '@/organization/churchMetadata';
import { useOrganization } from '@/organization/OrganizationProvider';

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
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setName(activeChurch?.name ?? '');
    setDefaultTimezone(activeChurch?.defaultTimezone ?? '');
  }, [activeChurch?.id, activeChurch?.name, activeChurch?.defaultTimezone]);

  const saveMutation = useMutation({
    mutationFn: updateChurchMetadata,
    onSuccess: async () => {
      setMessage(t('churchSettings.messages.saved'));
      await refresh();
    },
  });

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

  function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !activeChurch || !name.trim()) {
      return;
    }
    setMessage(null);
    saveMutation.mutate({
      churchId: activeChurch.id,
      actingVolunteerId,
      name: name.trim(),
      defaultTimezone: defaultTimezone.trim(),
    });
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          {t('churchSettings.title')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('churchSettings.body')}
        </p>
      </div>

      {saveMutation.error ? (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage(saveMutation.error)}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="text-sm font-medium text-primary">
          {message}
        </p>
      ) : null}

      <form className="flex max-w-xl flex-col gap-4" onSubmit={handleSave}>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t('churchSettings.nameLabel')}
          <Input
            className="mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saveMutation.isPending}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t('churchSettings.timezoneLabel')}
          <Input
            className="mt-1 font-mono"
            value={defaultTimezone}
            onChange={(e) => setDefaultTimezone(e.target.value)}
            disabled={saveMutation.isPending}
          />
        </label>
        <p className="text-xs text-muted-foreground">
          {t('churchSettings.timezoneHint')}
        </p>
        <Button
          type="submit"
          disabled={
            saveMutation.isPending || !name.trim() || !defaultTimezone.trim()
          }
          className="self-start"
        >
          {saveMutation.isPending
            ? t('churchSettings.saving')
            : t('churchSettings.save')}
        </Button>
      </form>
    </section>
  );
}
