import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { Button } from '@/components/ui/button';
import {
  fetchSystemAdminVolunteers,
  type SystemAdminVolunteerSummary,
} from './systemAdminUsers';

export function SystemAdminUsersPage() {
  const { t } = useTranslation('systemAdmin');
  const auth = useAuthSession();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [volunteers, setVolunteers] = useState<SystemAdminVolunteerSummary[]>(
    [],
  );
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVolunteers = useCallback(async () => {
    if (!actingVolunteerId) {
      setVolunteers([]);
      setNextCursor(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const page = await fetchSystemAdminVolunteers({
        volunteerId: actingVolunteerId,
        q: query || undefined,
        limit: 50,
      });
      setVolunteers(page.items);
      setNextCursor(page.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('users.errors.generic'));
    } finally {
      setLoading(false);
    }
  }, [actingVolunteerId, query, t]);

  const loadMoreVolunteers = useCallback(async () => {
    if (!actingVolunteerId || !nextCursor || loadingMore) {
      return;
    }
    setLoadingMore(true);
    setError(null);
    try {
      const page = await fetchSystemAdminVolunteers({
        volunteerId: actingVolunteerId,
        q: query || undefined,
        limit: 50,
        cursor: nextCursor,
      });
      setVolunteers((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('users.errors.generic'));
    } finally {
      setLoadingMore(false);
    }
  }, [actingVolunteerId, loadingMore, nextCursor, query, t]);

  useEffect(() => {
    void loadVolunteers();
  }, [loadVolunteers]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setQuery(searchInput.trim());
  }

  return (
    <section className="space-y-6">
      <div className="border border-border bg-background p-6">
        <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-tight">
          {t('users.title')}
        </h1>
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
        className="flex flex-wrap items-end gap-3 border border-border bg-background p-4"
      >
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm">
          <span className="font-medium">{t('users.searchLabel')}</span>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('users.searchPlaceholder')}
            className="border border-border bg-background px-3 py-2"
          />
        </label>
        <Button type="submit" disabled={loading}>
          {t('users.searchAction')}
        </Button>
      </form>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">{t('users.loading')}</p>
      ) : volunteers.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('users.empty')}</p>
      ) : (
        <div className="space-y-4">
          <ul className="divide-y divide-border border border-border bg-background">
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
          {nextCursor ? (
            <Button
              type="button"
              variant="outline"
              disabled={loadingMore}
              onClick={() => void loadMoreVolunteers()}
            >
              {loadingMore ? t('users.loadingMore') : t('users.loadMore')}
            </Button>
          ) : null}
        </div>
      )}
    </section>
  );
}
