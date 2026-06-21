import { describe, expect, it } from 'vitest';
import { resolveInitialLocale } from './resolveInitialLocale';
import type { LocalePersistence } from './localePersistence';

function persistenceReturning(
  value: 'pt-BR' | 'en' | null,
): LocalePersistence {
  return {
    load: () => value,
    save: () => {},
  };
}

describe('resolveInitialLocale', () => {
  it('defaults to pt-BR when nothing is saved', () => {
    expect(resolveInitialLocale(persistenceReturning(null))).toBe('pt-BR');
  });

  it('uses the persisted locale when present', () => {
    expect(resolveInitialLocale(persistenceReturning('en'))).toBe('en');
  });
});
