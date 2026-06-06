import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import {
  activateMinistryMembership,
  addMinistryMembership,
  deactivateMinistryMembership,
} from '@/organization/membershipLifecycle';
import {
  fetchMinistryMemberships,
  type MinistryMembershipRow,
} from '@/organization/fetchMinistryMemberships';
import { ministriesForWritePickers } from '@/organization/ministryArchive';
import { useOrganization } from '@/organization/OrganizationContextProvider';
import {
  isSendInviteAlreadyExists,
  listVolunteerInvites,
  searchVolunteers,
  sendVolunteerInvite,
  type VolunteerInviteRow,
  type VolunteerSearchResult,
} from '@/organization/volunteerInvite';
import { Button } from '@/components/ui/button';

export function VolunteersPage() {
  const { t } = useTranslation('volunteers');
  const auth = useAuthSession();
  const { activeChurch } = useOrganization();

  const actingVolunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const stewardshipMinistries = useMemo(
    () =>
      ministriesForWritePickers(
        activeChurch?.ministries.filter((m) => m.isLeader || m.isChurchAdmin) ?? [],
      ),
    [activeChurch?.ministries],
  );

  const [ministryId, setMinistryId] = useState('');
  const [rows, setRows] = useState<MinistryMembershipRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VolunteerSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerSearchResult | null>(null);
  const [addStatus, setAddStatus] = useState<'PENDING' | 'ACTIVE'>('PENDING');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [showInviteSection, setShowInviteSection] = useState(false);
  const [invites, setInvites] = useState<VolunteerInviteRow[]>([]);

  useEffect(() => {
    if (stewardshipMinistries.length === 1 && !ministryId) {
      setMinistryId(stewardshipMinistries[0].id);
    }
  }, [stewardshipMinistries, ministryId]);

  const loadRows = useCallback(async () => {
    if (!ministryId || !actingVolunteerId) {
      setRows([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMinistryMemberships({ ministryId, actingVolunteerId });
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.loadFailed'));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [ministryId, actingVolunteerId, t]);

  const loadInvites = useCallback(async () => {
    if (!ministryId || !actingVolunteerId) {
      setInvites([]);
      return;
    }
    try {
      const data = await listVolunteerInvites({ ministryId, actingVolunteerId });
      setInvites(data);
    } catch {
      setInvites([]);
    }
  }, [ministryId, actingVolunteerId]);

  useEffect(() => {
    void loadRows();
    void loadInvites();
  }, [loadRows, loadInvites]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery || searchQuery.length < 2 || !ministryId || !actingVolunteerId || !activeChurch) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchVolunteers({
          churchId: activeChurch.id,
          query: searchQuery,
          ministryId,
          actingVolunteerId,
        });
        setSearchResults(results);
        setSearchError(null);
        if (results.length === 0) {
          setShowInviteSection(true);
        }
      } catch {
        setSearchError(t('errors.searchFailed'));
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, ministryId, actingVolunteerId, activeChurch, t]);

  function handleSelectVolunteer(vol: VolunteerSearchResult) {
    setSelectedVolunteer(vol);
    setSearchQuery(vol.displayName);
    setSearchResults([]);
  }

  async function handleAddSelected(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !ministryId || !selectedVolunteer) return;
    setSubmitting(true);
    setSuccessMessage(null);
    setActionError(null);
    try {
      await addMinistryMembership({
        ministryId,
        actingVolunteerId,
        volunteerId: selectedVolunteer.id,
        status: addStatus,
      });
      setSelectedVolunteer(null);
      setSearchQuery('');
      setAddStatus('PENDING');
      setSuccessMessage(t('messages.added'));
      await loadRows();
    } catch (err) {
      const code = err instanceof ApiRequestError ? err.code : undefined;
      setActionError(
        code === 'ADMIN_NOT_ACCREDITED'
          ? t('errors.notAccredited')
          : err instanceof Error
            ? err.message
            : t('errors.actionFailed'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendInvite(e: FormEvent) {
    e.preventDefault();
    if (!actingVolunteerId || !ministryId || !inviteEmail.trim()) return;
    setInviteSending(true);
    setInviteSuccess(null);
    setInviteError(null);
    try {
      const result = await sendVolunteerInvite({
        ministryId,
        email: inviteEmail.trim(),
        actingVolunteerId,
      });
      if (isSendInviteAlreadyExists(result)) {
        setSearchQuery(result.displayName);
        setInviteEmail('');
        setInviteError(t('volunteerExistsHint'));
      } else {
        setInviteEmail('');
        setInviteSuccess(t('inviteSuccess'));
        await loadInvites();
      }
    } catch {
      setInviteError(t('errors.inviteFailed'));
    } finally {
      setInviteSending(false);
    }
  }

  async function handleActivate(volunteerId: string) {
    if (!actingVolunteerId || !ministryId) return;
    setSubmitting(true);
    setSuccessMessage(null);
    setActionError(null);
    try {
      await activateMinistryMembership({ ministryId, actingVolunteerId, volunteerId });
      setSuccessMessage(t('messages.activated'));
      await loadRows();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t('errors.actionFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(volunteerId: string) {
    if (!actingVolunteerId || !ministryId) return;
    setSubmitting(true);
    setSuccessMessage(null);
    setActionError(null);
    try {
      await deactivateMinistryMembership({
        ministryId,
        actingVolunteerId,
        volunteerId,
        leaderMinistryId: ministryId,
      });
      setSuccessMessage(t('messages.deactivated'));
      await loadRows();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t('errors.actionFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  if (!actingVolunteerId) {
    return (
      <section className="border-2 border-border bg-surface p-6">
        <p className="text-sm text-muted-foreground">{t('signInRequired')}</p>
      </section>
    );
  }

  if (stewardshipMinistries.length === 0) {
    return (
      <section className="border-2 border-border bg-surface p-6">
        <h1 className="font-display text-4xl font-bold uppercase">{t('title')}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{t('notSteward')}</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="border-2 border-border bg-surface p-6 shadow-[8px_8px_0_0_hsl(var(--border))]">
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-3 max-w-prose text-sm text-muted-foreground">{t('body')}</p>
      </div>

      <div className="flex flex-col gap-4 border-2 border-border bg-surface p-6">
        <label className="flex flex-col gap-1 text-sm font-semibold uppercase tracking-wide">
          {t('ministryLabel')}
          <select
            className="border-2 border-border bg-background px-3 py-2 normal-case tracking-normal"
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

        {/* Search section */}
        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <h2 className="font-display text-xl font-bold uppercase">{t('searchHeading')}</h2>
          <p className="text-xs text-muted-foreground">{t('searchHelp')}</p>
          <form onSubmit={(e) => void handleAddSelected(e)} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm font-semibold uppercase tracking-wide">
              {t('searchHeading')}
              <input
                className="border-2 border-border bg-background px-3 py-2 text-sm normal-case"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedVolunteer(null);
                }}
                disabled={!ministryId}
              />
            </label>
            {searchLoading && (
              <p className="text-xs text-muted-foreground">{t('searching')}</p>
            )}
            {searchError && (
              <p className="text-xs text-destructive">{searchError}</p>
            )}
            {searchResults.length > 0 && (
              <ul className="border-2 border-border bg-background" role="listbox" aria-label="Search results">
                {searchResults.map((vol) => (
                  <li
                    key={vol.id}
                    role="option"
                    aria-selected={selectedVolunteer?.id === vol.id}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => handleSelectVolunteer(vol)}
                  >
                    {vol.displayName}{vol.email ? ` · ${vol.email}` : ''}
                  </li>
                ))}
              </ul>
            )}
            {searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && !selectedVolunteer && (
              <p className="text-xs text-muted-foreground">{t('noResults')}</p>
            )}
            {selectedVolunteer && (
              <>
                <label className="flex flex-col gap-1 text-sm font-semibold uppercase tracking-wide">
                  {t('statusLabel')}
                  <select
                    className="border-2 border-border bg-background px-3 py-2 normal-case"
                    value={addStatus}
                    onChange={(e) => setAddStatus(e.target.value as 'PENDING' | 'ACTIVE')}
                    disabled={!ministryId || submitting}
                  >
                    <option value="PENDING">{t('status.pending')}</option>
                    <option value="ACTIVE">{t('status.active')}</option>
                  </select>
                </label>
                <Button type="submit" disabled={!ministryId || submitting} className="self-start">
                  {submitting ? t('saving') : t('addSelectedSubmit')}
                </Button>
              </>
            )}
          </form>
        </div>

        {/* Invite section */}
        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <h2 className="font-display text-xl font-bold uppercase">{t('inviteHeading')}</h2>
          <p className="text-xs text-muted-foreground">{t('inviteHelp')}</p>
          {!showInviteSection && (
            <Button
              type="button"
              variant="outline"
              className="self-start"
              onClick={() => setShowInviteSection(true)}
            >
              {t('inviteHeading')}
            </Button>
          )}
          {showInviteSection && (
            <form onSubmit={(e) => void handleSendInvite(e)} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm font-semibold uppercase tracking-wide">
                {t('inviteEmailLabel')}
                <input
                  type="email"
                  className="border-2 border-border bg-background px-3 py-2 text-sm normal-case"
                  placeholder={t('inviteEmailPlaceholder')}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={inviteSending}
                />
              </label>
              <Button type="submit" disabled={!inviteEmail.trim() || inviteSending} className="self-start">
                {inviteSending ? t('inviteSending') : t('inviteSubmit')}
              </Button>
              {inviteSuccess && (
                <p role="status" className="text-sm font-semibold text-primary">{inviteSuccess}</p>
              )}
              {inviteError && (
                <p role="alert" className="text-sm text-destructive">{inviteError}</p>
              )}
            </form>
          )}
        </div>
      </div>

      {actionError && (
        <p role="alert" className="border-2 border-destructive p-3 text-sm text-destructive">
          {actionError}
        </p>
      )}

      {successMessage && (
        <p role="status" className="border-2 border-primary bg-primary/10 p-3 text-sm font-semibold text-primary">
          {successMessage}
        </p>
      )}

      {error && (
        <p role="alert" className="border-2 border-destructive p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Pending invites */}
      {invites.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-2xl font-bold uppercase">{t('pendingInvitesHeading')}</h2>
          <ul className="flex flex-col gap-3">
            {invites.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-col gap-1 border-2 border-border bg-surface p-4"
              >
                <p className="font-medium">{inv.email}</p>
                <p className="text-xs text-muted-foreground">
                  {t('inviteSent')}: {new Date(inv.sentAtUtc).toLocaleDateString()}
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t(`inviteStatus.${inv.status}`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Membership roster */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold uppercase">{t('rosterHeading')}</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('emptyState')}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((row) => (
              <li
                key={row.volunteerId}
                className="flex flex-col gap-3 border-2 border-border bg-surface p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{row.displayName}</p>
                  <p className="font-mono text-xs text-muted-foreground">{row.volunteerId}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t(`status.${row.status.toLowerCase() as 'pending' | 'active' | 'inactive'}`)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {row.status === 'PENDING' && (
                    <Button
                      type="button"
                      size="sm"
                      disabled={submitting}
                      onClick={() => void handleActivate(row.volunteerId)}
                    >
                      {t('actions.activate')}
                    </Button>
                  )}
                  {row.status === 'ACTIVE' && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={submitting}
                      onClick={() => void handleDeactivate(row.volunteerId)}
                    >
                      {t('actions.deactivate')}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
