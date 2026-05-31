import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { Button } from '@/components/ui/button';
import {
  createSystemAdminChurch,
  fetchSystemAdminChurches,
  type SystemAdminChurchRow,
} from './systemAdminChurches';

export function SystemAdminChurchesPage() {
  const { t } = useTranslation('systemAdmin');
  const auth = useAuthSession();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const [churches, setChurches] = useState<SystemAdminChurchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [defaultTimezone, setDefaultTimezone] = useState('UTC');
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createMessage, setCreateMessage] = useState<string | null>(null);

  const loadChurches = useCallback(async () => {
    if (!actingVolunteerId) {
      setChurches([]);
      return;
    }
    setLoading(true);
    setListError(null);
    try {
      const page = await fetchSystemAdminChurches({
        volunteerId: actingVolunteerId,
        limit: 100,
      });
      setChurches(page.items);
    } catch (err) {
      setListError(err instanceof Error ? err.message : t('churches.errors.generic'));
    } finally {
      setLoading(false);
    }
  }, [actingVolunteerId, t]);

  useEffect(() => {
    void loadChurches();
  }, [loadChurches]);

  function createErrorMessage(err: unknown): string {
    if (err instanceof ApiRequestError) {
      if (err.code === 'CHURCH_NAME_REQUIRED') {
        return t('churches.errors.nameRequired');
      }
      if (err.code === 'INVALID_TIMEZONE') {
        return t('churches.errors.invalidTimezone');
      }
    }
    return err instanceof Error ? err.message : t('churches.errors.generic');
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !name.trim()) return;
    setCreateBusy(true);
    setCreateError(null);
    setCreateMessage(null);
    try {
      await createSystemAdminChurch({
        volunteerId: actingVolunteerId,
        name: name.trim(),
        defaultTimezone: defaultTimezone.trim(),
      });
      setName('');
      setCreateMessage(t('churches.createSuccess'));
      await loadChurches();
    } catch (err) {
      setCreateError(createErrorMessage(err));
    } finally {
      setCreateBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="border border-border bg-background p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {t('churches.eyebrow')}
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase leading-none tracking-tight">
          {t('churches.title')}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          {t('churches.intro')}
        </p>
        <p className="mt-4">
          <Button variant="outline" asChild>
            <Link to="/system-admin">{t('churches.backToDashboard')}</Link>
          </Button>
        </p>
      </section>

      <section className="border border-border bg-background p-6">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
          {t('churches.createHeading')}
        </h2>
        <form className="mt-4 flex max-w-xl flex-col gap-4" onSubmit={handleCreate}>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{t('churches.fields.name')}</span>
            <input
              className="border border-border bg-background px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{t('churches.fields.timezone')}</span>
            <input
              className="border border-border bg-background px-3 py-2 font-mono text-sm"
              value={defaultTimezone}
              onChange={(e) => setDefaultTimezone(e.target.value)}
              required
            />
          </label>
          {createError ? (
            <p className="text-sm text-destructive" role="alert">
              {createError}
            </p>
          ) : null}
          {createMessage ? (
            <p className="text-sm text-muted-foreground">{createMessage}</p>
          ) : null}
          <div>
            <Button type="submit" disabled={createBusy || !actingVolunteerId}>
              {createBusy ? t('churches.creating') : t('churches.createAction')}
            </Button>
          </div>
        </form>
      </section>

      <section className="border border-border bg-background p-6">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
          {t('churches.listHeading')}
        </h2>
        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">{t('churches.loading')}</p>
        ) : null}
        {listError ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {listError}
          </p>
        ) : null}
        {!loading && !listError && churches.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">{t('churches.empty')}</p>
        ) : null}
        {!loading && churches.length > 0 ? (
          <ul className="mt-4 divide-y divide-border border border-border">
            {churches.map((church) => (
              <li key={church.id} className="px-4 py-3">
                <p className="font-medium">{church.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {church.defaultTimezone}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('churches.campusCount', { count: church.campuses.length })}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
