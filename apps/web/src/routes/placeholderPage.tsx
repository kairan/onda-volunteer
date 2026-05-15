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
    <section className="flex max-w-prose flex-col gap-3">
      <Icon icon={LayoutTemplate} size={28} aria-hidden />
      <h1 className="font-display text-2xl font-bold uppercase tracking-tight">
        {t('title')}
      </h1>
      <p className="text-sm leading-relaxed">{t('body')}</p>
    </section>
  );
}
