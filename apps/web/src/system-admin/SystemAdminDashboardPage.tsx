import { useTranslation } from 'react-i18next';

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
    </section>
  );
}
