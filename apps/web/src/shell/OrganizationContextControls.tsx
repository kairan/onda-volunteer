import { useTranslation } from 'react-i18next';
import type { Church } from '@/organization/types';
import { shortTimezoneLabel } from '@/organization/timezoneCue';

type Props = {
  churches: Church[];
  activeChurchId: string;
  activeCampusId: string | null;
  onChurchChange: (churchId: string) => void;
  onCampusChange: (campusId: string) => void;
};

export function OrganizationContextControls({
  churches,
  activeChurchId,
  activeCampusId,
  onChurchChange,
  onCampusChange,
}: Props) {
  const { t } = useTranslation('shell');
  const activeChurch =
    churches.find((church) => church.id === activeChurchId) ?? churches[0];
  const campuses = activeChurch?.campuses ?? [];
  const activeCampus =
    campuses.find((campus) => campus.id === activeCampusId) ?? campuses[0];
  const timezone = activeCampus?.timezone ?? activeChurch?.defaultTimezone ?? 'UTC';
  const shortTz = shortTimezoneLabel(timezone);

  return (
    <div className="flex flex-col gap-2 px-4 pb-3">
      <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {t('churchLabel')}
        <select
          className="mt-1 w-full border border-border bg-background px-2 py-2 text-sm normal-case tracking-normal text-foreground"
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
        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {t('campusLabel')}
          <select
            className="mt-1 w-full border border-border bg-background px-2 py-2 text-sm normal-case tracking-normal text-foreground"
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
          {t('campusLabel')}: {campuses[0].name}
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground" title={t('timezoneDetails', { iana: timezone })}>
        {t('timezoneCue', { short: shortTz })}
      </p>
    </div>
  );
}
