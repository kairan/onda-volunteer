import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LocalTimeProvider, useLocalTimeContext } from './LocalTimeProvider';

describe('LocalTimeProvider', () => {
  it('formats with local time when toggled', () => {
    // Mock the local timezone to be different from UTC for the test
    const originalTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const mockTz = 'America/New_York';
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      timeZone: mockTz,
      locale: 'en-US',
      calendar: 'gregory',
      numberingSystem: 'latn',
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LocalTimeProvider>{children}</LocalTimeProvider>
    );

    const { result } = renderHook(() => useLocalTimeContext(), { wrapper });

    const iso = '2026-06-01T14:00:00Z'; // 14:00 UTC = 10:00 AM EDT
    
    // Default: local time is OFF
    let formatted = result.current.formatWithLocal(iso, 'UTC', 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    // Expected: 2:00 PM (or similar based on locale, but definitely UTC time)
    expect(formatted).not.toContain('Local');

    // Turn ON
    act(() => {
      result.current.setUseLocalTime(true);
    });

    formatted = result.current.formatWithLocal(iso, 'UTC', 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Should contain the string ' (Local)'
    expect(formatted).toContain(' (Local)');
    expect(formatted).toContain('/');

    vi.restoreAllMocks();
  });
});
