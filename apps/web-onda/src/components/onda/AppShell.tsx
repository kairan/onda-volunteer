import { Outlet } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { demoVolunteerId, devUserSelectAvailable } from '@/auth/authSession';
import { fetchIdentityMe } from '@/identity/fetchIdentityMe';
import { OrganizationProvider, useOrganization } from '@/organization/OrganizationProvider';
import { buildNavForWorkingContext } from '@/navigation/manifest';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { OrganizationContextControls } from '@/shell/OrganizationContextControls';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';

export function AppShell({ children }: { children?: ReactNode }) {
  const auth = useAuthSession();
  const queryClient = useQueryClient();
  const orgReady =
    auth.status === 'authenticated' || auth.status === 'dev-bypass';
  const sessionVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;
  const devVolunteerIdForOrg =
    auth.status === 'dev-bypass' ? auth.volunteerId : demoVolunteerId();
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const prevAuthSessionKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const authSessionKey = `${auth.status}:${sessionVolunteerId ?? ''}`;
    const previous = prevAuthSessionKeyRef.current;
    prevAuthSessionKeyRef.current = authSessionKey;
    if (previous === null || previous === authSessionKey) {
      return;
    }
    queryClient.removeQueries({ queryKey: ['org-context'] });
  }, [sessionVolunteerId, auth.status, queryClient]);

  useEffect(() => {
    if (auth.status === 'authenticated') {
      setIsSystemAdmin(auth.isSystemAdmin);
      return;
    }

    if (auth.status !== 'dev-bypass') {
      setIsSystemAdmin(false);
      return;
    }

    const volunteerId = auth.volunteerId;
    let cancelled = false;
    void (async () => {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const me = await fetchIdentityMe({ volunteerId });
          if (!cancelled) {
            setIsSystemAdmin(me.isSystemAdmin);
          }
          return;
        } catch {
          if (attempt === 1 && !cancelled) {
            setIsSystemAdmin(false);
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth]);

  return (
    <OrganizationProvider
      enabled={orgReady}
      sessionVolunteerId={sessionVolunteerId}
      devVolunteerId={devVolunteerIdForOrg}
      isSystemAdmin={isSystemAdmin}
    >
      <LocalTimeProvider>
        <AppShellContent isSystemAdmin={isSystemAdmin}>{children}</AppShellContent>
      </LocalTimeProvider>
    </OrganizationProvider>
  );
}

function AppShellContent({
  children,
  isSystemAdmin,
}: {
  children?: ReactNode;
  isSystemAdmin: boolean;
}) {
  const { t } = useTranslation('shell');
  const auth = useAuthSession();

  const {
    churches,
    loading,
    error,
    activeChurchId,
    activeCampusId,
    activeChurch,
    workingContext,
    workingContextOptions,
    onChurchChange,
    onCampusChange,
    onWorkingContextChange,
  } = useOrganization();

  const navItems = useMemo(() => {
    const isAuthenticated =
      auth.status === 'authenticated' || auth.status === 'dev-bypass';
    const isOrgAdmin = Boolean(activeChurch?.isAccreditedAdmin);
    return buildNavForWorkingContext({
      isAuthenticated,
      isOrgAdmin,
      workingContext,
    });
  }, [activeChurch, auth.status, workingContext]);

  const contextControls =
    churches.length > 0 && activeChurchId ? (
      <OrganizationContextControls
        churches={churches}
        activeChurchId={activeChurchId}
        activeCampusId={activeCampusId}
        workingContext={workingContext}
        workingContextOptions={workingContextOptions}
        onChurchChange={onChurchChange}
        onCampusChange={onCampusChange}
        onWorkingContextChange={onWorkingContextChange}
      />
    ) : null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          {t('skipToMain')}
        </a>

        <AppSidebar
          churchName={activeChurch?.name}
          navItems={navItems}
          showSystemAdminLink={isSystemAdmin}
          showDevUserSelect={devUserSelectAvailable()}
          contextControls={contextControls}
        />

        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur md:px-6">
            <SidebarTrigger />
            <div className="hidden md:block">
              <p className="text-sm font-semibold tracking-tight">Onda</p>
              {activeChurch?.name ? (
                <p className="text-xs text-muted-foreground">{activeChurch.name}</p>
              ) : null}
            </div>
          </header>

          {loading ? (
            <p className="border-b border-border px-4 py-3 text-xs text-muted-foreground md:px-6">
              {t('organizationLoading')}
            </p>
          ) : error ? (
            <p
              className="border-b border-border px-4 py-3 text-xs text-destructive md:px-6"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <main id="main" tabIndex={-1}>
              {children ?? <Outlet />}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
