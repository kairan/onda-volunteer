/** Half-open overlap on UTC instants: [a0,a1) overlaps [b0,b1) iff a0 < b1 && b0 < a1 */
export function intervalsOverlapHalfOpen(
  a0: Date,
  a1: Date,
  b0: Date,
  b1: Date,
): boolean {
  return a0 < b1 && b0 < a1;
}

export function parseInstantOrThrow(
  label: string,
  iso: string,
): Date | { error: { code: string; message: string } } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return {
      error: {
        code: 'INVALID_INSTANT',
        message: `${label} must be a valid ISO-8601 instant`,
      },
    };
  }
  return d;
}

export type AssignmentGuardInput = {
  eventStartsAtUtc: Date;
  eventEndsAtUtc: Date;
  assignmentStartsAtUtc: Date;
  assignmentEndsAtUtc: Date;
  membershipStatus: 'PENDING' | 'ACTIVE' | 'INACTIVE' | null;
  roleRetired: boolean;
  unavailabilityBlocks: Array<{ startsAtUtc: Date; endsAtUtc: Date }>;
  /** Overlapping assignments in ministries other than the target ministry. */
  crossMinistryConflictingAssignments: Array<{
    startsAtUtc: Date;
    endsAtUtc: Date;
  }>;
};

export type AssignmentGuardResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

export const SCHEDULING_CONFLICT_GUARD_CODES = new Set([
  'UNAVAILABILITY_BLOCKS_ASSIGN',
  'CROSS_MINISTRY_DOUBLE_BOOKING',
]);

export function validateAssignmentGuards(
  input: AssignmentGuardInput,
): AssignmentGuardResult {
  const { assignmentStartsAtUtc: a0, assignmentEndsAtUtc: a1 } = input;
  if (!(a0 < a1)) {
    return {
      ok: false,
      code: 'INVALID_ASSIGNMENT_WINDOW',
      message: 'Assignment window must have startsAtUtc strictly before endsAtUtc.',
    };
  }

  if (a0 < input.eventStartsAtUtc || a1 > input.eventEndsAtUtc) {
    return {
      ok: false,
      code: 'ASSIGNMENT_OUTSIDE_EVENT',
      message: 'Assignment interval must lie fully within the event UTC window.',
    };
  }

  if (!input.membershipStatus || input.membershipStatus !== 'ACTIVE') {
    return {
      ok: false,
      code: 'MEMBERSHIP_NOT_ACTIVE',
      message: 'Volunteer must have Active ministry membership for this ministry.',
    };
  }

  if (input.roleRetired) {
    return {
      ok: false,
      code: 'ROLE_RETIRED',
      message: 'Retired roles cannot be used for new assignments.',
    };
  }

  for (const u of input.unavailabilityBlocks) {
    if (intervalsOverlapHalfOpen(a0, a1, u.startsAtUtc, u.endsAtUtc)) {
      return {
        ok: false,
        code: 'UNAVAILABILITY_BLOCKS_ASSIGN',
        message:
          'This volunteer is unavailable for this ministry during the selected time.',
      };
    }
  }

  for (const other of input.crossMinistryConflictingAssignments) {
    if (intervalsOverlapHalfOpen(a0, a1, other.startsAtUtc, other.endsAtUtc)) {
      return {
        ok: false,
        code: 'CROSS_MINISTRY_DOUBLE_BOOKING',
        message:
          'This volunteer is already rostered in another ministry for an overlapping time (UTC half-open intervals).',
      };
    }
  }

  return { ok: true };
}

export type BulkUnavailabilityMembership =
  | { status: 'PENDING' | 'ACTIVE' | 'INACTIVE' }
  | undefined;

export function bulkUnavailabilityMembershipFailure(
  ministryId: string,
  membership: BulkUnavailabilityMembership,
): { ministryId: string; code: string; message: string } | null {
  if (!membership) {
    return {
      ministryId,
      code: 'MEMBERSHIP_REQUIRED',
      message:
        'Volunteer must have ministry membership before recording unavailability.',
    };
  }
  if (membership.status === 'INACTIVE') {
    return {
      ministryId,
      code: 'MEMBERSHIP_NOT_ACTIVE',
      message:
        'Volunteer must have Active or Pending ministry membership before recording unavailability.',
    };
  }
  return null;
}

export type RoleSlotGuardInput = {
  capacity: number;
  activeAssignmentCount: number;
  volunteerAlreadyOnRole: boolean;
};

export function validateRoleSlotGuards(
  input: RoleSlotGuardInput,
): AssignmentGuardResult {
  if (input.volunteerAlreadyOnRole) {
    return {
      ok: false,
      code: 'VOLUNTEER_ALREADY_ON_ROLE_SLOT',
      message:
        'This volunteer is already rostered for this role on this event.',
    };
  }

  if (input.activeAssignmentCount >= input.capacity) {
    return {
      ok: false,
      code: 'ROLE_SLOTS_FULL',
      message: 'All slots for this role on this event are filled.',
    };
  }

  return { ok: true };
}
