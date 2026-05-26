import { describe, expect, it } from '@jest/globals';
import {
  intervalsOverlapHalfOpen,
  validateAssignmentGuards,
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
      conflictingAssignments: [],
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
});
