import { describe, expect, it } from 'vitest';
import {
  ADMIN_NAV,
  LEADER_NAV,
  VOLUNTEER_NAV,
  buildNavForWorkingContext,
  isNavItemActive,
  pickActiveNavItem,
} from './manifest';

describe('buildNavForWorkingContext', () => {
  it('returns volunteer nav items for volunteer working context', () => {
    const nav = buildNavForWorkingContext({
      isAuthenticated: true,
      isOrgAdmin: false,
      workingContext: { ministryId: 'min-kids', mode: 'volunteer' },
    });
    expect(nav.map((item) => item.id)).toEqual([
      'dashboard',
      'myAssignments',
      'timeAway',
    ]);
  });

  it('returns leader nav for leader working context', () => {
    const nav = buildNavForWorkingContext({
      isAuthenticated: true,
      isOrgAdmin: false,
      workingContext: { ministryId: 'min-louvor', mode: 'leader' },
    });
    expect(nav.map((item) => item.id)).toEqual([
      'dashboard',
      'scheduling',
      'volunteers',
      'timeAway',
    ]);
    expect(nav.filter((item) => item.path === '/scheduling')).toHaveLength(1);
  });

  it('keeps my assignments for dual-role user in volunteer context', () => {
    const nav = buildNavForWorkingContext({
      isAuthenticated: true,
      isOrgAdmin: false,
      workingContext: { ministryId: 'min-kids', mode: 'volunteer' },
    });
    expect(nav.map((item) => item.id)).toContain('myAssignments');
    expect(nav.map((item) => item.id)).not.toContain('scheduling');
  });

  it('returns admin nav for org admin regardless of working context', () => {
    const nav = buildNavForWorkingContext({
      isAuthenticated: true,
      isOrgAdmin: true,
      workingContext: { ministryId: 'min-kids', mode: 'volunteer' },
    });
    expect(nav.map((item) => item.id)).toEqual([
      'dashboard',
      'myAssignments',
      'timeAway',
      ...ADMIN_NAV.map((item) => item.id),
    ]);
  });

  it('includes volunteer nav when working context is null plus admin items', () => {
    const nav = buildNavForWorkingContext({
      isAuthenticated: true,
      isOrgAdmin: true,
      workingContext: null,
    });
    expect(nav.map((item) => item.id)).toEqual([
      'dashboard',
      'myAssignments',
      'timeAway',
      ...ADMIN_NAV.map((item) => item.id),
    ]);
  });

  it('returns empty nav when unauthenticated', () => {
    expect(
      buildNavForWorkingContext({
        isAuthenticated: false,
        isOrgAdmin: true,
        workingContext: { ministryId: 'x', mode: 'leader' },
      }),
    ).toEqual([]);
  });

  it('dedupes shared items when leader context and org admin combine', () => {
    const nav = buildNavForWorkingContext({
      isAuthenticated: true,
      isOrgAdmin: true,
      workingContext: { ministryId: 'min-louvor', mode: 'leader' },
    });
    const ids = nav.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('scheduling');
    expect(ids).not.toContain('myAssignments');
    expect(ids).not.toContain('roster');
    expect(ids.filter((id) => id === 'volunteers')).toHaveLength(1);
    expect(ids.filter((id) => id === 'timeAway')).toHaveLength(1);
  });

  it('exposes route paths for every manifest entry', () => {
    for (const item of [...VOLUNTEER_NAV, ...LEADER_NAV, ...ADMIN_NAV]) {
      expect(item.path.startsWith('/')).toBe(true);
    }
  });

  it('marks my assignments active on /scheduling for volunteer context', () => {
    const nav = buildNavForWorkingContext({
      isAuthenticated: true,
      isOrgAdmin: false,
      workingContext: { ministryId: 'min-kids', mode: 'volunteer' },
    });
    const myAssignments = nav.find((item) => item.id === 'myAssignments')!;
    expect(pickActiveNavItem(nav, '/scheduling')?.id).toBe('myAssignments');
    expect(isNavItemActive(myAssignments, '/scheduling')).toBe(true);
  });

  it('marks scheduling active on /scheduling for leader context', () => {
    const nav = buildNavForWorkingContext({
      isAuthenticated: true,
      isOrgAdmin: false,
      workingContext: { ministryId: 'min-louvor', mode: 'leader' },
    });
    expect(pickActiveNavItem(nav, '/scheduling')?.id).toBe('scheduling');
    expect(nav.filter((item) => isNavItemActive(item, '/scheduling'))).toHaveLength(1);
  });
});
