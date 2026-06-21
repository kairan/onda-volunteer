import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { LeaderSchedulingPreview } from '@/routes/scheduling';
import { VolunteerMyAssignmentsPreview } from '@/__preview__/VolunteerMyAssignmentsPreview';

function renderLeaderScheduling() {
  return render(
    <I18nProvider>
      <LeaderSchedulingPreview />
    </I18nProvider>,
  );
}

function renderVolunteerAssignments() {
  return render(
    <I18nProvider>
      <VolunteerMyAssignmentsPreview />
    </I18nProvider>,
  );
}

afterEach(() => {
  cleanup();
});

describe('scheduling preview', () => {
  it('renders the roster fill badge on the leader preview', async () => {
    await initI18n(undefined, 'en');
    renderLeaderScheduling();
    const badges = await screen.findAllByTestId('roster-fill-badge');
    expect(badges[0]).toHaveTextContent('3/5 filled');
  });

  it('renders volunteer assignment cards on the my assignments preview', async () => {
    await initI18n(undefined, 'en');
    renderVolunteerAssignments();
    expect(
      await screen.findByRole('heading', { name: /upcoming assignments/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sunday Service')).toBeInTheDocument();
  });
});
