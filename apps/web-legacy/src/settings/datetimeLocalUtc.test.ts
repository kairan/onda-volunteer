import { describe, expect, it } from 'vitest';
import { datetimeLocalToUtcIso, utcIsoToDatetimeLocal } from './datetimeLocalUtc';

describe('datetimeLocalUtc', () => {
  it('round-trips UTC wall time', () => {
    const iso = '2026-06-01T14:00:00.000Z';
    const local = utcIsoToDatetimeLocal(iso, 'UTC');
    expect(local).toBe('2026-06-01T14:00');
    expect(datetimeLocalToUtcIso(local, 'UTC')).toBe(iso);
  });

  it('converts America/Sao_Paulo wall time to UTC', () => {
    expect(datetimeLocalToUtcIso('2026-06-01T10:00', 'America/Sao_Paulo')).toBe(
      '2026-06-01T13:00:00.000Z',
    );
    expect(
      utcIsoToDatetimeLocal('2026-06-01T13:00:00.000Z', 'America/Sao_Paulo'),
    ).toBe('2026-06-01T10:00');
  });
});
