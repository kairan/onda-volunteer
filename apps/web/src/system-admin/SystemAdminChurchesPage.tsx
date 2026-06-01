import { Link } from '@tanstack/react-router';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/apiError';
import { Button } from '@/components/ui/button';
import { RouteErrorPanel } from '@/shell/RouteErrorPanel';
import { createSystemAdminChurch } from './createSystemAdminChurch';
import {
  fetchSystemAdminChurches,
  type SystemAdminChurchSummary,
} from './fetchSystemAdminChurches';

export function SystemAdminChurchesPage() {
  const { t } = useTranslation('systemAdmin');
  const [churches, setChurches] = useState<SystemAdminChurchSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [defaultTimezone, setDefaultTimezone] = useState('America/Sao_Paulo');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadChurches = useCallback(async () => {
    const rows = await fetchSystemAdminChurches();
    setChurches(rows);
    setError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await loadChurches();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiRequestError
              ? err.message
              : t('churches.loadError'),
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadChurches, t]);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      await createSystemAdminChurch({ name, defaultTimezone });
      setName('');
      await loadChurches();
    } catch (err) {
      setCreateError(
        err instanceof ApiRequestError
          ? err.message
          : t('churches.create.errors.generic'),
      );
    } finally {
      setCreating(false);
    }
  }

  if (error) {
    return <RouteErrorPanel message={error} onRetry={() => window.location.reload()} />;
  }

  if (!churches) {
    return (
      <p className="text-sm text-muted-foreground">{t('churches.loading')}</p>
    );
  }

  return (
    <section className="border border-border bg-background p-6">
      <h1 className="font-display text-3xl font-bold uppercase leading-none tracking-tight">
        {t('churches.title')}
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        {t('churches.intro')}
      </p>
      <form
        className="mt-8 flex max-w-md flex-col gap-3 border border-border p-4"
        onSubmit={(e) => void onCreate(e)}
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide">
          {t('churches.create.title')}
        </h2>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('churches.create.nameLabel')}</span>
          <input
            className="border border-border bg-background px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('churches.create.timezoneLabel')}</span>
          <input
            className="border border-border bg-background px-3 py-2"
            value={defaultTimezone}
            onChange={(e) => setDefaultTimezone(e.target.value)}
            required
          />
        </label>
        {createError ? <p className="text-sm text-destructive">{createError}</p> : null}
        <Button type="submit" disabled={creating}>
          {creating ? t('churches.create.submitting') : t('churches.create.submit')}
        </Button>
      </form>
      {churches.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{t('churches.empty')}</p>
      ) : (
        <ul className="mt-6 divide-y divide-border border border-border">
          {churches.map((church) => (
            <li key={church.id}>
              <Link
                to="/system-admin/churches/$churchId"
                params={{ churchId: church.id }}
                className="flex flex-col gap-1 px-4 py-3 hover:bg-muted/40"
              >
                <span className="font-medium">{church.name}</span>
                <span className="text-xs text-muted-foreground">
                  {church.defaultTimezone}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
