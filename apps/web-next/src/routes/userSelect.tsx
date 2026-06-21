import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { devUserSelectAvailable } from '@/auth/authSession';
import { Button } from '@/components/ui/button';
import { PlaceholderPage } from './placeholderPage';

export function UserSelectPage() {
  const { t } = useTranslation('shell');

  if (!devUserSelectAvailable()) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col gap-8 px-4 py-12">
          <h1 className="font-display text-4xl font-bold leading-none tracking-tight">
            {t('devPersona.unavailableTitle')}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t('devPersona.unavailableBody')}
          </p>
          <Button asChild className="w-fit">
            <Link to="/dashboard">{t('devPersona.goDashboard')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PlaceholderPage
      namespace="shell"
      titleKey="devPersona.title"
      bodyKey="devPersona.subtitle"
    />
  );
}
