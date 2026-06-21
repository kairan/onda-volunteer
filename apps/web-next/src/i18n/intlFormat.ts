import type { SupportedLocale } from './localePersistence';

export function formatDateTime(
  locale: SupportedLocale,
  instantUtc: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date =
    typeof instantUtc === 'string' ? new Date(instantUtc) : instantUtc;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
    ...options,
  }).format(date);
}

export function formatNumber(
  locale: SupportedLocale,
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}
