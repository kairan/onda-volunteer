import { Link, useParams } from '@tanstack/react-router';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/apiError';
import { Button } from '@/components/ui/button';
import { useToasts } from '@/feedback/ToastHost';
import { RouteErrorPanel } from '@/shell/RouteErrorPanel';
import {
  fetchAdminInvites,
  revokeAdminInvite,
  type AdminInviteSummary,
} from './adminInvites';
import { createAdminInvite } from './createAdminInvite';
import {
  fetchSystemAdminChurch,
  type SystemAdminChurchSummary,
} from './fetchSystemAdminChurches';

export function SystemAdminChurchDetailPage() {
  const { churchId } = useParams({ from: '/system-admin/churches/$churchId' });
  const { t } = useTranslation(['systemAdmin', 'common']);
  const toasts = useToasts();
  const [church, setChurch] = useState<SystemAdminChurchSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [invites, setInvites] = useState<AdminInviteSummary[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [invitesLoadError, setInvitesLoadError] = useState<string | null>(null);
  const [revokeBusyId, setRevokeBusyId] = useState<string | null>(null);

  const loadInvites = useCallback(async () => {
    setInvitesLoading(true);
    setInvitesLoadError(null);
    try {
      const rows = await fetchAdminInvites({ churchId });
      setInvites(rows);
    } catch (err) {
      setInvites([]);
      setInvitesLoadError(
        err instanceof ApiRequestError
          ? err.message
          : t('churchDetail.invitesLoadError'),
      );
    } finally {
      setInvitesLoading(false);
    }
  }, [churchId, t]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const row = await fetchSystemAdminChurch(churchId);
        if (!cancelled) {
          setChurch(row);
          setLoadError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiRequestError
              ? err.message
              : t('churchDetail.loadError'),
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [churchId, t]);

  useEffect(() => {
    void loadInvites();
  }, [loadInvites]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await createAdminInvite({ churchId, email });
      setEmail('');
      toasts.push({
        id: crypto.randomUUID(),
        message: t('churchDetail.inviteSuccess'),
        kind: 'success',
      });
      await loadInvites();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        const key =
          err.code === 'ADMIN_INVITE_INVALID'
            ? 'churchDetail.errors.invalidEmail'
            : err.code === 'ADMIN_INVITE_ALREADY_PENDING'
              ? 'churchDetail.errors.alreadyPending'
              : 'churchDetail.errors.generic';
        setFormError(t(key));
      } else {
        setFormError(t('churchDetail.errors.generic'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function onRevokeInvite(inviteId: string) {
    setRevokeBusyId(inviteId);
    try {
      await revokeAdminInvite({ churchId, inviteId });
      toasts.push({
        id: crypto.randomUUID(),
        message: t('churchDetail.revokeSuccess'),
        kind: 'success',
      });
      await loadInvites();
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === 'ADMIN_INVITE_NOT_REVOKABLE') {
        setFormError(t('churchDetail.errors.notRevokable'));
      } else {
        setFormError(t('churchDetail.errors.generic'));
      }
    } finally {
      setRevokeBusyId(null);
    }
  }

  if (loadError) {
    return <RouteErrorPanel message={loadError} onRetry={() => window.location.reload()} />;
  }

  if (!church) {
    return (
      <p className="text-sm text-muted-foreground">{t('churchDetail.loading')}</p>
    );
  }

  return (
    <section className="border border-border bg-background p-6">
      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
        <Link to="/system-admin/churches" className="hover:underline">
          {t('churchDetail.backToChurches')}
        </Link>
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold uppercase leading-none tracking-tight">
        {church.name}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{church.defaultTimezone}</p>

      <form className="mt-8 max-w-md space-y-4" onSubmit={(event) => void onSubmit(event)}>
        <h2 className="font-display text-xl font-bold uppercase tracking-tight">
          {t('churchDetail.inviteTitle')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('churchDetail.inviteIntro')}</p>
        <label
          htmlFor="admin-invite-email"
          className="flex flex-col gap-1 text-sm font-semibold uppercase"
        >
          {t('churchDetail.emailLabel')}
          <input
            id="admin-invite-email"
            type="email"
            autoComplete="email"
            className="border-2 border-border bg-background px-3 py-2 normal-case"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
            required
          />
        </label>
        {formError ? (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? t('churchDetail.submitting') : t('churchDetail.submit')}
        </Button>
      </form>

      <div className="mt-10">
        <h2 className="font-display text-xl font-bold uppercase tracking-tight">
          {t('churchDetail.invitesListTitle')}
        </h2>
        {invitesLoadError ? (
          <div className="mt-3 space-y-2" role="alert">
            <p className="text-sm text-destructive">{invitesLoadError}</p>
            <Button
              type="button"
              variant="outline"
              disabled={invitesLoading}
              onClick={() => void loadInvites()}
            >
              {t('common:retry')}
            </Button>
          </div>
        ) : invitesLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {t('churchDetail.invitesLoading')}
          </p>
        ) : invites.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {t('churchDetail.invitesEmpty')}
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {invites.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{row.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(`churchDetail.inviteStatus.${row.status}`)}
                  </p>
                </div>
                {row.status === 'PENDING' ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={revokeBusyId === row.id}
                    onClick={() => void onRevokeInvite(row.id)}
                  >
                    {t('churchDetail.revokeInvite')}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
