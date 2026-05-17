import { createContext, useContext, useEffect, useState, type ReactNode, useMemo } from 'react';
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

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const payload = await fetchOrganizationContext(
          devVolunteerId ? { volunteerId: devVolunteerId } : undefined,
        );
        if (cancelled) {
          return;
        }
        setChurches(payload.churches);
        const initialChurch = payload.churches[0];
        setActiveChurchId(initialChurch?.id ?? null);
        setActiveCampusId(firstCampusId(initialChurch));
      } catch (err) {
        if (cancelled) {
          return;
        }
        setChurches([]);
        setActiveChurchId(null);
        setActiveCampusId(null);
        setError(err instanceof Error ? err.message : 'Failed to load organization context');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [enabled, devVolunteerId]);

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
  }), [churches, loading, error, activeChurchId, activeCampusId, activeChurch, activeCampus]);

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
