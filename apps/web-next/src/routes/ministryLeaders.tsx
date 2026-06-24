// TODO: Onda design phase — port with neutral tokens for now
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/api/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  grantMinistryLeader,
  revokeMinistryLeader,
} from '@/organization/ministryStructureMutations';
import { ministryLeadersQuery } from '@/organization/ministryStructureQueries';
import { useOrganization } from '@/organization/OrganizationProvider';
import { queryKeys } from '@/query/queryKeys';

export function MinistryLeadersPage() {
  const { t } = useTranslation('ministries');
  const auth = useAuthSession();
  const queryClient = useQueryClient();
  const { activeChurch } = useOrganization();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const isAccreditedAdmin = activeChurch?.isAccreditedAdmin ?? false;

  const adminMinistries = useMemo(
    () => (isAccreditedAdmin ? (activeChurch?.ministries ?? []) : []),
    [activeChurch?.ministries, isAccreditedAdmin],
  );

  const [ministryId, setMinistryId] = useState('');
  const [volunteerId, setVolunteerId] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (adminMinistries.length === 1 && !ministryId) {
      setMinistryId(adminMinistries[0].id);
    }
  }, [adminMinistries, ministryId]);

  const leadersQuery = useQuery(
    ministryLeadersQuery({
      ministryId,
      actingVolunteerId: actingVolunteerId ?? '',
    }),
  );

  const invalidateLeaders = async () => {
    if (!ministryId) {
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: queryKeys.ministryLeaders(ministryId),
    });
  };

  const grantMutation = useMutation({
    mutationFn: grantMinistryLeader,
    onSuccess: async () => {
      setVolunteerId('');
      setSuccessMessage(t('delegation.messages.granted'));
      await invalidateLeaders();
    },
  });

  const revokeMutation = useMutation({
    mutationFn: revokeMinistryLeader,
    onSuccess: async () => {
      setSuccessMessage(t('delegation.messages.revoked'));
      await invalidateLeaders();
    },
  });

  function delegationErrorMessage(err: unknown): string {
    const code = err instanceof ApiRequestError ? err.code : undefined;
    return code === 'ADMIN_NOT_ACCREDITED'
      ? t('delegation.errors.notAccredited')
      : err instanceof Error
        ? err.message
        : t('delegation.errors.actionFailed');
  }

  function loadErrorMessage(err: unknown): string {
    const code = err instanceof ApiRequestError ? err.code : undefined;
    return code === 'ADMIN_NOT_ACCREDITED'
      ? t('delegation.errors.notAccredited')
      : err instanceof Error
        ? err.message
        : t('delegation.errors.loadFailed');
  }

  const actionError = grantMutation.error ?? revokeMutation.error;
  const busy = grantMutation.isPending || revokeMutation.isPending;
  const leaders = leadersQuery.data ?? [];

  function handleGrant(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !ministryId || !volunteerId.trim()) {
      return;
    }
    setSuccessMessage(null);
    grantMutation.mutate({
      ministryId,
      volunteerId: volunteerId.trim(),
      actingVolunteerId,
    });
  }

  if (!actingVolunteerId) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('delegation.signInRequired')}
      </p>
    );
  }

  if (!isAccreditedAdmin) {
    return (
      <p className="text-sm text-muted-foreground">{t('delegation.notAdmin')}</p>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('delegation.title')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('delegation.body')}
        </p>
      </div>

      <select
        className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        value={ministryId}
        onChange={(e) => setMinistryId(e.target.value)}
      >
        <option value="">{t('ministryPlaceholder')}</option>
        {adminMinistries.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      {leadersQuery.error ? (
        <p role="alert" className="text-sm text-destructive">
          {loadErrorMessage(leadersQuery.error)}
        </p>
      ) : null}

      <form className="flex flex-wrap gap-2" onSubmit={handleGrant}>
        <Input
          className="min-w-[12rem] flex-1 font-mono"
          placeholder={t('delegation.volunteerIdPlaceholder')}
          value={volunteerId}
          onChange={(e) => setVolunteerId(e.target.value)}
          disabled={!ministryId || busy}
        />
        <Button type="submit" disabled={!ministryId || busy}>
          {t('delegation.grant')}
        </Button>
      </form>

      {actionError ? (
        <p role="alert" className="text-sm text-destructive">
          {delegationErrorMessage(actionError)}
        </p>
      ) : null}

      {successMessage ? (
        <p className="text-sm text-muted-foreground">{successMessage}</p>
      ) : null}

      {leadersQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">{t('delegation.loading')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {leaders.map((row) => (
            <li
              key={row.volunteerId}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-sm shadow-[var(--shadow-card)]"
            >
              <span>
                {row.displayName}{' '}
                <span className="font-mono text-xs text-muted-foreground">
                  ({row.volunteerId})
                </span>
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  revokeMutation.mutate({
                    ministryId,
                    volunteerId: row.volunteerId,
                    actingVolunteerId: actingVolunteerId!,
                  })
                }
              >
                {t('delegation.revoke')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
