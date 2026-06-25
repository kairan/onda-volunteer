import { describe, expect, it } from 'vitest';
import { PRIMARY_NAV_MANIFEST } from './manifest';

describe('PRIMARY_NAV_MANIFEST', () => {
  it('lists dashboard first then placeholder destinations in stable order', () => {
    expect(PRIMARY_NAV_MANIFEST.map((item) => item.id)).toEqual([
      'dashboard',
      'scheduling',
      'ministries',
      'volunteers',
      'timeAway',
    ]);
  });

  it('exposes a route path for every manifest entry', () => {
    for (const item of PRIMARY_NAV_MANIFEST) {
      expect(item.path.startsWith('/')).toBe(true);
    }
  });

  it('labels Time away for the availability destination', () => {
    const timeAway = PRIMARY_NAV_MANIFEST.find((item) => item.id === 'timeAway');
    expect(timeAway?.labelKey).toBe('shell:nav.timeAway');
    expect(timeAway?.path).toBe('/time-away');
  });
});
