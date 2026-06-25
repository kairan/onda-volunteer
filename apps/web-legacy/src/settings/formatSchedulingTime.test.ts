import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildDualTimeInterval,
  buildDualTimeLabels,
  formatInstantInTimezone,
} from './formatSchedulingTime';

const INSTANT = '2026-06-01T14:00:00.000Z';
const CHURCH_TZ = 'America/New_York';
const OPTIONS = {
  weekday: 'short' as const,
  month: 'short' as const,
  day: 'numeric' as const,
  hour: '2-digit' as const,
  minute: '2-digit' as const,
};

describe('formatSchedulingTime', () => {
afterEach(() => {
  vi.restoreAllMocks();
});

  it('formats church timezone without personal line when toggle is off', () => {
    const labels = buildDualTimeLabels(
      INSTANT,
      CHURCH_TZ,
      'en',
      false,
      OPTIONS,
    );
    expect(labels.church).toContain('Jun');
    expect(labels.personalLocal).toBeUndefined();
  });

  it('adds personal-local line when toggle is on and zones differ', () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      ...new Intl.DateTimeFormat().resolvedOptions(),
      timeZone: 'Europe/London',
    });

    const labels = buildDualTimeLabels(
      INSTANT,
      CHURCH_TZ,
      'en',
      true,
      OPTIONS,
    );
    expect(labels.church).toBeTruthy();
    expect(labels.personalLocal).toBeTruthy();
    expect(labels.personalLocal).not.toBe(labels.church);
  });

  it('keeps church-only label when browser timezone matches church', () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      ...new Intl.DateTimeFormat().resolvedOptions(),
      timeZone: CHURCH_TZ,
    });

    const labels = buildDualTimeLabels(
      INSTANT,
      CHURCH_TZ,
      'en',
      true,
      OPTIONS,
    );
    expect(labels.personalLocal).toBeUndefined();
  });

  it('builds dual interval labels for event windows', () => {
    const labels = buildDualTimeInterval(
      INSTANT,
      '2026-06-01T16:00:00.000Z',
      CHURCH_TZ,
      'en',
      false,
      OPTIONS,
      { hour: '2-digit', minute: '2-digit' },
    );
    expect(labels.church).toContain('→');
    expect(labels.personalLocal).toBeUndefined();
  });

  it('church formatting is stable for a fixed UTC instant', () => {
    const formatted = formatInstantInTimezone(
      INSTANT,
      CHURCH_TZ,
      'en',
      OPTIONS,
    );
    expect(formatted).toMatch(/Jun/);
    expect(formatted).toMatch(/10:00/);
  });
});
