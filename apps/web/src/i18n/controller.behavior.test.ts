import { afterEach, describe, expect, it } from 'vitest';
import i18n from 'i18next';
import {
  changeLocale,
  initI18n,
  missingKeyDevMarker,
  resetI18nForTests,
} from './controller';
import { createLocalePersistence } from './localePersistence';

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
  void i18n.off();
});

describe('i18n controller', () => {
  it('defaults to pt-BR on cold load with no saved preference', async () => {
    const persistence = createLocalePersistence(memoryStorage());
    await initI18n(persistence);
    expect(i18n.language).toBe('pt-BR');
    expect(i18n.t('shell:help')).toBe('Ajuda');
  });

  it('falls back from pt-BR to en for missing keys', async () => {
    const persistence = createLocalePersistence(memoryStorage());
    await initI18n(persistence);
    i18n.addResourceBundle('en', 'common', { fallbackProbe: 'From English' }, true, true);
    await i18n.changeLanguage('pt-BR');
    expect(i18n.t('common:fallbackProbe')).toBe('From English');
  });

  it('persists locale changes across re-init', async () => {
    const storage = memoryStorage();
    const persistence = createLocalePersistence(storage);
    await initI18n(persistence);
    await changeLocale('en', persistence);
    expect(i18n.t('shell:help')).toBe('Help');

    resetI18nForTests();
    await initI18n(persistence);
    expect(i18n.language).toBe('en');
    expect(i18n.t('shell:help')).toBe('Help');
  });

  it('marks catastrophic missing keys in development diagnostics', () => {
    expect(missingKeyDevMarker(['pt-BR'], 'shell', 'unknown.key')).toBe(
      '[missing:pt-BR/shell:unknown.key]',
    );
  });
});
