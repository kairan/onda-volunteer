import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { AuthPanel } from '@/AuthPanel';
import { AuthGateLayout } from '@/shell/AuthGateLayout';

export function AuthPage() {
  const { t } = useTranslation('shell');
  const auth = useAuthSession();

  return (
    <AuthGateLayout>
      {auth.status === 'loading' ? (
        <p className="text-sm text-primary-foreground/90">{t('authLoading')}</p>
      ) : (
        <AuthPanel variant="gate" onSignedIn={() => void auth.refresh()} />
      )}
    </AuthGateLayout>
  );
}
