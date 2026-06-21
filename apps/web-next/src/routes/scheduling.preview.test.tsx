import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { resolveSchedulingPreviewRole } from '@/__preview__/fixtures';
import { VolunteerMyAssignmentsPreview } from '@/__preview__/VolunteerMyAssignmentsPreview';
import { LeaderSchedulingPreview, SchedulingPage } from '@/routes/scheduling';

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

function renderSchedulingPage(previewRole?: string) {
  return render(
    <I18nProvider>
      <SchedulingPage previewRole={previewRole} />
    </I18nProvider>,
  );
}

afterEach(() => {
  cleanup();
});

describe('scheduling preview', () => {
  it('resolveSchedulingPreviewRole honors ?previewRole=volunteer|leader', () => {
    expect(resolveSchedulingPreviewRole('volunteer')).toBe('volunteer');
    expect(resolveSchedulingPreviewRole('leader')).toBe('leader');
    expect(resolveSchedulingPreviewRole(undefined)).toBe('leader');
    expect(resolveSchedulingPreviewRole('invalid')).toBe('leader');
  });

  it('renders leader preview from SchedulingPage by default', async () => {
    await initI18n(undefined, 'en');
    renderSchedulingPage();
    const badges = await screen.findAllByTestId('roster-fill-badge');
    expect(badges[0]).toHaveTextContent('3/5 filled');
  });

  it('renders volunteer preview when previewRole=volunteer', async () => {
    await initI18n(undefined, 'en');
    renderSchedulingPage('volunteer');
    expect(
      await screen.findByRole('heading', { name: /upcoming assignments/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sunday Service')).toBeInTheDocument();
    expect(screen.queryByTestId('roster-fill-badge')).not.toBeInTheDocument();
  });

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
