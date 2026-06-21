import { describe, expect, it } from 'vitest';
import {
  ADMIN_NAV,
  LEADER_NAV,
  VOLUNTEER_NAV,
  buildNavForGrants,
  isNavItemActive,
  pickActiveNavItem,
} from './manifest';

describe('buildNavForGrants', () => {
  it('returns volunteer nav items for volunteer-only grants', () => {
    const nav = buildNavForGrants({
      isVolunteer: true,
      isLeader: false,
      isOrgAdmin: false,
    });
    expect(nav.map((item) => item.id)).toEqual([
      'dashboard',
      'myAssignments',
      'timeAway',
    ]);
  });

  it('routes my assignments to /scheduling for volunteers', () => {
    const myAssignments = VOLUNTEER_NAV.find((item) => item.id === 'myAssignments');
    expect(myAssignments?.path).toBe('/scheduling');
  });

  it('adds leader scheduling for leader grants without duplicate /scheduling links', () => {
    const nav = buildNavForGrants({
      isVolunteer: true,
      isLeader: true,
      isOrgAdmin: false,
    });
    expect(nav.map((item) => item.id)).toEqual([
      'dashboard',
      'timeAway',
      'scheduling',
      'volunteers',
    ]);
    expect(nav.filter((item) => item.path === '/scheduling')).toHaveLength(1);
  });

  it('returns admin ministries, volunteers, and leaders for org admin grants', () => {
    const nav = buildNavForGrants({
      isVolunteer: false,
      isLeader: false,
      isOrgAdmin: true,
    });
    expect(nav.map((item) => item.id)).toEqual(ADMIN_NAV.map((item) => item.id));
  });

  it('dedupes shared items when volunteer, leader, and admin grants combine', () => {
    const nav = buildNavForGrants({
      isVolunteer: true,
      isLeader: true,
      isOrgAdmin: true,
    });
    const ids = nav.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('dashboard');
    expect(ids).toContain('scheduling');
    expect(ids).not.toContain('myAssignments');
    expect(ids).not.toContain('roster');
    expect(ids).toContain('ministries');
    expect(ids).toContain('leaders');
    expect(ids.filter((id) => id === 'volunteers')).toHaveLength(1);
    expect(ids.filter((id) => id === 'timeAway')).toHaveLength(1);
  });

  it('exposes route paths for every manifest entry', () => {
    for (const item of [...VOLUNTEER_NAV, ...LEADER_NAV, ...ADMIN_NAV]) {
      expect(item.path.startsWith('/')).toBe(true);
    }
  });

  it('marks only one /scheduling nav item active for dual-role users', () => {
    const nav = buildNavForGrants({
      isVolunteer: true,
      isLeader: true,
      isOrgAdmin: false,
    });
    const active = pickActiveNavItem(nav, '/scheduling');
    expect(active?.id).toBe('scheduling');
    expect(nav.filter((item) => isNavItemActive(item, '/scheduling'))).toHaveLength(1);
  });

  it('marks my assignments active on /scheduling for volunteer-only grants', () => {
    const nav = buildNavForGrants({
      isVolunteer: true,
      isLeader: false,
      isOrgAdmin: false,
    });
    const myAssignments = nav.find((item) => item.id === 'myAssignments')!;
    expect(pickActiveNavItem(nav, '/scheduling')?.id).toBe('myAssignments');
    expect(isNavItemActive(myAssignments, '/scheduling')).toBe(true);
    expect(isNavItemActive(nav[0], '/dashboard')).toBe(true);
  });
});
