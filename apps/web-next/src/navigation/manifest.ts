export type NavGrants = {
  isVolunteer: boolean;
  isLeader: boolean;
  isOrgAdmin: boolean;
};

export type NavManifestItem = {
  id: string;
  path: string;
  labelKey: `shell:nav.${string}`;
};

export const VOLUNTEER_NAV: NavManifestItem[] = [
  {
    id: 'dashboard',
    path: '/dashboard',
    labelKey: 'shell:nav.dashboard',
  },
  {
    id: 'myAssignments',
    path: '/scheduling',
    labelKey: 'shell:nav.myAssignments',
  },
  {
    id: 'timeAway',
    path: '/time-away',
    labelKey: 'shell:nav.timeAway',
  },
];

export const LEADER_NAV: NavManifestItem[] = [
  {
    id: 'dashboard',
    path: '/dashboard',
    labelKey: 'shell:nav.dashboard',
  },
  {
    id: 'scheduling',
    path: '/scheduling',
    labelKey: 'shell:nav.events',
  },
  {
    id: 'roster',
    path: '/scheduling',
    labelKey: 'shell:nav.roster',
  },
  {
    id: 'volunteers',
    path: '/volunteers',
    labelKey: 'shell:nav.volunteers',
  },
  {
    id: 'timeAway',
    path: '/time-away',
    labelKey: 'shell:nav.timeAway',
  },
];

export const ADMIN_NAV: NavManifestItem[] = [
  {
    id: 'ministries',
    path: '/ministries',
    labelKey: 'shell:nav.ministries',
  },
  {
    id: 'volunteers',
    path: '/volunteers',
    labelKey: 'shell:nav.volunteers',
  },
  {
    id: 'leaders',
    path: '/ministry-leaders',
    labelKey: 'shell:nav.leaders',
  },
];

export function buildNavForGrants(grants: NavGrants): NavManifestItem[] {
  const merged: NavManifestItem[] = [];
  if (grants.isVolunteer) {
    const volunteerItems = grants.isLeader
      ? VOLUNTEER_NAV.filter((item) => item.id !== 'myAssignments')
      : VOLUNTEER_NAV;
    merged.push(...volunteerItems);
  }
  if (grants.isLeader) {
    merged.push(...LEADER_NAV);
  }
  if (grants.isOrgAdmin) {
    merged.push(...ADMIN_NAV);
  }

  const seenIds = new Set<string>();
  const seenPaths = new Set<string>();
  return merged.filter((item) => {
    if (seenIds.has(item.id) || seenPaths.has(item.path)) {
      return false;
    }
    seenIds.add(item.id);
    seenPaths.add(item.path);
    return true;
  });
}

/** Prefer the most specific nav item when several share the same path prefix. */
export function pickActiveNavItem(
  navItems: NavManifestItem[],
  pathname: string,
): NavManifestItem | null {
  const matches = navItems.filter((item) => isNavItemActive(item, pathname));
  if (matches.length === 0) {
    return null;
  }
  if (matches.length === 1) {
    return matches[0];
  }
  return matches.sort((a, b) => {
    const aExact = pathname === a.path ? 0 : 1;
    const bExact = pathname === b.path ? 0 : 1;
    if (aExact !== bExact) {
      return aExact - bExact;
    }
    return navItems.indexOf(a) - navItems.indexOf(b);
  })[0];
}

export function isNavItemActive(item: NavManifestItem, pathname: string): boolean {
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}
