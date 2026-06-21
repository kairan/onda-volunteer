// TODO(MIG-FND-04): throwaway preview — remove when T16/T20/T21 land
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarInitials } from '@/components/ui/avatarInitials';
import {
  leaderSchedulingPreview,
  rosterFillCounts,
} from '@/__preview__/fixtures';

export function SchedulingPage() {
  const { t, i18n } = useTranslation('scheduling');
  const { ministryName, rosterEvent } = leaderSchedulingPreview;
  const { filled, total } = rosterFillCounts(rosterEvent.roster);

  const whenLabel = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(rosterEvent.startsAtUtc));

  return (
    <section className="flex flex-col gap-8">
      <header className="rounded-md border border-border bg-surface p-6">
        <p className="text-sm text-muted-foreground">{t('eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight">
          {t('preview.ministryHero', { name: ministryName })}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('body')}</p>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{t('preview.rosterHeading')}</h2>
          <Badge data-testid="roster-fill-badge">
            {t('preview.filledBadge', { filled, total })}
          </Badge>
        </div>

        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-base">{rosterEvent.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{whenLabel}</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {rosterEvent.roster.map((row) => (
              <div
                key={row.roleName}
                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{row.roleName}</p>
                  <p className="text-sm text-muted-foreground">
                    {row.volunteerName ?? t('preview.unfilled')}
                  </p>
                </div>
                {row.volunteerName ? (
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">
                      {getAvatarInitials(row.volunteerName)}
                    </AvatarFallback>
                  </Avatar>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
