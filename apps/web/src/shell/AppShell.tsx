import { Link, Outlet } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { demoVolunteerId } from '@/auth/authSession';
import { OrganizationContextProvider, useOrganization } from '@/organization/OrganizationContextProvider';
import { OrganizationContextControls } from './OrganizationContextControls';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from '@/components/ExternalLink';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Icon } from '@/components/icon';
import { Menu, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PRIMARY_NAV_MANIFEST } from '@/navigation/manifest';

import { LocalTimeProvider } from '@/settings/LocalTimeProvider';

const CHROME_ICON_HIT =
  'inline-flex size-11 min-h-11 min-w-11 items-center justify-center';

export function AppShell({ children }: { children?: ReactNode }) {
  const auth = useAuthSession();
  const orgReady =
    auth.status === 'authenticated' || auth.status === 'dev-bypass';
  const devVolunteerIdForOrg =
    auth.status === 'dev-bypass' ? auth.volunteerId : demoVolunteerId();

  return (
    <OrganizationContextProvider
      enabled={orgReady}
      devVolunteerId={devVolunteerIdForOrg}
    >
      <LocalTimeProvider>
        <AppShellContent>{children}</AppShellContent>
      </LocalTimeProvider>
    </OrganizationContextProvider>
  );
}

function AppShellContent({ children }: { children?: ReactNode }) {
  const { t } = useTranslation(['shell', 'common']);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const {
    churches,
    loading,
    error,
    activeChurchId,
    activeCampusId,
    onChurchChange,
    onCampusChange,
  } = useOrganization();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border-2 focus:border-border focus:bg-primary focus:px-3 focus:py-2 focus:font-semibold focus:text-primary-foreground focus:shadow-[4px_4px_0_0_hsl(var(--border))]"
      >
        {t('shell:skipToMain')}
      </a>

      <div className="flex min-h-screen">
        <aside
          className="hidden w-[260px] shrink-0 flex-col border-r-2 border-border bg-surface md:flex"
          aria-label={t('shell:openMenu')}
        >
          <ShellBrand />
          {loading ? (
            <p className="px-4 pb-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
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
              onChurchChange={onChurchChange}
              onCampusChange={onCampusChange}
            />
          ) : null}
          <nav className="flex flex-1 flex-col gap-3 px-3 py-4" aria-label="Primary">
            {PRIMARY_NAV_MANIFEST.map((item) => (
              <ShellNavLink
                key={item.id}
                to={item.path}
                label={t(item.labelKey)}
              />
            ))}
          </nav>
          <footer className="mt-auto flex flex-col gap-3 border-t-2 border-border px-4 py-4">
            <ExternalLink
              href="https://example.com/help"
              className="text-sm uppercase tracking-[0.12em] text-muted-foreground hover:text-primary"
            >
              {t('shell:help')}
            </ExternalLink>
            <LanguageSwitcher />
          </footer>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center gap-2 border-b-2 border-border bg-surface px-3 py-2 md:hidden">
            <button
              type="button"
              className={cn(CHROME_ICON_HIT, 'border-2 border-border bg-surface text-foreground shadow-[3px_3px_0_0_hsl(var(--border))] hover:bg-primary')}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav-sheet"
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              <span className="sr-only">{t('shell:openMenu')}</span>
              <Icon icon={Menu} size={36} aria-hidden />
            </button>
            <ShellBrand compact />
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                className={cn(CHROME_ICON_HIT, 'border-2 border-border bg-surface text-foreground shadow-[3px_3px_0_0_hsl(var(--border))] hover:bg-primary')}
                aria-expanded={accountOpen}
                aria-controls="mobile-account-panel"
                onClick={() => setAccountOpen((open) => !open)}
              >
                <span className="sr-only">{t('shell:account')}</span>
                <Icon icon={User} size={36} aria-hidden />
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
                className="h-full w-[min(280px,85vw)] border-r-2 border-border bg-surface p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex items-center justify-between">
                  <ShellBrand />
                  <button
                    type="button"
                    className={cn(CHROME_ICON_HIT, 'border-2 border-border bg-surface text-foreground shadow-[3px_3px_0_0_hsl(var(--border))] hover:bg-primary')}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    <span className="sr-only">{t('shell:closeMenu')}</span>
                    <Icon icon={X} size={36} aria-hidden />
                  </button>
                </div>
                {PRIMARY_NAV_MANIFEST.map((item) => (
                  <ShellNavLink
                    key={item.id}
                    to={item.path}
                    label={t(item.labelKey)}
                    onNavigate={() => setMobileNavOpen(false)}
                  />
                ))}
              </nav>
            </div>
          ) : null}

          {accountOpen ? (
            <div
              id="mobile-account-panel"
              className="border-b-2 border-border bg-surface px-4 py-3 md:hidden"
            >
              <ExternalLink
                href="https://example.com/help"
                className="mb-3 text-sm uppercase tracking-[0.12em] text-muted-foreground hover:text-primary"
              >
                {t('shell:help')}
              </ExternalLink>
              <LanguageSwitcher />
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

function ShellBrand({ compact }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'm-4 inline-block border-2 border-border bg-primary px-3 py-2 shadow-[4px_4px_0_0_hsl(var(--border))]',
        compact && 'm-0',
      )}
    >
      <p className="font-display text-xl font-extrabold uppercase leading-none tracking-tight">
        ON/DA
      </p>
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
      className="w-full justify-start font-medium normal-case tracking-normal"
      asChild
    >
      <Link
        to={to}
        activeProps={{
          className:
            'bg-primary text-primary-foreground shadow-[4px_4px_0_0_hsl(var(--border))]',
        }}
        onClick={onNavigate}
      >
        {label}
      </Link>
    </Button>
  );
}
