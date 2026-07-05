// TODO: Onda design phase — port with neutral tokens for now
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/api/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CampusSettingsSection } from '@/organization/CampusSettingsSection';
import { ChurchSettingsSection } from '@/organization/ChurchSettingsSection';
import { archiveMinistry, ministriesForWritePickers } from '@/organization/ministryArchive';
import {
  createMinistry,
  createMinistryRole,
  renameMinistry,
  renameMinistryRole,
  retireMinistryRole,
} from '@/organization/ministryStructureMutations';
import { ministryRolesQuery } from '@/organization/ministryStructureQueries';
import { useOrganization } from '@/organization/OrganizationProvider';
import { queryKeys } from '@/query/queryKeys';

export function MinistriesPage() {
  const { t } = useTranslation('ministries');
  const auth = useAuthSession();
  const queryClient = useQueryClient();
  const { activeChurch, refresh } = useOrganization();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const canManageStructure = Boolean(activeChurch?.isAccreditedAdmin);

  const roleCatalogMinistries = useMemo(
    () =>
      ministriesForWritePickers(
        activeChurch?.ministries.filter((m) => m.isLeader || m.isChurchAdmin) ??
          [],
      ),
    [activeChurch?.ministries],
  );

  const [ministryId, setMinistryId] = useState('');
  const [newName, setNewName] = useState('');
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState('');

  const [newMinistryName, setNewMinistryName] = useState('');
  const [ministryRenameId, setMinistryRenameId] = useState<string | null>(null);
  const [ministryRenameName, setMinistryRenameName] = useState('');
  const [structureMessage, setStructureMessage] = useState<string | null>(null);

  useEffect(() => {
    if (roleCatalogMinistries.length === 1 && !ministryId) {
      setMinistryId(roleCatalogMinistries[0].id);
    }
  }, [roleCatalogMinistries, ministryId]);

  const rolesQuery = useQuery(
    ministryRolesQuery({
      ministryId,
      actingVolunteerId: actingVolunteerId ?? '',
    }),
  );

  const invalidateRoles = async () => {
    if (!ministryId) {
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: queryKeys.ministryRoles(ministryId),
    });
  };

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
      if (err.code === 'MINISTRY_ALREADY_ARCHIVED') {
        return t('structure.errors.alreadyArchived');
      }
      if (err.code === 'MINISTRY_ARCHIVED') {
        return t('structure.errors.archived');
      }
    }
    return err instanceof Error ? err.message : t('errorGeneric');
  }

  const createMinistryMutation = useMutation({
    mutationFn: createMinistry,
    onSuccess: async () => {
      setNewMinistryName('');
      setStructureMessage(t('structure.messages.created'));
      await refresh();
    },
  });

  const archiveMinistryMutation = useMutation({
    mutationFn: archiveMinistry,
    onSuccess: async () => {
      setStructureMessage(t('structure.messages.archived'));
      await refresh();
    },
  });

  const renameMinistryMutation = useMutation({
    mutationFn: renameMinistry,
    onSuccess: async () => {
      setMinistryRenameId(null);
      setMinistryRenameName('');
      setStructureMessage(t('structure.messages.renamed'));
      await refresh();
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: createMinistryRole,
    onSuccess: async () => {
      setNewName('');
      await invalidateRoles();
    },
  });

  const renameRoleMutation = useMutation({
    mutationFn: renameMinistryRole,
    onSuccess: async () => {
      setRenameId(null);
      setRenameName('');
      await invalidateRoles();
    },
  });

  const retireRoleMutation = useMutation({
    mutationFn: retireMinistryRole,
    onSuccess: invalidateRoles,
  });

  function handleCreateMinistry(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !activeChurch || !newMinistryName.trim()) {
      return;
    }
    setStructureMessage(null);
    createMinistryMutation.mutate({
      churchId: activeChurch.id,
      actingVolunteerId,
      name: newMinistryName.trim(),
    });
  }

  function handleArchiveMinistry(
    ministryIdToArchive: string,
    ministryName: string,
  ) {
    if (!actingVolunteerId) {
      return;
    }
    if (!window.confirm(t('structure.archiveConfirm', { name: ministryName }))) {
      return;
    }
    setStructureMessage(null);
    archiveMinistryMutation.mutate({
      ministryId: ministryIdToArchive,
      actingVolunteerId,
    });
  }

  function handleRenameMinistry(ministryIdToRename: string) {
    if (!actingVolunteerId || !ministryRenameName.trim()) {
      return;
    }
    setStructureMessage(null);
    renameMinistryMutation.mutate({
      ministryId: ministryIdToRename,
      actingVolunteerId,
      name: ministryRenameName.trim(),
    });
  }

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !ministryId || !newName.trim()) {
      return;
    }
    createRoleMutation.mutate({
      ministryId,
      actingVolunteerId,
      name: newName.trim(),
    });
  }

  function handleRename(roleId: string) {
    if (!actingVolunteerId || !ministryId || !renameName.trim()) {
      return;
    }
    renameRoleMutation.mutate({
      ministryId,
      roleId,
      actingVolunteerId,
      name: renameName.trim(),
    });
  }

  function handleRetire(roleId: string, roleName: string) {
    if (!actingVolunteerId || !ministryId) {
      return;
    }
    if (!window.confirm(t('retireConfirm', { name: roleName }))) {
      return;
    }
    retireRoleMutation.mutate({ ministryId, roleId, actingVolunteerId });
  }

  const structureBusy =
    createMinistryMutation.isPending ||
    archiveMinistryMutation.isPending ||
    renameMinistryMutation.isPending;
  const structureError =
    createMinistryMutation.error ??
    archiveMinistryMutation.error ??
    renameMinistryMutation.error;
  const roleBusy =
    createRoleMutation.isPending ||
    renameRoleMutation.isPending ||
    retireRoleMutation.isPending;
  const roleError =
    createRoleMutation.error ??
    renameRoleMutation.error ??
    retireRoleMutation.error;
  const roles = rolesQuery.data ?? [];

  if (!actingVolunteerId) {
    return (
      <p className="text-sm text-muted-foreground">{t('signInRequired')}</p>
    );
  }

  if (!canManageStructure && roleCatalogMinistries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t('notLeader')}</p>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('body')}</p>
      </div>

      <ChurchSettingsSection />
      <CampusSettingsSection />

      {canManageStructure ? (
        <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {t('structure.title')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('structure.body')}
            </p>
          </div>

          {structureError ? (
            <p role="alert" className="text-sm text-destructive">
              {structureErrorMessage(structureError)}
            </p>
          ) : null}
          {structureMessage ? (
            <p role="status" className="text-sm font-medium text-primary">
              {structureMessage}
            </p>
          ) : null}

          <form
            className="flex flex-wrap gap-2"
            onSubmit={handleCreateMinistry}
          >
            <label className="min-w-[12rem] flex-1 text-sm font-medium">
              {t('structure.newNameLabel')}
              <Input
                className="mt-1"
                placeholder={t('structure.newNamePlaceholder')}
                value={newMinistryName}
                onChange={(e) => setNewMinistryName(e.target.value)}
                disabled={structureBusy}
              />
            </label>
            <Button
              type="submit"
              disabled={structureBusy || !newMinistryName.trim()}
              className="self-end"
            >
              {t('structure.create')}
            </Button>
          </form>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">{t('structure.currentHeading')}</h3>
            {activeChurch?.ministries.length ? (
              <ul className="flex flex-col gap-2">
                {activeChurch.ministries.map((ministry) => (
                  <li
                    key={ministry.id}
                    className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3 md:flex-row md:items-center md:justify-between"
                  >
                    {ministryRenameId === ministry.id ? (
                      <div className="flex flex-1 flex-wrap gap-2">
                        <Input
                          aria-label={t('structure.renameNameLabel', {
                            name: ministry.name,
                          })}
                          className="min-w-[12rem] flex-1"
                          value={ministryRenameName}
                          onChange={(e) => setMinistryRenameName(e.target.value)}
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleRenameMinistry(ministry.id)}
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
                        <div>
                          <p className="font-medium">{ministry.name}</p>
                          {ministry.archivedAt ? (
                            <p className="text-xs text-muted-foreground">
                              {t('structure.archivedBadge')}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex gap-2">
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
                          {!ministry.archivedAt ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleArchiveMinistry(ministry.id, ministry.name)
                              }
                              disabled={structureBusy}
                            >
                              {t('structure.archive')}
                            </Button>
                          ) : null}
                        </div>
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
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t('ministryLabel')}
            <select
              className="rounded-md border border-border bg-background px-3 py-2"
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

          {roleError ? (
            <p role="alert" className="text-sm text-destructive">
              {roleError instanceof Error
                ? roleError.message
                : t('errorGeneric')}
            </p>
          ) : null}

          <form
            className="flex flex-wrap gap-2 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-card)]"
            onSubmit={handleAdd}
          >
            <Input
              className="min-w-[12rem] flex-1"
              placeholder={t('newRolePlaceholder')}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={!ministryId || roleBusy}
            />
            <Button type="submit" disabled={!ministryId || roleBusy}>
              {t('addRole')}
            </Button>
          </form>

          {rolesQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">{t('loading')}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {roles.map((role) => (
                <li
                  key={role.id}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-card)] md:flex-row md:items-center md:justify-between"
                >
                  {renameId === role.id ? (
                    <div className="flex flex-wrap gap-2">
                      <Input
                        value={renameName}
                        onChange={(e) => setRenameName(e.target.value)}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleRename(role.id)}
                      >
                        {t('saveRename')}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setRenameId(null)}
                      >
                        {t('cancelRename')}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="font-medium">{role.name}</p>
                        <p className="text-xs text-muted-foreground">
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
                              onClick={() => handleRetire(role.id, role.name)}
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
