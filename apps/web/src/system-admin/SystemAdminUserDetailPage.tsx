import { Link, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/apiError';
import { Button } from '@/components/ui/button';
import { RouteErrorPanel } from '@/shell/RouteErrorPanel';
import {
  fetchSystemAdminChurches,
  type SystemAdminChurchSummary,
} from './fetchSystemAdminChurches';
import {
  fetchSystemAdminVolunteer,
  grantSystemAdminAccreditation,
  revokeSystemAdminAccreditation,
  type SystemAdminVolunteerDetail,
} from './fetchSystemAdminVolunteers';

export function SystemAdminUserDetailPage() {
  const { volunteerId } = useParams({ from: '/system-admin/users/$volunteerId' });
  const { t } = useTranslation('systemAdmin');
  const [volunteer, setVolunteer] = useState<SystemAdminVolunteerDetail | null>(null);
  const [churches, setChurches] = useState<SystemAdminChurchSummary[]>([]);
  const [grantChurchId, setGrantChurchId] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload() {
    const [detail, churchList] = await Promise.all([
      fetchSystemAdminVolunteer(volunteerId),
      fetchSystemAdminChurches(),
    ]);
    setVolunteer(detail);
    setChurches(churchList);
    setLoadError(null);
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await reload();
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiRequestError
              ? err.message
              : t('userDetail.loadError'),
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [volunteerId, t]);

  async function onGrant() {
    if (!grantChurchId) return;
    setBusy(true);
    try {
      await grantSystemAdminAccreditation({
        volunteerId,
        churchId: grantChurchId,
      });
      setGrantChurchId('');
      await reload();
    } catch (err) {
      setLoadError(
        err instanceof ApiRequestError
          ? err.message
          : t('userDetail.errors.generic'),
      );
    } finally {
      setBusy(false);
    }
  }

  async function onRevoke(churchId: string) {
    setBusy(true);
    try {
      await revokeSystemAdminAccreditation({ volunteerId, churchId });
      await reload();
    } catch (err) {
      setLoadError(
        err instanceof ApiRequestError
          ? err.message
          : t('userDetail.errors.generic'),
      );
    } finally {
      setBusy(false);
    }
  }

  if (loadError && !volunteer) {
    return (
      <RouteErrorPanel message={loadError} onRetry={() => void reload()} />
    );
  }

  if (!volunteer) {
    return (
      <p className="text-sm text-muted-foreground">{t('userDetail.loading')}</p>
    );
  }

  const accreditedIds = new Set(
    volunteer.adminAccreditations.map((a) => a.churchId),
  );
  const grantOptions = churches.filter((c) => !accreditedIds.has(c.id));

  return (
    <section className="border border-border bg-background p-6">
      <Link
        to="/system-admin/users"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        {t('userDetail.backToUsers')}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold uppercase leading-none tracking-tight">
        {volunteer.displayName}
      </h1>
      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide">
        {t('userDetail.accreditationsTitle')}
      </h2>
      {volunteer.adminAccreditations.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {t('userDetail.noAccreditations')}
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-border border border-border">
          {volunteer.adminAccreditations.map((a) => (
            <li
              key={a.churchId}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <span>{a.churchName}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => void onRevoke(a.churchId)}
              >
                {t('userDetail.revoke')}
              </Button>
            </li>
          ))}
        </ul>
      )}
      {grantOptions.length > 0 ? (
        <div className="mt-6 flex max-w-md flex-wrap items-end gap-2">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span>{t('userDetail.grantLabel')}</span>
            <select
              className="border border-border bg-background px-3 py-2"
              value={grantChurchId}
              onChange={(e) => setGrantChurchId(e.target.value)}
            >
              <option value="">{t('userDetail.grantPlaceholder')}</option>
              {grantOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            disabled={busy || !grantChurchId}
            onClick={() => void onGrant()}
          >
            {t('userDetail.grant')}
          </Button>
        </div>
      ) : null}
      {loadError ? (
        <p className="mt-4 text-sm text-destructive">{loadError}</p>
      ) : null}
    </section>
  );
}
