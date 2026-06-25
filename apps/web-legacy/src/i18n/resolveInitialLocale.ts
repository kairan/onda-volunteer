import type { LocalePersistence, SupportedLocale } from './localePersistence';

export const DEFAULT_LOCALE: SupportedLocale = 'pt-BR';

export function resolveInitialLocale(
  persistence: LocalePersistence,
): SupportedLocale {
  return persistence.load() ?? DEFAULT_LOCALE;
}
