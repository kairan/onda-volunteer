import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { useOrganization } from '@/organization/OrganizationContextProvider';
import { fetchJsonWithProtectedHeaders, fetchWithProtectedHeaders } from '@/apiAuthHeaders';
import { Button } from '@/components/ui/button';

type LeaderRow = { volunteerId: string; displayName: string };

export function MinistryLeadersPage() {
  const { t } = useTranslation('ministries');
  const auth = useAuthSession();
  const { activeChurch } = useOrganization();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const adminMinistries = useMemo(
    () =>
      activeChurch?.ministries.filter((m) => m.isLeader && !m.membershipStatus) ??
      [],
    [activeChurch?.ministries],
  );

  const [ministryId, setMinistryId] = useState('');
  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  const [volunteerId, setVolunteerId] = useState('');
  const [busy, setBusy] = useState(false);

  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

  const loadLeaders = useCallback(async () => {
    if (!ministryId || !actingVolunteerId) {
      setLeaders([]);
      return;
    }
    const rows = await fetchJsonWithProtectedHeaders<LeaderRow[]>(
      `${base}/ministries/${ministryId}/leaders`,
      { volunteerId: actingVolunteerId },
    );
    setLeaders(rows);
  }, [base, ministryId, actingVolunteerId]);

  useEffect(() => {
    void loadLeaders().catch(() => setLeaders([]));
  }, [loadLeaders]);

  async function handleGrant(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !ministryId || !volunteerId.trim()) return;
    setBusy(true);
    try {
      await fetchWithProtectedHeaders(
        `${base}/ministries/${ministryId}/leaders/${volunteerId.trim()}`,
        { volunteerId: actingVolunteerId },
        { method: 'POST' },
      );
      setVolunteerId('');
      await loadLeaders();
    } finally {
      setBusy(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!actingVolunteerId || !ministryId) return;
    setBusy(true);
    try {
      await fetchWithProtectedHeaders(
        `${base}/ministries/${ministryId}/leaders/${id}/revoke`,
        { volunteerId: actingVolunteerId },
        { method: 'POST' },
      );
      await loadLeaders();
    } finally {
      setBusy(false);
    }
  }

  if (!actingVolunteerId) {
    return <p className="text-sm text-muted-foreground">{t('delegation.signInRequired')}</p>;
  }

  if (adminMinistries.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('delegation.notAdmin')}</p>;
  }

  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-bold uppercase">{t('delegation.title')}</h1>
      <p className="text-sm text-muted-foreground">{t('delegation.body')}</p>

      <select
        className="border-2 border-border bg-background px-3 py-2 text-sm"
        value={ministryId}
        onChange={(e) => setMinistryId(e.target.value)}
      >
        <option value="">{t('ministryPlaceholder')}</option>
        {adminMinistries.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      <form className="flex flex-wrap gap-2" onSubmit={(e) => void handleGrant(e)}>
        <input
          className="min-w-[12rem] flex-1 border-2 border-border px-3 py-2 font-mono text-sm"
          placeholder={t('delegation.volunteerIdPlaceholder')}
          value={volunteerId}
          onChange={(e) => setVolunteerId(e.target.value)}
          disabled={!ministryId || busy}
        />
        <Button type="submit" disabled={!ministryId || busy}>
          {t('delegation.grant')}
        </Button>
      </form>

      <ul className="flex flex-col gap-2">
        {leaders.map((row) => (
          <li
            key={row.volunteerId}
            className="flex items-center justify-between border-2 border-border bg-surface p-3 text-sm"
          >
            <span>
              {row.displayName}{' '}
              <span className="font-mono text-xs text-muted-foreground">
                ({row.volunteerId})
              </span>
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => void handleRevoke(row.volunteerId)}
            >
              {t('delegation.revoke')}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
