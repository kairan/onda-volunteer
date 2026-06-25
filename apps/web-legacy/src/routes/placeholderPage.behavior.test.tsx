import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { changeLocale, initI18n, resetI18nForTests } from '@/i18n/controller';
import { PlaceholderPage } from './placeholderPage';

afterEach(() => {
  cleanup();
  resetI18nForTests();
});

describe('PlaceholderPage', () => {
  it('resolves scheduling copy in pt-BR and en', async () => {
    await initI18n();
    const { rerender } = render(
      <I18nProvider>
        <PlaceholderPage namespace="scheduling" />
      </I18nProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Agenda' })).toBeInTheDocument();

    await changeLocale('en');
    rerender(
      <I18nProvider>
        <PlaceholderPage namespace="scheduling" />
      </I18nProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Schedule' })).toBeInTheDocument();
  });
});
