import { Link, Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { AuthPanel } from '@/AuthPanel';
import { IgrejaOndaWordmark } from '@/components/brand/IgrejaOndaWordmark';
import { Button } from '@/components/ui/button';
import { RouteErrorPanel } from '@/shell/RouteErrorPanel';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';

export function SystemAdminShell() {
  const auth = useAuthSession();
  const { t } = useTranslation('systemAdmin');

  if (auth.status === 'loading') {
    return (
      <OperatorGateLayout>
        <IgrejaOndaWordmark variant="preto" className="max-h-7" />
      </OperatorGateLayout>
    );
  }

  if (auth.status === 'unauthenticated' || auth.status === 'profile-not-linked') {
    return (
      <OperatorGateLayout>
        <AuthPanel variant="gate" onSignedIn={() => void auth.refresh()} />
      </OperatorGateLayout>
    );
  }

  if (auth.status === 'error') {
    return (
      <OperatorGateLayout>
        <RouteErrorPanel
          message={auth.message}
          onRetry={() => void auth.refresh()}
        />
      </OperatorGateLayout>
    );
  }

  return (
    <LocalTimeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border px-4 py-4">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <IgrejaOndaWordmark variant="preto" className="max-h-7" />
              <p className="text-sm text-muted-foreground">{t('shell.brand')}</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/dashboard">{t('shell.backToApp')}</Link>
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">
          <Outlet />
        </main>
      </div>
    </LocalTimeProvider>
  );
}

function OperatorGateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-4 py-12">
        {children}
      </div>
    </div>
  );
}
