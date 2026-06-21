import { Link, Outlet } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, User, X } from 'lucide-react';
import { useToasts } from '@/feedback/ToastHost';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { demoVolunteerId, devUserSelectAvailable } from '@/auth/authSession';
import { fetchIdentityMe } from '@/identity/fetchIdentityMe';
import { OrganizationProvider, useOrganization } from '@/organization/OrganizationProvider';
import { buildNavForGrants } from '@/navigation/manifest';
import { consumeSystemAdminAccessDenied } from '@/system-admin/accessDenied';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OrganizationContextControls } from './OrganizationContextControls';

const CHROME_ICON_HIT =
  'inline-flex size-10 min-h-10 min-w-10 items-center justify-center rounded-md';

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
  const { t } = useTranslation(['shell', 'common', 'systemAdmin']);
  const auth = useAuthSession();
  const toasts = useToasts();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

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
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t('shell:skipToMain')}
      </a>

      <div className="flex min-h-screen">
        <aside
          className="hidden w-[260px] shrink-0 flex-col border-r border-border bg-surface md:flex"
          aria-label={t('shell:openMenu')}
        >
          <ShellBrand churchName={activeChurch?.name} />
          {loading ? (
            <p className="px-4 pb-3 text-xs text-muted-foreground">
              {t('shell:organizationLoading')}
            </p>
          ) : error ? (
            <p className="px-4 pb-3 text-xs text-destructive" role="alert">
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
          <nav className="flex flex-1 flex-col gap-1 px-3 py-4" aria-label="Primary">
            {navItems.map((item) => (
              <ShellNavLink
                key={item.id}
                to={item.path}
                label={t(item.labelKey)}
              />
            ))}
            {isSystemAdmin ? (
              <ShellNavLink
                to="/system-admin"
                label={t('shell:nav.systemAdmin')}
              />
            ) : null}
          </nav>
          <footer className="mt-auto flex flex-col gap-3 border-t border-border px-4 py-4">
            {devUserSelectAvailable() ? (
              <Link
                to="/user-select"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {t('shell:devPersona.switchUser')}
              </Link>
            ) : null}
            <a
              href="https://example.com/help"
              className="text-sm text-muted-foreground hover:text-primary"
              target="_blank"
              rel="noreferrer"
            >
              {t('shell:help')}
            </a>
          </footer>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-border bg-surface px-3 py-2 md:hidden">
            <button
              type="button"
              className={cn(
                CHROME_ICON_HIT,
                'border border-border bg-surface text-foreground hover:bg-primary/10',
              )}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav-sheet"
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              <span className="sr-only">{t('shell:openMenu')}</span>
              <Menu className="size-5" aria-hidden />
            </button>
            <ShellBrand compact churchName={activeChurch?.name} />
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                className={cn(
                  CHROME_ICON_HIT,
                  'border border-border bg-surface text-foreground hover:bg-primary/10',
                )}
                aria-expanded={accountOpen}
                aria-controls="mobile-account-panel"
                onClick={() => setAccountOpen((open) => !open)}
              >
                <span className="sr-only">{t('shell:account')}</span>
                <User className="size-5" aria-hidden />
              </button>
            </div>
          </header>

          {mobileNavOpen ? (
            <div
              id="mobile-nav-sheet"
              role="dialog"
              aria-modal="true"
              aria-label={t('shell:openMenu')}
              className="fixed inset-0 z-50 bg-black/45 md:hidden"
              onClick={() => setMobileNavOpen(false)}
            >
              <nav
                className="h-full w-[min(280px,85vw)] border-r border-border bg-surface p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex items-center justify-between">
                  <ShellBrand churchName={activeChurch?.name} />
                  <button
                    type="button"
                    className={cn(
                      CHROME_ICON_HIT,
                      'border border-border bg-surface text-foreground hover:bg-primary/10',
                    )}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    <span className="sr-only">{t('shell:closeMenu')}</span>
                    <X className="size-5" aria-hidden />
                  </button>
                </div>
                {navItems.map((item) => (
                  <ShellNavLink
                    key={item.id}
                    to={item.path}
                    label={t(item.labelKey)}
                    onNavigate={() => setMobileNavOpen(false)}
                  />
                ))}
                {isSystemAdmin ? (
                  <ShellNavLink
                    to="/system-admin"
                    label={t('shell:nav.systemAdmin')}
                    onNavigate={() => setMobileNavOpen(false)}
                  />
                ) : null}
              </nav>
            </div>
          ) : null}

          {accountOpen ? (
            <div
              id="mobile-account-panel"
              className="border-b border-border bg-surface px-4 py-3 md:hidden"
            >
              {devUserSelectAvailable() ? (
                <Link
                  to="/user-select"
                  className="mb-3 block text-sm text-muted-foreground hover:text-primary"
                >
                  {t('shell:devPersona.switchUser')}
                </Link>
              ) : null}
              <a
                href="https://example.com/help"
                className="mb-3 block text-sm text-muted-foreground hover:text-primary"
                target="_blank"
                rel="noreferrer"
              >
                {t('shell:help')}
              </a>
            </div>
          ) : null}

          <div className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6">
            <main id="main" tabIndex={-1}>
              {children ?? <Outlet />}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShellBrand({
  compact,
  churchName,
}: {
  compact?: boolean;
  churchName?: string;
}) {
  return (
    <div className={cn('m-4', compact && 'm-0')}>
      <p className="text-lg font-semibold leading-none text-primary">Onda</p>
      {churchName ? (
        <p className="mt-1 text-sm text-muted-foreground">{churchName}</p>
      ) : null}
    </div>
  );
}

function ShellNavLink({
  to,
  label,
  onNavigate,
}: {
  to: string;
  label: string;
  onNavigate?: () => void;
}) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start font-medium"
      asChild
    >
      <Link
        to={to}
        activeProps={{
          className: 'bg-primary text-primary-foreground hover:bg-primary',
        }}
        onClick={onNavigate}
      >
        {label}
      </Link>
    </Button>
  );
}
