import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      className="flex max-w-prose flex-col gap-3 rounded-md border border-border bg-surface p-4"
    >
      <AlertTriangle className="size-7 text-destructive" aria-hidden />
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button type="button" onClick={onRetry}>
        {t('retry')}
      </Button>
    </section>
  );
}
