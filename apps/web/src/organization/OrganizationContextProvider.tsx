import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  useMemo,
} from 'react';
import { fetchOrganizationContext } from './fetchOrganizationContext';
import type { Church } from './types';

function firstCampusId(church: Church | undefined): string | null {
  return church?.campuses[0]?.id ?? null;
}

type OrganizationContextValue = {
  churches: Church[];
  loading: boolean;
  error: string | null;
  activeChurchId: string | null;
  activeCampusId: string | null;
  activeChurch: Church | null;
  activeCampus: { id: string; name: string; timezone: string } | null;
  onChurchChange: (churchId: string) => void;
  onCampusChange: (campusId: string) => void;
  refresh: () => Promise<void>;
};

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationContextProvider({
  children,
  enabled,
  devVolunteerId,
}: {
  children: ReactNode;
  enabled: boolean;
  devVolunteerId?: string;
}) {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChurchId, setActiveChurchId] = useState<string | null>(null);
  const [activeCampusId, setActiveCampusId] = useState<string | null>(null);

  const loadContext = useCallback(async (input?: {
    preferredChurchId?: string | null;
    preferredCampusId?: string | null;
  }) => {
    if (!enabled) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = await fetchOrganizationContext(
        devVolunteerId ? { volunteerId: devVolunteerId } : undefined,
      );
      setChurches(payload.churches);
      const selectedChurch =
        payload.churches.find(
          (church) => church.id === input?.preferredChurchId,
        ) ?? payload.churches[0];
      setActiveChurchId(selectedChurch?.id ?? null);
      const selectedCampus = selectedChurch?.campuses.find(
        (campus) => campus.id === input?.preferredCampusId,
      );
      setActiveCampusId(selectedCampus?.id ?? firstCampusId(selectedChurch));
    } catch (err) {
      setChurches([]);
      setActiveChurchId(null);
      setActiveCampusId(null);
      setError(err instanceof Error ? err.message : 'Failed to load organization context');
    } finally {
      setLoading(false);
    }
  }, [devVolunteerId, enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        await loadContext();
      } finally {
        if (cancelled) {
          return;
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [enabled, loadContext]);

  function handleChurchChange(churchId: string) {
    setActiveChurchId(churchId);
    const church = churches.find((item) => item.id === churchId);
    setActiveCampusId(firstCampusId(church));
  }

  const activeChurch = useMemo(() => 
    churches.find(c => c.id === activeChurchId) ?? null,
    [churches, activeChurchId]
  );

  const activeCampus = useMemo(() => 
    activeChurch?.campuses.find(c => c.id === activeCampusId) ?? null,
    [activeChurch, activeCampusId]
  );

  const refresh = useCallback(
    () =>
      loadContext({
        preferredChurchId: activeChurchId,
        preferredCampusId: activeCampusId,
      }),
    [activeCampusId, activeChurchId, loadContext],
  );

  const value = useMemo(() => ({
    churches,
    loading,
    error,
    activeChurchId,
    activeCampusId,
    activeChurch,
    activeCampus,
    onChurchChange: handleChurchChange,
    onCampusChange: setActiveCampusId,
    refresh,
  }), [churches, loading, error, activeChurchId, activeCampusId, activeChurch, activeCampus, refresh]);

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const ctx = useContext(OrganizationContext);
  if (!ctx) {
    throw new Error('useOrganization must be used within OrganizationContextProvider');
  }
  return ctx;
}
