import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { resolveSchedulingPreviewRole } from '@/__preview__/fixtures';
import { VolunteerMyAssignmentsPreview } from '@/__preview__/VolunteerMyAssignmentsPreview';

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

  it('renders volunteer assignment cards on the my assignments preview', async () => {
    await initI18n(undefined, 'en');
    render(
      <I18nProvider>
        <VolunteerMyAssignmentsPreview />
      </I18nProvider>,
    );
    expect(
      await screen.findByRole('heading', { name: /upcoming assignments/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sunday Service')).toBeInTheDocument();
  });
});
