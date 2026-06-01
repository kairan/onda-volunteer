import { Link } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/apiError';
import { Button } from '@/components/ui/button';
import { RouteErrorPanel } from '@/shell/RouteErrorPanel';
import {
  fetchSystemAdminVolunteers,
  type SystemAdminVolunteerSummary,
} from './fetchSystemAdminVolunteers';

export function SystemAdminUsersPage() {
  const { t } = useTranslation('systemAdmin');
  const [query, setQuery] = useState('');
  const [volunteers, setVolunteers] = useState<SystemAdminVolunteerSummary[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  async function load(search?: string) {
    try {
      const rows = await fetchSystemAdminVolunteers(search);
      setVolunteers(rows);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : t('users.loadError'),
      );
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void load(query);
  }

  if (error && !volunteers) {
    return <RouteErrorPanel message={error} onRetry={() => void load(query)} />;
  }

  return (
    <section className="border border-border bg-background p-6">
      <h1 className="font-display text-3xl font-bold uppercase leading-none tracking-tight">
        {t('users.title')}
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('users.intro')}</p>
      <form className="mt-6 flex max-w-md gap-2" onSubmit={onSearch}>
        <input
          className="flex-1 border border-border bg-background px-3 py-2 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('users.searchPlaceholder')}
        />
        <Button type="submit" variant="outline">
          {t('users.search')}
        </Button>
      </form>
      {!volunteers ? (
        <p className="mt-6 text-sm text-muted-foreground">{t('users.loading')}</p>
      ) : volunteers.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{t('users.empty')}</p>
      ) : (
        <ul className="mt-6 divide-y divide-border border border-border">
          {volunteers.map((volunteer) => (
            <li key={volunteer.id}>
              <Link
                to="/system-admin/users/$volunteerId"
                params={{ volunteerId: volunteer.id }}
                className="flex flex-col gap-1 px-4 py-3 hover:bg-muted/40"
              >
                <span className="font-medium">{volunteer.displayName}</span>
                <span className="text-xs text-muted-foreground">
                  {t('users.adminCount', {
                    count: volunteer.adminAccreditations.length,
                  })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
