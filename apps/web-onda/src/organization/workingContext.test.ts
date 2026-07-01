import { describe, expect, it } from 'vitest';
import type { MinistrySummary } from './types';
import {
  buildWorkingContextOptions,
  resolveWorkingContext,
  type WorkingContext,
} from './workingContext';

const louvor: MinistrySummary = {
  id: 'min-louvor',
  name: 'Louvor',
  isLeader: true,
  membershipStatus: 'ACTIVE',
};

const kids: MinistrySummary = {
  id: 'min-kids',
  name: 'Kids',
  membershipStatus: 'ACTIVE',
};

const hospitality: MinistrySummary = {
  id: 'min-hospitality',
  name: 'Hospitalidade',
  membershipStatus: 'ACTIVE',
};

const pendingKids: MinistrySummary = {
  id: 'min-kids-pending',
  name: 'Kids',
  membershipStatus: 'PENDING',
};

const inactiveMinistry: MinistrySummary = {
  id: 'min-inactive',
  name: 'Inactive Ministry',
  membershipStatus: 'INACTIVE',
};

const archivedMinistry: MinistrySummary = {
  id: 'min-archived',
  name: 'Archived Ministry',
  archivedAt: '2026-01-01',
  membershipStatus: 'ACTIVE',
};

describe('buildWorkingContextOptions', () => {
  it('emits dual-role options (leader@Louvor + volunteer@Kids)', () => {
    const options = buildWorkingContextOptions([louvor, kids], false);

    expect(options).toEqual([
      {
        ministryId: 'min-louvor',
        mode: 'leader',
        ministryName: 'Louvor',
      },
      {
        ministryId: 'min-kids',
        mode: 'volunteer',
        ministryName: 'Kids',
      },
    ]);
  });

  it('emits leader-only options', () => {
    const options = buildWorkingContextOptions(
      [{ ...louvor, membershipStatus: undefined }, { ...kids, isLeader: true }],
      false,
    );

    expect(options).toEqual([
      { ministryId: 'min-kids', mode: 'leader', ministryName: 'Kids' },
      { ministryId: 'min-louvor', mode: 'leader', ministryName: 'Louvor' },
    ]);
  });

  it('emits volunteer-only options sorted by pt-BR name', () => {
    const options = buildWorkingContextOptions(
      [kids, hospitality, { ...louvor, isLeader: false, membershipStatus: 'ACTIVE' }],
      false,
    );

    expect(options.map((o) => o.ministryName)).toEqual([
      'Hospitalidade',
      'Kids',
      'Louvor',
    ]);
    expect(options.every((o) => o.mode === 'volunteer')).toBe(true);
  });

  it('does not emit volunteer option when user is leader for same ministry', () => {
    const options = buildWorkingContextOptions([louvor], false);

    expect(options).toEqual([
      { ministryId: 'min-louvor', mode: 'leader', ministryName: 'Louvor' },
    ]);
    expect(options.filter((o) => o.ministryId === 'min-louvor')).toHaveLength(1);
  });

  it('skips PENDING and INACTIVE ministries', () => {
    const options = buildWorkingContextOptions(
      [louvor, pendingKids, inactiveMinistry],
      false,
    );

    expect(options).toEqual([
      { ministryId: 'min-louvor', mode: 'leader', ministryName: 'Louvor' },
    ]);
  });

  it('hides archived ministries unless admin can see archived', () => {
    const nonAdmin = buildWorkingContextOptions([kids, archivedMinistry], false);
    expect(nonAdmin.map((o) => o.ministryId)).toEqual(['min-kids']);

    const admin = buildWorkingContextOptions([kids, archivedMinistry], true);
    expect(admin.map((o) => o.ministryId)).toEqual(['min-archived', 'min-kids']);
  });
});

describe('resolveWorkingContext', () => {
  const dualRoleOptions = buildWorkingContextOptions([louvor, kids], false);

  it('returns null when no options exist', () => {
    expect(resolveWorkingContext([], null, null)).toBeNull();
  });

  it('auto-selects the only option', () => {
    const single = buildWorkingContextOptions([louvor], false);
    expect(resolveWorkingContext(single, null, null)).toEqual(single[0]);
  });

  it('prefers stored context when it matches a current option', () => {
    const stored: WorkingContext = {
      ministryId: 'min-kids',
      mode: 'volunteer',
    };

    expect(resolveWorkingContext(dualRoleOptions, stored, null)).toEqual({
      ministryId: 'min-kids',
      mode: 'volunteer',
      ministryName: 'Kids',
    });
  });

  it('falls back when stored context is stale', () => {
    const stale: WorkingContext = {
      ministryId: 'min-revoked',
      mode: 'leader',
    };

    expect(resolveWorkingContext(dualRoleOptions, stale, null)).toEqual({
      ministryId: 'min-louvor',
      mode: 'leader',
      ministryName: 'Louvor',
    });
  });

  it('migrates from legacy ministry id preferring leader mode', () => {
    expect(resolveWorkingContext(dualRoleOptions, null, 'min-louvor')).toEqual({
      ministryId: 'min-louvor',
      mode: 'leader',
      ministryName: 'Louvor',
    });
  });

  it('migrates from legacy ministry id as volunteer when not a leader', () => {
    expect(resolveWorkingContext(dualRoleOptions, null, 'min-kids')).toEqual({
      ministryId: 'min-kids',
      mode: 'volunteer',
      ministryName: 'Kids',
    });
  });

  it('defaults to first leader option when stored and legacy are absent', () => {
    expect(resolveWorkingContext(dualRoleOptions, null, null)).toEqual({
      ministryId: 'min-louvor',
      mode: 'leader',
      ministryName: 'Louvor',
    });
  });
});
