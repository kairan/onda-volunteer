import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { Button } from '@/components/ui/button';
import {
  addSystemAdminMinistryMembership,
  grantSystemAdminMinistryLeader,
  patchSystemAdminMinistryMembership,
  revokeSystemAdminMinistryLeader,
} from './systemAdminOrganization';
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
  const [leaderMinistryId, setLeaderMinistryId] = useState('');
  const [membershipMinistryId, setMembershipMinistryId] = useState('');
  const [membershipStatus, setMembershipStatus] = useState<'PENDING' | 'ACTIVE'>(
    'ACTIVE',
  );
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

  async function runStewardshipAction(action: () => Promise<void>) {
    setActionBusy(true);
    setActionError(null);
    setActionMessage(null);
    try {
      await action();
      setActionMessage(t('users.stewardshipSuccess'));
      await loadDetail();
    } catch (err) {
      setActionError(actionErrorMessage(err));
    } finally {
      setActionBusy(false);
    }
  }

  async function handleGrantLeader(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !targetVolunteerId || !leaderMinistryId.trim()) {
      return;
    }
    const ministryId = leaderMinistryId.trim();
    await runStewardshipAction(async () => {
      await grantSystemAdminMinistryLeader({
        volunteerId: actingVolunteerId,
        ministryId,
        targetVolunteerId,
      });
      setLeaderMinistryId('');
    });
  }

  async function handleRevokeLeader(ministryId: string) {
    if (!actingVolunteerId || !targetVolunteerId) {
      return;
    }
    await runStewardshipAction(async () => {
      await revokeSystemAdminMinistryLeader({
        volunteerId: actingVolunteerId,
        ministryId,
        targetVolunteerId,
      });
    });
  }

  async function handleAddMembership(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !targetVolunteerId || !membershipMinistryId.trim()) {
      return;
    }
    const ministryId = membershipMinistryId.trim();
    await runStewardshipAction(async () => {
      await addSystemAdminMinistryMembership({
        volunteerId: actingVolunteerId,
        ministryId,
        targetVolunteerId,
        status: membershipStatus,
      });
      setMembershipMinistryId('');
    });
  }

  async function handlePatchMembership(
    ministryId: string,
    status: 'ACTIVE' | 'INACTIVE',
  ) {
    if (!actingVolunteerId || !targetVolunteerId) {
      return;
    }
    await runStewardshipAction(async () => {
      await patchSystemAdminMinistryMembership({
        volunteerId: actingVolunteerId,
        ministryId,
        targetVolunteerId,
        status,
      });
    });
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
          </div>

          <div className="border border-border bg-background p-6">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">
              {t('users.leadershipsTitle')}
            </h2>
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
                      disabled={actionBusy}
                      onClick={() => void handleRevokeLeader(row.ministryId)}
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
                <input
                  type="text"
                  value={leaderMinistryId}
                  onChange={(e) => setLeaderMinistryId(e.target.value)}
                  placeholder={t('users.leaderMinistryIdPlaceholder')}
                  className="border border-border bg-background px-3 py-2"
                />
              </label>
              <Button
                type="submit"
                disabled={actionBusy || !leaderMinistryId.trim()}
              >
                {t('users.grantLeader')}
              </Button>
            </form>
          </div>

          <div className="border border-border bg-background p-6">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">
              {t('users.membershipsTitle')}
            </h2>
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
                          disabled={actionBusy}
                          onClick={() =>
                            void handlePatchMembership(row.ministryId, 'ACTIVE')
                          }
                        >
                          {t('users.activateMembership')}
                        </Button>
                      ) : null}
                      {row.status === 'ACTIVE' ? (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={actionBusy}
                          onClick={() =>
                            void handlePatchMembership(row.ministryId, 'INACTIVE')
                          }
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
                <input
                  type="text"
                  value={membershipMinistryId}
                  onChange={(e) => setMembershipMinistryId(e.target.value)}
                  placeholder={t('users.membershipMinistryIdPlaceholder')}
                  className="border border-border bg-background px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">{t('users.membershipStatusLabel')}</span>
                <select
                  value={membershipStatus}
                  onChange={(e) =>
                    setMembershipStatus(e.target.value as 'PENDING' | 'ACTIVE')
                  }
                  className="border border-border bg-background px-3 py-2"
                >
                  <option value="PENDING">{t('users.membershipStatusPending')}</option>
                  <option value="ACTIVE">{t('users.membershipStatusActive')}</option>
                </select>
              </label>
              <Button
                type="submit"
                disabled={actionBusy || !membershipMinistryId.trim()}
              >
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
