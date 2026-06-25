import { useTranslation } from 'react-i18next';
import type { DualTimeLabels } from './formatSchedulingTime';

type Props = {
  labels: DualTimeLabels;
  className?: string;
  secondaryClassName?: string;
};

export function SchedulingTimeDisplay({
  labels,
  className,
  secondaryClassName = 'mt-1 block text-xs text-muted-foreground',
}: Props) {
  const { t } = useTranslation('common');

  return (
    <span className={className}>
      <span>{labels.church}</span>
      {labels.personalLocal ? (
        <span className={secondaryClassName}>
          {t('time.personalLocal', { time: labels.personalLocal })}
        </span>
      ) : null}
    </span>
  );
}
