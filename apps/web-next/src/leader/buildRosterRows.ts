import type { EventDetailPayload } from '@/eventDetailPayload';
import type { MinistryRoleRow, RosterRow } from './types';

export function buildRosterRows(input: {
  eventId: string;
  roles: MinistryRoleRow[];
  roleCapacities: EventDetailPayload['roleCapacities'];
  assignments: EventDetailPayload['assignments'];
  ministryId: string;
}): RosterRow[] {
  const activeRoles = input.roles.filter((role) => !role.retired);
  const ministryAssignments = input.assignments.filter(
    (assignment) => assignment.ministry.id === input.ministryId,
  );
  const ministryCapacities = input.roleCapacities.filter(
    (capacity) => capacity.ministryId === input.ministryId,
  );

  const rows: RosterRow[] = [];

  for (const role of activeRoles) {
    const capacity =
      ministryCapacities.find((entry) => entry.roleId === role.id)?.capacity ?? 1;
    const roleAssignments = ministryAssignments
      .filter((assignment) => assignment.role.id === role.id)
      .sort((left, right) => {
        const startCompare = left.window.startsAtUtc.localeCompare(
          right.window.startsAtUtc,
        );
        if (startCompare !== 0) {
          return startCompare;
        }
        return left.id.localeCompare(right.id);
      });

    for (let slotIndex = 0; slotIndex < capacity; slotIndex += 1) {
      const assignment = roleAssignments[slotIndex];
      const slotKey = `${input.eventId}:${role.id}:${slotIndex}`;
      if (assignment) {
        rows.push({
          roleId: role.id,
          roleName: role.name,
          slotIndex,
          slotKey,
          assignmentId: assignment.id,
          volunteerId: assignment.volunteer.id,
          volunteerName: assignment.volunteer.displayName,
        });
      } else {
        rows.push({
          roleId: role.id,
          roleName: role.name,
          slotIndex,
          slotKey,
        });
      }
    }
  }

  return rows;
}

export function rosterFillCounts(roster: RosterRow[]): {
  filled: number;
  total: number;
} {
  const total = roster.length;
  const filled = roster.filter((row) => row.volunteerName).length;
  return { filled, total };
}

export function countOpenSlotsAcrossRosters(rosters: RosterRow[][]): number {
  return rosters.reduce((sum, roster) => {
    const { filled, total } = rosterFillCounts(roster);
    return sum + (total - filled);
  }, 0);
}

export function isWithinNextDays(
  startsAtUtc: string,
  days: number,
  now = Date.now(),
): boolean {
  const startMs = new Date(startsAtUtc).getTime();
  const horizonMs = now + days * 24 * 60 * 60 * 1000;
  return startMs >= now - 24 * 60 * 60 * 1000 && startMs <= horizonMs;
}

export function eventVisibleToMinistry(
  event: { kind: 'PUBLIC' | 'PRIVATE'; ministry: { id: string } | null },
  ministryId: string,
): boolean {
  if (event.kind === 'PUBLIC') {
    return true;
  }
  return event.ministry?.id === ministryId;
}

export function defaultAssignmentWindow(event: EventDetailPayload): {
  startsAtUtc: string;
  endsAtUtc: string;
} {
  const eventStart = new Date(event.event.window.startsAtUtc).getTime();
  const eventEnd = new Date(event.event.window.endsAtUtc).getTime();
  const slotStart = eventStart + 60 * 60 * 1000;
  return {
    startsAtUtc: new Date(slotStart).toISOString(),
    endsAtUtc: new Date(eventEnd).toISOString(),
  };
}
