import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { SupportedLocale } from '@/i18n/localePersistence';
import {
  buildDualTimeInterval,
  buildDualTimeLabels,
  formatInstantInTimezone,
  getBrowserTimezone,
  type DualTimeLabels,
} from './formatSchedulingTime';

const STORAGE_KEY = 'onda.useLocalTime';

type LocalTimeContextValue = {
  useLocalTime: boolean;
  setUseLocalTime: (value: boolean) => void;
  /** Church/campus timezone (primary display; never replaced when local toggle is on). */
  formatChurchTime: (
    instantUtc: string,
    churchTimezone: string,
    locale: string,
    options?: Intl.DateTimeFormatOptions,
  ) => string;
  /** Dual labels: church framing plus optional personal-local companion. */
  buildDualTime: (
    instantUtc: string,
    churchTimezone: string,
    locale: string,
    options?: Intl.DateTimeFormatOptions,
  ) => DualTimeLabels;
  buildDualInterval: (
    startsAtUtc: string,
    endsAtUtc: string,
    churchTimezone: string,
    locale: string,
    startOptions?: Intl.DateTimeFormatOptions,
    endOptions?: Intl.DateTimeFormatOptions,
  ) => DualTimeLabels;
  /**
   * Viewer preference for form entry: church tz when off, browser tz when on.
   * List/detail surfaces should use {@link buildDualTime} instead.
   */
  formatWithLocal: (
    instantUtc: string,
    churchTimezone: string,
    locale: string,
    options?: Intl.DateTimeFormatOptions,
  ) => string;
};

const LocalTimeContext = createContext<LocalTimeContextValue | null>(null);

function readStoredPreference(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeStoredPreference(value: boolean): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // ignore storage failures in tests or private mode
  }
}

export function LocalTimeProvider({ children }: { children: ReactNode }) {
  const [useLocalTime, setUseLocalTimeState] = useState(readStoredPreference);

  const setUseLocalTime = useCallback((value: boolean) => {
    setUseLocalTimeState(value);
    writeStoredPreference(value);
  }, []);

  const formatChurchTime = useCallback(
    (
      instantUtc: string,
      churchTimezone: string,
      locale: string,
      options?: Intl.DateTimeFormatOptions,
    ) =>
      formatInstantInTimezone(
        instantUtc,
        churchTimezone,
        locale,
        options,
      ),
    [],
  );

  const buildDualTime = useCallback(
    (
      instantUtc: string,
      churchTimezone: string,
      locale: string,
      options?: Intl.DateTimeFormatOptions,
    ) =>
      buildDualTimeLabels(
        instantUtc,
        churchTimezone,
        locale,
        useLocalTime,
        options,
      ),
    [useLocalTime],
  );

  const buildDualInterval = useCallback(
    (
      startsAtUtc: string,
      endsAtUtc: string,
      churchTimezone: string,
      locale: string,
      startOptions?: Intl.DateTimeFormatOptions,
      endOptions?: Intl.DateTimeFormatOptions,
    ) =>
      buildDualTimeInterval(
        startsAtUtc,
        endsAtUtc,
        churchTimezone,
        locale,
        useLocalTime,
        startOptions,
        endOptions,
      ),
    [useLocalTime],
  );

  const formatWithLocal = useCallback(
    (
      instantUtc: string,
      churchTimezone: string,
      locale: string,
      options?: Intl.DateTimeFormatOptions,
    ) => {
      const timeZone = useLocalTime ? getBrowserTimezone() : churchTimezone;
      return formatInstantInTimezone(instantUtc, timeZone, locale, options);
    },
    [useLocalTime],
  );

  const value = useMemo(
    () => ({
      useLocalTime,
      setUseLocalTime,
      formatChurchTime,
      buildDualTime,
      buildDualInterval,
      formatWithLocal,
    }),
    [
      useLocalTime,
      setUseLocalTime,
      formatChurchTime,
      buildDualTime,
      buildDualInterval,
      formatWithLocal,
    ],
  );

  return (
    <LocalTimeContext.Provider value={value}>{children}</LocalTimeContext.Provider>
  );
}

export function useLocalTimeContext() {
  const ctx = useContext(LocalTimeContext);
  if (!ctx) {
    throw new Error('useLocalTimeContext must be used within LocalTimeProvider');
  }
  return ctx;
}
