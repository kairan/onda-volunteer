import { describe, expect, it } from 'vitest';
import { resolveSchedulingPresentationTimezone } from './timezoneCue';

describe('resolveSchedulingPresentationTimezone', () => {
  it('prefers active campus timezone over church default', () => {
    expect(
      resolveSchedulingPresentationTimezone({
        activeCampus: { timezone: 'Europe/Lisbon' },
        activeChurch: { defaultTimezone: 'America/Sao_Paulo' },
      }),
    ).toBe('Europe/Lisbon');
  });

  it('falls back to church default then UTC', () => {
    expect(
      resolveSchedulingPresentationTimezone({
        activeCampus: null,
        activeChurch: { defaultTimezone: 'America/New_York' },
      }),
    ).toBe('America/New_York');

    expect(
      resolveSchedulingPresentationTimezone({
        activeCampus: null,
        activeChurch: null,
      }),
    ).toBe('UTC');
  });
});
