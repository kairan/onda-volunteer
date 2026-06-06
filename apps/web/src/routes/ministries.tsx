import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { useOrganization } from '@/organization/OrganizationContextProvider';
import { fetchMinistryRoles, type MinistryRoleRow } from '@/organization/fetchMinistryRoles';
import {
  createMinistry,
  renameMinistry,
} from '@/organization/ministryStructure';
import {
  createMinistryRole,
  renameMinistryRole,
  retireMinistryRole,
} from '@/organization/roleCatalog';
import { ChurchSettingsSection } from '@/organization/ChurchSettingsSection';
import { CampusSettingsSection } from '@/organization/CampusSettingsSection';
import { Button } from '@/components/ui/button';

export function MinistriesPage() {
  const { t } = useTranslation('ministries');
  const auth = useAuthSession();
  const { activeChurch, refresh } = useOrganization();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const canManageStructure = Boolean(activeChurch?.isAccreditedAdmin);

  const roleCatalogMinistries = useMemo(
    () =>
      activeChurch?.ministries.filter((m) => m.isLeader || m.isChurchAdmin) ??
      [],
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

  const [newMinistryName, setNewMinistryName] = useState('');
  const [ministryRenameId, setMinistryRenameId] = useState<string | null>(null);
  const [ministryRenameName, setMinistryRenameName] = useState('');
  const [structureBusy, setStructureBusy] = useState(false);
  const [structureError, setStructureError] = useState<string | null>(null);
  const [structureMessage, setStructureMessage] = useState<string | null>(null);

  useEffect(() => {
    if (roleCatalogMinistries.length === 1 && !ministryId) {
      setMinistryId(roleCatalogMinistries[0].id);
    }
  }, [roleCatalogMinistries, ministryId]);

  function structureErrorMessage(err: unknown): string {
    if (err instanceof ApiRequestError) {
      if (err.code === 'ADMIN_NOT_ACCREDITED') {
        return t('structure.errors.notAccredited');
      }
      if (err.code === 'MINISTRY_NAME_REQUIRED') {
        return t('structure.errors.nameRequired');
      }
      if (err.code === 'MINISTRY_NAME_CONFLICT') {
        return t('structure.errors.nameConflict');
      }
    }
    return err instanceof Error ? err.message : t('errorGeneric');
  }

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

  async function handleCreateMinistry(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !activeChurch || !newMinistryName.trim()) return;
    setStructureBusy(true);
    setStructureError(null);
    setStructureMessage(null);
    try {
      await createMinistry({
        churchId: activeChurch.id,
        actingVolunteerId,
        name: newMinistryName.trim(),
      });
      setNewMinistryName('');
      setStructureMessage(t('structure.messages.created'));
      await refresh();
    } catch (err) {
      setStructureError(structureErrorMessage(err));
    } finally {
      setStructureBusy(false);
    }
  }

  async function handleRenameMinistry(ministryIdToRename: string) {
    if (!actingVolunteerId || !ministryRenameName.trim()) return;
    setStructureBusy(true);
    setStructureError(null);
    setStructureMessage(null);
    try {
      await renameMinistry({
        ministryId: ministryIdToRename,
        actingVolunteerId,
        name: ministryRenameName.trim(),
      });
      setMinistryRenameId(null);
      setMinistryRenameName('');
      setStructureMessage(t('structure.messages.renamed'));
      await refresh();
    } catch (err) {
      setStructureError(structureErrorMessage(err));
    } finally {
      setStructureBusy(false);
    }
  }

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

  if (!canManageStructure && roleCatalogMinistries.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('notLeader')}</p>;
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="border-2 border-border bg-surface p-6">
        <h1 className="font-display text-4xl font-bold uppercase">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('body')}</p>
      </div>

      <ChurchSettingsSection />

      <CampusSettingsSection />

      {canManageStructure ? (
        <section className="flex flex-col gap-4 border-2 border-border bg-surface p-4">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase">
              {t('structure.title')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('structure.body')}
            </p>
          </div>

          {structureError ? (
            <p role="alert" className="border-2 border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {structureError}
            </p>
          ) : null}
          {structureMessage ? (
            <p role="status" className="border-2 border-primary bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
              {structureMessage}
            </p>
          ) : null}

          <form className="flex flex-wrap gap-2" onSubmit={(e) => void handleCreateMinistry(e)}>
            <label className="min-w-[12rem] flex-1 text-sm font-semibold uppercase">
              {t('structure.newNameLabel')}
              <input
                className="mt-1 w-full border-2 border-border bg-background px-3 py-2 text-sm normal-case"
                placeholder={t('structure.newNamePlaceholder')}
                value={newMinistryName}
                onChange={(e) => setNewMinistryName(e.target.value)}
                disabled={structureBusy}
              />
            </label>
            <Button type="submit" disabled={structureBusy || !newMinistryName.trim()} className="self-end">
              {t('structure.create')}
            </Button>
          </form>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wide">
              {t('structure.currentHeading')}
            </h3>
            {activeChurch?.ministries.length ? (
              <ul className="flex flex-col gap-2">
                {activeChurch.ministries.map((ministry) => (
                  <li
                    key={ministry.id}
                    className="flex flex-col gap-2 border-2 border-border bg-background p-3 md:flex-row md:items-center md:justify-between"
                  >
                    {ministryRenameId === ministry.id ? (
                      <div className="flex flex-1 flex-wrap gap-2">
                        <input
                          aria-label={t('structure.renameNameLabel', {
                            name: ministry.name,
                          })}
                          className="min-w-[12rem] flex-1 border-2 border-border bg-surface px-3 py-2 text-sm"
                          value={ministryRenameName}
                          onChange={(e) => setMinistryRenameName(e.target.value)}
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => void handleRenameMinistry(ministry.id)}
                          disabled={structureBusy || !ministryRenameName.trim()}
                        >
                          {t('structure.saveRename')}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setMinistryRenameId(null);
                            setMinistryRenameName('');
                          }}
                          disabled={structureBusy}
                        >
                          {t('structure.cancelRename')}
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium">{ministry.name}</p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          aria-label={t('structure.renameAria', {
                            name: ministry.name,
                          })}
                          onClick={() => {
                            setMinistryRenameId(ministry.id);
                            setMinistryRenameName(ministry.name);
                          }}
                          disabled={structureBusy}
                        >
                          {t('structure.rename')}
                        </Button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('structure.empty')}
              </p>
            )}
          </div>
        </section>
      ) : null}

      {roleCatalogMinistries.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('notLeader')}</p>
      ) : (
        <>
      <label className="flex flex-col gap-1 text-sm font-semibold uppercase">
        {t('ministryLabel')}
        <select
          className="border-2 border-border bg-background px-3 py-2 normal-case"
          value={ministryId}
          onChange={(e) => setMinistryId(e.target.value)}
        >
          <option value="">{t('ministryPlaceholder')}</option>
          {roleCatalogMinistries.map((m) => (
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
        </>
      )}
    </section>
  );
}
