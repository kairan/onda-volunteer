// TODO: Onda design phase — port with neutral tokens for now
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/api/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { queryKeys } from '@/query/queryKeys';
import {
  createSystemAdminChurch,
  systemAdminChurchesInfiniteQuery,
} from './systemAdminQueries';

export function SystemAdminChurchesPage() {
  const { t } = useTranslation('systemAdmin');
  const auth = useAuthSession();
  const queryClient = useQueryClient();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const [name, setName] = useState('');
  const [defaultTimezone, setDefaultTimezone] = useState('UTC');
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const churchesQuery = useInfiniteQuery(
    systemAdminChurchesInfiniteQuery({
      volunteerId: actingVolunteerId ?? '',
    }),
  );

  const createMutation = useMutation({
    mutationFn: createSystemAdminChurch,
    onSuccess: async () => {
      setName('');
      setCreateMessage(t('churches.createSuccess'));
      setCreateError(null);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.systemAdmin.churches(),
      });
    },
    onError: (err) => {
      setCreateMessage(null);
      setCreateError(createErrorMessage(err, t));
    },
  });

  const churches =
    churchesQuery.data?.pages.flatMap((page) => page.items) ?? [];

  function createErrorMessage(
    err: unknown,
    translate: (key: string) => string,
  ): string {
    if (err instanceof ApiRequestError) {
      if (err.code === 'CHURCH_NAME_REQUIRED') {
        return translate('churches.errors.nameRequired');
      }
      if (err.code === 'INVALID_TIMEZONE') {
        return translate('churches.errors.invalidTimezone');
      }
    }
    return err instanceof Error ? err.message : translate('churches.errors.generic');
  }

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !name.trim()) {
      return;
    }
    setCreateMessage(null);
    createMutation.mutate({
      volunteerId: actingVolunteerId,
      name: name.trim(),
      defaultTimezone: defaultTimezone.trim(),
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-md border border-border bg-surface p-6">
        <p className="text-xs font-medium text-primary">{t('churches.eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight">{t('churches.title')}</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('churches.intro')}</p>
        <p className="mt-4">
          <Button variant="outline" asChild>
            <Link to="/system-admin">{t('churches.backToDashboard')}</Link>
          </Button>
        </p>
      </section>

      <section className="rounded-md border border-border bg-surface p-6">
        <h2 className="text-xl font-semibold">{t('churches.createHeading')}</h2>
        <form className="mt-4 flex max-w-xl flex-col gap-4" onSubmit={handleCreate}>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{t('churches.fields.name')}</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{t('churches.fields.timezone')}</span>
            <Input
              className="font-mono text-sm"
              value={defaultTimezone}
              onChange={(e) => setDefaultTimezone(e.target.value)}
              required
            />
          </label>
          {createError ? (
            <p className="text-sm text-destructive" role="alert">
              {createError}
            </p>
          ) : null}
          {createMessage ? (
            <p className="text-sm text-muted-foreground">{createMessage}</p>
          ) : null}
          <div>
            <Button
              type="submit"
              disabled={createMutation.isPending || !actingVolunteerId}
            >
              {createMutation.isPending
                ? t('churches.creating')
                : t('churches.createAction')}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-md border border-border bg-surface p-6">
        <h2 className="text-xl font-semibold">{t('churches.listHeading')}</h2>
        {churchesQuery.isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">{t('churches.loading')}</p>
        ) : null}
        {churchesQuery.isError ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {churchesQuery.error instanceof Error
              ? churchesQuery.error.message
              : t('churches.errors.generic')}
          </p>
        ) : null}
        {!churchesQuery.isLoading &&
        !churchesQuery.isError &&
        churches.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">{t('churches.empty')}</p>
        ) : null}
        {churches.length > 0 ? (
          <ul className="mt-4 divide-y divide-border rounded-md border border-border">
            {churches.map((church) => (
              <li key={church.id} className="px-4 py-3">
                <p className="font-medium">{church.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {church.defaultTimezone}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('churches.campusCount', { count: church.campuses.length })}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
        {churchesQuery.hasNextPage ? (
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              disabled={churchesQuery.isFetchingNextPage}
              onClick={() => void churchesQuery.fetchNextPage()}
            >
              {churchesQuery.isFetchingNextPage
                ? t('churches.loadingMore')
                : t('churches.loadMore')}
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
