import { describe, expect, it } from 'vitest';
import {
  createLocalePersistence,
  LOCALE_STORAGE_KEY,
} from './localePersistence';

function memoryStorage(): {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
} {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

describe('locale persistence', () => {
  it('returns null when no locale was saved', () => {
    const persistence = createLocalePersistence(memoryStorage());
    expect(persistence.load()).toBeNull();
  });

  it('persists and reloads the chosen locale', () => {
    const storage = memoryStorage();
    const persistence = createLocalePersistence(storage);
    persistence.save('en');
    expect(storage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
    expect(persistence.load()).toBe('en');
  });
});
