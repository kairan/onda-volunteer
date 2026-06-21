import { Outlet } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToasts } from '@/feedback/ToastHost';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { demoVolunteerId, devUserSelectAvailable } from '@/auth/authSession';
import { fetchIdentityMe } from '@/identity/fetchIdentityMe';
import { OrganizationProvider, useOrganization } from '@/organization/OrganizationProvider';
import { buildNavForGrants } from '@/navigation/manifest';
import { consumeSystemAdminAccessDenied } from '@/system-admin/accessDenied';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ChurchAppSidebar } from './ChurchAppSidebar';
import { OrganizationContextControls } from './OrganizationContextControls';

export function AppShell({ children }: { children?: ReactNode }) {
  const { t } = useTranslation('shell');
  const auth = useAuthSession();
  const toasts = useToasts();
  const orgReady =
    auth.status === 'authenticated' || auth.status === 'dev-bypass';
  const devVolunteerIdForOrg =
    auth.status === 'dev-bypass' ? auth.volunteerId : demoVolunteerId();
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const fulfilledInviteToastKeyRef = useRef('');

  useEffect(() => {
    if (auth.status === 'authenticated') {
      setIsSystemAdmin(auth.isSystemAdmin);
      const toastKey = auth.newlyFulfilledInvites
        .map((invite) => invite.ministryId)
        .join(',');
      if (
        toastKey &&
        fulfilledInviteToastKeyRef.current !==
          `${auth.volunteerId}:${toastKey}`
      ) {
        fulfilledInviteToastKeyRef.current = `${auth.volunteerId}:${toastKey}`;
        for (const invite of auth.newlyFulfilledInvites) {
          toasts.push({
            id: crypto.randomUUID(),
            kind: 'success',
            message: t('inviteFulfilled', {
              ministryName: invite.ministryName,
            }),
          });
        }
      }
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
            for (const invite of me.newlyFulfilledInvites ?? []) {
              toasts.push({
                id: crypto.randomUUID(),
                kind: 'success',
                message: t('inviteFulfilled', {
                  ministryName: invite.ministryName,
                }),
              });
            }
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
  }, [auth, t, toasts]);

  return (
    <OrganizationProvider
      enabled={orgReady}
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
  const { t } = useTranslation(['shell', 'systemAdmin']);
  const auth = useAuthSession();
  const toasts = useToasts();

  useEffect(() => {
    if (!consumeSystemAdminAccessDenied()) {
      return;
    }
    toasts.push({
      id: crypto.randomUUID(),
      kind: 'info',
      message: t('systemAdmin:accessDenied'),
    });
  }, [t, toasts]);

  const {
    churches,
    loading,
    error,
    activeChurchId,
    activeCampusId,
    activeMinistryId,
    activeChurch,
    onChurchChange,
    onCampusChange,
    onMinistryChange,
  } = useOrganization();

  const navItems = useMemo(() => {
    const isAuthenticated =
      auth.status === 'authenticated' || auth.status === 'dev-bypass';
    const isOrgAdmin = Boolean(activeChurch?.isAccreditedAdmin);
    const isLeader =
      activeChurch?.ministries.some((ministry) => ministry.isLeader) ?? false;
    return buildNavForGrants({
      isVolunteer: isAuthenticated,
      isLeader,
      isOrgAdmin,
    });
  }, [activeChurch, auth.status]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          {t('shell:skipToMain')}
        </a>

        <ChurchAppSidebar
          churchName={activeChurch?.name}
          navItems={navItems}
          showSystemAdminLink={isSystemAdmin}
          showDevUserSelect={devUserSelectAvailable()}
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

          <div className="border-b border-border px-4 py-3 md:px-6">
            {loading ? (
              <p className="text-xs text-muted-foreground">
                {t('shell:organizationLoading')}
              </p>
            ) : error ? (
              <p className="text-xs text-destructive" role="alert">
                {error}
              </p>
            ) : churches.length > 0 && activeChurchId ? (
              <OrganizationContextControls
                churches={churches}
                activeChurchId={activeChurchId}
                activeCampusId={activeCampusId}
                activeMinistryId={activeMinistryId}
                isSystemAdmin={isSystemAdmin}
                onChurchChange={onChurchChange}
                onCampusChange={onCampusChange}
                onMinistryChange={onMinistryChange}
              />
            ) : null}
          </div>

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
