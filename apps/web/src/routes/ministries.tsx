import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { useOrganization } from '@/organization/OrganizationContextProvider';
import { fetchMinistryRoles, type MinistryRoleRow } from '@/organization/fetchMinistryRoles';
import {
  createMinistryRole,
  renameMinistryRole,
  retireMinistryRole,
} from '@/organization/roleCatalog';
import { Button } from '@/components/ui/button';

export function MinistriesPage() {
  const { t } = useTranslation('ministries');
  const auth = useAuthSession();
  const { activeChurch } = useOrganization();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const ledMinistries = useMemo(
    () => activeChurch?.ministries.filter((m) => m.isLeader) ?? [],
    [activeChurch?.ministries],
  );

  const [ministryId, setMinistryId] = useState('');
  const [roles, setRoles] = useState<MinistryRoleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ledMinistries.length === 1 && !ministryId) {
      setMinistryId(ledMinistries[0].id);
    }
  }, [ledMinistries, ministryId]);

  const loadRoles = useCallback(async () => {
    if (!ministryId || !actingVolunteerId) {
      setRoles([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setRoles(
        await fetchMinistryRoles({ ministryId, actingVolunteerId }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorGeneric'));
    } finally {
      setLoading(false);
    }
  }, [ministryId, actingVolunteerId]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !ministryId || !newName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await createMinistryRole({
        ministryId,
        actingVolunteerId,
        name: newName.trim(),
      });
      setNewName('');
      await loadRoles();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorGeneric'));
    } finally {
      setBusy(false);
    }
  }

  async function handleRename(roleId: string) {
    if (!actingVolunteerId || !ministryId || !renameName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await renameMinistryRole({
        ministryId,
        roleId,
        actingVolunteerId,
        name: renameName.trim(),
      });
      setRenameId(null);
      setRenameName('');
      await loadRoles();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorGeneric'));
    } finally {
      setBusy(false);
    }
  }

  async function handleRetire(roleId: string, roleName: string) {
    if (!actingVolunteerId || !ministryId) return;
    if (!window.confirm(t('retireConfirm', { name: roleName }))) return;
    setBusy(true);
    setError(null);
    try {
      await retireMinistryRole({ ministryId, roleId, actingVolunteerId });
      await loadRoles();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorGeneric'));
    } finally {
      setBusy(false);
    }
  }

  if (!actingVolunteerId) {
    return <p className="text-sm text-muted-foreground">{t('signInRequired')}</p>;
  }

  if (ledMinistries.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('notLeader')}</p>;
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="border-2 border-border bg-surface p-6">
        <h1 className="font-display text-4xl font-bold uppercase">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('body')}</p>
      </div>

      <label className="flex flex-col gap-1 text-sm font-semibold uppercase">
        {t('ministryLabel')}
        <select
          className="border-2 border-border bg-background px-3 py-2 normal-case"
          value={ministryId}
          onChange={(e) => setMinistryId(e.target.value)}
        >
          <option value="">{t('ministryPlaceholder')}</option>
          {ledMinistries.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>

      {error ? (
        <p role="alert" className="border-2 border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <form className="flex flex-wrap gap-2 border-2 border-border bg-surface p-4" onSubmit={(e) => void handleAdd(e)}>
        <input
          className="min-w-[12rem] flex-1 border-2 border-border bg-background px-3 py-2 text-sm"
          placeholder={t('newRolePlaceholder')}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={!ministryId || busy}
        />
        <Button type="submit" disabled={!ministryId || busy}>
          {t('addRole')}
        </Button>
      </form>

      {loading ? (
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {roles.map((role) => (
            <li
              key={role.id}
              className="flex flex-col gap-2 border-2 border-border bg-surface p-4 md:flex-row md:items-center md:justify-between"
            >
              {renameId === role.id ? (
                <div className="flex flex-wrap gap-2">
                  <input
                    className="border-2 border-border bg-background px-3 py-2 text-sm"
                    value={renameName}
                    onChange={(e) => setRenameName(e.target.value)}
                  />
                  <Button type="button" size="sm" onClick={() => void handleRename(role.id)}>
                    {t('saveRename')}
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setRenameId(null)}>
                    {t('cancelRename')}
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-medium">{role.name}</p>
                    <p className="text-xs uppercase text-muted-foreground">
                      {role.retired ? t('retiredBadge') : t('activeBadge')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!role.retired ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRenameId(role.id);
                            setRenameName(role.name);
                          }}
                        >
                          {t('rename')}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => void handleRetire(role.id, role.name)}
                        >
                          {t('retire')}
                        </Button>
                      </>
                    ) : null}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
