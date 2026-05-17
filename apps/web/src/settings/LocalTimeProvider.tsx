import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type LocalTimeContextValue = {
  useLocalTime: boolean;
  setUseLocalTime: (val: boolean) => void;
  formatWithLocal: (iso: string, churchTimezone: string, locale: string, formatOpts: Intl.DateTimeFormatOptions) => string;
};

const LocalTimeContext = createContext<LocalTimeContextValue | null>(null);

const STORAGE_KEY = 'onda_use_local_time';

export function LocalTimeProvider({ children }: { children: ReactNode }) {
  const [useLocalTime, setUseLocalTimeState] = useState(false);

  useEffect(() => {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === 'true') setUseLocalTimeState(true);
  }, []);

  const setUseLocalTime = (val: boolean) => {
    setUseLocalTimeState(val);
    localStorage.setItem(STORAGE_KEY, val ? 'true' : 'false');
  };

  const formatWithLocal = (iso: string, churchTimezone: string, locale: string, formatOpts: Intl.DateTimeFormatOptions) => {
    try {
      const churchTime = new Intl.DateTimeFormat(locale, {
        ...formatOpts,
        timeZone: churchTimezone,
      }).format(new Date(iso));

      if (!useLocalTime) return churchTime;

      const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (localTz === churchTimezone) return churchTime; // Same TZ

      const localTime = new Intl.DateTimeFormat(locale, {
        ...formatOpts,
        timeZone: localTz,
      }).format(new Date(iso));

      return `${churchTime} / ${localTime} (Local)`;
    } catch {
      return iso;
    }
  };

  return (
    <LocalTimeContext.Provider value={{ useLocalTime, setUseLocalTime, formatWithLocal }}>
      {children}
    </LocalTimeContext.Provider>
  );
}

export function useLocalTimeContext() {
  const ctx = useContext(LocalTimeContext);
  if (!ctx) throw new Error('useLocalTimeContext must be used within LocalTimeProvider');
  return ctx;
}
