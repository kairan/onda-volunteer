import { afterEach, describe, expect, it, vi } from 'vitest';
import { isAccessTokenUsable } from './sessionToken';

afterEach(() => {
  vi.useRealTimers();
});

describe('isAccessTokenUsable', () => {
  it('returns false when the session expiry is in the past', () => {
    vi.setSystemTime(new Date('2026-05-15T12:00:00.000Z'));
    expect(isAccessTokenUsable(Math.floor(Date.now() / 1000) - 60)).toBe(false);
  });

  it('returns true when the session expiry is in the future', () => {
    vi.setSystemTime(new Date('2026-05-15T12:00:00.000Z'));
    expect(isAccessTokenUsable(Math.floor(Date.now() / 1000) + 3600)).toBe(true);
  });
});
