import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  createPrivateEvent,
  invalidateAfterPrivateEventCreate,
} from '@/leader/createPrivateEventMutation';
import { ministriesForWritePickers } from '@/organization/ministryArchive';
import { useOrganization } from '@/organization/OrganizationProvider';
import { datetimeLocalToUtcIso } from '@/settings/datetimeLocalUtc';
import { useLocalTimeContext } from '@/settings/LocalTimeProvider';

export function SchedulingCreatePrivateEventPage() {
  const { t } = useTranslation('scheduling');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const auth = useAuthSession();
  const { activeChurch, activeCampus, activeMinistry } = useOrganization();
  const { formTimezone } = useLocalTimeContext();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const ledMinistries = useMemo(
    () =>
      ministriesForWritePickers(
        activeChurch?.ministries.filter((ministry) => ministry.isLeader) ?? [],
      ),
    [activeChurch?.ministries],
  );

  const [ministryId, setMinistryId] = useState('');
  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const churchTimezone =
    activeCampus?.timezone ?? activeChurch?.defaultTimezone ?? 'UTC';
  const formTimeZone = formTimezone(churchTimezone);

  useEffect(() => {
    if (activeMinistry?.id && ledMinistries.some((m) => m.id === activeMinistry.id)) {
      setMinistryId(activeMinistry.id);
      return;
    }
    if (ledMinistries.length === 1 && !ministryId) {
      setMinistryId(ledMinistries[0].id);
    }
  }, [activeMinistry?.id, ledMinistries, ministryId]);

  const createMutation = useMutation({
    mutationFn: createPrivateEvent,
    onSuccess: async (created) => {
      if (activeChurch?.id && ministryId) {
        invalidateAfterPrivateEventCreate(queryClient, {
          churchId: activeChurch.id,
          ministryId,
        });
      }
      await navigate({
        to: '/scheduling/events/$eventId',
        params: { eventId: created.id },
      });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : t('createPrivate.errors.failed'));
    },
  });

  const isValid =
    Boolean(ministryId && title.trim() && startsAt && endsAt) &&
    new Date(datetimeLocalToUtcIso(startsAt, formTimeZone)).getTime() <
      new Date(datetimeLocalToUtcIso(endsAt, formTimeZone)).getTime();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!actingVolunteerId || !ministryId || !isValid) {
      return;
    }
    setError(null);
    await createMutation.mutateAsync({
      actingVolunteerId,
      leaderMinistryId: ministryId,
      ministryId,
      title: title.trim(),
      startsAtUtc: datetimeLocalToUtcIso(startsAt, formTimeZone),
      endsAtUtc: datetimeLocalToUtcIso(endsAt, formTimeZone),
    });
  }

  if (!actingVolunteerId) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('createPrivate.signInRequired')}
      </p>
    );
  }

  if (ledMinistries.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <p className="text-sm text-muted-foreground">{t('createPrivate.notLeader')}</p>
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t('createPrivate.title')}
      </h1>
      <form
        className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]"
        onSubmit={(event) => void handleSubmit(event)}
        noValidate
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{t('createPrivate.ministryLabel')}</span>
          <select
            className="rounded-md border border-border bg-background px-3 py-2"
            value={ministryId}
            onChange={(event) => setMinistryId(event.target.value)}
            required
            disabled={createMutation.isPending}
          >
            <option value="">{t('createPrivate.ministryPlaceholder')}</option>
            {ledMinistries.map((ministry) => (
              <option key={ministry.id} value={ministry.id}>
                {ministry.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{t('createPrivate.titleLabel')}</span>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            disabled={createMutation.isPending}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{t('createPrivate.startsLabel')}</span>
          <Input
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
            required
            disabled={createMutation.isPending}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{t('createPrivate.endsLabel')}</span>
          <Input
            type="datetime-local"
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
            required
            disabled={createMutation.isPending}
          />
        </label>
        <Button
          type="submit"
          disabled={createMutation.isPending || !isValid}
          className="self-start"
        >
          {createMutation.isPending ? t('detail.saving') : t('createPrivate.submit')}
        </Button>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </form>
    </section>
  );
}
