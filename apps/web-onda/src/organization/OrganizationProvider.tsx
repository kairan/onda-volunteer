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
import {
  readStoredActiveCampusId,
  readStoredActiveChurchId,
  readStoredActiveMinistryId,
  readStoredWorkingContext,
  setStoredOrganizationSelection,
  writeStoredWorkingContext,
} from './organizationContextStorage';
import type { Church, MinistrySummary } from './types';
import {
  buildWorkingContextOptions,
  resolveWorkingContext,
  type WorkingContext,
  type WorkingContextOption,
} from './workingContext';

function firstCampusId(church: Church | undefined): string | null {
  return church?.campuses[0]?.id ?? null;
}

function resolveSelection(
  churches: Church[],
  preferredChurchId: string | null,
  preferredCampusId: string | null,
): {
  churchId: string | null;
  campusId: string | null;
} {
  const selectedChurch =
    churches.find((church) => church.id === preferredChurchId) ?? churches[0];
  const churchId = selectedChurch?.id ?? null;
  const campusId =
    selectedChurch?.campuses.find((campus) => campus.id === preferredCampusId)
      ?.id ?? firstCampusId(selectedChurch);
  return { churchId, campusId };
}

function resolveWorkingContextForChurch(
  church: Church | null,
  isSystemAdmin: boolean,
  storedWorkingContext: WorkingContext | null,
  legacyMinistryId: string | null,
): WorkingContext | null {
  if (!church) {
    return null;
  }
  const canSeeArchived = Boolean(church.isAccreditedAdmin) || isSystemAdmin;
  const options = buildWorkingContextOptions(church.ministries, canSeeArchived);
  return resolveWorkingContext(
    options,
    storedWorkingContext,
    legacyMinistryId,
  );
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
  workingContext: WorkingContext | null;
  workingContextOptions: WorkingContextOption[];
  onChurchChange: (churchId: string) => void;
  onCampusChange: (campusId: string) => void;
  onWorkingContextChange: (ctx: WorkingContext) => void;
  refresh: () => Promise<void>;
};

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({
  children,
  enabled,
  sessionVolunteerId = null,
  devVolunteerId,
  isSystemAdmin = false,
}: {
  children: ReactNode;
  enabled: boolean;
  sessionVolunteerId?: string | null;
  devVolunteerId?: string;
  isSystemAdmin?: boolean;
}) {
  const queryClient = useQueryClient();
  const orgContextQueryKey = queryKeys.organizationContext(
    sessionVolunteerId,
    devVolunteerId,
  );
  const {
    data,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: orgContextQueryKey,
    queryFn: () =>
      fetchOrganizationContext(
        devVolunteerId ? { volunteerId: devVolunteerId } : undefined,
      ),
    enabled,
  });

  const hasQueryError = Boolean(queryError);
  const churches = hasQueryError ? [] : (data?.churches ?? []);
  const [activeChurchId, setActiveChurchId] = useState<string | null>(null);
  const [activeCampusId, setActiveCampusId] = useState<string | null>(null);
  const [storedWorkingContext, setStoredWorkingContext] =
    useState<WorkingContext | null>(null);
  const bootstrappedRef = useRef(false);
  const legacyMinistryMigratedRef = useRef(false);

  useEffect(() => {
    bootstrappedRef.current = false;
    legacyMinistryMigratedRef.current = false;
    setActiveChurchId(null);
    setActiveCampusId(null);
    setStoredWorkingContext(null);
  }, [sessionVolunteerId, devVolunteerId]);

  useEffect(() => {
    if (!queryError) {
      return;
    }
    bootstrappedRef.current = false;
    setActiveChurchId(null);
    setActiveCampusId(null);
    setStoredWorkingContext(null);
  }, [queryError]);

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
    );
    const church =
      data.churches.find((item) => item.id === resolved.churchId) ?? null;
    const legacyMinistryId = legacyMinistryMigratedRef.current
      ? null
      : readStoredActiveMinistryId();
    legacyMinistryMigratedRef.current = true;
    const workingContext = resolveWorkingContextForChurch(
      church,
      isSystemAdmin,
      church ? readStoredWorkingContext(church.id) : null,
      legacyMinistryId,
    );
    setActiveChurchId(resolved.churchId);
    setActiveCampusId(resolved.campusId);
    setStoredWorkingContext(workingContext);
    if (church && workingContext) {
      writeStoredWorkingContext(church.id, workingContext);
    }
    setStoredOrganizationSelection(
      resolved.churchId,
      resolved.campusId,
      workingContext?.ministryId ?? null,
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

  const workingContextOptions = useMemo(
    () =>
      buildWorkingContextOptions(
        activeChurch?.ministries ?? [],
        Boolean(activeChurch?.isAccreditedAdmin) || isSystemAdmin,
      ),
    [activeChurch, isSystemAdmin],
  );

  const workingContext = useMemo(
    () =>
      resolveWorkingContext(
        workingContextOptions,
        storedWorkingContext,
        null,
      ),
    [workingContextOptions, storedWorkingContext],
  );

  const activeMinistryId = workingContext?.ministryId ?? null;

  const activeMinistry = useMemo(
    () =>
      activeChurch?.ministries?.find((m) => m.id === activeMinistryId) ?? null,
    [activeChurch, activeMinistryId],
  );

  const onChurchChange = useCallback(
    (churchId: string) => {
      const church = churches.find((item) => item.id === churchId);
      const campusId = firstCampusId(church);
      const nextWorkingContext = resolveWorkingContextForChurch(
        church ?? null,
        isSystemAdmin,
        church ? readStoredWorkingContext(church.id) : null,
        null,
      );
      setActiveChurchId(churchId);
      setActiveCampusId(campusId);
      setStoredWorkingContext(nextWorkingContext);
      if (church && nextWorkingContext) {
        writeStoredWorkingContext(church.id, nextWorkingContext);
      }
      setStoredOrganizationSelection(
        churchId,
        campusId,
        nextWorkingContext?.ministryId ?? null,
      );
    },
    [churches, isSystemAdmin],
  );

  const onCampusChange = useCallback(
    (campusId: string) => {
      setActiveCampusId(campusId);
      setStoredOrganizationSelection(
        activeChurchId,
        campusId,
        activeMinistryId,
      );
    },
    [activeChurchId, activeMinistryId],
  );

  const onWorkingContextChange = useCallback(
    (ctx: WorkingContext) => {
      setStoredWorkingContext(ctx);
      if (activeChurchId) {
        writeStoredWorkingContext(activeChurchId, ctx);
      }
      setStoredOrganizationSelection(activeChurchId, activeCampusId, ctx.ministryId);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event-detail'] });
    },
    [activeChurchId, activeCampusId, queryClient],
  );

  const refresh = useCallback(async () => {
    try {
      await queryClient.cancelQueries({
        queryKey: orgContextQueryKey,
      });
      const freshData = await fetchOrganizationContext(
        devVolunteerId ? { volunteerId: devVolunteerId } : undefined,
      );
      const resolved = resolveSelection(
        freshData.churches,
        activeChurchId,
        activeCampusId,
      );
      const church =
        freshData.churches.find((item) => item.id === resolved.churchId) ?? null;
      const nextWorkingContext = resolveWorkingContextForChurch(
        church,
        isSystemAdmin,
        church && activeChurchId
          ? readStoredWorkingContext(activeChurchId)
          : storedWorkingContext,
        null,
      );
      setActiveChurchId(resolved.churchId);
      setActiveCampusId(resolved.campusId);
      setStoredWorkingContext(nextWorkingContext);
      if (church && nextWorkingContext) {
        writeStoredWorkingContext(church.id, nextWorkingContext);
      }
      setStoredOrganizationSelection(
        resolved.churchId,
        resolved.campusId,
        nextWorkingContext?.ministryId ?? null,
      );
      queryClient.setQueryData(orgContextQueryKey, freshData);
      await queryClient.invalidateQueries({
        queryKey: orgContextQueryKey,
        refetchType: 'none',
      });
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error('Failed to load organization context');
      bootstrappedRef.current = false;
      setActiveChurchId(null);
      setActiveCampusId(null);
      setStoredWorkingContext(null);
      queryClient.setQueryData(orgContextQueryKey, undefined);
      queryClient
        .getQueryCache()
        .find({ queryKey: orgContextQueryKey })
        ?.setState({
          data: undefined,
          error,
          status: 'error',
          fetchStatus: 'idle',
        });
    }
  }, [
    activeCampusId,
    activeChurchId,
    devVolunteerId,
    isSystemAdmin,
    orgContextQueryKey,
    queryClient,
    storedWorkingContext,
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
      activeChurchId: hasQueryError ? null : activeChurchId,
      activeCampusId: hasQueryError ? null : activeCampusId,
      activeMinistryId: hasQueryError ? null : activeMinistryId,
      activeChurch: hasQueryError ? null : activeChurch,
      activeCampus: hasQueryError ? null : activeCampus,
      activeMinistry: hasQueryError ? null : activeMinistry,
      workingContext: hasQueryError ? null : workingContext,
      workingContextOptions: hasQueryError ? [] : workingContextOptions,
      onChurchChange,
      onCampusChange,
      onWorkingContextChange,
      refresh,
    }),
    [
      churches,
      enabled,
      isLoading,
      queryError,
      hasQueryError,
      activeChurchId,
      activeCampusId,
      activeMinistryId,
      activeChurch,
      activeCampus,
      activeMinistry,
      workingContext,
      workingContextOptions,
      onChurchChange,
      onCampusChange,
      onWorkingContextChange,
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
