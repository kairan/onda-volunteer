import { useTranslation } from 'react-i18next';

export function DashboardPage() {
  const { t } = useTranslation('dashboard');
  return (
    <section className="flex flex-col gap-6">
      <div className="border-2 border-border bg-surface p-6 shadow-[8px_8px_0_0_hsl(var(--border))]">
        <p className="mb-3 inline-block border-2 border-border bg-background px-2 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-foreground">
          {t('eyebrow')}
        </p>
        <h1 className="inline-block max-w-3xl border-2 border-border bg-primary px-3 py-2 font-display text-6xl font-extrabold uppercase leading-[0.95] tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-5 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {t('body')}
        </p>
      </div>
      <div className="grid border-2 border-border bg-surface divide-y-2 divide-border md:grid-cols-3 md:divide-x-2 md:divide-y-0">
        {['ministries', 'schedule', 'timeAway'].map((key) => (
          <article key={key} className="bg-surface p-4">
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
