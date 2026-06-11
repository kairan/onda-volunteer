import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { TimeAwayPage } from './timeAway';
import { AuthSessionContext } from '@/auth/AuthSessionProvider';
import { OrganizationContextProvider } from '@/organization/OrganizationContextProvider';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import * as fetchUnavailability from '@/identity/fetchVolunteerUnavailability';
import * as createUnavailability from '@/identity/createVolunteerUnavailability';
import * as createBulkUnavailability from '@/identity/createBulkVolunteerUnavailability';
import * as fetchOrgContext from '@/organization/fetchOrganizationContext';

vi.mock('@/identity/fetchVolunteerUnavailability');
vi.mock('@/identity/createVolunteerUnavailability');
vi.mock('@/identity/createBulkVolunteerUnavailability');
vi.mock('@/organization/fetchOrganizationContext');

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('TimeAwayPage', () => {
  const mockVolunteerId = 'vol-123';
  const mockChurchId = 'church-456';

  const authState = {
    status: 'authenticated' as const,
    volunteerId: mockVolunteerId,
    displayName: 'Sam',
    uiLocale: 'pt-BR',
    isSystemAdmin: false,
    newlyFulfilledInvites: [],
    refresh: async () => {},
  };

  const orgContext = {
    churches: [
      {
        id: mockChurchId,
        name: 'Test Church',
        defaultTimezone: 'UTC',
        isAccreditedAdmin: false,
        campuses: [],
        ministries: [{ id: 'min-1', name: 'Greeters' }],
      },
    ],
  };

  it('renders unavailability rows grouped by ministry when loaded', async () => {
    await initI18n();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(orgContext as any);
    vi.mocked(fetchUnavailability.fetchVolunteerUnavailability).mockResolvedValue([
      {
        id: 'unavail-1',
        startsAtUtc: '2026-06-01T10:00:00Z',
        endsAtUtc: '2026-06-01T12:00:00Z',
        ministry: { id: 'min-1', name: 'Greeters' },
      },
    ]);

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <AuthSessionContext.Provider value={authState}>
            <OrganizationContextProvider enabled={true}>
              <TimeAwayPage />
            </OrganizationContextProvider>
          </AuthSessionContext.Provider>
        </LocalTimeProvider>
      </I18nProvider>,
    );

    expect(screen.getByText('Carregando indisponibilidades...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Greeters', level: 3 })).toBeInTheDocument();
    });
  });

  it('creates unavailability for a selected ministry and refreshes the list', async () => {
    await initI18n();
    const user = userEvent.setup();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(orgContext as any);
    vi.mocked(fetchUnavailability.fetchVolunteerUnavailability)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'unavail-new',
          startsAtUtc: '2026-06-03T10:00:00Z',
          endsAtUtc: '2026-06-03T12:00:00Z',
          ministry: { id: 'min-1', name: 'Greeters' },
        },
      ]);
    vi.mocked(createUnavailability.createVolunteerUnavailability).mockResolvedValue({
      id: 'unavail-new',
      ministryId: 'min-1',
      window: {
        startsAtUtc: '2026-06-03T10:00:00Z',
        endsAtUtc: '2026-06-03T12:00:00Z',
      },
    });

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <AuthSessionContext.Provider value={authState}>
            <OrganizationContextProvider enabled={true}>
              <TimeAwayPage />
            </OrganizationContextProvider>
          </AuthSessionContext.Provider>
        </LocalTimeProvider>
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Ministério' })).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByRole('combobox', { name: 'Ministério' }), 'min-1');
    await user.type(screen.getByLabelText('Início'), '2026-06-03T10:00');
    await user.type(screen.getByLabelText('Fim'), '2026-06-03T12:00');
    await user.click(screen.getByRole('button', { name: /salvar indisponibilidade/i }));

    await waitFor(() => {
      expect(createUnavailability.createVolunteerUnavailability).toHaveBeenCalledWith({
        volunteerId: mockVolunteerId,
        ministryId: 'min-1',
        startsAtUtc: '2026-06-03T10:00:00.000Z',
        endsAtUtc: '2026-06-03T12:00:00.000Z',
      });
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Greeters', level: 3 })).toBeInTheDocument();
    });
  });

  it('shows pending membership notice while still allowing the create form', async () => {
    await initI18n();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue({
      churches: [
        {
          id: mockChurchId,
          name: 'Test Church',
          defaultTimezone: 'UTC',
          isAccreditedAdmin: false,
          campuses: [],
          ministries: [
            { id: 'min-1', name: 'Greeters', membershipStatus: 'ACTIVE' },
            { id: 'min-2', name: 'Band', membershipStatus: 'PENDING' },
          ],
        },
      ],
    } as any);
    vi.mocked(fetchUnavailability.fetchVolunteerUnavailability).mockResolvedValue([]);

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <AuthSessionContext.Provider value={authState}>
            <OrganizationContextProvider enabled={true}>
              <TimeAwayPage />
            </OrganizationContextProvider>
          </AuthSessionContext.Provider>
        </LocalTimeProvider>
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/Band/);
    });
    expect(screen.getByRole('status')).toHaveTextContent(/Ativo/i);
    expect(screen.getByRole('combobox', { name: 'Ministério' })).toBeInTheDocument();
  });


  it('mirrors unavailability across selected ministries and confirms how many were created', async () => {
    await initI18n();
    const user = userEvent.setup();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue({
      churches: [
        {
          id: mockChurchId,
          name: 'Test Church',
          defaultTimezone: 'UTC',
          isAccreditedAdmin: false,
          campuses: [],
          ministries: [
            { id: 'min-1', name: 'Greeters', membershipStatus: 'ACTIVE' },
            { id: 'min-2', name: 'Band', membershipStatus: 'ACTIVE' },
          ],
        },
      ],
    } as any);
    vi.mocked(fetchUnavailability.fetchVolunteerUnavailability).mockResolvedValue([]);
    vi.mocked(createBulkUnavailability.createBulkVolunteerUnavailability).mockResolvedValue({
      createdCount: 2,
      created: [
        { id: 'u1', ministryId: 'min-1' },
        { id: 'u2', ministryId: 'min-2' },
      ],
      failed: [],
    });

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <AuthSessionContext.Provider value={authState}>
            <OrganizationContextProvider enabled={true}>
              <TimeAwayPage />
            </OrganizationContextProvider>
          </AuthSessionContext.Provider>
        </LocalTimeProvider>
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('group', { name: /espelhar/i })).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Início do espelhamento'), '2026-06-05T09:00');
    await user.type(screen.getByLabelText('Fim do espelhamento'), '2026-06-05T17:00');
    await user.click(screen.getByRole('button', { name: /espelhar em ministérios/i }));

    await waitFor(() => {
      expect(createBulkUnavailability.createBulkVolunteerUnavailability).toHaveBeenCalledWith({
        volunteerId: mockVolunteerId,
        ministryIds: ['min-1', 'min-2'],
        startsAtUtc: '2026-06-05T09:00:00.000Z',
        endsAtUtc: '2026-06-05T17:00:00.000Z',
      });
    });

    expect(
      await screen.findByRole('status', { name: /2 indisponibilidades criadas/i }),
    ).toBeInTheDocument();
  });

  it('reports ministries that failed to mirror without discarding successful rows', async () => {
    await initI18n();
    const user = userEvent.setup();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue({
      churches: [
        {
          id: mockChurchId,
          name: 'Test Church',
          defaultTimezone: 'UTC',
          isAccreditedAdmin: false,
          campuses: [],
          ministries: [
            { id: 'min-1', name: 'Greeters', membershipStatus: 'ACTIVE' },
            { id: 'min-2', name: 'Band', membershipStatus: 'ACTIVE' },
          ],
        },
      ],
    } as any);
    vi.mocked(fetchUnavailability.fetchVolunteerUnavailability).mockResolvedValue([]);
    vi.mocked(createBulkUnavailability.createBulkVolunteerUnavailability).mockResolvedValue({
      createdCount: 1,
      created: [{ id: 'u1', ministryId: 'min-1' }],
      failed: [
        {
          ministryId: 'min-2',
          code: 'MEMBERSHIP_REQUIRED',
          message: 'No membership',
        },
      ],
    });

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <AuthSessionContext.Provider value={authState}>
            <OrganizationContextProvider enabled={true}>
              <TimeAwayPage />
            </OrganizationContextProvider>
          </AuthSessionContext.Provider>
        </LocalTimeProvider>
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('group', { name: /espelhar/i })).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Início do espelhamento'), '2026-06-06T09:00');
    await user.type(screen.getByLabelText('Fim do espelhamento'), '2026-06-06T17:00');
    await user.click(screen.getByRole('button', { name: /espelhar em ministérios/i }));

    expect(
      await screen.findByRole('status', { name: /1 indisponibilidades criadas/i }),
    ).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Band');
    expect(alert.textContent).toMatch(/1 indisponibilidades criadas/i);
    expect(alert.textContent).not.toMatch(/criadas\. criada/i);
  });

  it('shows field-level validation errors without a top summary for single-field failures', async () => {
    await initI18n();
    const user = userEvent.setup();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(orgContext as any);
    vi.mocked(fetchUnavailability.fetchVolunteerUnavailability).mockResolvedValue([]);

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <AuthSessionContext.Provider value={authState}>
            <OrganizationContextProvider enabled={true}>
              <TimeAwayPage />
            </OrganizationContextProvider>
          </AuthSessionContext.Provider>
        </LocalTimeProvider>
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Ministério' })).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Início'), '2026-06-03T10:00');
    await user.type(screen.getByLabelText('Fim'), '2026-06-03T12:00');
    await user.click(screen.getByRole('button', { name: /salvar indisponibilidade/i }));

    expect(await screen.findByText('Selecione um ministério.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
