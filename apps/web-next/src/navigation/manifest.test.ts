import { describe, expect, it } from 'vitest';
import {
  ADMIN_NAV,
  LEADER_NAV,
  VOLUNTEER_NAV,
  buildNavForGrants,
  isNavItemActive,
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

  it('adds leader scheduling and roster items for leader grants', () => {
    const nav = buildNavForGrants({
      isVolunteer: true,
      isLeader: true,
      isOrgAdmin: false,
    });
    expect(nav.map((item) => item.id)).toEqual([
      'dashboard',
      'myAssignments',
      'timeAway',
      'scheduling',
      'roster',
      'volunteers',
    ]);
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
    expect(ids).toContain('myAssignments');
    expect(ids).toContain('scheduling');
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

  it('marks my assignments active on /scheduling', () => {
    const myAssignments = VOLUNTEER_NAV.find((item) => item.id === 'myAssignments')!;
    expect(isNavItemActive(myAssignments, '/scheduling')).toBe(true);
    expect(isNavItemActive(VOLUNTEER_NAV[0], '/dashboard')).toBe(true);
  });
});
