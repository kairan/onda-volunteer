import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { EventDetailPayload } from '@/eventDetailPayload';
import { useLocalTimeContext } from '@/settings/LocalTimeProvider';
import { SchedulingTimeDisplay } from '@/settings/SchedulingTimeDisplay';
import {
  useAuthSession,
  type AuthSessionContextValue,
} from '@/auth/AuthSessionProvider';
import {
  devAuthBypassAllowed,
  volunteerIdForProtectedRequests,
} from '@/auth/authSession';
import { useOrganization } from '@/organization/OrganizationContextProvider';
import { cancelEvent } from '@/events/cancelEvent';
import { editEvent } from '@/events/editEvent';
import { DestructiveConfirmDialog } from '@/components/DestructiveConfirmDialog';
import { ApiRequestError } from '@/apiError';
import { createAssignment } from '@/events/createAssignment';
import { releaseAssignment } from '@/events/releaseAssignment';
import { voidAssignment } from '@/events/voidAssignment';
import { createVolunteerUnavailability } from '@/identity/createVolunteerUnavailability';
import {
  fetchMinistryMemberships,
  type MinistryMembershipRow,
} from '@/organization/fetchMinistryMemberships';
import {
  fetchMinistryRoles,
  type MinistryRoleRow,
} from '@/organization/fetchMinistryRoles';
import { ministriesForWritePickers } from '@/organization/ministryArchive';
import { Button } from '@/components/ui/button';
import { useToasts } from '@/feedback/ToastHost';
import { cn } from '@/lib/utils';

function resolveActingVolunteerId(auth: AuthSessionContextValue): string | null {
  if (auth.status === 'authenticated' || auth.status === 'dev-bypass') {
    return auth.volunteerId;
  }
  if (auth.status === 'loading' && devAuthBypassAllowed()) {
    return volunteerIdForProtectedRequests() ?? null;
  }
  return null;
}

export function SchedulingEventDetailPending() {
  const { t } = useTranslation('scheduling');
  return (
    <section className="flex flex-col gap-8" aria-busy="true">
      <div className="h-32 w-full animate-pulse border-2 border-border bg-surface-2" aria-hidden />
      <div className="h-48 w-full animate-pulse border-2 border-border bg-surface-2" aria-hidden />
      <p className="sr-only">{t('detail.loading')}</p>
    </section>
  );
}

function defaultAssignmentWindow(payload: EventDetailPayload): {
  startsAtUtc: string;
  endsAtUtc: string;
} {
  const es = new Date(payload.event.window.startsAtUtc).getTime();
  const ee = new Date(payload.event.window.endsAtUtc).getTime();
  const slotStart = es + 60 * 60 * 1000;
  return {
    startsAtUtc: new Date(slotStart).toISOString(),
    endsAtUtc: new Date(ee).toISOString(),
  };
}

function mapAssignError(
  err: unknown,
  t: (key: string) => string,
): string {
  if (!(err instanceof ApiRequestError)) {
    return t('detail.errors.assignFailed');
  }
  switch (err.code) {
    case 'UNAVAILABILITY_BLOCKS_ASSIGN':
      return t('detail.errors.unavailabilityBlocksAssign');
    case 'ASSIGNMENT_OVERLAP':
      return t('detail.errors.assignmentOverlap');
    case 'OUTSIDE_EVENT_WINDOW':
      return t('detail.errors.outsideEventWindow');
    case 'MINISTRY_ARCHIVED':
      return t('detail.errors.ministryArchived');
    case 'LEADER_NOT_ASSIGNED':
      return t('detail.errors.notLeader');
    default:
      return err.message;
  }
}

function mapEditError(
  err: unknown,
  t: (key: string) => string,
): string {
  if (!(err instanceof ApiRequestError)) {
    return t('detail.edit.errors.failed');
  }
  switch (err.code) {
    case 'EVENT_ALREADY_CANCELLED':
      return t('detail.edit.errors.eventAlreadyCancelled');
    case 'EVENT_EDIT_EMPTY':
      return t('detail.edit.errors.eventEditEmpty');
    case 'EVENT_TITLE_REQUIRED':
      return t('detail.edit.errors.eventTitleRequired');
    case 'EVENT_TITLE_TOO_LONG':
      return t('detail.edit.errors.eventTitleTooLong');
    case 'INVALID_EVENT_WINDOW':
      return t('detail.edit.errors.invalidEventWindow');
    case 'LEADER_CANNOT_EDIT_PUBLIC_EVENT':
    case 'ADMIN_NOT_ACCREDITED':
      return t('detail.edit.errors.leaderCannotEditPublic');
    default:
      return err.message;
  }
}

export function SchedulingEventDetailView({ data }: { data: EventDetailPayload }) {
  const { t, i18n } = useTranslation('scheduling');
  const { buildDualInterval } = useLocalTimeContext();
  const router = useRouter();
  const toasts = useToasts();
  const auth = useAuthSession();
  const { activeChurch } = useOrganization();

  const actingVolunteerId = resolveActingVolunteerId(auth);

  const isAccreditedAdmin = activeChurch?.isAccreditedAdmin ?? false;

  const ledMinistries = useMemo(
    () =>
      ministriesForWritePickers(
        activeChurch?.ministries?.filter((m) => m.isLeader) ?? [],
      ),
    [activeChurch?.ministries],
  );

  const isLeaderForMinistry = useCallback(
    (ministryId: string) =>
      ledMinistries.some((ministry) => ministry.id === ministryId),
    [ledMinistries],
  );

  const isCancelled = Boolean(data.event.cancelledAtUtc);

  const privateEventMinistryId =
    data.event.kind === 'PRIVATE' ? (data.ministry?.id ?? null) : null;

  const canShowAssignForm = useMemo(() => {
    if (isCancelled || !actingVolunteerId) {
      return false;
    }
    if (data.event.kind === 'PRIVATE') {
      return (
        privateEventMinistryId !== null &&
        ledMinistries.some((ministry) => ministry.id === privateEventMinistryId)
      );
    }
    return ledMinistries.length > 0;
  }, [
    actingVolunteerId,
    data.event.kind,
    isCancelled,
    ledMinistries,
    privateEventMinistryId,
  ]);

  const [selectedMinistryId, setSelectedMinistryId] = useState('');

  useEffect(() => {
    if (data.event.kind === 'PUBLIC' && ledMinistries.length === 1 && !selectedMinistryId) {
      setSelectedMinistryId(ledMinistries[0].id);
    }
  }, [data.event.kind, ledMinistries, selectedMinistryId]);

  const formMinistryId =
    data.event.kind === 'PRIVATE'
      ? privateEventMinistryId
      : ledMinistries.length === 1
        ? ledMinistries[0].id
        : selectedMinistryId || null;

  const [memberships, setMemberships] = useState<MinistryMembershipRow[]>([]);
  const [roles, setRoles] = useState<MinistryRoleRow[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');

  useEffect(() => {
    if (!formMinistryId || !actingVolunteerId || !canShowAssignForm) {
      setMemberships([]);
      setRoles([]);
      setSelectedVolunteerId('');
      setSelectedRoleId('');
      setPickerError(null);
      return;
    }

    let cancelled = false;
    setPickerLoading(true);
    setPickerError(null);
    void Promise.all([
      fetchMinistryMemberships({
        ministryId: formMinistryId,
        actingVolunteerId,
      }),
      fetchMinistryRoles({
        ministryId: formMinistryId,
        actingVolunteerId,
      }),
    ])
      .then(([membershipRows, roleRows]) => {
        if (cancelled) {
          return;
        }
        const activeMembers = membershipRows.filter(
          (row) => row.status === 'ACTIVE',
        );
        const activeRoles = roleRows.filter((row) => !row.retired);
        setMemberships(activeMembers);
        setRoles(activeRoles);
        setSelectedVolunteerId((current) =>
          activeMembers.some((row) => row.volunteerId === current)
            ? current
            : (activeMembers[0]?.volunteerId ?? ''),
        );
        setSelectedRoleId((current) =>
          activeRoles.some((row) => row.id === current)
            ? current
            : (activeRoles[0]?.id ?? ''),
        );
        setPickerError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setMemberships([]);
          setRoles([]);
          setSelectedVolunteerId('');
          setSelectedRoleId('');
          setPickerError(
            err instanceof ApiRequestError
              ? err.message
              : t('detail.errors.pickerLoadFailed'),
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPickerLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [actingVolunteerId, canShowAssignForm, formMinistryId, t]);

  const canEdit = useMemo(() => {
    if (isCancelled || !actingVolunteerId) return false;
    if (isAccreditedAdmin) return true;
    if (data.event.kind === 'PRIVATE' && privateEventMinistryId) {
      return ledMinistries.some((m) => m.id === privateEventMinistryId);
    }
    return false;
  }, [
    isCancelled,
    actingVolunteerId,
    isAccreditedAdmin,
    data.event.kind,
    privateEventMinistryId,
    ledMinistries,
  ]);

  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(data.event.title);
  const [editStartsAtUtc, setEditStartsAtUtc] = useState(data.event.window.startsAtUtc);
  const [editEndsAtUtc, setEditEndsAtUtc] = useState(data.event.window.endsAtUtc);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const editHasChanges = useMemo(
    () =>
      editTitle !== data.event.title ||
      editStartsAtUtc !== data.event.window.startsAtUtc ||
      editEndsAtUtc !== data.event.window.endsAtUtc,
    [
      editTitle,
      editStartsAtUtc,
      editEndsAtUtc,
      data.event.title,
      data.event.window.startsAtUtc,
      data.event.window.endsAtUtc,
    ],
  );

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !editHasChanges) return;
    setEditBusy(true);
    setEditError(null);
    try {
      const patch: Record<string, string> = {};
      if (editTitle !== data.event.title) patch.title = editTitle;
      if (editStartsAtUtc !== data.event.window.startsAtUtc) patch.startsAtUtc = editStartsAtUtc;
      if (editEndsAtUtc !== data.event.window.endsAtUtc) patch.endsAtUtc = editEndsAtUtc;

      const result = await editEvent({
        eventId: data.event.id,
        actingVolunteerId,
        ...patch,
      });
      setEditOpen(false);
      if (result.voidedAssignmentCount > 0) {
        toasts.push({
          id: crypto.randomUUID(),
          kind: 'warning',
          message: t('detail.edit.voidedWarning', { count: result.voidedAssignmentCount }),
        });
      } else {
        toasts.push({
          id: crypto.randomUUID(),
          kind: 'success',
          message: t('detail.edit.success'),
        });
      }
      await router.invalidate();
    } catch (err) {
      setEditError(mapEditError(err, t));
    } finally {
      setEditBusy(false);
    }
  }

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(
    null,
  );

  const initialWindow = defaultAssignmentWindow(data);
  const [startsAtUtc, setStartsAtUtc] = useState(initialWindow.startsAtUtc);
  const [endsAtUtc, setEndsAtUtc] = useState(initialWindow.endsAtUtc);

  const [busy, setBusy] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [releaseError, setReleaseError] = useState<string | null>(null);
  const [offerError, setOfferError] = useState<string | null>(null);

  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null);
  const [removeBusy, setRemoveBusy] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const [releasedOffer, setReleasedOffer] = useState<{
    ministryId: string;
    startsAtUtc: string;
    endsAtUtc: string;
  } | null>(null);
  const [offerBusy, setOfferBusy] = useState(false);
  const [offerDone, setOfferDone] = useState(false);

  const volunteerId = actingVolunteerId;

  const timezone = data.church.defaultTimezone;

  const intervalStartOptions = {
    weekday: 'short' as const,
    month: 'short' as const,
    day: 'numeric' as const,
    hour: '2-digit' as const,
    minute: '2-digit' as const,
  };
  const intervalEndOptions = { hour: '2-digit' as const, minute: '2-digit' as const };

  const formatIntervalLabels = (startsAtUtc: string, endsAtUtc: string) =>
    buildDualInterval(
      startsAtUtc,
      endsAtUtc,
      timezone,
      i18n.language,
      intervalStartOptions,
      intervalEndOptions,
    );

  function pushSuccessToast(message: string) {
    toasts.push({ id: crypto.randomUUID(), kind: 'success', message });
  }

  async function handleCancelConfirm() {
    if (!actingVolunteerId) return;
    setCancelBusy(true);
    setCancelError(null);
    try {
      await cancelEvent({ eventId: data.event.id, actingVolunteerId });
      setCancelOpen(false);
      pushSuccessToast(t('detail.cancel.success'));
      await router.invalidate();
      await router.navigate({ to: '/scheduling' });
    } catch (err) {
      setCancelError(
        err instanceof Error ? err.message : t('detail.cancel.errors.failed'),
      );
    } finally {
      setCancelBusy(false);
    }
  }

  async function handleAssignSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formMinistryId || !selectedVolunteerId || !selectedRoleId) return;
    setBusy(true);
    setAssignError(null);
    try {
      await createAssignment({
        eventId: data.event.id,
        volunteerId: selectedVolunteerId,
        ministryId: formMinistryId,
        roleId: selectedRoleId,
        startsAtUtc,
        endsAtUtc,
      });
      await router.invalidate();
      pushSuccessToast(t('detail.assignSuccess'));
    } catch (err) {
      setAssignError(mapAssignError(err, t));
    } finally {
      setBusy(false);
    }
  }

  async function handleRelease(assignmentId: string) {
    if (!volunteerId) return;
    setBusy(true);
    setReleaseError(null);
    setReleasedOffer(null);
    setOfferDone(false);
    try {
      const res = await releaseAssignment({
        assignmentId,
        volunteerId,
      });
      setReleasedOffer({
        ministryId: res.ministryId,
        startsAtUtc: res.window.startsAtUtc,
        endsAtUtc: res.window.endsAtUtc,
      });
      await router.invalidate();
      pushSuccessToast(t('detail.releaseSuccess'));
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === 'ASSIGNMENT_NOT_OWNED') {
        setReleaseError(t('detail.errors.releaseNotOwned'));
      } else if (
        err instanceof ApiRequestError &&
        err.code === 'ASSIGNMENT_ALREADY_VOIDED'
      ) {
        setReleaseError(t('detail.errors.releaseAlreadyVoided'));
      } else if (
        err instanceof ApiRequestError &&
        err.code === 'SYSTEM_ADMIN_READ_ONLY'
      ) {
        setReleaseError(t('detail.errors.releaseReadOnly'));
      } else if (err instanceof ApiRequestError) {
        setReleaseError(err.message);
      } else {
        setReleaseError(t('detail.errors.releaseFailed'));
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveConfirm() {
    if (!removeTargetId || !actingVolunteerId) return;
    setRemoveBusy(true);
    setRemoveError(null);
    try {
      await voidAssignment({
        assignmentId: removeTargetId,
        actingVolunteerId,
      });
      setRemoveTargetId(null);
      await router.invalidate();
      pushSuccessToast(t('detail.removeSuccess'));
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === 'ASSIGNMENT_ALREADY_VOIDED') {
        setRemoveError(t('detail.errors.alreadyVoided'));
      } else if (err instanceof ApiRequestError && err.code === 'LEADER_NOT_ASSIGNED') {
        setRemoveError(t('detail.errors.notLeader'));
      } else if (
        err instanceof ApiRequestError &&
        err.code === 'SYSTEM_ADMIN_READ_ONLY'
      ) {
        setRemoveError(t('detail.errors.releaseReadOnly'));
      } else if (err instanceof ApiRequestError) {
        setRemoveError(err.message);
      } else {
        setRemoveError(t('detail.errors.removeFailed'));
      }
    } finally {
      setRemoveBusy(false);
    }
  }

  async function handleConfirmOffer() {
    if (!volunteerId || !releasedOffer) return;
    setOfferBusy(true);
    setOfferError(null);
    try {
      await createVolunteerUnavailability({
        volunteerId,
        ministryId: releasedOffer.ministryId,
        startsAtUtc: releasedOffer.startsAtUtc,
        endsAtUtc: releasedOffer.endsAtUtc,
      });
      setOfferDone(true);
      setReleasedOffer(null);
    } catch {
      setOfferError(t('detail.errors.unavailabilityFailed'));
    } finally {
      setOfferBusy(false);
    }
  }

  function canRemoveAssignment(
    assignment: EventDetailPayload['assignments'][number],
  ): boolean {
    if (assignment.volunteer.id === volunteerId) {
      return false;
    }
    return (
      isLeaderForMinistry(assignment.ministry.id) || isAccreditedAdmin
    );
  }

  const showMinistryPicker =
    canShowAssignForm &&
    data.event.kind === 'PUBLIC' &&
    ledMinistries.length > 1;

  return (
    <section className="flex flex-col gap-8">
      <div className="border-2 border-border bg-surface p-6 shadow-[8px_8px_0_0_hsl(var(--border))]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {data.church.name} · {t('detail.timezoneLabel', { tz: data.church.defaultTimezone })}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <p className="inline-block border-2 border-border bg-background px-2 py-1 text-xs font-semibold uppercase tracking-[0.24em]">
            {data.event.kind === 'PRIVATE'
              ? t('visibility.private')
              : t('visibility.public')}
          </p>
          {data.ministry ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary-foreground bg-primary px-1.5 py-0.5">
              {data.ministry.name}
            </p>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-display text-4xl font-extrabold uppercase leading-tight tracking-tight md:text-5xl">
            {data.event.title}
          </h1>
          {isAccreditedAdmin && !isCancelled ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setCancelOpen(true)}
            >
              {t('detail.cancel.action')}
            </Button>
          ) : null}
        </div>
        {isCancelled ? (
          <p
            role="status"
            className="mt-3 border-2 border-destructive bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive"
          >
            {t('detail.cancel.cancelledLabel')}
          </p>
        ) : null}
        <p className="mt-3 text-sm font-medium text-foreground">
          <SchedulingTimeDisplay
            labels={formatIntervalLabels(
              data.event.window.startsAtUtc,
              data.event.window.endsAtUtc,
            )}
          />
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {t('detail.utcWindow', {
            start: data.event.window.startsAtUtc,
            end: data.event.window.endsAtUtc,
          })}
        </p>
      </div>

      {canEdit ? (
        <section
          className="border-2 border-border bg-surface p-6 shadow-[8px_8px_0_0_hsl(var(--border))]"
          aria-labelledby="edit-event-heading"
        >
          {editOpen ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => void handleEditSubmit(e)}
              noValidate
            >
              <h2
                id="edit-event-heading"
                className="font-display text-2xl font-bold uppercase tracking-tight"
              >
                {t('detail.edit.heading')}
              </h2>
              <div className="flex flex-col gap-1">
                <label htmlFor="editTitle" className="text-sm font-semibold uppercase tracking-wide">
                  {t('detail.edit.titleLabel')}
                </label>
                <input
                  id="editTitle"
                  className="border-2 border-border bg-background px-3 py-2 text-sm"
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    setEditError(null);
                  }}
                  disabled={editBusy}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="editStartsAtUtc" className="text-sm font-semibold uppercase tracking-wide">
                  {t('detail.edit.startsAtUtcLabel')}
                </label>
                <input
                  id="editStartsAtUtc"
                  className="border-2 border-border bg-background px-3 py-2 font-mono text-sm"
                  value={editStartsAtUtc}
                  onChange={(e) => {
                    setEditStartsAtUtc(e.target.value);
                    setEditError(null);
                  }}
                  disabled={editBusy}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="editEndsAtUtc" className="text-sm font-semibold uppercase tracking-wide">
                  {t('detail.edit.endsAtUtcLabel')}
                </label>
                <input
                  id="editEndsAtUtc"
                  className="border-2 border-border bg-background px-3 py-2 font-mono text-sm"
                  value={editEndsAtUtc}
                  onChange={(e) => {
                    setEditEndsAtUtc(e.target.value);
                    setEditError(null);
                  }}
                  disabled={editBusy}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={editBusy || !editHasChanges}
                  className="self-start"
                >
                  {editBusy ? t('detail.saving') : t('detail.edit.submit')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={editBusy}
                  onClick={() => {
                    setEditOpen(false);
                    setEditError(null);
                    setEditTitle(data.event.title);
                    setEditStartsAtUtc(data.event.window.startsAtUtc);
                    setEditEndsAtUtc(data.event.window.endsAtUtc);
                  }}
                >
                  {t('create.cancel')}
                </Button>
              </div>
              {editError ? (
                <p
                  role="alert"
                  className="border-2 border-destructive bg-surface p-3 text-sm text-destructive font-semibold"
                >
                  {editError}
                </p>
              ) : null}
            </form>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              {t('detail.edit.heading')}
            </Button>
          )}
        </section>
      ) : null}

      {releasedOffer ? (
        <section
          className="flex flex-col gap-4 border-2 border-border bg-surface p-6 shadow-[8px_8px_0_0_hsl(var(--border))]"
          aria-labelledby="unavailability-offer-heading"
        >
          <h2 id="unavailability-offer-heading" className="font-display text-2xl font-bold uppercase tracking-tight">
            {t('detail.unavailabilityOffer.heading')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('detail.unavailabilityOffer.body', {
              start: releasedOffer.startsAtUtc,
              end: releasedOffer.endsAtUtc,
            })}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              disabled={offerBusy}
              onClick={() => void handleConfirmOffer()}
            >
              {offerBusy ? t('detail.saving') : t('detail.unavailabilityOffer.confirm')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={offerBusy}
              onClick={() => {
                setReleasedOffer(null);
                setOfferDone(false);
                setOfferError(null);
              }}
            >
              {t('detail.unavailabilityOffer.dismiss')}
            </Button>
          </div>
          {offerError ? (
            <p
              role="alert"
              className="border-2 border-destructive bg-surface p-3 text-sm text-destructive font-semibold"
            >
              {offerError}
            </p>
          ) : null}
        </section>
      ) : null}

      {offerDone ? (
        <p role="status" className="border-2 border-primary bg-primary/10 p-3 text-sm text-primary font-semibold">
          {t('detail.unavailabilityOffer.success')}
        </p>
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
            {t('detail.rosterHeading')}
          </h2>
          <Link
            to="/scheduling"
            className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            {t('detail.backToList')}
          </Link>
        </div>

        {releaseError ? (
          <p
            role="alert"
            className="border-2 border-destructive bg-surface p-3 text-sm text-destructive font-semibold"
          >
            {releaseError}
          </p>
        ) : null}

        {removeError ? (
          <p
            role="alert"
            className="border-2 border-destructive bg-surface p-3 text-sm text-destructive font-semibold"
          >
            {removeError}
          </p>
        ) : null}

        {data.assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-2 border-border bg-surface p-12 text-center text-muted-foreground">
            <p className="max-w-xs text-sm">{t('detail.emptyRoster')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto border-2 border-border bg-surface">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-2 border-border bg-surface-2">
                  <th scope="col" className="px-4 py-3 font-semibold normal-case tracking-normal">
                    {t('detail.columns.ministry')}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold normal-case tracking-normal">
                    {t('detail.columns.volunteer')}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold normal-case tracking-normal">
                    {t('detail.columns.role')}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold normal-case tracking-normal">
                    {t('detail.columns.interval')}
                  </th>
                  {volunteerId ? (
                    <th scope="col" className="px-4 py-3 font-semibold normal-case tracking-normal">
                      {/* Actions */}
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {data.assignments.map((assignment) => {
                  const selected = selectedAssignmentId === assignment.id;
                  const showRelease = assignment.volunteer.id === volunteerId;
                  const showRemove = canRemoveAssignment(assignment);
                  return (
                    <tr
                      key={assignment.id}
                      tabIndex={0}
                      onClick={() => setSelectedAssignmentId(assignment.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedAssignmentId(assignment.id);
                        }
                      }}
                      className={cn(
                        'cursor-pointer border-b border-border/40 transition-colors hover:bg-foreground/5',
                        selected &&
                          'border-l-2 border-l-foreground bg-foreground/5 hover:bg-foreground/5',
                      )}
                    >
                      <td className="px-4 py-3 font-medium">{assignment.ministry.name}</td>
                      <td className="px-4 py-3">{assignment.volunteer.displayName}</td>
                      <td className="px-4 py-3">{assignment.role.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <SchedulingTimeDisplay
                          labels={formatIntervalLabels(
                            assignment.window.startsAtUtc,
                            assignment.window.endsAtUtc,
                          )}
                        />
                        <span className="mt-1 block font-mono text-[11px] text-muted-foreground/80">
                          {assignment.window.startsAtUtc} → {assignment.window.endsAtUtc}
                        </span>
                      </td>
                      {volunteerId ? (
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {showRelease ? (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                disabled={busy}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleRelease(assignment.id);
                                }}
                              >
                                {t('detail.release')}
                              </Button>
                            ) : null}
                            {showRemove ? (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                disabled={busy || removeBusy}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRemoveError(null);
                                  setRemoveTargetId(assignment.id);
                                }}
                              >
                                {t('detail.remove')}
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DestructiveConfirmDialog
        open={cancelOpen}
        title={t('detail.cancel.dialogTitle')}
        description={t('detail.cancel.dialogBody')}
        confirmLabel={cancelBusy ? t('detail.saving') : t('detail.cancel.confirm')}
        onConfirm={() => void handleCancelConfirm()}
        onCancel={() => {
          if (!cancelBusy) {
            setCancelOpen(false);
            setCancelError(null);
          }
        }}
      />
      {cancelError ? (
        <p role="alert" className="text-sm text-destructive font-semibold">
          {cancelError}
        </p>
      ) : null}

      <DestructiveConfirmDialog
        open={removeTargetId !== null}
        title={t('detail.removeDialog.title')}
        description={t('detail.removeDialog.body')}
        confirmLabel={
          removeBusy ? t('detail.saving') : t('detail.removeDialog.confirm')
        }
        onConfirm={() => void handleRemoveConfirm()}
        onCancel={() => {
          if (!removeBusy) {
            setRemoveTargetId(null);
          }
        }}
      />

      {canShowAssignForm ? (
        <form
          className="flex flex-col gap-4 border-2 border-border bg-surface p-6 shadow-[8px_8px_0_0_hsl(var(--border))]"
          onSubmit={(e) => void handleAssignSubmit(e)}
          noValidate
          aria-labelledby="assign-heading"
        >
          <h2
            id="assign-heading"
            className="font-display text-2xl font-bold uppercase tracking-tight"
          >
            {t('detail.assignHeading')}
          </h2>

          <div className="flex flex-col gap-4">
            {pickerError ? (
              <p
                role="alert"
                className="border-2 border-destructive bg-surface p-3 text-sm text-destructive font-semibold"
              >
                {pickerError}
              </p>
            ) : null}

            {showMinistryPicker ? (
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="assignMinistryId"
                  className="text-sm font-semibold uppercase tracking-wide"
                >
                  {t('detail.ministryLabel')}
                </label>
                <select
                  id="assignMinistryId"
                  className="border-2 border-border bg-background px-3 py-2 text-sm"
                  value={selectedMinistryId}
                  onChange={(e) => {
                    setSelectedMinistryId(e.target.value);
                    setAssignError(null);
                    setPickerError(null);
                  }}
                  disabled={busy || pickerLoading}
                >
                  <option value="">{t('detail.ministryPlaceholder')}</option>
                  {ledMinistries.map((ministry) => (
                    <option key={ministry.id} value={ministry.id}>
                      {ministry.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="flex flex-col gap-1">
              <label
                htmlFor="assignVolunteerId"
                className="text-sm font-semibold uppercase tracking-wide"
              >
                {t('detail.volunteerLabel')}
              </label>
              <select
                id="assignVolunteerId"
                className="border-2 border-border bg-background px-3 py-2 text-sm"
                value={selectedVolunteerId}
                onChange={(e) => {
                  setSelectedVolunteerId(e.target.value);
                  setAssignError(null);
                }}
                disabled={busy || pickerLoading || !formMinistryId || memberships.length === 0}
              >
                {memberships.length === 0 ? (
                  <option value="">{t('detail.noActiveVolunteers')}</option>
                ) : (
                  memberships.map((row) => (
                    <option key={row.volunteerId} value={row.volunteerId}>
                      {row.displayName}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="assignRoleId"
                className="text-sm font-semibold uppercase tracking-wide"
              >
                {t('detail.roleLabel')}
              </label>
              <select
                id="assignRoleId"
                className="border-2 border-border bg-background px-3 py-2 text-sm"
                value={selectedRoleId}
                onChange={(e) => {
                  setSelectedRoleId(e.target.value);
                  setAssignError(null);
                }}
                disabled={busy || pickerLoading || !formMinistryId || roles.length === 0}
              >
                {roles.length === 0 ? (
                  <option value="">{t('detail.noActiveRoles')}</option>
                ) : (
                  roles.map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="startsAtUtc" className="text-sm font-semibold uppercase tracking-wide">
                {t('detail.startsAtUtcLabel')}
              </label>
              <input
                id="startsAtUtc"
                className="border-2 border-border bg-background px-3 py-2 font-mono text-sm"
                value={startsAtUtc}
                onChange={(e) => {
                  setStartsAtUtc(e.target.value);
                  setAssignError(null);
                }}
                disabled={busy}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="endsAtUtc" className="text-sm font-semibold uppercase tracking-wide">
                {t('detail.endsAtUtcLabel')}
              </label>
              <input
                id="endsAtUtc"
                className="border-2 border-border bg-background px-3 py-2 font-mono text-sm"
                value={endsAtUtc}
                onChange={(e) => {
                  setEndsAtUtc(e.target.value);
                  setAssignError(null);
                }}
                disabled={busy}
              />
            </div>

            <Button
              type="submit"
              disabled={
                busy ||
                pickerLoading ||
                !formMinistryId ||
                !selectedVolunteerId ||
                !selectedRoleId
              }
              className="self-start mt-2"
            >
              {busy ? t('detail.saving') : t('detail.createAssignment')}
            </Button>

            {assignError ? (
              <p
                role="alert"
                className="border-2 border-destructive bg-surface p-3 text-sm text-destructive font-semibold"
              >
                {assignError}
              </p>
            ) : null}
          </div>
        </form>
      ) : null}
    </section>
  );
}
