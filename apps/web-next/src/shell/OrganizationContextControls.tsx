import { useTranslation } from 'react-i18next';
import { ministriesForShellSwitcher } from '@/organization/ministryArchive';
import type { Church } from '@/organization/types';
import { shortTimezoneLabel } from '@/organization/timezoneCue';
import { useLocalTimeContext } from '@/settings/LocalTimeProvider';

type Props = {
  churches: Church[];
  activeChurchId: string;
  activeCampusId: string | null;
  activeMinistryId: string | null;
  isSystemAdmin?: boolean;
  onChurchChange: (churchId: string) => void;
  onCampusChange: (campusId: string) => void;
  onMinistryChange: (ministryId: string) => void;
};

export function OrganizationContextControls({
  churches,
  activeChurchId,
  activeCampusId,
  activeMinistryId,
  isSystemAdmin = false,
  onChurchChange,
  onCampusChange,
  onMinistryChange,
}: Props) {
  const { t } = useTranslation(['shell', 'ministries']);
  const { useLocalTime, setUseLocalTime } = useLocalTimeContext();

  const activeChurch =
    churches.find((church) => church.id === activeChurchId) ?? churches[0];
  const campuses = activeChurch?.campuses ?? [];
  const activeCampus =
    campuses.find((campus) => campus.id === activeCampusId) ?? campuses[0];
  const timezone = activeCampus?.timezone ?? activeChurch?.defaultTimezone ?? 'UTC';
  const shortTz = shortTimezoneLabel(timezone);
  const canSeeArchived =
    Boolean(activeChurch?.isAccreditedAdmin) || isSystemAdmin;
  const ministries = ministriesForShellSwitcher(
    activeChurch?.ministries ?? [],
    canSeeArchived,
  );
  const activeMinistry =
    ministries.find((ministry) => ministry.id === activeMinistryId) ??
    ministries[0];

  const selectClassName =
    'mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground';

  return (
    <div className="flex flex-col gap-2 px-4 pb-3">
      <label className="block text-xs font-medium text-muted-foreground">
        {t('shell:churchLabel')}
        <select
          className={selectClassName}
          value={activeChurch?.id}
          aria-label={t('shell:churchLabel')}
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
          {t('shell:campusLabel')}
          <select
            className={selectClassName}
            value={activeCampus?.id}
            aria-label={t('shell:campusLabel')}
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
          {t('shell:campusLabel')}: {campuses[0].name}
        </p>
      ) : null}

      {ministries.length > 0 ? (
        <label className="block text-xs font-medium text-muted-foreground">
          {t('shell:ministryLabel')}
          <select
            className={selectClassName}
            value={activeMinistry?.id ?? ''}
            aria-label={t('shell:ministryLabel')}
            onChange={(event) => onMinistryChange(event.target.value)}
          >
            {ministries.map((ministry) => (
              <option key={ministry.id} value={ministry.id}>
                {ministry.archivedAt
                  ? t('ministries:structure.archivedOption', {
                      name: ministry.name,
                    })
                  : ministry.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="mt-1 flex flex-col gap-1">
        <p
          className="text-xs text-muted-foreground"
          title={t('shell:timezoneDetails', { iana: timezone })}
        >
          {t('shell:timezoneCue', { short: shortTz })}
        </p>
        <label className="mt-1 flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            className="size-3 accent-primary"
            checked={useLocalTime}
            onChange={(e) => setUseLocalTime(e.target.checked)}
          />
          {t('shell:showLocalTime')}
        </label>
      </div>
    </div>
  );
}
