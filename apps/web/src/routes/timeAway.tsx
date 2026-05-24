import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiRequestError } from '@/apiError';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { createBulkVolunteerUnavailability } from '@/identity/createBulkVolunteerUnavailability';
import { createVolunteerUnavailability } from '@/identity/createVolunteerUnavailability';
import {
  fetchVolunteerUnavailability,
  type VolunteerUnavailability,
} from '@/identity/fetchVolunteerUnavailability';
import { useOrganization } from '@/organization/OrganizationContextProvider';
import { useLocalTimeContext } from '@/settings/LocalTimeProvider';
import { Button } from '@/components/ui/button';

type FieldErrors = {
  ministryId?: string;
  startsAt?: string;
  endsAt?: string;
  summary?: string;
};

type MirrorFieldErrors = {
  ministryIds?: string;
  startsAt?: string;
  endsAt?: string;
  summary?: string;
};

function datetimeLocalToUtcIso(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${value}:00.000Z`;
  }
  return new Date(value).toISOString();
}

export function TimeAwayPage() {
  const { t, i18n } = useTranslation('timeAway');
  const auth = useAuthSession();
  const { activeChurch, activeCampus } = useOrganization();
  const { formatWithLocal } = useLocalTimeContext();

  const pendingMinistries = useMemo(
    () =>
      activeChurch?.ministries.filter((m) => m.membershipStatus === 'PENDING') ?? [],
    [activeChurch],
  );

  const [rows, setRows] = useState<VolunteerUnavailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [ministryId, setMinistryId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [mirrorMinistryIds, setMirrorMinistryIds] = useState<string[]>([]);
  const [mirrorStartsAt, setMirrorStartsAt] = useState('');
  const [mirrorEndsAt, setMirrorEndsAt] = useState('');
  const [mirrorFieldErrors, setMirrorFieldErrors] = useState<MirrorFieldErrors>({});
  const [mirrorSubmitting, setMirrorSubmitting] = useState(false);
  const [mirrorStatusMessage, setMirrorStatusMessage] = useState<string | null>(null);
  const [mirrorFailureMessage, setMirrorFailureMessage] = useState<string | null>(null);

  const volunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : null;

  const ministries = useMemo(
    () => activeChurch?.ministries ?? [],
    [activeChurch?.ministries],
  );
  const mirrorEligibleMinistries = useMemo(
    () => ministries.filter((ministry) => ministry.membershipStatus !== 'INACTIVE'),
    [ministries],
  );

  useEffect(() => {
    setMirrorMinistryIds(mirrorEligibleMinistries.map((ministry) => ministry.id));
  }, [mirrorEligibleMinistries]);

  const loadRows = useCallback(async (options?: { silent?: boolean }) => {
    if (!volunteerId || !activeChurch) return;
    if (!options?.silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await fetchVolunteerUnavailability({
        volunteerId,
        churchId: activeChurch.id,
      });
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load unavailability');
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, [volunteerId, activeChurch]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const timezone = activeCampus?.timezone ?? activeChurch?.defaultTimezone ?? 'UTC';

  const formatDateTime = (iso: string) => {
    return formatWithLocal(iso, timezone, i18n.language, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupedByMinistry = useMemo(() => {
    const groups = new Map<string, { name: string; rows: VolunteerUnavailability[] }>();
    for (const row of rows) {
      const existing = groups.get(row.ministry.id);
      if (existing) {
        existing.rows.push(row);
      } else {
        groups.set(row.ministry.id, { name: row.ministry.name, rows: [row] });
      }
    }
    return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);

  function validateForm(): FieldErrors {
    const next: FieldErrors = {};
    if (!ministryId) {
      next.ministryId = t('errors.ministryRequired');
    }
    if (!startsAt) {
      next.startsAt = t('errors.startsAtRequired');
    }
    if (!endsAt) {
      next.endsAt = t('errors.endsAtRequired');
    }
    if (startsAt && endsAt) {
      const start = new Date(datetimeLocalToUtcIso(startsAt)).getTime();
      const end = new Date(datetimeLocalToUtcIso(endsAt)).getTime();
      if (!(start < end)) {
        next.endsAt = t('errors.invalidWindow');
      }
    }
    return next;
  }

  function validateMirrorForm(): MirrorFieldErrors {
    const next: MirrorFieldErrors = {};
    if (mirrorMinistryIds.length === 0) {
      next.ministryIds = t('errors.mirrorMinistriesRequired');
    }
    if (!mirrorStartsAt) {
      next.startsAt = t('errors.startsAtRequired');
    }
    if (!mirrorEndsAt) {
      next.endsAt = t('errors.endsAtRequired');
    }
    if (mirrorStartsAt && mirrorEndsAt) {
      const start = new Date(datetimeLocalToUtcIso(mirrorStartsAt)).getTime();
      const end = new Date(datetimeLocalToUtcIso(mirrorEndsAt)).getTime();
      if (!(start < end)) {
        next.endsAt = t('errors.invalidWindow');
      }
    }
    return next;
  }

  const selectedMirrorMinistryNames = useMemo(
    () =>
      mirrorEligibleMinistries
        .filter((ministry) => mirrorMinistryIds.includes(ministry.id))
        .map((ministry) => ministry.name)
        .sort((a, b) => a.localeCompare(b)),
    [mirrorEligibleMinistries, mirrorMinistryIds],
  );

  function toggleMirrorMinistry(ministryId: string, checked: boolean) {
    setMirrorMinistryIds((current) => {
      if (checked) {
        return current.includes(ministryId) ? current : [...current, ministryId];
      }
      return current.filter((id) => id !== ministryId);
    });
  }

  async function handleMirrorSubmit(event: FormEvent) {
    event.preventDefault();
    if (!volunteerId) return;

    setMirrorStatusMessage(null);
    setMirrorFailureMessage(null);
    const nextErrors = validateMirrorForm();
    const fieldKeys = ['ministryIds', 'startsAt', 'endsAt'] as const;
    const errorCount = fieldKeys.filter((key) => nextErrors[key]).length;
    if (errorCount > 1) {
      nextErrors.summary = t('errors.summary');
    }
    if (Object.keys(nextErrors).length > 0) {
      setMirrorFieldErrors(nextErrors);
      return;
    }

    setMirrorFieldErrors({});
    setMirrorSubmitting(true);
    try {
      const result = await createBulkVolunteerUnavailability({
        volunteerId,
        ministryIds: mirrorMinistryIds,
        startsAtUtc: datetimeLocalToUtcIso(mirrorStartsAt),
        endsAtUtc: datetimeLocalToUtcIso(mirrorEndsAt),
      });

      if (result.createdCount > 0) {
        setMirrorStatusMessage(t('mirrorSuccess', { count: result.createdCount }));
        setMirrorStartsAt('');
        setMirrorEndsAt('');
        await loadRows({ silent: true });
      }

      if (result.failed.length > 0) {
        const failedNames = result.failed
          .map((failure) => {
            const ministry = ministries.find((entry) => entry.id === failure.ministryId);
            return ministry?.name ?? failure.ministryId;
          })
          .join(', ');
        setMirrorFailureMessage(
          result.createdCount > 0
            ? t('mirrorPartial', { count: result.createdCount, failed: failedNames })
            : t('mirrorAllFailed', { failed: failedNames }),
        );
      }
    } catch (err) {
      if (err instanceof ApiRequestError) {
        const apiErrors: MirrorFieldErrors = { summary: err.message };
        if (err.code === 'INVALID_UNAVAILABILITY_WINDOW') {
          apiErrors.endsAt = err.message;
          delete apiErrors.summary;
        }
        if (Object.keys(apiErrors).length > 1 || apiErrors.summary) {
          apiErrors.summary = apiErrors.summary ?? t('errors.summary');
        }
        setMirrorFieldErrors(apiErrors);
      } else {
        setMirrorFieldErrors({
          summary: err instanceof Error ? err.message : t('errors.summary'),
        });
      }
    } finally {
      setMirrorSubmitting(false);
    }
  }


  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!volunteerId) return;

    setSuccessMessage(null);
    const nextErrors = validateForm();
    const fieldKeys = ['ministryId', 'startsAt', 'endsAt'] as const;
    const errorCount = fieldKeys.filter((key) => nextErrors[key]).length;
    if (errorCount > 1) {
      nextErrors.summary = t('errors.summary');
    }
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      await createVolunteerUnavailability({
        volunteerId,
        ministryId,
        startsAtUtc: datetimeLocalToUtcIso(startsAt),
        endsAtUtc: datetimeLocalToUtcIso(endsAt),
      });
      setSuccessMessage(t('success'));
      setStartsAt('');
      setEndsAt('');
      await loadRows({ silent: true });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        const apiErrors: FieldErrors = { summary: err.message };
        if (err.code === 'INVALID_UNAVAILABILITY_WINDOW') {
          apiErrors.endsAt = err.message;
          delete apiErrors.summary;
        } else if (err.code === 'MEMBERSHIP_REQUIRED') {
          apiErrors.ministryId = err.message;
          delete apiErrors.summary;
        }
        if (Object.keys(apiErrors).length > 1 || apiErrors.summary) {
          apiErrors.summary = apiErrors.summary ?? t('errors.summary');
        }
        setFieldErrors(apiErrors);
      } else {
        setFieldErrors({
          summary: err instanceof Error ? err.message : t('errors.summary'),
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="flex flex-col gap-8">
      {pendingMinistries.length > 0 ? (
        <div
          className="border-2 border-primary bg-primary/10 p-4 text-sm"
          role="status"
        >
          <p>
            {t('pendingNotice', {
              ministries: pendingMinistries.map((m) => m.name).join(', '),
            })}
          </p>
        </div>
      ) : null}
      <div className="border-2 border-border bg-surface p-6 shadow-[8px_8px_0_0_hsl(var(--border))]">
        <div className="flex flex-col items-start gap-3">
          <p className="inline-block border-2 border-border bg-background px-2 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-foreground">
            {t('eyebrow')}
          </p>
          <h1 className="inline-block max-w-3xl border-2 border-border bg-primary px-3 py-2 font-display text-6xl font-extrabold uppercase leading-[0.95] tracking-tight">
            {t('title')}
          </h1>
        </div>
        <p className="mt-5 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {t('body')}
        </p>
      </div>

      <form
        className="flex flex-col gap-4 border-2 border-border bg-surface p-6"
        onSubmit={(event) => void handleSubmit(event)}
        noValidate
      >
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
          {t('createHeading')}
        </h2>

        {fieldErrors.summary ? (
          <p role="alert" className="border-2 border-destructive bg-surface p-3 text-sm text-destructive">
            {fieldErrors.summary}
          </p>
        ) : null}

        {successMessage ? (
          <p role="status" className="border-2 border-primary bg-primary/10 p-3 text-sm">
            {successMessage}
          </p>
        ) : null}

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold uppercase tracking-wide">{t('form.ministry')}</span>
          <select
            className="border-2 border-border bg-background px-3 py-2"
            value={ministryId}
            aria-label={t('form.ministry')}
            aria-invalid={Boolean(fieldErrors.ministryId)}
            aria-describedby={fieldErrors.ministryId ? 'time-away-ministry-error' : undefined}
            onChange={(event) => setMinistryId(event.target.value)}
          >
            <option value="">{t('form.ministry')}</option>
            {ministries.map((ministry) => (
              <option key={ministry.id} value={ministry.id}>
                {ministry.name}
              </option>
            ))}
          </select>
          {fieldErrors.ministryId ? (
            <span id="time-away-ministry-error" className="text-destructive">
              {fieldErrors.ministryId}
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold uppercase tracking-wide">{t('form.startsAt')}</span>
          <input
            type="datetime-local"
            className="border-2 border-border bg-background px-3 py-2"
            value={startsAt}
            aria-label={t('form.startsAt')}
            aria-invalid={Boolean(fieldErrors.startsAt)}
            aria-describedby={fieldErrors.startsAt ? 'time-away-starts-error' : undefined}
            onChange={(event) => setStartsAt(event.target.value)}
          />
          {fieldErrors.startsAt ? (
            <span id="time-away-starts-error" className="text-destructive">
              {fieldErrors.startsAt}
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold uppercase tracking-wide">{t('form.endsAt')}</span>
          <input
            type="datetime-local"
            className="border-2 border-border bg-background px-3 py-2"
            value={endsAt}
            aria-label={t('form.endsAt')}
            aria-invalid={Boolean(fieldErrors.endsAt)}
            aria-describedby={fieldErrors.endsAt ? 'time-away-ends-error' : undefined}
            onChange={(event) => setEndsAt(event.target.value)}
          />
          {fieldErrors.endsAt ? (
            <span id="time-away-ends-error" className="text-destructive">
              {fieldErrors.endsAt}
            </span>
          ) : null}
        </label>

        <Button type="submit" disabled={submitting}>
          {submitting ? t('form.submitting') : t('form.submit')}
        </Button>
      </form>


      <form
        className="flex flex-col gap-4 border-2 border-border bg-surface p-6"
        onSubmit={(event) => void handleMirrorSubmit(event)}
        noValidate
        role="group"
        aria-labelledby="time-away-mirror-heading"
      >
        <h2
          id="time-away-mirror-heading"
          className="font-display text-2xl font-bold uppercase tracking-tight"
        >
          {t('mirrorHeading')}
        </h2>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          {t('mirrorBody')}
        </p>

        {mirrorEligibleMinistries.length < 2 ? (
          <p className="text-sm text-muted-foreground">{t('mirrorNoMinistries')}</p>
        ) : (
          <>
            {mirrorFieldErrors.summary ? (
              <p
                role="alert"
                className="border-2 border-destructive bg-surface p-3 text-sm text-destructive"
              >
                {mirrorFieldErrors.summary}
              </p>
            ) : null}

            {mirrorStatusMessage ? (
              <p
                role="status"
                aria-label={mirrorStatusMessage}
                className="border-2 border-primary bg-primary/10 p-3 text-sm"
              >
                {mirrorStatusMessage}
              </p>
            ) : null}

            {mirrorFailureMessage ? (
              <p
                role="alert"
                className="border-2 border-destructive bg-surface p-3 text-sm text-destructive"
              >
                {mirrorFailureMessage}
              </p>
            ) : null}

            <fieldset className="flex flex-col gap-2 border-0 p-0">
              <legend className="text-sm font-semibold uppercase tracking-wide">
                {t('mirrorScope')}
              </legend>
              {mirrorFieldErrors.ministryIds ? (
                <span className="text-destructive">{mirrorFieldErrors.ministryIds}</span>
              ) : null}
              <ul className="flex flex-col gap-2">
                {mirrorEligibleMinistries.map((ministry) => (
                  <li key={ministry.id}>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={mirrorMinistryIds.includes(ministry.id)}
                        onChange={(event) =>
                          toggleMirrorMinistry(ministry.id, event.target.checked)
                        }
                      />
                      <span>{ministry.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
              {selectedMirrorMinistryNames.length > 0 ? (
                <p className="text-sm text-muted-foreground">
                  {selectedMirrorMinistryNames.join(', ')}
                </p>
              ) : null}
            </fieldset>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold uppercase tracking-wide">
                {t('mirrorForm.startsAt')}
              </span>
              <input
                type="datetime-local"
                className="border-2 border-border bg-background px-3 py-2"
                value={mirrorStartsAt}
                aria-label={t('mirrorForm.startsAt')}
                aria-invalid={Boolean(mirrorFieldErrors.startsAt)}
                onChange={(event) => setMirrorStartsAt(event.target.value)}
              />
              {mirrorFieldErrors.startsAt ? (
                <span className="text-destructive">{mirrorFieldErrors.startsAt}</span>
              ) : null}
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold uppercase tracking-wide">
                {t('mirrorForm.endsAt')}
              </span>
              <input
                type="datetime-local"
                className="border-2 border-border bg-background px-3 py-2"
                value={mirrorEndsAt}
                aria-label={t('mirrorForm.endsAt')}
                aria-invalid={Boolean(mirrorFieldErrors.endsAt)}
                onChange={(event) => setMirrorEndsAt(event.target.value)}
              />
              {mirrorFieldErrors.endsAt ? (
                <span className="text-destructive">{mirrorFieldErrors.endsAt}</span>
              ) : null}
            </label>

            <Button type="submit" disabled={mirrorSubmitting}>
              {mirrorSubmitting ? t('mirrorForm.submitting') : t('mirrorForm.submit')}
            </Button>
          </>
        )}
      </form>


      <div className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
          {t('listHeading')}
        </h2>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 w-full animate-pulse border-2 border-border bg-surface-2"
                aria-hidden
              />
            ))}
            <p className="sr-only">{t('loading')}</p>
          </div>
        ) : error ? (
          <div className="border-2 border-destructive bg-surface p-4 text-sm text-destructive">
            {error}
          </div>
        ) : groupedByMinistry.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-2 border-border bg-surface p-12 text-center text-muted-foreground">
            <p className="max-w-xs text-sm">{t('emptyState')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {groupedByMinistry.map((group) => (
              <section key={group.name} className="flex flex-col gap-3">
                <h3 className="font-display text-lg font-bold uppercase tracking-tight">
                  {group.name}
                </h3>
                <ul className="grid gap-3 md:grid-cols-2">
                  {group.rows.map((row) => (
                    <li
                      key={row.id}
                      className="border-2 border-border bg-surface p-4 text-sm"
                    >
                      <p className="font-medium">
                        {formatDateTime(row.startsAtUtc)} → {formatDateTime(row.endsAtUtc)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
