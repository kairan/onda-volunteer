import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import {
  activateMinistryMembership,
  addMinistryMembership,
  deactivateMinistryMembership,
} from '@/organization/membershipLifecycle';
import {
  fetchMinistryMemberships,
  type MinistryMembershipRow,
} from '@/organization/fetchMinistryMemberships';
import { useOrganization } from '@/organization/OrganizationContextProvider';
import { Button } from '@/components/ui/button';

export function VolunteersPage() {
  const { t } = useTranslation('volunteers');
  const auth = useAuthSession();
  const { activeChurch } = useOrganization();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const adminMinistries = useMemo(
    () =>
      activeChurch?.ministries.filter((m) => m.isLeader && !m.membershipStatus) ??
      [],
    [activeChurch?.ministries],
  );

  const [ministryId, setMinistryId] = useState('');
  const [rows, setRows] = useState<MinistryMembershipRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newVolunteerId, setNewVolunteerId] = useState('');
  const [newStatus, setNewStatus] = useState<'PENDING' | 'ACTIVE'>('PENDING');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (adminMinistries.length === 1 && !ministryId) {
      setMinistryId(adminMinistries[0].id);
    }
  }, [adminMinistries, ministryId]);

  const loadRows = useCallback(async () => {
    if (!ministryId || !actingVolunteerId) {
      setRows([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMinistryMemberships({
        ministryId,
        actingVolunteerId,
      });
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.loadFailed'));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [ministryId, actingVolunteerId, t]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !ministryId || !newVolunteerId.trim()) return;
    setSubmitting(true);
    setStatusMessage(null);
    try {
      await addMinistryMembership({
        ministryId,
        actingVolunteerId,
        volunteerId: newVolunteerId.trim(),
        status: newStatus,
      });
      setNewVolunteerId('');
      setStatusMessage(t('messages.added'));
      await loadRows();
    } catch (err) {
      const code =
        err instanceof ApiRequestError ? err.code : undefined;
      setStatusMessage(
        code === 'ADMIN_NOT_ACCREDITED'
          ? t('errors.notAccredited')
          : err instanceof Error
            ? err.message
            : t('errors.actionFailed'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleActivate(volunteerId: string) {
    if (!actingVolunteerId || !ministryId) return;
    setSubmitting(true);
    setStatusMessage(null);
    try {
      await activateMinistryMembership({
        ministryId,
        actingVolunteerId,
        volunteerId,
      });
      setStatusMessage(t('messages.activated'));
      await loadRows();
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : t('errors.actionFailed'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(volunteerId: string) {
    if (!actingVolunteerId || !ministryId) return;
    setSubmitting(true);
    setStatusMessage(null);
    try {
      await deactivateMinistryMembership({
        ministryId,
        actingVolunteerId,
        volunteerId,
        leaderMinistryId: ministryId,
      });
      setStatusMessage(t('messages.deactivated'));
      await loadRows();
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : t('errors.actionFailed'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!actingVolunteerId) {
    return (
      <section className="border-2 border-border bg-surface p-6">
        <p className="text-sm text-muted-foreground">{t('signInRequired')}</p>
      </section>
    );
  }

  if (adminMinistries.length === 0) {
    return (
      <section className="border-2 border-border bg-surface p-6">
        <h1 className="font-display text-4xl font-bold uppercase">{t('title')}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{t('notAdmin')}</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="border-2 border-border bg-surface p-6 shadow-[8px_8px_0_0_hsl(var(--border))]">
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-3 max-w-prose text-sm text-muted-foreground">{t('body')}</p>
      </div>

      <div className="flex flex-col gap-4 border-2 border-border bg-surface p-6">
        <label className="flex flex-col gap-1 text-sm font-semibold uppercase tracking-wide">
          {t('ministryLabel')}
          <select
            className="border-2 border-border bg-background px-3 py-2 normal-case tracking-normal"
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
        </label>

        <form className="flex flex-col gap-3 border-t border-border pt-4" onSubmit={(e) => void handleAdd(e)}>
          <h2 className="font-display text-xl font-bold uppercase">{t('addHeading')}</h2>
          <p className="text-xs text-muted-foreground">{t('addHelp')}</p>
          <label className="flex flex-col gap-1 text-sm font-semibold uppercase tracking-wide">
            {t('volunteerIdLabel')}
            <input
              className="border-2 border-border bg-background px-3 py-2 font-mono text-sm normal-case"
              value={newVolunteerId}
              onChange={(e) => setNewVolunteerId(e.target.value)}
              disabled={!ministryId || submitting}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold uppercase tracking-wide">
            {t('statusLabel')}
            <select
              className="border-2 border-border bg-background px-3 py-2 normal-case"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as 'PENDING' | 'ACTIVE')}
              disabled={!ministryId || submitting}
            >
              <option value="PENDING">{t('status.pending')}</option>
              <option value="ACTIVE">{t('status.active')}</option>
            </select>
          </label>
          <Button type="submit" disabled={!ministryId || submitting} className="self-start">
            {submitting ? t('saving') : t('addSubmit')}
          </Button>
        </form>
      </div>

      {statusMessage ? (
        <p role="status" className="border-2 border-primary bg-primary/10 p-3 text-sm font-semibold text-primary">
          {statusMessage}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="border-2 border-destructive p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold uppercase">{t('rosterHeading')}</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('emptyState')}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((row) => (
              <li
                key={row.volunteerId}
                className="flex flex-col gap-3 border-2 border-border bg-surface p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{row.displayName}</p>
                  <p className="font-mono text-xs text-muted-foreground">{row.volunteerId}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t(`status.${row.status.toLowerCase() as 'pending' | 'active' | 'inactive'}`)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {row.status === 'PENDING' ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={submitting}
                      onClick={() => void handleActivate(row.volunteerId)}
                    >
                      {t('actions.activate')}
                    </Button>
                  ) : null}
                  {row.status === 'ACTIVE' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={submitting}
                      onClick={() => void handleDeactivate(row.volunteerId)}
                    >
                      {t('actions.deactivate')}
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
