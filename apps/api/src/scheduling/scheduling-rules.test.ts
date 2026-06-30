import {
  bulkUnavailabilityMembershipFailure,
  intervalsOverlapHalfOpen,
  validateAssignmentGuards,
  validateRoleSlotGuards,
} from './scheduling-rules';

describe('scheduling-rules', () => {
  it('detects half-open interval overlap', () => {
    const a0 = new Date('2026-06-01T10:00:00.000Z');
    const a1 = new Date('2026-06-01T11:00:00.000Z');
    const b0 = new Date('2026-06-01T10:30:00.000Z');
    const b1 = new Date('2026-06-01T12:00:00.000Z');
    expect(intervalsOverlapHalfOpen(a0, a1, b0, b1)).toBe(true);
    expect(intervalsOverlapHalfOpen(a0, a1, a1, b1)).toBe(false);
  });

  it('rejects retired roles and inactive membership', () => {
    const base = {
      eventStartsAtUtc: new Date('2026-06-01T10:00:00.000Z'),
      eventEndsAtUtc: new Date('2026-06-01T14:00:00.000Z'),
      assignmentStartsAtUtc: new Date('2026-06-01T11:00:00.000Z'),
      assignmentEndsAtUtc: new Date('2026-06-01T12:00:00.000Z'),
      unavailabilityBlocks: [],
      crossMinistryConflictingAssignments: [],
    };

    expect(
      validateAssignmentGuards({
        ...base,
        membershipStatus: 'PENDING',
        roleRetired: false,
      }),
    ).toMatchObject({ ok: false, code: 'MEMBERSHIP_NOT_ACTIVE' });

    expect(
      validateAssignmentGuards({
        ...base,
        membershipStatus: 'ACTIVE',
        roleRetired: true,
      }),
    ).toMatchObject({ ok: false, code: 'ROLE_RETIRED' });
  });

  it('uses CROSS_MINISTRY_DOUBLE_BOOKING for other-ministry overlaps', () => {
    const base = {
      eventStartsAtUtc: new Date('2026-06-01T10:00:00.000Z'),
      eventEndsAtUtc: new Date('2026-06-01T14:00:00.000Z'),
      assignmentStartsAtUtc: new Date('2026-06-01T11:00:00.000Z'),
      assignmentEndsAtUtc: new Date('2026-06-01T12:00:00.000Z'),
      membershipStatus: 'ACTIVE' as const,
      roleRetired: false,
      unavailabilityBlocks: [],
      crossMinistryConflictingAssignments: [
        {
          startsAtUtc: new Date('2026-06-01T11:30:00.000Z'),
          endsAtUtc: new Date('2026-06-01T13:00:00.000Z'),
        },
      ],
    };

    expect(validateAssignmentGuards(base)).toMatchObject({
      ok: false,
      code: 'CROSS_MINISTRY_DOUBLE_BOOKING',
    });
  });

  it('validates bulk unavailability ministry membership', () => {
    expect(
      bulkUnavailabilityMembershipFailure('min-1', undefined),
    ).toMatchObject({ code: 'MEMBERSHIP_REQUIRED', ministryId: 'min-1' });

    expect(
      bulkUnavailabilityMembershipFailure('min-2', { status: 'INACTIVE' }),
    ).toMatchObject({ code: 'MEMBERSHIP_NOT_ACTIVE', ministryId: 'min-2' });

    expect(
      bulkUnavailabilityMembershipFailure('min-3', { status: 'PENDING' }),
    ).toBeNull();
  });

  it('rejects duplicate volunteer on same role slot', () => {
    expect(
      validateRoleSlotGuards({
        capacity: 2,
        activeAssignmentCount: 1,
        volunteerAlreadyOnRole: true,
      }),
    ).toMatchObject({
      ok: false,
      code: 'VOLUNTEER_ALREADY_ON_ROLE_SLOT',
    });
  });

  it('rejects assignment when role slots are full', () => {
    expect(
      validateRoleSlotGuards({
        capacity: 2,
        activeAssignmentCount: 2,
        volunteerAlreadyOnRole: false,
      }),
    ).toMatchObject({ ok: false, code: 'ROLE_SLOTS_FULL' });

    expect(
      validateRoleSlotGuards({
        capacity: 2,
        activeAssignmentCount: 1,
        volunteerAlreadyOnRole: false,
      }),
    ).toMatchObject({ ok: true });
  });
});
