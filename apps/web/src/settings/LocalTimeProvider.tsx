import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { SupportedLocale } from '@/i18n/localePersistence';

const STORAGE_KEY = 'onda.useLocalTime';

type LocalTimeContextValue = {
  useLocalTime: boolean;
  setUseLocalTime: (value: boolean) => void;
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

  const formatWithLocal = useCallback(
    (
      instantUtc: string,
      churchTimezone: string,
      locale: string,
      options?: Intl.DateTimeFormatOptions,
    ) => {
      const timeZone = useLocalTime
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : churchTimezone;
      return new Intl.DateTimeFormat(locale as SupportedLocale, {
        timeZone,
        ...options,
      }).format(new Date(instantUtc));
    },
    [useLocalTime],
  );

  const value = useMemo(
    () => ({ useLocalTime, setUseLocalTime, formatWithLocal }),
    [useLocalTime, setUseLocalTime, formatWithLocal],
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
