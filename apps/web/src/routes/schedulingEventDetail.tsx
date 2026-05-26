import { useState } from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { EventDetailPayload } from '@/eventDetailPayload';
import { useLocalTimeContext } from '@/settings/LocalTimeProvider';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { useOrganization } from '@/organization/OrganizationContextProvider';
import { cancelEvent } from '@/events/cancelEvent';
import { DestructiveConfirmDialog } from '@/components/DestructiveConfirmDialog';
import { createAssignment } from '@/events/createAssignment';
import { releaseAssignment } from '@/events/releaseAssignment';
import { createVolunteerUnavailability } from '@/identity/createVolunteerUnavailability';
import { Button } from '@/components/ui/button';
import { useToasts } from '@/feedback/ToastHost';
import { cn } from '@/lib/utils';

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

export function SchedulingEventDetailView({ data }: { data: EventDetailPayload }) {
  const { t, i18n } = useTranslation('scheduling');
  const { formatWithLocal } = useLocalTimeContext();
  const router = useRouter();
  const toasts = useToasts();
  const auth = useAuthSession();
  const { activeChurch } = useOrganization();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const isAdminAccredited = activeChurch?.isAdminAccredited ?? false;

  const isCancelled = Boolean(data.event.cancelledAtUtc);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(
    null,
  );

  const demoMinistry = import.meta.env.VITE_DEMO_MINISTRY_ID as string | undefined;
  const demoVolunteer = import.meta.env.VITE_DEMO_VOLUNTEER_ID as string | undefined;
  const demoRole = import.meta.env.VITE_DEMO_ROLE_ID as string | undefined;

  const canAssign =
    !isCancelled &&
    data.event.kind === 'PUBLIC' &&
    Boolean(demoMinistry && demoVolunteer && demoRole);

  const initialWindow = defaultAssignmentWindow(data);
  const [startsAtUtc, setStartsAtUtc] = useState(initialWindow.startsAtUtc);
  const [endsAtUtc, setEndsAtUtc] = useState(initialWindow.endsAtUtc);

  const [busy, setBusy] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [releaseError, setReleaseError] = useState<string | null>(null);
  const [offerError, setOfferError] = useState<string | null>(null);

  const [releasedOffer, setReleasedOffer] = useState<{
    ministryId: string;
    startsAtUtc: string;
    endsAtUtc: string;
  } | null>(null);
  const [offerBusy, setOfferBusy] = useState(false);
  const [offerDone, setOfferDone] = useState(false);

  const volunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const timezone = data.church.defaultTimezone;

  const formatInterval = (startsAtUtc: string, endsAtUtc: string) => {
    const start = formatWithLocal(startsAtUtc, timezone, i18n.language, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const end = formatWithLocal(endsAtUtc, timezone, i18n.language, {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${start} → ${end}`;
  };

  const formatEventWindow = () =>
    formatInterval(data.event.window.startsAtUtc, data.event.window.endsAtUtc);

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
    if (!demoMinistry || !demoVolunteer || !demoRole) return;
    setBusy(true);
    setAssignError(null);
    try {
      await createAssignment({
        eventId: data.event.id,
        volunteerId: demoVolunteer,
        ministryId: demoMinistry,
        roleId: demoRole,
        startsAtUtc,
        endsAtUtc,
      });
      await router.invalidate();
      pushSuccessToast(t('detail.assignSuccess'));
    } catch (err) {
      setAssignError(
        err instanceof Error ? err.message : 'Failed to create assignment',
      );
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
      setReleaseError(
        err instanceof Error ? err.message : 'Failed to release assignment',
      );
    } finally {
      setBusy(false);
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
    } catch (err) {
      setOfferError(
        err instanceof Error ? err.message : 'Failed to record unavailability',
      );
    } finally {
      setOfferBusy(false);
    }
  }

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
          {isAdminAccredited && !isCancelled ? (
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
        <p className="mt-3 text-sm font-medium text-foreground">{formatEventWindow()}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {t('detail.utcWindow', {
            start: data.event.window.startsAtUtc,
            end: data.event.window.endsAtUtc,
          })}
        </p>
      </div>

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
                        {formatInterval(
                          assignment.window.startsAtUtc,
                          assignment.window.endsAtUtc,
                        )}
                        <span className="mt-1 block font-mono text-[11px] text-muted-foreground/80">
                          {assignment.window.startsAtUtc} → {assignment.window.endsAtUtc}
                        </span>
                      </td>
                      {volunteerId ? (
                        <td className="px-4 py-3 text-right">
                          {assignment.volunteer.id === volunteerId ? (
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

      {canAssign ? (
        <form
          className="flex flex-col gap-4 border-2 border-border bg-surface p-6 shadow-[8px_8px_0_0_hsl(var(--border))]"
          onSubmit={(e) => void handleAssignSubmit(e)}
          noValidate
          aria-labelledby="assign-demo-heading"
        >
          <h2
            id="assign-demo-heading"
            className="font-display text-2xl font-bold uppercase tracking-tight"
          >
            {t('detail.assignHeading')}
          </h2>
          <p className="text-sm text-muted-foreground">{t('detail.assignDemoHelp')}</p>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="startsAtUtc" className="text-sm font-semibold uppercase tracking-wide">
                startsAtUtc
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
                endsAtUtc
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

            <Button type="submit" disabled={busy} className="self-start mt-2">
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
