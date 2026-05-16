import { useTranslation } from 'react-i18next';

export function DashboardPage() {
  const { t } = useTranslation('dashboard');
  return (
    <section className="flex flex-col gap-6">
      <div className="border border-border bg-surface p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          {t('eyebrow')}
        </p>
        <h1 className="max-w-3xl font-display text-6xl font-bold uppercase leading-[0.95] tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-5 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {t('body')}
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {['ministries', 'schedule', 'timeAway'].map((key) => (
          <article key={key} className="border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t(`stats.${key}.label`)}
            </p>
            <p className="mt-3 font-display text-4xl font-bold uppercase leading-none">
              {t(`stats.${key}.value`)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
