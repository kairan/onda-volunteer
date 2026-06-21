import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/query/queryKeys';
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

function resolveSelection(
  churches: Church[],
  preferredChurchId: string | null,
  preferredCampusId: string | null,
  preferredMinistryId: string | null,
  isSystemAdmin: boolean,
): {
  churchId: string | null;
  campusId: string | null;
  ministryId: string | null;
} {
  const selectedChurch =
    churches.find((church) => church.id === preferredChurchId) ?? churches[0];
  const churchId = selectedChurch?.id ?? null;
  const campusId =
    selectedChurch?.campuses.find((campus) => campus.id === preferredCampusId)
      ?.id ?? firstCampusId(selectedChurch);
  const canSeeArchived =
    Boolean(selectedChurch?.isAccreditedAdmin) || isSystemAdmin;
  const ministryId = resolveMinistryId(
    selectedChurch,
    preferredMinistryId,
    canSeeArchived,
  );
  return { churchId, campusId, ministryId };
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

export function OrganizationProvider({
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
  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.organizationContext(devVolunteerId),
    queryFn: () =>
      fetchOrganizationContext(
        devVolunteerId ? { volunteerId: devVolunteerId } : undefined,
      ),
    enabled,
  });

  const churches = data?.churches ?? [];
  const [activeChurchId, setActiveChurchId] = useState<string | null>(null);
  const [activeCampusId, setActiveCampusId] = useState<string | null>(null);
  const [activeMinistryId, setActiveMinistryId] = useState<string | null>(null);
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    bootstrappedRef.current = false;
    setActiveChurchId(null);
    setActiveCampusId(null);
    setActiveMinistryId(null);
  }, [devVolunteerId]);

  useEffect(() => {
    if (!enabled) {
      bootstrappedRef.current = false;
      return;
    }
    if (!data || bootstrappedRef.current) {
      return;
    }
    const resolved = resolveSelection(
      data.churches,
      readStoredActiveChurchId(),
      readStoredActiveCampusId(),
      readStoredActiveMinistryId(),
      isSystemAdmin,
    );
    setActiveChurchId(resolved.churchId);
    setActiveCampusId(resolved.campusId);
    setActiveMinistryId(resolved.ministryId);
    setStoredOrganizationSelection(
      resolved.churchId,
      resolved.campusId,
      resolved.ministryId,
    );
    bootstrappedRef.current = true;
  }, [data, enabled, isSystemAdmin]);

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

  const onChurchChange = useCallback(
    (churchId: string) => {
      const church = churches.find((item) => item.id === churchId);
      const campusId = firstCampusId(church);
      const canSeeArchived = Boolean(church?.isAccreditedAdmin) || isSystemAdmin;
      const ministryId = resolveMinistryId(church, null, canSeeArchived);
      setActiveChurchId(churchId);
      setActiveCampusId(campusId);
      setActiveMinistryId(ministryId);
      setStoredOrganizationSelection(churchId, campusId, ministryId);
    },
    [churches, isSystemAdmin],
  );

  const onCampusChange = useCallback(
    (campusId: string) => {
      setActiveCampusId(campusId);
      setStoredOrganizationSelection(activeChurchId, campusId, activeMinistryId);
    },
    [activeChurchId, activeMinistryId],
  );

  const onMinistryChange = useCallback(
    (ministryId: string) => {
      setActiveMinistryId(ministryId);
      setStoredOrganizationSelection(activeChurchId, activeCampusId, ministryId);
    },
    [activeChurchId, activeCampusId],
  );

  const refresh = useCallback(async () => {
    await queryClient.cancelQueries({
      queryKey: queryKeys.organizationContext(devVolunteerId),
    });
    const freshData = await fetchOrganizationContext(
      devVolunteerId ? { volunteerId: devVolunteerId } : undefined,
    );
    const resolved = resolveSelection(
      freshData.churches,
      activeChurchId,
      activeCampusId,
      activeMinistryId,
      isSystemAdmin,
    );
    setActiveChurchId(resolved.churchId);
    setActiveCampusId(resolved.campusId);
    setActiveMinistryId(resolved.ministryId);
    setStoredOrganizationSelection(
      resolved.churchId,
      resolved.campusId,
      resolved.ministryId,
    );
    queryClient.setQueryData(
      queryKeys.organizationContext(devVolunteerId),
      freshData,
    );
    await queryClient.invalidateQueries({
      queryKey: queryKeys.organizationContext(devVolunteerId),
      refetchType: 'none',
    });
  }, [
    activeCampusId,
    activeChurchId,
    activeMinistryId,
    devVolunteerId,
    isSystemAdmin,
    queryClient,
  ]);

  const value = useMemo(
    () => ({
      churches,
      loading: enabled ? isLoading : false,
      error: queryError
        ? queryError instanceof Error
          ? queryError.message
          : 'Failed to load organization context'
        : null,
      activeChurchId,
      activeCampusId,
      activeMinistryId,
      activeChurch,
      activeCampus,
      activeMinistry,
      onChurchChange,
      onCampusChange,
      onMinistryChange,
      refresh,
    }),
    [
      churches,
      enabled,
      isLoading,
      queryError,
      activeChurchId,
      activeCampusId,
      activeMinistryId,
      activeChurch,
      activeCampus,
      activeMinistry,
      onChurchChange,
      onCampusChange,
      onMinistryChange,
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
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return ctx;
}
