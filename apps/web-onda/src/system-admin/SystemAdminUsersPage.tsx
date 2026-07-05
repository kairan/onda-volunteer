// TODO: Onda design phase — port with neutral tokens for now
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { systemAdminVolunteersInfiniteQuery } from './systemAdminQueries';

export function SystemAdminUsersPage() {
  const { t } = useTranslation('systemAdmin');
  const auth = useAuthSession();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');

  const volunteersQuery = useInfiniteQuery(
    systemAdminVolunteersInfiniteQuery({
      volunteerId: actingVolunteerId ?? '',
      q: query,
    }),
  );

  const volunteers =
    volunteersQuery.data?.pages.flatMap((page) => page.items) ?? [];

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setQuery(searchInput.trim());
  }

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-border bg-surface p-6">
        <h1 className="text-3xl font-semibold leading-tight">{t('users.title')}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t('users.intro')}
        </p>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link to="/system-admin">{t('users.backToDashboard')}</Link>
          </Button>
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-surface p-4"
      >
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm">
          <span className="font-medium">{t('users.searchLabel')}</span>
          <Input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('users.searchPlaceholder')}
          />
        </label>
        <Button type="submit" disabled={volunteersQuery.isFetching}>
          {t('users.searchAction')}
        </Button>
      </form>

      {volunteersQuery.isError ? (
        <p className="text-sm text-destructive" role="alert">
          {volunteersQuery.error instanceof Error
            ? volunteersQuery.error.message
            : t('users.errors.generic')}
        </p>
      ) : null}

      {volunteersQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">{t('users.loading')}</p>
      ) : volunteers.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('users.empty')}</p>
      ) : (
        <div className="space-y-4">
          <ul className="divide-y divide-border rounded-md border border-border bg-surface">
            {volunteers.map((volunteer) => (
              <li
                key={volunteer.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="font-medium">{volunteer.displayName}</p>
                  <p className="text-xs text-muted-foreground">{volunteer.id}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('users.summaryCounts', {
                      accreditations: volunteer.accreditations.length,
                      leaderships: volunteer.leaderships.length,
                      memberships: volunteer.memberships.length,
                    })}
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link
                    to="/system-admin/users/$volunteerId"
                    params={{ volunteerId: volunteer.id }}
                  >
                    {t('users.viewDetail')}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
          {volunteersQuery.hasNextPage ? (
            <Button
              type="button"
              variant="outline"
              disabled={volunteersQuery.isFetchingNextPage}
              onClick={() => void volunteersQuery.fetchNextPage()}
            >
              {volunteersQuery.isFetchingNextPage
                ? t('users.loadingMore')
                : t('users.loadMore')}
            </Button>
          ) : null}
        </div>
      )}
    </section>
  );
}
