import type { SupportedLocale } from '@/i18n/localePersistence';

export type DualTimeLabels = {
  church: string;
  personalLocal?: string;
};

export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formatInstantInTimezone(
  instantUtc: string,
  timeZone: string,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(locale as SupportedLocale, {
    timeZone,
    ...options,
  }).format(new Date(instantUtc));
}

export function buildDualTimeLabels(
  instantUtc: string,
  churchTimezone: string,
  locale: string,
  useLocalTime: boolean,
  options?: Intl.DateTimeFormatOptions,
): DualTimeLabels {
  const church = formatInstantInTimezone(
    instantUtc,
    churchTimezone,
    locale,
    options,
  );
  if (!useLocalTime) {
    return { church };
  }
  const browserTz = getBrowserTimezone();
  if (browserTz === churchTimezone) {
    return { church };
  }
  const personalLocal = formatInstantInTimezone(
    instantUtc,
    browserTz,
    locale,
    options,
  );
  return { church, personalLocal };
}

export function buildDualTimeInterval(
  startsAtUtc: string,
  endsAtUtc: string,
  churchTimezone: string,
  locale: string,
  useLocalTime: boolean,
  startOptions?: Intl.DateTimeFormatOptions,
  endOptions?: Intl.DateTimeFormatOptions,
): DualTimeLabels {
  const start = formatInstantInTimezone(
    startsAtUtc,
    churchTimezone,
    locale,
    startOptions,
  );
  const end = formatInstantInTimezone(
    endsAtUtc,
    churchTimezone,
    locale,
    endOptions ?? startOptions,
  );
  const church = `${start} → ${end}`;

  if (!useLocalTime) {
    return { church };
  }
  const browserTz = getBrowserTimezone();
  if (browserTz === churchTimezone) {
    return { church };
  }
  const personalStart = formatInstantInTimezone(
    startsAtUtc,
    browserTz,
    locale,
    startOptions,
  );
  const personalEnd = formatInstantInTimezone(
    endsAtUtc,
    browserTz,
    locale,
    endOptions ?? startOptions,
  );
  return { church, personalLocal: `${personalStart} → ${personalEnd}` };
}
