import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
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
  formatChurchTime: (
    instantUtc: string,
    churchTimezone: string,
    locale: string,
    options?: Intl.DateTimeFormatOptions,
  ) => string;
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
  formTimezone: (churchTimezone: string) => string;
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

  const formTimezone = useCallback(
    (churchTimezone: string) =>
      useLocalTime ? getBrowserTimezone() : churchTimezone,
    [useLocalTime],
  );

  const value = useMemo(
    () => ({
      useLocalTime,
      setUseLocalTime,
      formatChurchTime,
      buildDualTime,
      buildDualInterval,
      formTimezone,
    }),
    [
      useLocalTime,
      setUseLocalTime,
      formatChurchTime,
      buildDualTime,
      buildDualInterval,
      formTimezone,
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
