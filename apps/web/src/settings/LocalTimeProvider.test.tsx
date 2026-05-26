import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  LocalTimeProvider,
  useLocalTimeContext,
} from './LocalTimeProvider';

const INSTANT = '2026-06-01T14:00:00.000Z';
const CHURCH_TZ = 'America/New_York';

function Probe() {
  const { useLocalTime, setUseLocalTime, buildDualTime } = useLocalTimeContext();
  const labels = buildDualTime(INSTANT, CHURCH_TZ, 'en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <div>
      <span data-testid="church">{labels.church}</span>
      <span data-testid="personal">{labels.personalLocal ?? ''}</span>
      <button type="button" onClick={() => setUseLocalTime(!useLocalTime)}>
        toggle
      </button>
    </div>
  );
}

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe('LocalTimeProvider', () => {
  it('persists preference in sessionStorage across remount', async () => {
    const user = userEvent.setup();
    const first = render(
      <LocalTimeProvider>
        <Probe />
      </LocalTimeProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'toggle' }));
    expect(sessionStorage.getItem('onda.useLocalTime')).toBe('true');
    first.unmount();

    render(
      <LocalTimeProvider>
        <Probe />
      </LocalTimeProvider>,
    );
    expect(sessionStorage.getItem('onda.useLocalTime')).toBe('true');
  });

  it('changes dual labels when toggle flips for a fixed instant', async () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      ...new Intl.DateTimeFormat().resolvedOptions(),
      timeZone: 'Europe/London',
    });

    const user = userEvent.setup();
    render(
      <LocalTimeProvider>
        <Probe />
      </LocalTimeProvider>,
    );

    const churchBefore = screen.getByTestId('church').textContent;
    expect(screen.getByTestId('personal').textContent).toBe('');

    await user.click(screen.getByRole('button', { name: 'toggle' }));

    expect(screen.getByTestId('church').textContent).toBe(churchBefore);
    expect(screen.getByTestId('personal').textContent).not.toBe('');
  });
});
