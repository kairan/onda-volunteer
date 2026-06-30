import { useTranslation } from 'react-i18next';
import { UserMinus, UserPlus } from 'lucide-react';
import type { DualTimeLabels } from '@/settings/formatSchedulingTime';
import { SchedulingTimeDisplay } from '@/settings/SchedulingTimeDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarInitials } from '@/components/ui/avatarInitials';
import { rosterFillCounts } from '@/leader/buildRosterRows';
import type { RosterRow } from '@/leader/types';

export type RosterByEventSectionProps = {
  eventTitle: string;
  timeLabels: DualTimeLabels;
  roster: RosterRow[];
  busyRoleKey?: string | null;
  rowError?: { roleKey: string; message: string } | null;
  onAssign: (roleId: string, slotKey: string) => void;
  onRelease: (assignmentId: string, roleId: string, slotKey: string) => void;
};

export function RosterByEventSection({
  eventTitle,
  timeLabels,
  roster,
  busyRoleKey,
  rowError,
  onAssign,
  onRelease,
}: RosterByEventSectionProps) {
  const { t } = useTranslation('scheduling');
  const { filled, total } = rosterFillCounts(roster);
  const fillVariant =
    total > 0 && filled === total
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-amber-200 bg-amber-50 text-amber-800';

  return (
    <Card
      className="overflow-hidden rounded-lg border border-border p-0 shadow-[var(--shadow-card)]"
      data-testid="roster-event-card"
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
        <div>
          <h3 className="font-medium">{eventTitle}</h3>
          <p className="text-xs text-muted-foreground">
            <SchedulingTimeDisplay labels={timeLabels} />
          </p>
        </div>
        <Badge
          variant="outline"
          className={`rounded-md ${fillVariant}`}
          data-testid="roster-fill-badge"
        >
          {t('preview.filledBadge', { filled, total })}
        </Badge>
      </div>
      <ul className="divide-y divide-border">
        {roster.map((row) => {
          const isBusy = busyRoleKey === row.slotKey;
          const errorMessage =
            rowError?.roleKey === row.slotKey ? rowError.message : null;

          return (
            <li key={row.slotKey} className="px-4 py-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-36 text-muted-foreground">{row.roleName}</span>
                <div className="flex flex-1 items-center gap-2">
                  {row.volunteerName ? (
                    <>
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                          {getAvatarInitials(row.volunteerName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{row.volunteerName}</span>
                    </>
                  ) : (
                    <span className="italic text-muted-foreground">
                      {t('preview.unfilled')}
                    </span>
                  )}
                </div>
                {row.assignmentId ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    disabled={isBusy}
                    onClick={() => onRelease(row.assignmentId!, row.roleId, row.slotKey)}
                  >
                    <UserMinus className="h-4 w-4" aria-hidden />
                    {t('detail.release')}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    disabled={isBusy}
                    onClick={() => onAssign(row.roleId, row.slotKey)}
                  >
                    <UserPlus className="h-4 w-4" aria-hidden />
                    {t('preview.assign')}
                  </Button>
                )}
              </div>
              {errorMessage ? (
                <p role="alert" className="mt-2 text-xs text-destructive">
                  {errorMessage}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
