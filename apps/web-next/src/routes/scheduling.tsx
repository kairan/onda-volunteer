// TODO(MIG-FND-04): throwaway preview — remove when T16/T20/T21 land
import { Calendar, Plus, UserMinus, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { VolunteerMyAssignmentsPreview } from '@/__preview__/VolunteerMyAssignmentsPreview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarInitials } from '@/components/ui/avatarInitials';
import {
  leaderSchedulingPreview,
  resolveSchedulingPreviewRole,
  rosterFillCounts,
} from '@/__preview__/fixtures';

export function LeaderSchedulingPreview() {
  const { t, i18n } = useTranslation('scheduling');
  const { ministryName, eventsThisWeek, openSlots, rosterEvents } =
    leaderSchedulingPreview;

  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('preview.ministryHero', { name: ministryName })}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('preview.leaderSummary', {
              events: eventsThisWeek,
              openSlots,
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" type="button">
            <Calendar className="h-4 w-4" aria-hidden />
            {t('preview.newEvent')}
          </Button>
          <Button size="sm" type="button">
            <Plus className="h-4 w-4" aria-hidden />
            {t('preview.assignVolunteer')}
          </Button>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">{t('preview.rosterHeading')}</h2>
        {rosterEvents.map((event) => {
          const { filled, total } = rosterFillCounts(event.roster);
          const whenLabel = new Intl.DateTimeFormat(
            i18n.language,
            dateTimeOptions,
          ).format(new Date(event.startsAtUtc));

          return (
            <Card
              key={event.id}
              className="overflow-hidden rounded-lg border border-border p-0 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                <div>
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-xs text-muted-foreground">{whenLabel}</p>
                </div>
                <Badge
                  variant="outline"
                  className="rounded-md"
                  data-testid="roster-fill-badge"
                >
                  {t('preview.filledBadge', { filled, total })}
                </Badge>
              </div>
              <ul className="divide-y divide-border">
                {event.roster.map((row) => (
                  <li
                    key={row.roleName}
                    className="flex items-center gap-3 px-4 py-3 text-sm"
                  >
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
                    {row.volunteerName ? (
                      <Button size="sm" variant="ghost" type="button">
                        <UserMinus className="h-4 w-4" aria-hidden />
                        {t('detail.release')}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" type="button">
                        <UserPlus className="h-4 w-4" aria-hidden />
                        {t('preview.assign')}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

export function SchedulingPage({ previewRole }: { previewRole?: string } = {}) {
  if (resolveSchedulingPreviewRole(previewRole) === 'leader') {
    return <LeaderSchedulingPreview />;
  }

  return <VolunteerMyAssignmentsPreview />;
}
