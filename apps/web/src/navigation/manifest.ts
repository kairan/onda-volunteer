export type NavManifestItem = {
  id: string;
  path: string;
  labelKey: `shell:nav.${string}`;
  namespace: 'dashboard' | 'scheduling' | 'ministries' | 'volunteers' | 'timeAway';
  placeholder: boolean;
};

export const PRIMARY_NAV_MANIFEST: NavManifestItem[] = [
  {
    id: 'dashboard',
    path: '/dashboard',
    labelKey: 'shell:nav.dashboard',
    namespace: 'dashboard',
    placeholder: false,
  },
  {
    id: 'scheduling',
    path: '/scheduling',
    labelKey: 'shell:nav.scheduling',
    namespace: 'scheduling',
    placeholder: false,
  },
  {
    id: 'ministries',
    path: '/ministries',
    labelKey: 'shell:nav.ministries',
    namespace: 'ministries',
    placeholder: false,
  },
  {
    id: 'volunteers',
    path: '/volunteers',
    labelKey: 'shell:nav.volunteers',
    namespace: 'volunteers',
    placeholder: true,
  },
  {
    id: 'timeAway',
    path: '/time-away',
    labelKey: 'shell:nav.timeAway',
    namespace: 'timeAway',
    placeholder: false,
  },
];
