import { useEffect, useState } from 'react';
import { fetchOrganizationContext } from './fetchOrganizationContext';
import type { Church } from './types';

function firstCampusId(church: Church | undefined): string | null {
  return church?.campuses[0]?.id ?? null;
}

export function useOrganizationContext(demoVolunteerId: string | undefined) {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChurchId, setActiveChurchId] = useState<string | null>(null);
  const [activeCampusId, setActiveCampusId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const payload = await fetchOrganizationContext({
          volunteerId: demoVolunteerId,
        });
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
  }, [demoVolunteerId]);

  function handleChurchChange(churchId: string) {
    setActiveChurchId(churchId);
    const church = churches.find((item) => item.id === churchId);
    setActiveCampusId(firstCampusId(church));
  }

  return {
    churches,
    loading,
    error,
    activeChurchId,
    activeCampusId,
    onChurchChange: handleChurchChange,
    onCampusChange: setActiveCampusId,
  };
}
