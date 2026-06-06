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
import { ministriesForShellSwitcher } from './ministryArchive';
import {
  readStoredActiveCampusId,
  readStoredActiveChurchId,
  readStoredActiveMinistryId,
  setStoredOrganizationSelection,
} from './organizationContextStorage';
import type { Church, MinistrySummary } from './types';

function firstCampusId(church: Church | undefined): string | null {
  return church?.campuses[0]?.id ?? null;
}

function resolveMinistryId(
  church: Church | undefined,
  preferredMinistryId: string | null | undefined,
  canSeeArchived: boolean,
): string | null {
  const ministries = ministriesForShellSwitcher(
    church?.ministries ?? [],
    canSeeArchived,
  );
  if (preferredMinistryId) {
    const match = ministries.find((ministry) => ministry.id === preferredMinistryId);
    if (match) {
      return match.id;
    }
  }
  return ministries[0]?.id ?? null;
}

type OrganizationContextValue = {
  churches: Church[];
  loading: boolean;
  error: string | null;
  activeChurchId: string | null;
  activeCampusId: string | null;
  activeMinistryId: string | null;
  activeChurch: Church | null;
  activeCampus: { id: string; name: string; timezone: string } | null;
  activeMinistry: MinistrySummary | null;
  onChurchChange: (churchId: string) => void;
  onCampusChange: (campusId: string) => void;
  onMinistryChange: (ministryId: string) => void;
  refresh: () => Promise<void>;
};

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationContextProvider({
  children,
  enabled,
  devVolunteerId,
  isSystemAdmin = false,
}: {
  children: ReactNode;
  enabled: boolean;
  devVolunteerId?: string;
  isSystemAdmin?: boolean;
}) {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChurchId, setActiveChurchId] = useState<string | null>(null);
  const [activeCampusId, setActiveCampusId] = useState<string | null>(null);
  const [activeMinistryId, setActiveMinistryId] = useState<string | null>(null);

  const loadContext = useCallback(
    async (input?: {
      preferredChurchId?: string | null;
      preferredCampusId?: string | null;
      preferredMinistryId?: string | null;
      isCancelled?: () => boolean;
    }) => {
      if (!enabled) {
        return;
      }

      const cancelled = () => input?.isCancelled?.() ?? false;

      setLoading(true);
      setError(null);
      try {
        const payload = await fetchOrganizationContext(
          devVolunteerId ? { volunteerId: devVolunteerId } : undefined,
        );
        if (cancelled()) {
          return;
        }
        setChurches(payload.churches);
        const selectedChurch =
          payload.churches.find(
            (church) => church.id === input?.preferredChurchId,
          ) ?? payload.churches[0];
        const churchId = selectedChurch?.id ?? null;
        const campusId =
          selectedChurch?.campuses.find(
            (campus) => campus.id === input?.preferredCampusId,
          )?.id ?? firstCampusId(selectedChurch);
        const canSeeArchived =
          Boolean(selectedChurch?.isAccreditedAdmin) || isSystemAdmin;
        const ministryId = resolveMinistryId(
          selectedChurch,
          input?.preferredMinistryId ?? readStoredActiveMinistryId(),
          canSeeArchived,
        );
        setActiveChurchId(churchId);
        setActiveCampusId(campusId);
        setActiveMinistryId(ministryId);
        setStoredOrganizationSelection(churchId, campusId, ministryId);
      } catch (err) {
        if (cancelled()) {
          return;
        }
        setChurches([]);
        setActiveChurchId(null);
        setActiveCampusId(null);
        setActiveMinistryId(null);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load organization context',
        );
      } finally {
        if (!cancelled()) {
          setLoading(false);
        }
      }
    },
    [devVolunteerId, enabled, isSystemAdmin],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    void loadContext({
      isCancelled: () => cancelled,
      preferredChurchId: readStoredActiveChurchId(),
      preferredCampusId: readStoredActiveCampusId(),
      preferredMinistryId: readStoredActiveMinistryId(),
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, loadContext]);

  const activeChurch = useMemo(
    () => churches.find((c) => c.id === activeChurchId) ?? null,
    [churches, activeChurchId],
  );

  const activeCampus = useMemo(
    () => activeChurch?.campuses.find((c) => c.id === activeCampusId) ?? null,
    [activeChurch, activeCampusId],
  );

  const activeMinistry = useMemo(
    () =>
      activeChurch?.ministries?.find((m) => m.id === activeMinistryId) ?? null,
    [activeChurch, activeMinistryId],
  );

  function handleChurchChange(churchId: string) {
    const church = churches.find((item) => item.id === churchId);
    const campusId = firstCampusId(church);
    const canSeeArchived = Boolean(church?.isAccreditedAdmin) || isSystemAdmin;
    const ministryId = resolveMinistryId(church, null, canSeeArchived);
    setActiveChurchId(churchId);
    setActiveCampusId(campusId);
    setActiveMinistryId(ministryId);
    setStoredOrganizationSelection(churchId, campusId, ministryId);
  }

  function handleCampusChange(campusId: string) {
    setActiveCampusId(campusId);
    setStoredOrganizationSelection(activeChurchId, campusId, activeMinistryId);
  }

  function handleMinistryChange(ministryId: string) {
    setActiveMinistryId(ministryId);
    setStoredOrganizationSelection(activeChurchId, activeCampusId, ministryId);
  }

  const refresh = useCallback(
    () =>
      loadContext({
        preferredChurchId: activeChurchId,
        preferredCampusId: activeCampusId,
        preferredMinistryId: activeMinistryId,
      }),
    [activeCampusId, activeChurchId, activeMinistryId, loadContext],
  );

  const value = useMemo(
    () => ({
      churches,
      loading,
      error,
      activeChurchId,
      activeCampusId,
      activeMinistryId,
      activeChurch,
      activeCampus,
      activeMinistry,
      onChurchChange: handleChurchChange,
      onCampusChange: handleCampusChange,
      onMinistryChange: handleMinistryChange,
      refresh,
    }),
    [
      churches,
      loading,
      error,
      activeChurchId,
      activeCampusId,
      activeMinistryId,
      activeChurch,
      activeCampus,
      activeMinistry,
      refresh,
    ],
  );

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
