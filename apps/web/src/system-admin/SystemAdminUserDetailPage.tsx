import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { Button } from '@/components/ui/button';
import {
  fetchSystemAdminVolunteerDetail,
  grantSystemAdminAccreditation,
  revokeSystemAdminAccreditation,
  type SystemAdminVolunteerSummary,
} from './systemAdminUsers';

export function SystemAdminUserDetailPage() {
  const { t } = useTranslation('systemAdmin');
  const auth = useAuthSession();
  const { volunteerId: targetVolunteerId } = useParams({
    from: '/system-admin/users/$volunteerId',
  });

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const [detail, setDetail] = useState<SystemAdminVolunteerSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grantChurchId, setGrantChurchId] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    if (!actingVolunteerId || !targetVolunteerId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSystemAdminVolunteerDetail({
        volunteerId: actingVolunteerId,
        targetVolunteerId,
      });
      setDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('users.errors.generic'));
    } finally {
      setLoading(false);
    }
  }, [actingVolunteerId, targetVolunteerId, t]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  function actionErrorMessage(err: unknown): string {
    if (err instanceof ApiRequestError) {
      if (err.code === 'LAST_ADMIN_ACCREDITATION') {
        return t('users.errors.lastAdmin');
      }
    }
    return err instanceof Error ? err.message : t('users.errors.generic');
  }

  async function handleGrant(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !targetVolunteerId || !grantChurchId.trim()) {
      return;
    }
    setActionBusy(true);
    setActionError(null);
    setActionMessage(null);
    try {
      await grantSystemAdminAccreditation({
        volunteerId: actingVolunteerId,
        targetVolunteerId,
        churchId: grantChurchId.trim(),
      });
      setGrantChurchId('');
      setActionMessage(t('users.grantSuccess'));
      await loadDetail();
    } catch (err) {
      setActionError(actionErrorMessage(err));
    } finally {
      setActionBusy(false);
    }
  }

  async function handleRevoke(churchId: string) {
    if (!actingVolunteerId || !targetVolunteerId) {
      return;
    }
    setActionBusy(true);
    setActionError(null);
    setActionMessage(null);
    try {
      await revokeSystemAdminAccreditation({
        volunteerId: actingVolunteerId,
        targetVolunteerId,
        churchId,
      });
      setActionMessage(t('users.revokeSuccess'));
      await loadDetail();
    } catch (err) {
      setActionError(actionErrorMessage(err));
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="border border-border bg-background p-6">
        <Button variant="outline" asChild>
          <Link to="/system-admin/users">{t('users.backToSearch')}</Link>
        </Button>
        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">{t('users.loading')}</p>
        ) : error ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : detail ? (
          <>
            <h1 className="mt-4 font-display text-4xl font-bold uppercase leading-none tracking-tight">
              {detail.displayName}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{detail.id}</p>
          </>
        ) : null}
      </div>

      {detail ? (
        <>
          <div className="border border-border bg-background p-6">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">
              {t('users.accreditationsTitle')}
            </h2>
            {detail.accreditations.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {t('users.noAccreditations')}
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {detail.accreditations.map((row) => (
                  <li
                    key={row.churchId}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="font-medium">{row.churchName}</p>
                      <p className="text-xs text-muted-foreground">{row.churchId}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={actionBusy}
                      onClick={() => void handleRevoke(row.churchId)}
                    >
                      {t('users.revokeAdmin')}
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={handleGrant} className="mt-6 flex flex-wrap items-end gap-3">
              <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm">
                <span className="font-medium">{t('users.grantChurchIdLabel')}</span>
                <input
                  type="text"
                  value={grantChurchId}
                  onChange={(e) => setGrantChurchId(e.target.value)}
                  placeholder={t('users.grantChurchIdPlaceholder')}
                  className="border border-border bg-background px-3 py-2"
                />
              </label>
              <Button type="submit" disabled={actionBusy || !grantChurchId.trim()}>
                {t('users.grantAdmin')}
              </Button>
            </form>

            {actionError ? (
              <p className="mt-3 text-sm text-destructive" role="alert">
                {actionError}
              </p>
            ) : null}
            {actionMessage ? (
              <p className="mt-3 text-sm text-muted-foreground">{actionMessage}</p>
            ) : null}
          </div>

          {detail.leaderships.length > 0 ? (
            <div className="border border-border bg-background p-6">
              <h2 className="font-display text-xl font-bold uppercase tracking-tight">
                {t('users.leadershipsTitle')}
              </h2>
              <ul className="mt-3 divide-y divide-border text-sm">
                {detail.leaderships.map((row) => (
                  <li key={row.ministryId} className="py-2">
                    {row.ministryName} — {row.churchName}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {detail.memberships.length > 0 ? (
            <div className="border border-border bg-background p-6">
              <h2 className="font-display text-xl font-bold uppercase tracking-tight">
                {t('users.membershipsTitle')}
              </h2>
              <ul className="mt-3 divide-y divide-border text-sm">
                {detail.memberships.map((row) => (
                  <li key={row.ministryId} className="py-2">
                    {row.ministryName} — {row.status}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
