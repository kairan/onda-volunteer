import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { createVolunteerUnavailability } from '@/identity/createVolunteerUnavailability';
import { deleteVolunteerUnavailability } from '@/identity/deleteVolunteerUnavailability';
import {
  fetchVolunteerUnavailability,
  type VolunteerUnavailability,
} from '@/identity/fetchVolunteerUnavailability';
import { updateVolunteerUnavailability } from '@/identity/updateVolunteerUnavailability';
import { fetchMinistryMemberships } from '@/organization/fetchMinistryMemberships';
import type { MinistryMembershipRow } from '@/organization/fetchMinistryMemberships';
import { useOrganization } from '@/organization/OrganizationContextProvider';
import {
  datetimeLocalToUtcIso,
  utcIsoToDatetimeLocal,
} from '@/settings/datetimeLocalUtc';
import { useLocalTimeContext } from '@/settings/LocalTimeProvider';
import { SchedulingTimeDisplay } from '@/settings/SchedulingTimeDisplay';
import { Button } from '@/components/ui/button';

type FieldErrors = {
  ministryId?: string;
  volunteerId?: string;
  startsAt?: string;
  endsAt?: string;
  summary?: string;
};

export function LeaderVolunteerTimeAwayPage() {
  const { t, i18n } = useTranslation('leaderTimeAway');
  const auth = useAuthSession();
  const { activeChurch, activeCampus } = useOrganization();
  const { buildDualInterval, formTimezone } = useLocalTimeContext();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const ledMinistries = useMemo(
    () => activeChurch?.ministries.filter((m) => m.isLeader) ?? [],
    [activeChurch?.ministries],
  );

  const [ministryId, setMinistryId] = useState('');
  const [volunteerId, setVolunteerId] = useState('');
  const [members, setMembers] = useState<MinistryMembershipRow[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const [rows, setRows] = useState<VolunteerUnavailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (ledMinistries.length === 1 && !ministryId) {
      setMinistryId(ledMinistries[0].id);
    }
  }, [ledMinistries, ministryId]);

  useEffect(() => {
    setVolunteerId('');
    setMembers([]);
    if (!ministryId || !actingVolunteerId) {
      return;
    }

    let cancelled = false;
    async function loadMembers() {
      setMembersLoading(true);
      try {
        const data = await fetchMinistryMemberships({
          ministryId,
          actingVolunteerId,
        });
        if (!cancelled) {
          setMembers(data.filter((row) => row.volunteerId !== actingVolunteerId));
        }
      } catch {
        if (!cancelled) {
          setMembers([]);
        }
      } finally {
        if (!cancelled) {
          setMembersLoading(false);
        }
      }
    }
    void loadMembers();
    return () => {
      cancelled = true;
    };
  }, [ministryId, actingVolunteerId]);

  const loadRows = useCallback(async () => {
    if (!volunteerId || !ministryId || !actingVolunteerId || !activeChurch) {
      setRows([]);
      return;
    }
    setLoading(true);
    setListError(null);
    try {
      const data = await fetchVolunteerUnavailability({
        volunteerId,
        churchId: activeChurch.id,
        leaderMinistryId: ministryId,
        actingVolunteerId,
      });
      setRows(data.filter((row) => row.ministry.id === ministryId));
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to load');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [volunteerId, ministryId, actingVolunteerId, activeChurch]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const churchTimezone =
    activeCampus?.timezone ?? activeChurch?.defaultTimezone ?? 'UTC';
  const formTimeZone = formTimezone(churchTimezone);

  const listTimeOptions = {
    weekday: 'short' as const,
    month: 'short' as const,
    day: 'numeric' as const,
    hour: '2-digit' as const,
    minute: '2-digit' as const,
  };

  function validateForm(): FieldErrors {
    const next: FieldErrors = {};
    if (!ministryId) {
      next.ministryId = t('errors.ministryRequired');
    }
    if (!volunteerId) {
      next.volunteerId = t('errors.volunteerRequired');
    }
    if (!startsAt) {
      next.startsAt = t('errors.startsAtRequired');
    }
    if (!endsAt) {
      next.endsAt = t('errors.endsAtRequired');
    }
    if (startsAt && endsAt) {
      const start = new Date(datetimeLocalToUtcIso(startsAt, formTimeZone)).getTime();
      const end = new Date(datetimeLocalToUtcIso(endsAt, formTimeZone)).getTime();
      if (!(start < end)) {
        next.endsAt = t('errors.invalidWindow');
      }
    }
    return next;
  }

  function beginEdit(row: VolunteerUnavailability) {
    setEditingId(row.id);
    setStartsAt(utcIsoToDatetimeLocal(row.startsAtUtc, formTimeZone));
    setEndsAt(utcIsoToDatetimeLocal(row.endsAtUtc, formTimeZone));
    setStatusMessage(null);
    setFieldErrors({});
  }

  function cancelEdit() {
    setEditingId(null);
    setStartsAt('');
    setEndsAt('');
    setFieldErrors({});
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!actingVolunteerId || !ministryId || !volunteerId) {
      return;
    }

    setStatusMessage(null);
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      if (Object.keys(nextErrors).length > 1) {
        nextErrors.summary = t('errors.summary');
      }
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      const window = {
        startsAtUtc: datetimeLocalToUtcIso(startsAt, formTimeZone),
        endsAtUtc: datetimeLocalToUtcIso(endsAt, formTimeZone),
      };
      if (editingId) {
        await updateVolunteerUnavailability({
          unavailabilityId: editingId,
          leaderMinistryId: ministryId,
          actingVolunteerId,
          ...window,
        });
        setStatusMessage(t('successUpdate'));
        cancelEdit();
      } else {
        await createVolunteerUnavailability({
          volunteerId,
          ministryId,
          leaderMinistryId: ministryId,
          actingVolunteerId,
          ...window,
        });
        setStatusMessage(t('successCreate'));
        setStartsAt('');
        setEndsAt('');
      }
      await loadRows();
    } catch (err) {
      const apiErrors: FieldErrors = {
        summary: err instanceof Error ? err.message : t('errors.summary'),
      };
      if (err instanceof ApiRequestError && err.code === 'INVALID_UNAVAILABILITY_WINDOW') {
        apiErrors.endsAt = err.message;
        delete apiErrors.summary;
      }
      setFieldErrors(apiErrors);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(rowId: string) {
    if (!actingVolunteerId || !ministryId) {
      return;
    }
    setDeletingId(rowId);
    setStatusMessage(null);
    try {
      await deleteVolunteerUnavailability({
        unavailabilityId: rowId,
        leaderMinistryId: ministryId,
        actingVolunteerId,
      });
      if (editingId === rowId) {
        cancelEdit();
      }
      setStatusMessage(t('successDelete'));
      await loadRows();
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  }

  if (ledMinistries.length === 0) {
    return (
      <section className="flex flex-col gap-4 border-2 border-border bg-surface p-6">
        <p className="text-sm text-muted-foreground">{t('body')}</p>
        <Link to="/time-away" className="text-sm font-semibold text-primary underline">
          {t('selfServiceLink')}
        </Link>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="border-2 border-border bg-surface p-6 shadow-[8px_8px_0_0_hsl(var(--border))]">
        <p className="inline-block border-2 border-border bg-background px-2 py-1 text-xs font-semibold uppercase tracking-[0.24em]">
          {t('eyebrow')}
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {t('body')}
        </p>
        <Link
          to="/time-away"
          className="mt-4 inline-block text-sm font-semibold text-primary underline"
        >
          {t('selfServiceLink')}
        </Link>
      </div>

      <div className="grid gap-4 border-2 border-border bg-surface p-6 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold uppercase tracking-wide">{t('ministry')}</span>
          <select
            className="border-2 border-border bg-background px-3 py-2"
            value={ministryId}
            onChange={(event) => setMinistryId(event.target.value)}
          >
            <option value="">{t('ministry')}</option>
            {ledMinistries.map((ministry) => (
              <option key={ministry.id} value={ministry.id}>
                {ministry.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold uppercase tracking-wide">{t('volunteer')}</span>
          <select
            className="border-2 border-border bg-background px-3 py-2"
            value={volunteerId}
            disabled={!ministryId || membersLoading}
            onChange={(event) => setVolunteerId(event.target.value)}
          >
            <option value="">{t('selectVolunteer')}</option>
            {members.map((member) => (
              <option key={member.volunteerId} value={member.volunteerId}>
                {member.displayName}
              </option>
            ))}
          </select>
        </label>
      </div>

      {volunteerId ? (
        <>
          <form
            className="flex flex-col gap-4 border-2 border-border bg-surface p-6"
            onSubmit={(event) => void handleSubmit(event)}
            noValidate
          >
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
              {editingId ? t('editHeading') : t('createHeading')}
            </h2>

            {fieldErrors.summary ? (
              <p role="alert" className="border-2 border-destructive p-3 text-sm text-destructive">
                {fieldErrors.summary}
              </p>
            ) : null}

            {statusMessage ? (
              <p role="status" className="border-2 border-primary bg-primary/10 p-3 text-sm">
                {statusMessage}
              </p>
            ) : null}

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold uppercase tracking-wide">{t('form.startsAt')}</span>
              <input
                type="datetime-local"
                className="border-2 border-border bg-background px-3 py-2"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
              {fieldErrors.startsAt ? (
                <span className="text-destructive">{fieldErrors.startsAt}</span>
              ) : null}
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold uppercase tracking-wide">{t('form.endsAt')}</span>
              <input
                type="datetime-local"
                className="border-2 border-border bg-background px-3 py-2"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
              />
              {fieldErrors.endsAt ? (
                <span className="text-destructive">{fieldErrors.endsAt}</span>
              ) : null}
            </label>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? t('form.submitting') : t('form.submit')}
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  {t('form.cancelEdit')}
                </Button>
              ) : null}
            </div>
          </form>

          <div className="flex flex-col gap-4">
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
              {t('listHeading')}
            </h2>
            {loading ? (
              <p className="text-sm text-muted-foreground">{t('loading')}</p>
            ) : listError ? (
              <p role="alert" className="text-sm text-destructive">
                {listError}
              </p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('emptyState')}</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {rows.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-col gap-3 border-2 border-border bg-surface p-4 text-sm md:flex-row md:items-center md:justify-between"
                  >
                    <p className="font-medium">
                      <SchedulingTimeDisplay
                        labels={buildDualInterval(
                          row.startsAtUtc,
                          row.endsAtUtc,
                          churchTimezone,
                          i18n.language,
                          listTimeOptions,
                          listTimeOptions,
                        )}
                      />
                    </p>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => beginEdit(row)}>
                        {t('actions.edit')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={deletingId === row.id}
                        onClick={() => void handleDelete(row.id)}
                      >
                        {deletingId === row.id
                          ? t('actions.deleting')
                          : t('actions.delete')}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
