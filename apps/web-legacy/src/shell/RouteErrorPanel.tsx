import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export function RouteErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const { t } = useTranslation('common');
  return (
    <section
      role="alert"
      className="flex max-w-prose flex-col gap-3 border border-border bg-surface p-4"
    >
      <Icon icon={AlertTriangle} size={28} className="text-destructive" aria-hidden />
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button type="button" onClick={onRetry}>
        {t('retry')}
      </Button>
    </section>
  );
}
