import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/api/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

const intervalFormatOptions: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
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

function formatTimeAwayInterval(
  startsAtUtc: string,
  endsAtUtc: string,
  timezone: string,
  locale: string,
): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    ...intervalFormatOptions,
  });
  const start = formatter.format(new Date(startsAtUtc));
  const end = formatter.format(new Date(endsAtUtc));
  return `${start} → ${end}`;
}

function useVolunteerId(): string | null {
  const auth = useAuthSession();
  if (auth.status === 'authenticated' || auth.status === 'dev-bypass') {
    return auth.volunteerId;
  }
  return null;
}

export function TimeAwayPage() {
  const { t, i18n } = useTranslation('timeAway');
  const volunteerId = useVolunteerId();
  const queryClient = useQueryClient();
  const { activeChurch, activeCampus, workingContext } = useOrganization();

  const churchId = activeChurch?.id ?? null;
  const rowsQuery = useQuery(
    volunteerUnavailabilityQuery({
      volunteerId: volunteerId ?? '',
      churchId: churchId ?? '',
    }),
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [ministryId, setMinistryId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [editingRow, setEditingRow] = useState<VolunteerUnavailability | null>(
    null,
  );
  const [editStartsAt, setEditStartsAt] = useState('');
  const [editEndsAt, setEditEndsAt] = useState('');
  const [editFieldErrors, setFieldErrorsForEdit] = useState<FieldErrors>({});

  const [deleteTarget, setDeleteTarget] = useState<VolunteerUnavailability | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const ministries = useMemo(
    () => ministriesForWritePickers(activeChurch?.ministries ?? []),
    [activeChurch?.ministries],
  );

  const defaultMinistryId =
    workingContext?.mode === 'volunteer' ? workingContext.ministryId : '';

  useEffect(() => {
    if (createOpen) {
      setMinistryId(defaultMinistryId);
      setStartsAt('');
      setEndsAt('');
      setFieldErrors({});
    }
  }, [createOpen, defaultMinistryId]);

  const timezone =
    activeCampus?.timezone ?? activeChurch?.defaultTimezone ?? 'UTC';

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
      setCreateOpen(false);
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
      setFieldErrorsForEdit({});
      await invalidateUnavailability();
    },
    onError: (error) => {
      if (error instanceof ApiRequestError) {
        setFieldErrorsForEdit({ summary: error.message });
        return;
      }
      setFieldErrorsForEdit({ summary: t('errors.summary') });
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

  function validateEditForm(): FieldErrors {
    const next: FieldErrors = {};
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
    setFieldErrorsForEdit(nextErrors);
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
    setFieldErrorsForEdit({});
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
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('eyebrow')}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('body')}</p>
      </header>

      <section aria-labelledby="time-away-list-heading">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 id="time-away-list-heading" className="text-base font-semibold">
              {t('listHeading')}
            </h2>
            <p className="text-sm text-muted-foreground">{t('body')}</p>
          </div>
          <Button
            size="sm"
            type="button"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t('form.addPeriod')}
          </Button>
        </div>

        {rowsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        ) : groupedByMinistry.length === 0 ? (
          <Card className="rounded-lg border border-border p-6 text-center text-sm text-muted-foreground shadow-card">
            {t('emptyState')}
          </Card>
        ) : (
          <div className="space-y-6">
            {groupedByMinistry.map((group) => (
              <div key={group.id}>
                <h3 className="text-sm font-medium text-muted-foreground">
                  {group.name}
                </h3>
                <Card className="mt-2 overflow-hidden rounded-lg border border-border p-0 shadow-card">
                  <ul className="divide-y divide-border">
                    {group.rows.map((row) => (
                      <li
                        key={row.id}
                        className="flex items-center gap-4 px-4 py-3"
                      >
                        <Clock
                          className="h-4 w-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {formatTimeAwayInterval(
                              row.startsAtUtc,
                              row.endsAtUtc,
                              timezone,
                              i18n.language,
                            )}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          type="button"
                          aria-label={t('actions.edit')}
                          onClick={() => startEditing(row)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          type="button"
                          aria-label={t('actions.delete')}
                          onClick={() => {
                            setDeleteTarget(row);
                            setDeleteError(null);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>{t('createHeading')}</DialogTitle>
              <DialogDescription>{t('dialogDescription')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
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
              <div className="grid gap-3 sm:grid-cols-2">
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
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                {t('deleteConfirm.cancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? t('form.submitting') : t('form.submit')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editingRow !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingRow(null);
            setFieldErrorsForEdit({});
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>{t('editHeading')}</DialogTitle>
              <DialogDescription>{t('dialogDescription')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="time-away-edit-starts" className="text-sm font-medium">
                    {t('form.startsAt')}
                  </label>
                  <Input
                    id="time-away-edit-starts"
                    type="datetime-local"
                    value={editStartsAt}
                    onChange={(event) => setEditStartsAt(event.target.value)}
                  />
                  {editFieldErrors.startsAt ? (
                    <p className="text-xs text-destructive">
                      {editFieldErrors.startsAt}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1">
                  <label htmlFor="time-away-edit-ends" className="text-sm font-medium">
                    {t('form.endsAt')}
                  </label>
                  <Input
                    id="time-away-edit-ends"
                    type="datetime-local"
                    value={editEndsAt}
                    onChange={(event) => setEditEndsAt(event.target.value)}
                  />
                  {editFieldErrors.endsAt ? (
                    <p className="text-xs text-destructive">
                      {editFieldErrors.endsAt}
                    </p>
                  ) : null}
                </div>
              </div>
              {editFieldErrors.summary ? (
                <p className="text-sm text-destructive" role="alert">
                  {editFieldErrors.summary}
                </p>
              ) : null}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingRow(null)}
              >
                {t('form.cancelEdit')}
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? t('form.submitting') : t('form.saveEdit')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
