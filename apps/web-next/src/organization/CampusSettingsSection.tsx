import { useMutation } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/api/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateCampusMetadata } from '@/organization/campusMetadata';
import { useOrganization } from '@/organization/OrganizationProvider';

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
  const [message, setMessage] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setName(activeCampus?.name ?? '');
    const tz = activeCampus?.timezone ?? '';
    setTimezone(tz);
    setLoadedTimezone(tz);
  }, [activeCampus?.id, activeCampus?.name, activeCampus?.timezone]);

  const saveMutation = useMutation({
    mutationFn: updateCampusMetadata,
    onSuccess: async (_data, variables) => {
      setLoadedTimezone(variables.timezone?.trim() ?? loadedTimezone);
      setMessage(t('campusSettings.messages.saved'));
      setConfirmOpen(false);
      await refresh();
    },
  });

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

  function performSave() {
    if (!actingVolunteerId || !activeCampus || !name.trim()) {
      return;
    }
    setMessage(null);
    saveMutation.mutate({
      campusId: activeCampus.id,
      actingVolunteerId,
      name: name.trim(),
      timezone: timezone.trim(),
    });
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !activeCampus || !name.trim()) {
      return;
    }
    const timezoneChanged = timezone.trim() !== loadedTimezone;
    if (timezoneChanged) {
      setConfirmOpen(true);
      return;
    }
    performSave();
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          {t('campusSettings.title')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('campusSettings.body')}
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
          {t('campusSettings.nameLabel')}
          <Input
            className="mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saveMutation.isPending}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t('campusSettings.timezoneLabel')}
          <Input
            className="mt-1 font-mono"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            disabled={saveMutation.isPending}
          />
        </label>
        <p className="text-xs text-muted-foreground">
          {t('campusSettings.timezoneHint')}
        </p>
        <Button
          type="submit"
          disabled={saveMutation.isPending || !name.trim() || !timezone.trim()}
          className="self-start"
        >
          {saveMutation.isPending
            ? t('campusSettings.saving')
            : t('campusSettings.save')}
        </Button>
      </form>

      {confirmOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="campus-timezone-confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
        >
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-card)]">
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
                disabled={saveMutation.isPending}
              >
                {t('campusSettings.confirm.cancel')}
              </Button>
              <Button
                type="button"
                onClick={performSave}
                disabled={saveMutation.isPending}
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
