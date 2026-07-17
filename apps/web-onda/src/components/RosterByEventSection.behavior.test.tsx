import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import { RosterByEventSection } from './RosterByEventSection';

const rosterFixture = [
  {
    roleId: 'role-1',
    roleName: 'Greeter',
    assignmentId: 'asg-1',
    volunteerId: 'vol-1',
    volunteerName: 'Sarah Chen',
  },
  {
    roleId: 'role-2',
    roleName: 'Usher',
  },
];

function renderSection(
  props: Partial<React.ComponentProps<typeof RosterByEventSection>> = {},
) {
  return render(
    <I18nProvider>
      <LocalTimeProvider>
        <RosterByEventSection
          eventTitle="Sunday Service"
          timeLabels={{ church: 'Sun, Jun 22 · 9:00 AM' }}
          roster={rosterFixture}
          onAssign={() => undefined}
          onRelease={() => undefined}
          {...props}
        />
      </LocalTimeProvider>
    </I18nProvider>,
  );
}

afterEach(() => {
  cleanup();
});

describe('RosterByEventSection', () => {
  it('shows fill badge with ratio', async () => {
    await initI18n(undefined, 'en');
    renderSection();
    expect(screen.getByTestId('roster-fill-badge')).toHaveTextContent('1/2 filled');
  });

  it('does not use glass/backdrop-blur on roster cards (BB-FLR-01 AC4)', async () => {
    await initI18n(undefined, 'en');
    renderSection();
    const card = screen.getByTestId('roster-event-card');
    expect(card.className).not.toContain('backdrop-blur');
  });

  it('renders assigned row with volunteer name and initials avatar', async () => {
    await initI18n(undefined, 'en');
    renderSection();
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('SC')).toBeInTheDocument();
  });

  it('renders unfilled row with assign button', async () => {
    await initI18n(undefined, 'en');
    renderSection();
    expect(screen.getByText('Unfilled')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /assign/i })).toBeInTheDocument();
  });

  it('calls release handler for assigned rows', async () => {
    await initI18n(undefined, 'en');
    const user = userEvent.setup();
    const onRelease = vi.fn();
    renderSection({ onRelease });
    await user.click(screen.getByRole('button', { name: /release/i }));
    expect(onRelease).toHaveBeenCalledWith('asg-1', 'role-1');
  });
});
