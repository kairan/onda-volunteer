// TODO: Onda design phase — port with neutral tokens for now
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/api/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { queryKeys } from '@/query/queryKeys';
import {
  addSystemAdminMinistryMembership,
  grantSystemAdminAccreditation,
  grantSystemAdminMinistryLeader,
  patchSystemAdminMinistryMembership,
  revokeSystemAdminAccreditation,
  revokeSystemAdminMinistryLeader,
  systemAdminVolunteerQuery,
} from './systemAdminQueries';

export function SystemAdminUserDetailPage() {
  const { t } = useTranslation('systemAdmin');
  const auth = useAuthSession();
  const queryClient = useQueryClient();
  const { volunteerId: targetVolunteerId } = useParams({
    from: '/system-admin/users/$volunteerId',
  });

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const [grantChurchId, setGrantChurchId] = useState('');
  const [leaderMinistryId, setLeaderMinistryId] = useState('');
  const [membershipMinistryId, setMembershipMinistryId] = useState('');
  const [membershipStatus, setMembershipStatus] = useState<'PENDING' | 'ACTIVE'>(
    'ACTIVE',
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const detailQuery = useQuery(
    systemAdminVolunteerQuery({
      volunteerId: actingVolunteerId ?? '',
      targetVolunteerId,
    }),
  );

  const invalidateDetail = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.systemAdmin.volunteer(targetVolunteerId),
    });
  };

  function actionErrorMessage(err: unknown): string {
    if (err instanceof ApiRequestError && err.code === 'LAST_ADMIN_ACCREDITATION') {
      return t('users.errors.lastAdmin');
    }
    return err instanceof Error ? err.message : t('users.errors.generic');
  }

  const stewardshipMutation = useMutation({
    mutationFn: async (action: () => Promise<void>) => {
      await action();
    },
    onSuccess: async () => {
      setActionError(null);
      setActionMessage(t('users.stewardshipSuccess'));
      await invalidateDetail();
    },
    onError: (err) => {
      setActionMessage(null);
      setActionError(actionErrorMessage(err));
    },
  });

  const grantMutation = useMutation({
    mutationFn: grantSystemAdminAccreditation,
    onSuccess: async () => {
      setGrantChurchId('');
      setActionError(null);
      setActionMessage(t('users.grantSuccess'));
      await invalidateDetail();
    },
    onError: (err) => {
      setActionMessage(null);
      setActionError(actionErrorMessage(err));
    },
  });

  const revokeMutation = useMutation({
    mutationFn: revokeSystemAdminAccreditation,
    onSuccess: async () => {
      setActionError(null);
      setActionMessage(t('users.revokeSuccess'));
      await invalidateDetail();
    },
    onError: (err) => {
      setActionMessage(null);
      setActionError(actionErrorMessage(err));
    },
  });

  const detail = detailQuery.data;
  const actionBusy =
    stewardshipMutation.isPending ||
    grantMutation.isPending ||
    revokeMutation.isPending;

  function handleGrant(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !targetVolunteerId || !grantChurchId.trim()) {
      return;
    }
    grantMutation.mutate({
      volunteerId: actingVolunteerId,
      targetVolunteerId,
      churchId: grantChurchId.trim(),
    });
  }

  function handleGrantLeader(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !targetVolunteerId || !leaderMinistryId.trim()) {
      return;
    }
    const ministryId = leaderMinistryId.trim();
    stewardshipMutation.mutate(async () => {
      await grantSystemAdminMinistryLeader({
        volunteerId: actingVolunteerId,
        ministryId,
        targetVolunteerId,
      });
      setLeaderMinistryId('');
    });
  }

  function handleAddMembership(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !targetVolunteerId || !membershipMinistryId.trim()) {
      return;
    }
    const ministryId = membershipMinistryId.trim();
    stewardshipMutation.mutate(async () => {
      await addSystemAdminMinistryMembership({
        volunteerId: actingVolunteerId,
        ministryId,
        targetVolunteerId,
        status: membershipStatus,
      });
      setMembershipMinistryId('');
    });
  }

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-border bg-surface p-6">
        <Button variant="outline" asChild>
          <Link to="/system-admin/users">{t('users.backToSearch')}</Link>
        </Button>
        {detailQuery.isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">{t('users.loading')}</p>
        ) : detailQuery.isError ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {detailQuery.error instanceof Error
              ? detailQuery.error.message
              : t('users.errors.generic')}
          </p>
        ) : detail ? (
          <>
            <h1 className="mt-4 text-3xl font-semibold leading-tight">
              {detail.displayName}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{detail.id}</p>
          </>
        ) : null}
      </div>

      {detail ? (
        <>
          <div className="rounded-md border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold">{t('users.accreditationsTitle')}</h2>
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
                      disabled={actionBusy || !actingVolunteerId}
                      onClick={() => {
                        if (!actingVolunteerId) {
                          return;
                        }
                        revokeMutation.mutate({
                          volunteerId: actingVolunteerId,
                          targetVolunteerId,
                          churchId: row.churchId,
                        });
                      }}
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
                <Input
                  type="text"
                  value={grantChurchId}
                  onChange={(e) => setGrantChurchId(e.target.value)}
                  placeholder={t('users.grantChurchIdPlaceholder')}
                />
              </label>
              <Button type="submit" disabled={actionBusy || !grantChurchId.trim()}>
                {t('users.grantAdmin')}
              </Button>
            </form>
          </div>

          <div className="rounded-md border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold">{t('users.leadershipsTitle')}</h2>
            {detail.leaderships.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {t('users.noLeaderships')}
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {detail.leaderships.map((row) => (
                  <li
                    key={row.ministryId}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{row.ministryName}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.churchName} · {row.ministryId}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={actionBusy || !actingVolunteerId}
                      onClick={() => {
                        if (!actingVolunteerId) {
                          return;
                        }
                        stewardshipMutation.mutate(async () => {
                          await revokeSystemAdminMinistryLeader({
                            volunteerId: actingVolunteerId,
                            ministryId: row.ministryId,
                            targetVolunteerId,
                          });
                        });
                      }}
                    >
                      {t('users.revokeLeader')}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <form
              onSubmit={handleGrantLeader}
              className="mt-6 flex flex-wrap items-end gap-3"
            >
              <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm">
                <span className="font-medium">{t('users.leaderMinistryIdLabel')}</span>
                <Input
                  type="text"
                  value={leaderMinistryId}
                  onChange={(e) => setLeaderMinistryId(e.target.value)}
                  placeholder={t('users.leaderMinistryIdPlaceholder')}
                />
              </label>
              <Button type="submit" disabled={actionBusy || !leaderMinistryId.trim()}>
                {t('users.grantLeader')}
              </Button>
            </form>
          </div>

          <div className="rounded-md border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold">{t('users.membershipsTitle')}</h2>
            {detail.memberships.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {t('users.noMemberships')}
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {detail.memberships.map((row) => (
                  <li
                    key={row.ministryId}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{row.ministryName}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.churchName} · {row.status}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {row.status === 'PENDING' || row.status === 'INACTIVE' ? (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={actionBusy || !actingVolunteerId}
                          onClick={() => {
                            if (!actingVolunteerId) {
                              return;
                            }
                            stewardshipMutation.mutate(async () => {
                              await patchSystemAdminMinistryMembership({
                                volunteerId: actingVolunteerId,
                                ministryId: row.ministryId,
                                targetVolunteerId,
                                status: 'ACTIVE',
                              });
                            });
                          }}
                        >
                          {t('users.activateMembership')}
                        </Button>
                      ) : null}
                      {row.status === 'ACTIVE' ? (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={actionBusy || !actingVolunteerId}
                          onClick={() => {
                            if (!actingVolunteerId) {
                              return;
                            }
                            stewardshipMutation.mutate(async () => {
                              await patchSystemAdminMinistryMembership({
                                volunteerId: actingVolunteerId,
                                ministryId: row.ministryId,
                                targetVolunteerId,
                                status: 'INACTIVE',
                              });
                            });
                          }}
                        >
                          {t('users.deactivateMembership')}
                        </Button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <form
              onSubmit={handleAddMembership}
              className="mt-6 flex flex-wrap items-end gap-3"
            >
              <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm">
                <span className="font-medium">
                  {t('users.membershipMinistryIdLabel')}
                </span>
                <Input
                  type="text"
                  value={membershipMinistryId}
                  onChange={(e) => setMembershipMinistryId(e.target.value)}
                  placeholder={t('users.membershipMinistryIdPlaceholder')}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">{t('users.membershipStatusLabel')}</span>
                <select
                  value={membershipStatus}
                  onChange={(e) =>
                    setMembershipStatus(e.target.value as 'PENDING' | 'ACTIVE')
                  }
                  className="h-9 rounded-md border border-border bg-background px-3 py-2"
                >
                  <option value="PENDING">{t('users.membershipStatusPending')}</option>
                  <option value="ACTIVE">{t('users.membershipStatusActive')}</option>
                </select>
              </label>
              <Button type="submit" disabled={actionBusy || !membershipMinistryId.trim()}>
                {t('users.addMembership')}
              </Button>
            </form>
          </div>

          {actionError ? (
            <p className="text-sm text-destructive" role="alert">
              {actionError}
            </p>
          ) : null}
          {actionMessage ? (
            <p className="text-sm text-muted-foreground">{actionMessage}</p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
