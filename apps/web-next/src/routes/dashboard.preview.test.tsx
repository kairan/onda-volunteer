import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { DashboardPage } from '@/routes/dashboard';

function renderDashboard() {
  return render(
    <I18nProvider>
      <DashboardPage />
    </I18nProvider>,
  );
}

afterEach(() => {
  cleanup();
});

describe('dashboard preview', () => {
  it('renders the volunteer greeting from fixtures', async () => {
    await initI18n(undefined, 'en');
    renderDashboard();
    expect(
      await screen.findByRole('heading', { name: /hi alex volunteer/i }),
    ).toBeInTheDocument();
  });
});
