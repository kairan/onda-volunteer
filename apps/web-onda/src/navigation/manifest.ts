import type { WorkingContext } from '@/organization/workingContext';

export type NavContextInput = {
  isAuthenticated: boolean;
  isOrgAdmin: boolean;
  workingContext: WorkingContext | null;
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

function dedupeNavItems(items: NavManifestItem[]): NavManifestItem[] {
  const seenIds = new Set<string>();
  const seenPaths = new Set<string>();
  return items.filter((item) => {
    if (seenIds.has(item.id) || seenPaths.has(item.path)) {
      return false;
    }
    seenIds.add(item.id);
    seenPaths.add(item.path);
    return true;
  });
}

export function buildNavForWorkingContext(
  input: NavContextInput,
): NavManifestItem[] {
  if (!input.isAuthenticated) return [];

  const merged: NavManifestItem[] = [];

  if (!input.workingContext || input.workingContext.mode === 'volunteer') {
    merged.push(...VOLUNTEER_NAV);
  }

  if (input.workingContext?.mode === 'leader') {
    merged.push(...LEADER_NAV);
  }

  if (input.isOrgAdmin) {
    merged.push(...ADMIN_NAV);
  }

  return dedupeNavItems(merged);
}

export function pickActiveNavItem(
  navItems: NavManifestItem[],
  pathname: string,
): NavManifestItem | null {
  const matches = navItems.filter((item) => isNavItemActive(item, pathname));
  if (matches.length === 0) {
    return null;
  }
  if (matches.length === 1) {
    return matches[0]!;
  }
  return matches.sort((a, b) => {
    const aExact = pathname === a.path ? 0 : 1;
    const bExact = pathname === b.path ? 0 : 1;
    if (aExact !== bExact) {
      return aExact - bExact;
    }
    return navItems.indexOf(a) - navItems.indexOf(b);
  })[0]!;
}

export function isNavItemActive(item: NavManifestItem, pathname: string): boolean {
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}
