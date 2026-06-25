import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/icon';
import { LayoutTemplate } from 'lucide-react';
import type { NavManifestItem } from '@/navigation/manifest';

export function PlaceholderPage({
  namespace,
}: {
  namespace: NavManifestItem['namespace'];
}) {
  const { t } = useTranslation(namespace);
  return (
    <section className="flex max-w-2xl flex-col gap-4 border border-border bg-surface p-6">
      <div className="flex size-12 items-center justify-center border border-border text-primary">
        <Icon icon={LayoutTemplate} size={28} aria-hidden />
      </div>
      <h1 className="font-display text-5xl font-bold uppercase leading-none tracking-tight">
        {t('title')}
      </h1>
      <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
        {t('body')}
      </p>
    </section>
  );
}
