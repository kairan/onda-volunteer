import { Link } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/api/apiError';
import {
  devAuthBypassAllowed,
  volunteerIdForProtectedRequests,
} from '@/auth/authSession';
import { useAuthSession, type AuthSessionContextValue } from '@/auth/AuthSessionProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RosterByEventSection } from '@/components/RosterByEventSection';
import type { EventDetailPayload } from '@/eventDetailPayload';
import {
  createAssignment,
  invalidateAfterAssignOrRelease,
} from '@/leader/assignMutation';
import {
  invalidateAfterCapacityUpdate,
  updateRoleCapacities,
} from '@/leader/capacityMutation';
import {
  buildRosterRows,
  defaultAssignmentWindow,
} from '@/leader/buildRosterRows';
import { eventDetailQuery } from '@/leader/eventDetailQuery';
import { voidAssignment } from '@/leader/releaseMutation';
import { ministriesForWritePickers } from '@/organization/ministryArchive';
import { useOrganization } from '@/organization/OrganizationProvider';
import type { MinistrySummary } from '@/organization/types';
import {
  ministryMembershipsQuery,
  ministryRolesQuery,
} from '@/organization/ministryStructureQueries';
import { useLocalTimeContext } from '@/settings/LocalTimeProvider';
import { SchedulingTimeDisplay } from '@/settings/SchedulingTimeDisplay';
import { Skeleton } from '@/components/ui/skeleton';

function mapAssignError(err: unknown, t: (key: string) => string): string {
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
    case 'ROLE_SLOTS_FULL':
      return t('detail.errors.roleSlotsFull');
    case 'VOLUNTEER_ALREADY_ON_ROLE_SLOT':
      return t('detail.errors.volunteerAlreadyOnRoleSlot');
    default:
      return err.message;
  }
}

function mapCapacityError(err: unknown, t: (key: string) => string): string {
  if (!(err instanceof ApiRequestError)) {
    return t('detail.capacityEditor.errors.failed');
  }
  switch (err.code) {
    case 'CAPACITY_BELOW_FILLED_SLOTS':
      return t('detail.capacityEditor.errors.belowFilled');
    case 'INVALID_ROLE_CAPACITY':
      return t('detail.capacityEditor.errors.invalidCapacity');
    default:
      return err.message;
  }
}

function resolveActingVolunteerId(auth: AuthSessionContextValue): string | null {
  if (auth.status === 'authenticated' || auth.status === 'dev-bypass') {
    return auth.volunteerId;
  }
  if (auth.status === 'loading' && devAuthBypassAllowed()) {
    return volunteerIdForProtectedRequests() ?? null;
  }
  return null;
}

function resolveFormMinistryId(input: {
  eventKind: 'PUBLIC' | 'PRIVATE';
  privateMinistryId: string | null;
  activeMinistryId: string | null | undefined;
  ledInActiveChurch: MinistrySummary[];
  allLedMinistries: MinistrySummary[];
  assignmentMinistryIds: string[];
}): string | null {
  if (input.eventKind === 'PRIVATE') {
    return input.privateMinistryId;
  }

  const {
    activeMinistryId,
    ledInActiveChurch,
    allLedMinistries,
    assignmentMinistryIds,
  } = input;

  if (
    activeMinistryId &&
    ledInActiveChurch.some((ministry) => ministry.id === activeMinistryId)
  ) {
    return activeMinistryId;
  }
  if (ledInActiveChurch.length === 1) {
    return ledInActiveChurch[0].id;
  }
  if (ledInActiveChurch.length > 0) {
    return ledInActiveChurch[0].id;
  }

  const fromAssignments = allLedMinistries.find((ministry) =>
    assignmentMinistryIds.includes(ministry.id),
  );
  if (fromAssignments) {
    return fromAssignments.id;
  }

  return allLedMinistries[0]?.id ?? null;
}

function mapReleaseError(err: unknown, t: (key: string) => string): string {
  if (!(err instanceof ApiRequestError)) {
    return t('detail.errors.removeFailed');
  }
  switch (err.code) {
    case 'ASSIGNMENT_ALREADY_VOIDED':
      return t('detail.errors.alreadyVoided');
    case 'LEADER_NOT_ASSIGNED':
      return t('detail.errors.notLeader');
    case 'SYSTEM_ADMIN_READ_ONLY':
      return t('detail.errors.releaseReadOnly');
    default:
      return err.message;
  }
}

export function SchedulingEventDetailPending() {
  const { t } = useTranslation('scheduling');
  return (
    <section className="flex flex-col gap-4">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-32 w-full" />
      <p className="sr-only">{t('detail.loading')}</p>
    </section>
  );
}

export function SchedulingEventDetailView({ data }: { data: EventDetailPayload }) {
  const { t, i18n } = useTranslation('scheduling');
  const auth = useAuthSession();
  const queryClient = useQueryClient();
  const { churches, activeChurch, activeCampus, activeMinistry } = useOrganization();
  const { buildDualInterval } = useLocalTimeContext();

  const actingVolunteerId = resolveActingVolunteerId(auth);

  const ledMinistries = useMemo(
    () =>
      ministriesForWritePickers(
        activeChurch?.ministries.filter((ministry) => ministry.isLeader) ?? [],
      ),
    [activeChurch?.ministries],
  );

  const allLedMinistries = useMemo(
    () =>
      ministriesForWritePickers(
        churches.flatMap((church) =>
          church.ministries.filter((ministry) => ministry.isLeader),
        ),
      ),
    [churches],
  );

  const detailQuery = useQuery(
    eventDetailQuery({
      eventId: data.event.id,
      volunteerId: actingVolunteerId ?? '',
    }),
  );
  const payload = detailQuery.data ?? data;

  const formMinistryId = useMemo(
    () =>
      resolveFormMinistryId({
        eventKind: data.event.kind,
        privateMinistryId: data.ministry?.id ?? null,
        activeMinistryId: activeMinistry?.id,
        ledInActiveChurch: ledMinistries,
        allLedMinistries,
        assignmentMinistryIds: payload.assignments.map(
          (assignment) => assignment.ministry.id,
        ),
      }),
    [
      activeMinistry?.id,
      allLedMinistries,
      data.event.kind,
      data.ministry?.id,
      ledMinistries,
      payload.assignments,
    ],
  );

  const rolesQuery = useQuery(
    ministryRolesQuery({
      ministryId: formMinistryId ?? '',
      actingVolunteerId: actingVolunteerId ?? '',
    }),
  );
  const membershipsQuery = useQuery(
    ministryMembershipsQuery({
      ministryId: formMinistryId ?? '',
      actingVolunteerId: actingVolunteerId ?? '',
    }),
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

  const roster = useMemo(() => {
    if (!formMinistryId) {
      return [];
    }
    return buildRosterRows({
      eventId: payload.event.id,
      roles: rolesQuery.data ?? [],
      roleCapacities: payload.roleCapacities ?? [],
      assignments: payload.assignments,
      ministryId: formMinistryId,
    });
  }, [formMinistryId, payload.assignments, payload.event.id, payload.roleCapacities, rolesQuery.data]);

  const [busyRoleKey, setBusyRoleKey] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{
    roleKey: string;
    message: string;
  } | null>(null);
  const [assignRoleId, setAssignRoleId] = useState<string | null>(null);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [assignError, setAssignError] = useState<string | null>(null);
  const [capacityDraft, setCapacityDraft] = useState<Record<string, number>>({});
  const [capacityError, setCapacityError] = useState<string | null>(null);
  const [capacitySuccess, setCapacitySuccess] = useState(false);

  const initialWindow = defaultAssignmentWindow(payload);
  const [startsAtUtc, setStartsAtUtc] = useState(initialWindow.startsAtUtc);
  const [endsAtUtc, setEndsAtUtc] = useState(initialWindow.endsAtUtc);

  useEffect(() => {
    const window = defaultAssignmentWindow(payload);
    setStartsAtUtc(window.startsAtUtc);
    setEndsAtUtc(window.endsAtUtc);
  }, [payload.event.id, payload.event.window.endsAtUtc, payload.event.window.startsAtUtc]);

  const activeRoles = (rolesQuery.data ?? []).filter((role) => !role.retired);

  useEffect(() => {
    if (!formMinistryId) {
      setCapacityDraft({});
      return;
    }
    const roles = (rolesQuery.data ?? []).filter((role) => !role.retired);
    const nextDraft: Record<string, number> = {};
    for (const role of roles) {
      const existing = payload.roleCapacities.find(
        (entry) =>
          entry.ministryId === formMinistryId && entry.roleId === role.id,
      );
      nextDraft[role.id] = existing?.capacity ?? 1;
    }
    setCapacityDraft(nextDraft);
    setCapacityError(null);
  }, [formMinistryId, payload.event.id, payload.roleCapacities, rolesQuery.data]);

  const activeMembers = (membershipsQuery.data ?? []).filter(
    (row) => row.status === 'ACTIVE',
  );

  useEffect(() => {
    if (assignRoleId && activeMembers.length > 0 && !selectedVolunteerId) {
      setSelectedVolunteerId(activeMembers[0].volunteerId);
    }
  }, [activeMembers, assignRoleId, selectedVolunteerId]);

  const releaseMutation = useMutation({
    mutationFn: (input: {
      assignmentId: string;
      actingVolunteerId: string;
      roleId: string;
      slotKey: string;
    }) => voidAssignment(input),
    onMutate: (variables) => {
      setBusyRoleKey(variables.slotKey);
      setRowError(null);
    },
    onSuccess: () => {
      if (actingVolunteerId && formMinistryId && activeChurch?.id) {
        invalidateAfterAssignOrRelease(queryClient, {
          churchId: activeChurch.id,
          ministryId: formMinistryId,
          eventId: payload.event.id,
        });
      }
    },
    onError: (error, variables) => {
      setRowError({
        roleKey: variables.slotKey,
        message: mapReleaseError(error, t),
      });
    },
    onSettled: () => {
      setBusyRoleKey(null);
    },
  });

  const assignMutation = useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      if (actingVolunteerId && formMinistryId && activeChurch?.id) {
        invalidateAfterAssignOrRelease(queryClient, {
          churchId: activeChurch.id,
          ministryId: formMinistryId,
          eventId: payload.event.id,
        });
      }
      setAssignRoleId(null);
      setBusyRoleKey(null);
      setAssignError(null);
    },
    onError: (error) => {
      setAssignError(mapAssignError(error, t));
    },
  });

  const capacityMutation = useMutation({
    mutationFn: updateRoleCapacities,
    onSuccess: () => {
      if (actingVolunteerId && formMinistryId && activeChurch?.id) {
        invalidateAfterCapacityUpdate(queryClient, {
          churchId: activeChurch.id,
          ministryId: formMinistryId,
          eventId: payload.event.id,
        });
      }
      setCapacityError(null);
      setCapacitySuccess(true);
    },
    onError: (error) => {
      setCapacitySuccess(false);
      setCapacityError(mapCapacityError(error, t));
    },
  });

  const isCancelled = Boolean(payload.event.cancelledAtUtc);
  const canLeadSelectedMinistry =
    data.event.kind !== 'PRIVATE' ||
    (formMinistryId !== null &&
      allLedMinistries.some((ministry) => ministry.id === formMinistryId));
  const canManageRoster =
    Boolean(
      actingVolunteerId && formMinistryId && !isCancelled && canLeadSelectedMinistry,
    );

  async function handleAssignSubmit(event: FormEvent) {
    event.preventDefault();
    if (
      !actingVolunteerId ||
      !formMinistryId ||
      !assignRoleId ||
      !selectedVolunteerId
    ) {
      return;
    }
    await assignMutation.mutateAsync({
      eventId: payload.event.id,
      volunteerId: selectedVolunteerId,
      ministryId: formMinistryId,
      roleId: assignRoleId,
      actingVolunteerId,
      startsAtUtc,
      endsAtUtc,
    });
  }

  function handleCapacitySave(event: FormEvent) {
    event.preventDefault();
    if (!actingVolunteerId || !formMinistryId) {
      return;
    }
    setCapacitySuccess(false);
    capacityMutation.mutate({
      eventId: payload.event.id,
      ministryId: formMinistryId,
      actingVolunteerId,
      capacities: activeRoles.map((role) => ({
        roleId: role.id,
        capacity: capacityDraft[role.id] ?? 1,
      })),
    });
  }

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            {payload.event.kind === 'PRIVATE'
              ? t('visibility.private')
              : t('visibility.public')}
          </Badge>
          {payload.ministry ? (
            <Badge>{payload.ministry.name}</Badge>
          ) : null}
          {isCancelled ? (
            <Badge variant="destructive">{t('detail.cancel.cancelledLabel')}</Badge>
          ) : null}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {payload.event.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          <SchedulingTimeDisplay
            labels={buildDualInterval(
              payload.event.window.startsAtUtc,
              payload.event.window.endsAtUtc,
              timezone,
              i18n.language,
              intervalOptions,
              intervalOptions,
            )}
          />
        </p>
        <Link
          to="/scheduling"
          search={{ previewRole: undefined }}
          className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {t('detail.backToList')}
        </Link>
      </header>

      {canManageRoster ? (
        <>
          {payload.event.kind === 'PRIVATE' && formMinistryId ? (
            <form
              className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]"
              onSubmit={handleCapacitySave}
              data-testid="role-capacity-editor"
            >
              <h2 className="text-lg font-semibold">
                {t('detail.capacityEditor.heading')}
              </h2>
              <ul className="space-y-3">
                {activeRoles.map((role) => (
                  <li
                    key={role.id}
                    className="flex flex-wrap items-center justify-between gap-3 text-sm"
                  >
                    <span className="font-medium">{role.name}</span>
                    <label className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {t('detail.capacityEditor.slotsLabel')}
                      </span>
                      <input
                        type="number"
                        min={1}
                        className="w-20 rounded-md border border-border bg-background px-2 py-1"
                        value={capacityDraft[role.id] ?? 1}
                        onChange={(changeEvent) => {
                          setCapacitySuccess(false);
                          setCapacityError(null);
                          setCapacityDraft((current) => ({
                            ...current,
                            [role.id]: Number(changeEvent.target.value),
                          }));
                        }}
                        disabled={capacityMutation.isPending || rolesQuery.isLoading}
                      />
                    </label>
                  </li>
                ))}
              </ul>
              {capacityError ? (
                <p role="alert" className="text-sm text-destructive">
                  {capacityError}
                </p>
              ) : null}
              {capacitySuccess ? (
                <p className="text-sm text-emerald-700">
                  {t('detail.capacityEditor.success')}
                </p>
              ) : null}
              <Button type="submit" disabled={capacityMutation.isPending}>
                {capacityMutation.isPending
                  ? t('detail.capacityEditor.saving')
                  : t('detail.capacityEditor.save')}
              </Button>
            </form>
          ) : null}

          <RosterByEventSection
            eventId={payload.event.id}
            eventTitle={payload.event.title}
            timeLabels={buildDualInterval(
              payload.event.window.startsAtUtc,
              payload.event.window.endsAtUtc,
              timezone,
              i18n.language,
              intervalOptions,
              intervalOptions,
            )}
            roster={roster}
            busyRoleKey={busyRoleKey}
            rowError={rowError}
            onAssign={(roleId, slotKey) => {
              setAssignRoleId(roleId);
              setBusyRoleKey(slotKey);
              setAssignError(null);
            }}
            onRelease={(assignmentId, roleId, slotKey) => {
              if (!actingVolunteerId) {
                return;
              }
              releaseMutation.mutate({
                assignmentId,
                actingVolunteerId,
                roleId,
                slotKey,
              });
            }}
          />

          {assignRoleId ? (
            <form
              className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]"
              onSubmit={(event) => void handleAssignSubmit(event)}
              aria-labelledby="assign-heading"
            >
              <h2 id="assign-heading" className="text-lg font-semibold">
                {t('detail.assignHeading')}
              </h2>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">{t('detail.volunteerLabel')}</span>
                <select
                  className="rounded-md border border-border bg-background px-3 py-2"
                  value={selectedVolunteerId}
                  onChange={(event) => setSelectedVolunteerId(event.target.value)}
                  disabled={assignMutation.isPending || membershipsQuery.isLoading}
                >
                  {activeMembers.length === 0 ? (
                    <option value="">{t('detail.noActiveVolunteers')}</option>
                  ) : (
                    activeMembers.map((member) => (
                      <option key={member.volunteerId} value={member.volunteerId}>
                        {member.displayName}
                      </option>
                    ))
                  )}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">{t('detail.startsAtUtcLabel')}</span>
                <input
                  className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
                  value={startsAtUtc}
                  onChange={(event) => setStartsAtUtc(event.target.value)}
                  disabled={assignMutation.isPending}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">{t('detail.endsAtUtcLabel')}</span>
                <input
                  className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
                  value={endsAtUtc}
                  onChange={(event) => setEndsAtUtc(event.target.value)}
                  disabled={assignMutation.isPending}
                />
              </label>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={
                    assignMutation.isPending ||
                    !selectedVolunteerId ||
                    activeMembers.length === 0
                  }
                >
                  {assignMutation.isPending
                    ? t('detail.saving')
                    : t('detail.createAssignment')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAssignRoleId(null);
                    setAssignError(null);
                  }}
                >
                  {t('create.cancel')}
                </Button>
              </div>
              {assignError ? (
                <p role="alert" className="text-sm text-destructive">
                  {assignError}
                </p>
              ) : null}
            </form>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{t('detail.emptyRoster')}</p>
      )}
    </section>
  );
}
