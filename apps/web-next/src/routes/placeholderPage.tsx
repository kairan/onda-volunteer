import { useTranslation } from 'react-i18next';
import { LayoutTemplate } from 'lucide-react';

export function PlaceholderPage({
  titleKey,
  bodyKey,
  namespace,
}: {
  titleKey: string;
  bodyKey: string;
  namespace: string;
}) {
  const { t } = useTranslation(namespace);
  return (
    <section className="flex max-w-2xl flex-col gap-4 rounded-md border border-border bg-surface p-6">
      <div className="flex size-12 items-center justify-center rounded-md border border-border text-primary">
        <LayoutTemplate className="size-7" aria-hidden />
      </div>
      <h1 className="text-2xl font-semibold leading-tight">{t(titleKey)}</h1>
      <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
        {t(bodyKey)}
      </p>
    </section>
  );
}
