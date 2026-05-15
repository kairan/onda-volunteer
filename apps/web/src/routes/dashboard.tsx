import { useTranslation } from 'react-i18next';

export function DashboardPage() {
  const { t } = useTranslation('dashboard');
  return (
    <>
      <h1 className="font-display text-2xl font-bold uppercase tracking-tight">
        {t('title')}
      </h1>
      <p className="mt-2 max-w-prose text-sm">{t('body')}</p>
    </>
  );
}
