import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { AuthPanel } from '@/AuthPanel';
import { IgrejaOndaWordmark } from '@/components/brand/IgrejaOndaWordmark';

export function AuthPage() {
  const { t } = useTranslation('shell');
  const auth = useAuthSession();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-4 py-12">
        <div>
          <IgrejaOndaWordmark variant="preto" className="max-h-7" />
          <div className="mt-3 h-1 w-12 rounded-full bg-primary" aria-hidden />
        </div>
        {auth.status === 'loading' ? (
          <p className="text-sm text-muted-foreground">{t('authLoading')}</p>
        ) : (
          <AuthPanel variant="gate" onSignedIn={() => void auth.refresh()} />
        )}
      </div>
    </div>
  );
}
