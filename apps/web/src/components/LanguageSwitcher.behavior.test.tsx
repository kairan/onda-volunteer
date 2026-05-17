import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import i18n from 'i18next';
import { I18nProvider } from '@/i18n/I18nProvider';
import { AuthSessionTestProvider } from '@/auth/AuthSessionProvider';
import {
  initI18n,
  resetI18nForTests,
  setLocalePersistence,
} from '@/i18n/controller';
import { createLocalePersistence } from '@/i18n/localePersistence';
import { LanguageSwitcher } from './LanguageSwitcher';

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

afterEach(() => {
  resetI18nForTests();
});

describe('LanguageSwitcher', () => {
  it('updates visible shell strings when switching to English', async () => {
    const persistence = createLocalePersistence(memoryStorage());
    setLocalePersistence(persistence);
    await initI18n(persistence);

    render(
      <I18nProvider>
        <AuthSessionTestProvider state={{ status: 'unauthenticated', reason: 'signed-out' }}>
          <LanguageSwitcher />
        </AuthSessionTestProvider>
      </I18nProvider>,
    );

    expect(screen.getByText('Português (Brasil)')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('English'));
    expect(i18n.language).toBe('en');
    expect(persistence.load()).toBe('en');
  });
});
