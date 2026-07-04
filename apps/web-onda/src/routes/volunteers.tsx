// TODO: Onda design phase — port with neutral tokens for now
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/api/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ministriesForWritePickers } from '@/organization/ministryArchive';
import {
  activateMinistryMembership,
  addMinistryMembership,
  deactivateMinistryMembership,
  isSendInviteAlreadyExists,
  sendVolunteerInvite,
} from '@/organization/ministryStructureMutations';
import {
  ministryMembershipsQuery,
  volunteerInvitesQuery,
  volunteerSearchQuery,
} from '@/organization/ministryStructureQueries';
import { useOrganization } from '@/organization/OrganizationProvider';
import { queryKeys } from '@/query/queryKeys';
import type { VolunteerSearchResult } from '@/organization/ministryStructureMutations';

export function VolunteersPage() {
  const { t } = useTranslation('volunteers');
  const auth = useAuthSession();
  const queryClient = useQueryClient();
  const { activeChurch } = useOrganization();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;
  const churchId = activeChurch?.id ?? '';

  const stewardshipMinistries = useMemo(
    () =>
      ministriesForWritePickers(
        activeChurch?.ministries.filter((m) => m.isLeader || m.isChurchAdmin) ??
          [],
      ),
    [activeChurch?.ministries],
  );

  const [ministryId, setMinistryId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] =
    useState<VolunteerSearchResult | null>(null);
  const [addStatus, setAddStatus] = useState<'PENDING' | 'ACTIVE'>('PENDING');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [showInviteSection, setShowInviteSection] = useState(false);

  useEffect(() => {
    if (stewardshipMinistries.length === 1 && !ministryId) {
      setMinistryId(stewardshipMinistries[0].id);
    }
  }, [stewardshipMinistries, ministryId]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const membershipsQuery = useQuery(
    ministryMembershipsQuery({
      ministryId,
      actingVolunteerId: actingVolunteerId ?? '',
    }),
  );

  const invitesQuery = useQuery(
    volunteerInvitesQuery({
      ministryId,
      actingVolunteerId: actingVolunteerId ?? '',
    }),
  );

  const searchResultsQuery = useQuery(
    volunteerSearchQuery({
      churchId,
      ministryId,
      actingVolunteerId: actingVolunteerId ?? '',
      query: debouncedQuery,
    }),
  );

  useEffect(() => {
    if (
      debouncedQuery.length >= 2 &&
      !searchResultsQuery.isLoading &&
      (searchResultsQuery.data?.length ?? 0) === 0
    ) {
      setShowInviteSection(true);
    }
  }, [
    debouncedQuery,
    searchResultsQuery.data,
    searchResultsQuery.isLoading,
  ]);

  const invalidateMemberships = async () => {
    if (!ministryId) {
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: queryKeys.ministryMemberships(ministryId),
    });
  };

  const invalidateInvites = async () => {
    if (!ministryId) {
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: queryKeys.volunteerInvites(ministryId),
    });
  };

  const addMembershipMutation = useMutation({
    mutationFn: addMinistryMembership,
    onSuccess: async () => {
      setSelectedVolunteer(null);
      setSearchQuery('');
      setAddStatus('PENDING');
      setSuccessMessage(t('messages.added'));
      await invalidateMemberships();
    },
  });

  const activateMutation = useMutation({
    mutationFn: activateMinistryMembership,
    onSuccess: async () => {
      setSuccessMessage(t('messages.activated'));
      await invalidateMemberships();
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateMinistryMembership,
    onSuccess: async () => {
      setSuccessMessage(t('messages.deactivated'));
      await invalidateMemberships();
    },
  });

  const inviteMutation = useMutation({
    mutationFn: sendVolunteerInvite,
    onSuccess: async (result) => {
      if (isSendInviteAlreadyExists(result)) {
        setSearchQuery(result.displayName);
        setInviteEmail('');
        setInviteError(t('volunteerExistsHint'));
        return;
      }
      setInviteEmail('');
      setInviteSuccess(t('inviteSuccess'));
      await invalidateInvites();
    },
    onError: () => {
      setInviteError(t('errors.inviteFailed'));
    },
  });

  function actionErrorMessage(err: unknown): string {
    const code = err instanceof ApiRequestError ? err.code : undefined;
    return code === 'ADMIN_NOT_ACCREDITED'
      ? t('errors.notAccredited')
      : err instanceof Error
        ? err.message
        : t('errors.actionFailed');
  }

  const actionError =
    addMembershipMutation.error ??
    activateMutation.error ??
    deactivateMutation.error;
  const submitting =
    addMembershipMutation.isPending ||
    activateMutation.isPending ||
    deactivateMutation.isPending;

  function handleSelectVolunteer(vol: VolunteerSearchResult) {
    setSelectedVolunteer(vol);
    setSearchQuery(vol.displayName);
  }

  function handleAddSelected(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !ministryId || !selectedVolunteer) {
      return;
    }
    setSuccessMessage(null);
    addMembershipMutation.mutate({
      ministryId,
      actingVolunteerId,
      volunteerId: selectedVolunteer.id,
      status: addStatus,
    });
  }

  function handleSendInvite(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !ministryId || !inviteEmail.trim()) {
      return;
    }
    setInviteSuccess(null);
    setInviteError(null);
    inviteMutation.mutate({
      ministryId,
      email: inviteEmail.trim(),
      actingVolunteerId,
    });
  }

  const rows = membershipsQuery.data ?? [];
  const invites = invitesQuery.data ?? [];
  const searchResults = searchResultsQuery.data ?? [];

  if (!actingVolunteerId) {
    return (
      <section className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <p className="text-sm text-muted-foreground">{t('signInRequired')}</p>
      </section>
    );
  }

  if (stewardshipMinistries.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{t('notSteward')}</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-3 max-w-prose text-sm text-muted-foreground">
          {t('body')}
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t('ministryLabel')}
          <select
            className="rounded-md border border-border bg-background px-3 py-2"
            value={ministryId}
            onChange={(e) => setMinistryId(e.target.value)}
          >
            <option value="">{t('ministryPlaceholder')}</option>
            {stewardshipMinistries.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <h2 className="text-lg font-semibold">{t('searchHeading')}</h2>
          <p className="text-xs text-muted-foreground">{t('searchHelp')}</p>
          <form onSubmit={handleAddSelected} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm font-medium">
              {t('searchHeading')}
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedVolunteer(null);
                }}
                disabled={!ministryId}
              />
            </label>
            {searchResultsQuery.isLoading ? (
              <p className="text-xs text-muted-foreground">{t('searching')}</p>
            ) : null}
            {searchResultsQuery.error ? (
              <p className="text-xs text-destructive">{t('errors.searchFailed')}</p>
            ) : null}
            {searchResults.length > 0 ? (
              <ul
                className="rounded-md border border-border bg-background"
                role="listbox"
                aria-label="Search results"
              >
                {searchResults.map((vol) => (
                  <li
                    key={vol.id}
                    role="option"
                    aria-selected={selectedVolunteer?.id === vol.id}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => handleSelectVolunteer(vol)}
                  >
                    {vol.displayName}
                    {vol.email ? ` · ${vol.email}` : ''}
                  </li>
                ))}
              </ul>
            ) : null}
            {debouncedQuery.length >= 2 &&
            !searchResultsQuery.isLoading &&
            searchResults.length === 0 &&
            !selectedVolunteer ? (
              <p className="text-xs text-muted-foreground">{t('noResults')}</p>
            ) : null}
            {selectedVolunteer ? (
              <>
                <label className="flex flex-col gap-1 text-sm font-medium">
                  {t('statusLabel')}
                  <select
                    className="rounded-md border border-border bg-background px-3 py-2"
                    value={addStatus}
                    onChange={(e) =>
                      setAddStatus(e.target.value as 'PENDING' | 'ACTIVE')
                    }
                    disabled={!ministryId || submitting}
                  >
                    <option value="PENDING">{t('status.pending')}</option>
                    <option value="ACTIVE">{t('status.active')}</option>
                  </select>
                </label>
                <Button
                  type="submit"
                  disabled={!ministryId || submitting}
                  className="self-start"
                >
                  {submitting ? t('saving') : t('addSelectedSubmit')}
                </Button>
              </>
            ) : null}
          </form>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <h2 className="text-lg font-semibold">{t('inviteHeading')}</h2>
          <p className="text-xs text-muted-foreground">{t('inviteHelp')}</p>
          {!showInviteSection ? (
            <Button
              type="button"
              variant="outline"
              className="self-start"
              onClick={() => setShowInviteSection(true)}
            >
              {t('inviteHeading')}
            </Button>
          ) : null}
          {showInviteSection ? (
            <form onSubmit={handleSendInvite} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm font-medium">
                {t('inviteEmailLabel')}
                <Input
                  type="email"
                  placeholder={t('inviteEmailPlaceholder')}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={inviteMutation.isPending}
                />
              </label>
              <Button
                type="submit"
                disabled={!inviteEmail.trim() || inviteMutation.isPending}
                className="self-start"
              >
                {inviteMutation.isPending ? t('inviteSending') : t('inviteSubmit')}
              </Button>
              {inviteSuccess ? (
                <p role="status" className="text-sm font-medium text-primary">
                  {inviteSuccess}
                </p>
              ) : null}
              {inviteError ? (
                <p role="alert" className="text-sm text-destructive">
                  {inviteError}
                </p>
              ) : null}
            </form>
          ) : null}
        </div>
      </div>

      {actionError ? (
        <p role="alert" className="text-sm text-destructive">
          {actionErrorMessage(actionError)}
        </p>
      ) : null}

      {successMessage ? (
        <p role="status" className="text-sm font-medium text-primary">
          {successMessage}
        </p>
      ) : null}

      {membershipsQuery.error ? (
        <p role="alert" className="text-sm text-destructive">
          {membershipsQuery.error instanceof Error
            ? membershipsQuery.error.message
            : t('errors.loadFailed')}
        </p>
      ) : null}

      {invites.length > 0 ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">{t('pendingInvitesHeading')}</h2>
          <ul className="flex flex-col gap-3">
            {invites.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-card)]"
              >
                <p className="font-medium">{inv.email}</p>
                <p className="text-xs text-muted-foreground">
                  {t('inviteSent')}:{' '}
                  {new Date(inv.sentAtUtc).toLocaleDateString()}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {t(`inviteStatus.${inv.status}`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{t('rosterHeading')}</h2>
        {membershipsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('emptyState')}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((row) => (
              <li
                key={row.volunteerId}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-card)] md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{row.displayName}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {row.volunteerId}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {t(
                      `status.${row.status.toLowerCase() as 'pending' | 'active' | 'inactive'}`,
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {row.status === 'PENDING' ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={submitting}
                      onClick={() =>
                        activateMutation.mutate({
                          ministryId,
                          actingVolunteerId: actingVolunteerId!,
                          volunteerId: row.volunteerId,
                        })
                      }
                    >
                      {t('actions.activate')}
                    </Button>
                  ) : null}
                  {row.status === 'ACTIVE' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={submitting}
                      onClick={() =>
                        deactivateMutation.mutate({
                          ministryId,
                          actingVolunteerId: actingVolunteerId!,
                          volunteerId: row.volunteerId,
                          leaderMinistryId: ministryId,
                        })
                      }
                    >
                      {t('actions.deactivate')}
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
