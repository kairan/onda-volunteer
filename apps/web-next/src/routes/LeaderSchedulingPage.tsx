import { Link } from '@tanstack/react-router';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/api/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { RosterByEventSection } from '@/components/RosterByEventSection';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  createAssignment,
  invalidateAfterAssignOrRelease,
} from '@/leader/assignMutation';
import {
  buildRosterRows,
  countOpenSlotsAcrossRosters,
  defaultAssignmentWindow,
  eventVisibleToMinistry,
  isWithinNextDays,
} from '@/leader/buildRosterRows';
import { eventDetailQuery } from '@/leader/eventDetailQuery';
import { leaderEventsQuery } from '@/leader/leaderEventsQuery';
import { voidAssignment, type VoidAssignmentInput } from '@/leader/releaseMutation';
import { useOrganization } from '@/organization/OrganizationProvider';
import {
  ministryMembershipsQuery,
  ministryRolesQuery,
} from '@/organization/ministryStructureQueries';
import { useLocalTimeContext } from '@/settings/LocalTimeProvider';

type AssignTarget = {
  eventId: string;
  roleId: string;
};

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
    default:
      return err.message;
  }
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

export function LeaderSchedulingPage() {
  const { t, i18n } = useTranslation('scheduling');
  const auth = useAuthSession();
  const queryClient = useQueryClient();
  const { activeChurch, activeCampus, activeMinistry, activeMinistryId, loading: orgLoading } =
    useOrganization();
  const { buildDualInterval } = useLocalTimeContext();

  const ledMinistries = useMemo(
    () =>
      (activeChurch?.ministries ?? []).filter(
        (ministry) => ministry.isLeader && !ministry.archivedAt,
      ),
    [activeChurch?.ministries],
  );

  const ministryId =
    activeMinistry?.id ?? activeMinistryId ?? ledMinistries[0]?.id ?? null;
  const ministryName =
    activeMinistry?.name ??
    ledMinistries.find((ministry) => ministry.id === ministryId)?.name ??
    '';

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;
  const churchId = activeChurch?.id ?? null;

  const eventsQuery = useQuery(
    leaderEventsQuery({
      volunteerId: actingVolunteerId ?? '',
      churchId: churchId ?? '',
      ministryId: ministryId ?? '',
    }),
  );
  const rolesQuery = useQuery(
    ministryRolesQuery({
      ministryId: ministryId ?? '',
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

  const upcomingEvents = useMemo(() => {
    const events = eventsQuery.data ?? [];
    if (!ministryId) {
      return [];
    }
    return events.filter(
      (event) =>
        eventVisibleToMinistry(event, ministryId) &&
        isWithinNextDays(event.window.startsAtUtc, 7),
    );
  }, [eventsQuery.data, ministryId]);

  const eventDetailQueries = useQueries({
    queries: upcomingEvents.map((event) =>
      eventDetailQuery({
        eventId: event.id,
        volunteerId: actingVolunteerId ?? '',
      }),
    ),
  });

  const rosterByEvent = useMemo(() => {
    const roles = rolesQuery.data ?? [];
    if (!ministryId) {
      return [];
    }
    return upcomingEvents.map((event, index) => {
      const detail = eventDetailQueries[index]?.data;
      const roster = detail
        ? buildRosterRows({
            eventId: event.id,
            roles,
            roleCapacities: detail.roleCapacities ?? [],
            assignments: detail.assignments,
            ministryId,
          })
        : [];
      return { event, roster, detail };
    });
  }, [upcomingEvents, eventDetailQueries, rolesQuery.data, ministryId]);

  const openSlots = countOpenSlotsAcrossRosters(
    rosterByEvent.map((row) => row.roster),
  );

  const [busyRoleKey, setBusyRoleKey] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{
    roleKey: string;
    message: string;
  } | null>(null);

  function rosterRoleKey(eventId: string, roleId: string): string {
    return `${eventId}:${roleId}`;
  }
  const [assignTarget, setAssignTarget] = useState<AssignTarget | null>(null);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [assignFormError, setAssignFormError] = useState<string | null>(null);

  const membershipsQuery = useQuery(
    ministryMembershipsQuery({
      ministryId: ministryId ?? '',
      actingVolunteerId: actingVolunteerId ?? '',
    }),
  );

  const releaseMutation = useMutation({
    mutationFn: (input: VoidAssignmentInput & { eventId: string; roleId: string }) =>
      voidAssignment(input),
    onMutate: ({ eventId, roleId }) => {
      setBusyRoleKey(rosterRoleKey(eventId, roleId));
      setRowError(null);
    },
    onSuccess: (_data, variables) => {
      if (churchId && ministryId) {
        invalidateAfterAssignOrRelease(queryClient, {
          churchId,
          ministryId,
          eventId: variables.eventId,
        });
      }
    },
    onError: (error, variables) => {
      setRowError({
        roleKey: rosterRoleKey(variables.eventId, variables.roleId),
        message: mapReleaseError(error, t),
      });
    },
    onSettled: () => {
      setBusyRoleKey(null);
    },
  });

  const assignMutation = useMutation({
    mutationFn: createAssignment,
    onSuccess: (_data, variables) => {
      if (churchId && ministryId) {
        invalidateAfterAssignOrRelease(queryClient, {
          churchId,
          ministryId,
          eventId: variables.eventId,
        });
      }
      setAssignTarget(null);
      setSelectedVolunteerId('');
      setAssignFormError(null);
    },
    onError: (error) => {
      setAssignFormError(mapAssignError(error, t));
    },
  });

  const listLoading = orgLoading || eventsQuery.isLoading || rolesQuery.isLoading;

  const activeMembers = (membershipsQuery.data ?? []).filter(
    (row) => row.status === 'ACTIVE',
  );

  function openAssignDialog(eventId: string, roleId: string) {
    setAssignTarget({ eventId, roleId });
    setAssignFormError(null);
    setSelectedVolunteerId(activeMembers[0]?.volunteerId ?? '');
  }

  async function handleAssignSubmit() {
    if (
      !assignTarget ||
      !actingVolunteerId ||
      !ministryId ||
      !selectedVolunteerId
    ) {
      return;
    }
    const detail = rosterByEvent.find(
      (row) => row.event.id === assignTarget.eventId,
    )?.detail;
    if (!detail) {
      return;
    }
    const window = defaultAssignmentWindow(detail);
    await assignMutation.mutateAsync({
      eventId: assignTarget.eventId,
      volunteerId: selectedVolunteerId,
      ministryId,
      roleId: assignTarget.roleId,
      actingVolunteerId,
      ...window,
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            data-testid="leader-ministry-hero"
          >
            {t('preview.ministryHero', { name: ministryName })}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('preview.leaderSummary', {
              events: upcomingEvents.length,
              openSlots,
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" type="button" asChild>
            <Link to="/scheduling/events/new-private">
              <Calendar className="h-4 w-4" aria-hidden />
              {t('preview.newEvent')}
            </Link>
          </Button>
          <Button size="sm" type="button" asChild>
            <Link
              to={
                upcomingEvents[0]
                  ? '/scheduling/events/$eventId'
                  : '/scheduling/events/new-private'
              }
              params={
                upcomingEvents[0]
                  ? { eventId: upcomingEvents[0].id }
                  : undefined
              }
            >
              <Plus className="h-4 w-4" aria-hidden />
              {t('preview.assignVolunteer')}
            </Link>
          </Button>
        </div>
      </header>

      <section className="space-y-4" data-testid="leader-roster-section">
        <h2 className="text-base font-semibold">{t('preview.rosterHeading')}</h2>
        {listLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div
            data-testid="leader-scheduling-empty"
            className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-[var(--shadow-card)]"
          >
            {t('emptyState')}
          </div>
        ) : (
          rosterByEvent.map(({ event, roster }) => (
            <RosterByEventSection
              key={event.id}
              eventId={event.id}
              eventTitle={event.title}
              timeLabels={buildDualInterval(
                event.window.startsAtUtc,
                event.window.endsAtUtc,
                timezone,
                i18n.language,
                intervalOptions,
                intervalOptions,
              )}
              roster={roster}
              busyRoleKey={busyRoleKey}
              rowError={rowError}
              onAssign={(roleId) => openAssignDialog(event.id, roleId)}
              onRelease={(assignmentId, roleId) => {
                if (!actingVolunteerId) {
                  return;
                }
                releaseMutation.mutate({
                  assignmentId,
                  actingVolunteerId,
                  eventId: event.id,
                  roleId,
                });
              }}
            />
          ))
        )}
      </section>

      <Dialog
        open={assignTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAssignTarget(null);
            setAssignFormError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('detail.assignHeading')}</DialogTitle>
          </DialogHeader>
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
          {assignFormError ? (
            <p role="alert" className="text-sm text-destructive">
              {assignFormError}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              disabled={
                assignMutation.isPending ||
                !selectedVolunteerId ||
                activeMembers.length === 0
              }
              onClick={() => void handleAssignSubmit()}
            >
              {assignMutation.isPending
                ? t('detail.saving')
                : t('detail.createAssignment')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
