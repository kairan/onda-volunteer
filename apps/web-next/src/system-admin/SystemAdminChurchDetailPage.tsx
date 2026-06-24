// TODO: Onda design phase — port with neutral tokens for now
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/api/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToasts } from '@/feedback/ToastHost';
import { queryKeys } from '@/query/queryKeys';
import { RouteErrorPanel } from '@/shell/RouteErrorPanel';
import {
  createAdminInvite,
  revokeAdminInvite,
  systemAdminAdminInvitesQuery,
  systemAdminChurchQuery,
} from './systemAdminQueries';

export function SystemAdminChurchDetailPage() {
  const { churchId } = useParams({ from: '/system-admin/churches/$churchId' });
  const { t } = useTranslation(['systemAdmin', 'common']);
  const auth = useAuthSession();
  const toasts = useToasts();
  const queryClient = useQueryClient();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const churchQuery = useQuery(
    systemAdminChurchQuery({
      volunteerId: actingVolunteerId ?? '',
      churchId,
    }),
  );

  const invitesQuery = useQuery(
    systemAdminAdminInvitesQuery({
      volunteerId: actingVolunteerId ?? '',
      churchId,
    }),
  );

  const inviteMutation = useMutation({
    mutationFn: createAdminInvite,
    onSuccess: async () => {
      setEmail('');
      setFormError(null);
      toasts.push({
        id: crypto.randomUUID(),
        message: t('churchDetail.inviteSuccess'),
        kind: 'success',
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.systemAdmin.adminInvites(churchId),
      });
    },
    onError: (err) => {
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
    },
  });

  const revokeMutation = useMutation({
    mutationFn: revokeAdminInvite,
    onSuccess: async () => {
      setFormError(null);
      toasts.push({
        id: crypto.randomUUID(),
        message: t('churchDetail.revokeSuccess'),
        kind: 'success',
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.systemAdmin.adminInvites(churchId),
      });
    },
    onError: (err) => {
      if (err instanceof ApiRequestError && err.code === 'ADMIN_INVITE_NOT_REVOKABLE') {
        setFormError(t('churchDetail.errors.notRevokable'));
      } else {
        setFormError(t('churchDetail.errors.generic'));
      }
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!actingVolunteerId) {
      return;
    }
    inviteMutation.mutate({
      volunteerId: actingVolunteerId,
      churchId,
      email,
    });
  }

  if (churchQuery.isError) {
    const message =
      churchQuery.error instanceof ApiRequestError
        ? churchQuery.error.message
        : t('churchDetail.loadError');
    return (
      <RouteErrorPanel
        message={message}
        onRetry={() => void churchQuery.refetch()}
      />
    );
  }

  if (churchQuery.isLoading || !churchQuery.data) {
    return (
      <p className="text-sm text-muted-foreground">{t('churchDetail.loading')}</p>
    );
  }

  const church = churchQuery.data;
  const invites = invitesQuery.data ?? [];

  return (
    <section className="rounded-md border border-border bg-surface p-6">
      <p className="text-xs text-muted-foreground">
        <Link to="/system-admin/churches" className="hover:underline">
          {t('churchDetail.backToChurches')}
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-semibold leading-tight">{church.name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{church.defaultTimezone}</p>

      <form className="mt-8 max-w-md space-y-4" onSubmit={onSubmit}>
        <h2 className="text-lg font-semibold">{t('churchDetail.inviteTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('churchDetail.inviteIntro')}</p>
        <label
          htmlFor="admin-invite-email"
          className="flex flex-col gap-1 text-sm font-medium"
        >
          {t('churchDetail.emailLabel')}
          <Input
            id="admin-invite-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={inviteMutation.isPending}
            required
          />
        </label>
        {formError ? (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        ) : null}
        <Button type="submit" disabled={inviteMutation.isPending || !actingVolunteerId}>
          {inviteMutation.isPending
            ? t('churchDetail.submitting')
            : t('churchDetail.submit')}
        </Button>
      </form>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">{t('churchDetail.invitesListTitle')}</h2>
        {invitesQuery.isError ? (
          <div className="mt-3 space-y-2" role="alert">
            <p className="text-sm text-destructive">
              {invitesQuery.error instanceof ApiRequestError
                ? invitesQuery.error.message
                : t('churchDetail.invitesLoadError')}
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={invitesQuery.isFetching}
              onClick={() => void invitesQuery.refetch()}
            >
              {t('common:retry')}
            </Button>
          </div>
        ) : invitesQuery.isLoading ? (
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
                    disabled={revokeMutation.isPending}
                    onClick={() => {
                      if (!actingVolunteerId) {
                        return;
                      }
                      revokeMutation.mutate({
                        volunteerId: actingVolunteerId,
                        churchId,
                        inviteId: row.id,
                      });
                    }}
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
