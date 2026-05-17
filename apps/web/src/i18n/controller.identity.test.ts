import { afterEach, describe, expect, it, vi } from 'vitest';
import i18n from 'i18next';
import {
  changeLocale,
  initI18n,
  resetI18nForTests,
} from './controller';
import { createLocalePersistence, LOCALE_STORAGE_KEY } from './localePersistence';

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
  vi.restoreAllMocks();
});

describe('i18n controller with identity', () => {
  it('applies server preference when provided', async () => {
    const storage = memoryStorage();
    const persistence = createLocalePersistence(storage);
    
    // Initial load: defaults to pt-BR
    await initI18n(persistence);
    expect(i18n.language).toBe('pt-BR');

    // Simulate sign-in / identity load with server preference 'en'
    await changeLocale('en', persistence);
    expect(i18n.language).toBe('en');
    expect(storage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
  });

  it('does not overwrite server preference with client preference on load if server preference is available', async () => {
    const storage = memoryStorage();
    storage.setItem(LOCALE_STORAGE_KEY, 'pt-BR');
    const persistence = createLocalePersistence(storage);

    await initI18n(persistence, 'en');
    
    expect(i18n.language).toBe('en');
  });

  it('calls onSave callback when locale changes', async () => {
    const storage = memoryStorage();
    const persistence = createLocalePersistence(storage);
    const onSave = vi.fn().mockResolvedValue(undefined);

    await initI18n(persistence);
    await changeLocale('en', persistence, onSave);

    expect(onSave).toHaveBeenCalledWith('en');
    expect(i18n.language).toBe('en');
  });
});
