import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/api/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ministriesForWritePickers } from '@/organization/ministryArchive';
import { useOrganization } from '@/organization/OrganizationProvider';
import { useLocalTimeContext } from '@/settings/LocalTimeProvider';
import { SchedulingTimeDisplay } from '@/settings/SchedulingTimeDisplay';
import { queryKeys } from '@/query/queryKeys';
import {
  createVolunteerUnavailability,
  deleteVolunteerUnavailability,
  updateVolunteerUnavailability,
} from '@/volunteer/unavailabilityMutations';
import { volunteerUnavailabilityQuery } from '@/volunteer/volunteerUnavailabilityQuery';
import type { VolunteerUnavailability } from '@/volunteer/types';

type FieldErrors = {
  ministryId?: string;
  startsAt?: string;
  endsAt?: string;
  summary?: string;
};

type EditFieldErrors = {
  startsAt?: string;
  endsAt?: string;
  summary?: string;
};

function utcIsoToDatetimeLocalInput(isoUtc: string): string {
  return isoUtc.slice(0, 16);
}

function datetimeLocalToUtcIso(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${value}:00.000Z`;
  }
  return new Date(value).toISOString();
}

export function TimeAwayPage() {
  const { t, i18n } = useTranslation('timeAway');
  const auth = useAuthSession();
  const queryClient = useQueryClient();
  const { activeChurch, activeCampus } = useOrganization();
  const { buildDualInterval } = useLocalTimeContext();

  const volunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;
  const churchId = activeChurch?.id ?? null;

  const rowsQuery = useQuery(
    volunteerUnavailabilityQuery({
      volunteerId: volunteerId ?? '',
      churchId: churchId ?? '',
    }),
  );

  const [ministryId, setMinistryId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [editingRow, setEditingRow] = useState<VolunteerUnavailability | null>(
    null,
  );
  const [editStartsAt, setEditStartsAt] = useState('');
  const [editEndsAt, setEditEndsAt] = useState('');
  const [editFieldErrors, setEditFieldErrors] = useState<EditFieldErrors>({});

  const [deleteTarget, setDeleteTarget] = useState<VolunteerUnavailability | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const ministries = useMemo(
    () => ministriesForWritePickers(activeChurch?.ministries ?? []),
    [activeChurch?.ministries],
  );

  const timezone =
    activeCampus?.timezone ?? activeChurch?.defaultTimezone ?? 'UTC';
  const intervalOptions = {
    weekday: 'short' as const,
    month: 'short' as const,
    day: 'numeric' as const,
    hour: '2-digit' as const,
    minute: '2-digit' as const,
  };

  const invalidateUnavailability = async () => {
    if (!volunteerId) {
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: queryKeys.unavailability(volunteerId, churchId),
    });
  };

  const createMutation = useMutation({
    mutationFn: createVolunteerUnavailability,
    onSuccess: async () => {
      setMinistryId('');
      setStartsAt('');
      setEndsAt('');
      setFieldErrors({});
      await invalidateUnavailability();
    },
    onError: (error) => {
      if (error instanceof ApiRequestError) {
        setFieldErrors({ summary: error.message });
        return;
      }
      setFieldErrors({ summary: t('errors.summary') });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateVolunteerUnavailability,
    onSuccess: async () => {
      setEditingRow(null);
      setEditFieldErrors({});
      await invalidateUnavailability();
    },
    onError: (error) => {
      if (error instanceof ApiRequestError) {
        setEditFieldErrors({ summary: error.message });
        return;
      }
      setEditFieldErrors({ summary: t('errors.summary') });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVolunteerUnavailability,
    onSuccess: async () => {
      setDeleteTarget(null);
      setDeleteError(null);
      await invalidateUnavailability();
    },
    onError: (error) => {
      if (error instanceof ApiRequestError) {
        setDeleteError(error.message);
        return;
      }
      setDeleteError(t('errors.deleteFailed'));
    },
  });

  function validateCreateForm(): FieldErrors {
    const next: FieldErrors = {};
    if (!ministryId) {
      next.ministryId = t('errors.ministryRequired');
    }
    if (!startsAt) {
      next.startsAt = t('errors.startsAtRequired');
    }
    if (!endsAt) {
      next.endsAt = t('errors.endsAtRequired');
    }
    if (startsAt && endsAt) {
      const start = new Date(datetimeLocalToUtcIso(startsAt)).getTime();
      const end = new Date(datetimeLocalToUtcIso(endsAt)).getTime();
      if (!(start < end)) {
        next.endsAt = t('errors.invalidWindow');
      }
    }
    return next;
  }

  function validateEditForm(): EditFieldErrors {
    const next: EditFieldErrors = {};
    if (!editStartsAt) {
      next.startsAt = t('errors.startsAtRequired');
    }
    if (!editEndsAt) {
      next.endsAt = t('errors.endsAtRequired');
    }
    if (editStartsAt && editEndsAt) {
      const start = new Date(datetimeLocalToUtcIso(editStartsAt)).getTime();
      const end = new Date(datetimeLocalToUtcIso(editEndsAt)).getTime();
      if (!(start < end)) {
        next.endsAt = t('errors.invalidWindow');
      }
    }
    return next;
  }

  function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!volunteerId) {
      return;
    }
    const nextErrors = validateCreateForm();
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    createMutation.mutate({
      volunteerId,
      ministryId,
      startsAtUtc: datetimeLocalToUtcIso(startsAt),
      endsAtUtc: datetimeLocalToUtcIso(endsAt),
    });
  }

  function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!volunteerId || !editingRow) {
      return;
    }
    const nextErrors = validateEditForm();
    setEditFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    updateMutation.mutate({
      unavailabilityId: editingRow.id,
      actingVolunteerId: volunteerId,
      startsAtUtc: datetimeLocalToUtcIso(editStartsAt),
      endsAtUtc: datetimeLocalToUtcIso(editEndsAt),
    });
  }

  function startEditing(row: VolunteerUnavailability) {
    setEditingRow(row);
    setEditStartsAt(utcIsoToDatetimeLocalInput(row.startsAtUtc));
    setEditEndsAt(utcIsoToDatetimeLocalInput(row.endsAtUtc));
    setEditFieldErrors({});
  }

  const groupedByMinistry = useMemo(() => {
    const groups = new Map<
      string,
      { id: string; name: string; rows: VolunteerUnavailability[] }
    >();
    for (const row of rowsQuery.data ?? []) {
      const existing = groups.get(row.ministry.id);
      if (existing) {
        existing.rows.push(row);
      } else {
        groups.set(row.ministry.id, {
          id: row.ministry.id,
          name: row.ministry.name,
          rows: [row],
        });
      }
    }
    return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [rowsQuery.data]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('eyebrow')}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('body')}</p>
      </header>

      <section aria-labelledby="time-away-create-heading">
        <h2 id="time-away-create-heading" className="text-base font-semibold">
          {t('createHeading')}
        </h2>
        <form
          className="mt-4 space-y-4 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-card)]"
          onSubmit={handleCreateSubmit}
        >
          <div className="space-y-1">
            <label htmlFor="time-away-ministry" className="text-sm font-medium">
              {t('form.ministry')}
            </label>
            <select
              id="time-away-ministry"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={ministryId}
              onChange={(event) => setMinistryId(event.target.value)}
            >
              <option value="">{t('form.ministry')}</option>
              {ministries.map((ministry) => (
                <option key={ministry.id} value={ministry.id}>
                  {ministry.name}
                </option>
              ))}
            </select>
            {fieldErrors.ministryId ? (
              <p className="text-xs text-destructive">{fieldErrors.ministryId}</p>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="time-away-starts" className="text-sm font-medium">
                {t('form.startsAt')}
              </label>
              <Input
                id="time-away-starts"
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
              {fieldErrors.startsAt ? (
                <p className="text-xs text-destructive">{fieldErrors.startsAt}</p>
              ) : null}
            </div>
            <div className="space-y-1">
              <label htmlFor="time-away-ends" className="text-sm font-medium">
                {t('form.endsAt')}
              </label>
              <Input
                id="time-away-ends"
                type="datetime-local"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
              />
              {fieldErrors.endsAt ? (
                <p className="text-xs text-destructive">{fieldErrors.endsAt}</p>
              ) : null}
            </div>
          </div>
          {fieldErrors.summary ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.summary}
            </p>
          ) : null}
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? t('form.submitting') : t('form.submit')}
          </Button>
        </form>
      </section>

      <section aria-labelledby="time-away-list-heading">
        <h2 id="time-away-list-heading" className="text-base font-semibold">
          {t('listHeading')}
        </h2>
        {rowsQuery.isLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">{t('loading')}</p>
        ) : groupedByMinistry.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t('emptyState')}</p>
        ) : (
          <div className="mt-4 space-y-6">
            {groupedByMinistry.map((group) => (
              <div key={group.id}>
                <h3 className="text-sm font-medium text-muted-foreground">
                  {group.name}
                </h3>
                <ul className="mt-2 divide-y divide-border rounded-lg border border-border bg-card shadow-[var(--shadow-card)]">
                  {group.rows.map((row) => (
                    <li key={row.id} className="px-4 py-3">
                      {editingRow?.id === row.id ? (
                        <form className="space-y-3" onSubmit={handleEditSubmit}>
                          <p className="text-sm font-medium">{t('editHeading')}</p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Input
                              type="datetime-local"
                              value={editStartsAt}
                              onChange={(event) =>
                                setEditStartsAt(event.target.value)
                              }
                              aria-label={t('form.startsAt')}
                            />
                            <Input
                              type="datetime-local"
                              value={editEndsAt}
                              onChange={(event) => setEditEndsAt(event.target.value)}
                              aria-label={t('form.endsAt')}
                            />
                          </div>
                          {editFieldErrors.startsAt ? (
                            <p className="text-xs text-destructive">
                              {editFieldErrors.startsAt}
                            </p>
                          ) : null}
                          {editFieldErrors.endsAt ? (
                            <p className="text-xs text-destructive">
                              {editFieldErrors.endsAt}
                            </p>
                          ) : null}
                          {editFieldErrors.summary ? (
                            <p className="text-sm text-destructive" role="alert">
                              {editFieldErrors.summary}
                            </p>
                          ) : null}
                          <div className="flex gap-2">
                            <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                              {updateMutation.isPending
                                ? t('form.submitting')
                                : t('form.saveEdit')}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingRow(null)}
                            >
                              {t('form.cancelEdit')}
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">
                              <SchedulingTimeDisplay
                                labels={buildDualInterval(
                                  row.startsAtUtc,
                                  row.endsAtUtc,
                                  timezone,
                                  i18n.language,
                                  intervalOptions,
                                  intervalOptions,
                                )}
                              />
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(row)}
                            >
                              {t('actions.edit')}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                              setDeleteTarget(row);
                              setDeleteError(null);
                            }}
                            >
                              {t('actions.delete')}
                            </Button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteConfirm.title')}</DialogTitle>
            <DialogDescription>{t('deleteConfirm.body')}</DialogDescription>
          </DialogHeader>
          {deleteError ? (
            <p className="text-sm text-destructive" role="alert">
              {deleteError}
            </p>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteError(null);
              }}
            >
              {t('deleteConfirm.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (!volunteerId || !deleteTarget) {
                  return;
                }
                deleteMutation.mutate({
                  unavailabilityId: deleteTarget.id,
                  actingVolunteerId: volunteerId,
                });
              }}
            >
              {deleteMutation.isPending
                ? t('actions.deleting')
                : t('deleteConfirm.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
