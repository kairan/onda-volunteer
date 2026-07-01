import { useTranslation } from 'react-i18next';
import type { Church } from '@/organization/types';
import type {
  WorkingContext,
  WorkingContextOption,
} from '@/organization/workingContext';
import { WorkingContextPicker } from './WorkingContextPicker';

type Props = {
  churches: Church[];
  activeChurchId: string;
  activeCampusId: string | null;
  workingContext: WorkingContext | null;
  workingContextOptions: WorkingContextOption[];
  onChurchChange: (churchId: string) => void;
  onCampusChange: (campusId: string) => void;
  onWorkingContextChange: (ctx: WorkingContext) => void;
};

export function OrganizationContextControls({
  churches,
  activeChurchId,
  activeCampusId,
  workingContext,
  workingContextOptions,
  onChurchChange,
  onCampusChange,
  onWorkingContextChange,
}: Props) {
  const { t } = useTranslation('shell');

  const activeChurch =
    churches.find((church) => church.id === activeChurchId) ?? churches[0];
  const campuses = activeChurch?.campuses ?? [];
  const activeCampus =
    campuses.find((campus) => campus.id === activeCampusId) ?? campuses[0];

  const selectClassName =
    'mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground';

  return (
    <div className="flex flex-col gap-2 px-2 pb-3">
      <label className="block text-xs font-medium text-muted-foreground">
        {t('churchLabel')}
        <select
          className={selectClassName}
          value={activeChurch?.id}
          aria-label={t('churchLabel')}
          onChange={(event) => onChurchChange(event.target.value)}
        >
          {churches.map((church) => (
            <option key={church.id} value={church.id}>
              {church.name}
            </option>
          ))}
        </select>
      </label>

      {campuses.length > 1 ? (
        <label className="block text-xs font-medium text-muted-foreground">
          {t('campusLabel')}
          <select
            className={selectClassName}
            value={activeCampus?.id}
            aria-label={t('campusLabel')}
            onChange={(event) => onCampusChange(event.target.value)}
          >
            {campuses.map((campus) => (
              <option key={campus.id} value={campus.id}>
                {campus.name}
              </option>
            ))}
          </select>
        </label>
      ) : campuses.length === 1 ? (
        <p className="text-xs text-muted-foreground">
          {t('campusLabel')}: {campuses[0]!.name}
        </p>
      ) : null}

      <WorkingContextPicker
        options={workingContextOptions}
        value={workingContext}
        onChange={onWorkingContextChange}
      />
    </div>
  );
}
