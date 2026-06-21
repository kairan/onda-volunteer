import { Link } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/api/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ministriesForWritePickers } from '@/organization/ministryArchive';
import { useOrganization } from '@/organization/OrganizationProvider';
import { ministryMembershipsQuery } from '@/organization/ministryStructureQueries';
import { queryKeys } from '@/query/queryKeys';
import { datetimeLocalToUtcIso, utcIsoToDatetimeLocal } from '@/settings/datetimeLocalUtc';
import { useLocalTimeContext } from '@/settings/LocalTimeProvider';
import { SchedulingTimeDisplay } from '@/settings/SchedulingTimeDisplay';
import {
  createVolunteerUnavailability,
  deleteVolunteerUnavailability,
  updateVolunteerUnavailability,
} from '@/volunteer/unavailabilityMutations';
import { volunteerUnavailabilityQuery } from '@/volunteer/volunteerUnavailabilityQuery';
import type { VolunteerUnavailability } from '@/volunteer/types';

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
  const queryClient = useQueryClient();
  const { activeChurch, activeCampus } = useOrganization();
  const { buildDualInterval, formTimezone } = useLocalTimeContext();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const ledMinistries = useMemo(
    () =>
      ministriesForWritePickers(
        activeChurch?.ministries.filter((ministry) => ministry.isLeader) ?? [],
      ),
    [activeChurch?.ministries],
  );

  const [ministryId, setMinistryId] = useState('');
  const [volunteerId, setVolunteerId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (ledMinistries.length === 1 && !ministryId) {
      setMinistryId(ledMinistries[0].id);
    }
  }, [ledMinistries, ministryId]);

  useEffect(() => {
    setVolunteerId('');
  }, [ministryId]);

  const membershipsQuery = useQuery(
    ministryMembershipsQuery({
      ministryId,
      actingVolunteerId: actingVolunteerId ?? '',
    }),
  );

  const members = useMemo(
    () =>
      (membershipsQuery.data ?? []).filter(
        (row) =>
          row.status === 'ACTIVE' && row.volunteerId !== actingVolunteerId,
      ),
    [actingVolunteerId, membershipsQuery.data],
  );

  const rowsQuery = useQuery({
    ...volunteerUnavailabilityQuery({
      volunteerId,
      churchId: activeChurch?.id ?? '',
      leaderMinistryId: ministryId,
      actingVolunteerId: actingVolunteerId ?? undefined,
    }),
    enabled: Boolean(volunteerId && activeChurch?.id && ministryId && actingVolunteerId),
    select: (rows) => rows.filter((row) => row.ministry.id === ministryId),
  });

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

  const saveMutation = useMutation({
    mutationFn: async (input: {
      editingId: string | null;
      window: { startsAtUtc: string; endsAtUtc: string };
    }) => {
      if (!actingVolunteerId || !ministryId || !volunteerId) {
        throw new Error('Missing scope');
      }
      if (input.editingId) {
        return updateVolunteerUnavailability({
          unavailabilityId: input.editingId,
          leaderMinistryId: ministryId,
          actingVolunteerId,
          ...input.window,
        });
      }
      return createVolunteerUnavailability({
        volunteerId,
        ministryId,
        leaderMinistryId: ministryId,
        actingVolunteerId,
        ...input.window,
      });
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.unavailability(volunteerId, activeChurch?.id),
      });
      if (variables.editingId) {
        setStatusMessage(t('successUpdate'));
        cancelEdit();
      } else {
        setStatusMessage(t('successCreate'));
        setStartsAt('');
        setEndsAt('');
      }
    },
    onError: (err) => {
      const apiErrors: FieldErrors = {
        summary: err instanceof Error ? err.message : t('errors.summary'),
      };
      if (err instanceof ApiRequestError && err.code === 'INVALID_UNAVAILABILITY_WINDOW') {
        apiErrors.endsAt = err.message;
        delete apiErrors.summary;
      }
      setFieldErrors(apiErrors);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (unavailabilityId: string) => {
      if (!actingVolunteerId || !ministryId) {
        throw new Error('Missing scope');
      }
      return deleteVolunteerUnavailability({
        unavailabilityId,
        leaderMinistryId: ministryId,
        actingVolunteerId,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.unavailability(volunteerId, activeChurch?.id),
      });
      setStatusMessage(t('successDelete'));
    },
  });

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
    await saveMutation.mutateAsync({
      editingId,
      window: {
        startsAtUtc: datetimeLocalToUtcIso(startsAt, formTimeZone),
        endsAtUtc: datetimeLocalToUtcIso(endsAt, formTimeZone),
      },
    });
  }

  if (ledMinistries.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <p className="text-sm text-muted-foreground">{t('body')}</p>
        <Link to="/time-away" className="mt-4 inline-block text-sm text-primary underline">
          {t('selfServiceLink')}
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('eyebrow')}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('body')}</p>
        <Link to="/time-away" className="inline-block text-sm text-primary underline">
          {t('selfServiceLink')}
        </Link>
      </header>

      <div className="grid gap-4 rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)] md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{t('ministry')}</span>
          <select
            className="rounded-md border border-border bg-background px-3 py-2"
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
          <span className="font-medium">{t('volunteer')}</span>
          <select
            className="rounded-md border border-border bg-background px-3 py-2"
            value={volunteerId}
            disabled={!ministryId || membershipsQuery.isLoading}
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
            className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]"
            onSubmit={(event) => void handleSubmit(event)}
            noValidate
          >
            <h2 className="text-lg font-semibold">
              {editingId ? t('editHeading') : t('createHeading')}
            </h2>
            {fieldErrors.summary ? (
              <p role="alert" className="text-sm text-destructive">
                {fieldErrors.summary}
              </p>
            ) : null}
            {statusMessage ? (
              <p role="status" className="text-sm text-primary">
                {statusMessage}
              </p>
            ) : null}
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">{t('form.startsAt')}</span>
              <Input
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
              {fieldErrors.startsAt ? (
                <span className="text-destructive">{fieldErrors.startsAt}</span>
              ) : null}
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">{t('form.endsAt')}</span>
              <Input
                type="datetime-local"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
              />
              {fieldErrors.endsAt ? (
                <span className="text-destructive">{fieldErrors.endsAt}</span>
              ) : null}
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? t('form.submitting') : t('form.submit')}
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  {t('form.cancelEdit')}
                </Button>
              ) : null}
            </div>
          </form>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t('listHeading')}</h2>
            {rowsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">{t('loading')}</p>
            ) : rowsQuery.isError ? (
              <p role="alert" className="text-sm text-destructive">
                {rowsQuery.error instanceof Error
                  ? rowsQuery.error.message
                  : t('errors.summary')}
              </p>
            ) : (rowsQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('emptyState')}</p>
            ) : (
              <ul className="space-y-3">
                {(rowsQuery.data ?? []).map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-sm shadow-[var(--shadow-card)] md:flex-row md:items-center md:justify-between"
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
                        disabled={deleteMutation.isPending}
                        onClick={() => void deleteMutation.mutateAsync(row.id)}
                      >
                        {deleteMutation.isPending
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
