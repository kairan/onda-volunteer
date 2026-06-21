import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { SchedulingPage } from '@/routes/scheduling';

function renderScheduling() {
  return render(
    <I18nProvider>
      <SchedulingPage />
    </I18nProvider>,
  );
}

afterEach(() => {
  cleanup();
});

describe('scheduling preview', () => {
  it('renders the roster fill badge from fixtures', async () => {
    await initI18n(undefined, 'en');
    renderScheduling();
    expect(await screen.findByTestId('roster-fill-badge')).toHaveTextContent(
      '2/4 filled',
    );
  });
});
