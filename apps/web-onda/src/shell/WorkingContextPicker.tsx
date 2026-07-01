import { useTranslation } from 'react-i18next';
import type {
  WorkingContext,
  WorkingContextOption,
} from '@/organization/workingContext';

type Props = {
  options: WorkingContextOption[];
  value: WorkingContext | null;
  onChange: (ctx: WorkingContext) => void;
};

function formatOptionLabel(
  option: WorkingContextOption,
  t: (key: string, values?: Record<string, string>) => string,
): string {
  const key =
    option.mode === 'leader' ? 'shell:context.leader' : 'shell:context.volunteer';
  return t(key, { ministry: option.ministryName });
}

export function WorkingContextPicker({ options, value, onChange }: Props) {
  const { t } = useTranslation('shell');

  if (options.length === 0) {
    return null;
  }

  const selectClassName =
    'mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground';

  if (options.length === 1) {
    const only = options[0]!;
    return (
      <p className="text-xs text-muted-foreground">
        {formatOptionLabel(only, t)}
      </p>
    );
  }

  const selectedKey = value
    ? `${value.ministryId}:${value.mode}`
    : '';

  return (
    <label className="block text-xs font-medium text-muted-foreground">
      {t('workingContextLabel')}
      <select
        className={selectClassName}
        value={selectedKey}
        aria-label={t('workingContextLabel')}
        onChange={(event) => {
          const [ministryId, mode] = event.target.value.split(':');
          if (
            ministryId &&
            (mode === 'leader' || mode === 'volunteer')
          ) {
            onChange({ ministryId, mode });
          }
        }}
      >
        {options.map((option) => (
          <option
            key={`${option.ministryId}:${option.mode}`}
            value={`${option.ministryId}:${option.mode}`}
          >
            {formatOptionLabel(option, t)}
          </option>
        ))}
      </select>
    </label>
  );
}
