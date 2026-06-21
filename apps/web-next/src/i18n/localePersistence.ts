export const LOCALE_STORAGE_KEY = 'onda.ui.locale';

export type SupportedLocale = 'pt-BR' | 'en';

export interface LocaleStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface LocalePersistence {
  load(): SupportedLocale | null;
  save(locale: SupportedLocale): void;
}

export function createLocalePersistence(
  storage: LocaleStorage,
): LocalePersistence {
  return {
    load() {
      const raw = storage.getItem(LOCALE_STORAGE_KEY);
      if (raw === 'pt-BR' || raw === 'en') {
        return raw;
      }
      return null;
    },
    save(locale) {
      storage.setItem(LOCALE_STORAGE_KEY, locale);
    },
  };
}

export function browserLocalePersistence(): LocalePersistence {
  return createLocalePersistence(localStorage);
}
