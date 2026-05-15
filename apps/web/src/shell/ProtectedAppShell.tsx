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
        <p className="text-sm text-foreground/80">{t('authLoading')}</p>
      </AuthGateLayout>
    );
  }

  if (auth.status === 'unauthenticated') {
    return (
      <AuthGateLayout>
        <h1 className="font-display text-xl font-bold uppercase tracking-tight">
          {t('signInTitle')}
        </h1>
        {auth.reason === 'supabase-not-configured' ? (
          <p className="text-sm text-foreground/80">
            {t('supabaseNotConfigured')}
          </p>
        ) : (
          <p className="text-sm text-foreground/80">{t('signInPrompt')}</p>
        )}
        <AuthPanel />
      </AuthGateLayout>
    );
  }

  if (auth.status === 'profile-not-linked') {
    return (
      <AuthGateLayout>
        <h1 className="font-display text-xl font-bold uppercase tracking-tight">
          {t('profileNotLinkedTitle')}
        </h1>
        <p className="text-sm text-foreground/80">{t('profileNotLinkedBody')}</p>
        <AuthPanel />
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
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4 py-12">
        {children}
      </div>
    </div>
  );
}
