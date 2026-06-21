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
    merged.push(...VOLUNTEER_NAV);
  }
  if (grants.isLeader) {
    merged.push(...LEADER_NAV);
  }
  if (grants.isOrgAdmin) {
    merged.push(...ADMIN_NAV);
  }

  const seen = new Set<string>();
  return merged.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

export function isNavItemActive(item: NavManifestItem, pathname: string): boolean {
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}
