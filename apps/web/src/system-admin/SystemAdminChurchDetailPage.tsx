import { Link, useParams } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/apiError';
import { Button } from '@/components/ui/button';
import { useToasts } from '@/feedback/ToastHost';
import { RouteErrorPanel } from '@/shell/RouteErrorPanel';
import { createAdminInvite } from './createAdminInvite';
import {
  fetchSystemAdminChurch,
  type SystemAdminChurchSummary,
} from './fetchSystemAdminChurches';

export function SystemAdminChurchDetailPage() {
  const { churchId } = useParams({ from: '/system-admin/churches/$churchId' });
  const { t } = useTranslation('systemAdmin');
  const toasts = useToasts();
  const [church, setChurch] = useState<SystemAdminChurchSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    </section>
  );
}
