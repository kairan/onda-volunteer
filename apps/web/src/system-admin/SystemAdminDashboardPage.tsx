import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function SystemAdminDashboardPage() {
  const { t } = useTranslation('systemAdmin');

  return (
    <section className="border border-border bg-background p-6">
      <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-tight">
        {t('dashboard.title')}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {t('dashboard.intro')}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link to="/system-admin/churches">{t('dashboard.churchesLink')}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/system-admin/users">{t('dashboard.usersLink')}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/system-admin/scheduling">{t('dashboard.schedulingLink')}</Link>
        </Button>
      </div>
    </section>
  );
}
