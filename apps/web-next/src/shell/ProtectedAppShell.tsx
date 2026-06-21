import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { AuthPanel } from '@/AuthPanel';
import { AppShell } from './AppShell';
import { RouteErrorPanel } from './RouteErrorPanel';

export function ProtectedAppShell({ children }: { children: ReactNode }) {
  const auth = useAuthSession();
  const { t } = useTranslation('shell');

  if (auth.status === 'loading') {
    return (
      <AuthGateLayout>
        <p className="text-sm text-muted-foreground">{t('authLoading')}</p>
      </AuthGateLayout>
    );
  }

  if (auth.status === 'unauthenticated') {
    return (
      <AuthGateLayout>
        {auth.reason === 'supabase-not-configured' ? (
          <p className="rounded-md border border-border bg-surface p-4 text-sm text-muted-foreground">
            {t('supabaseNotConfigured')}
          </p>
        ) : (
          <AuthPanel variant="gate" onSignedIn={() => void auth.refresh()} />
        )}
      </AuthGateLayout>
    );
  }

  if (auth.status === 'profile-not-linked') {
    return (
      <AuthGateLayout>
        <h1 className="text-2xl font-semibold leading-tight">
          {t('profileNotLinkedTitle')}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t('profileNotLinkedBody')}
        </p>
        <AuthPanel
          variant="gate"
          gateShowChrome={false}
          onSignedIn={() => void auth.refresh()}
        />
      </AuthGateLayout>
    );
  }

  if (auth.status === 'error') {
    return (
      <AuthGateLayout>
        <RouteErrorPanel
          message={auth.message}
          onRetry={() => void auth.refresh()}
        />
      </AuthGateLayout>
    );
  }

  return <AppShell>{children}</AppShell>;
}

function AuthGateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-4 py-12">
        <div>
          <p className="text-xl font-semibold leading-none text-primary">Onda</p>
          <div className="mt-3 h-1 w-12 rounded-full bg-primary" aria-hidden />
        </div>
        {children}
      </div>
    </div>
  );
}
