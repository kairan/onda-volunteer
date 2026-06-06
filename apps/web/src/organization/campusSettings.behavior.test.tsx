import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AuthSessionContext } from '@/auth/AuthSessionProvider';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { OrganizationContextProvider } from '@/organization/OrganizationContextProvider';
import * as fetchOrgContext from '@/organization/fetchOrganizationContext';
import * as campusMetadata from '@/organization/campusMetadata';
import { CampusSettingsSection } from '@/organization/CampusSettingsSection';

vi.mock('@/organization/fetchOrganizationContext');
vi.mock('@/organization/campusMetadata');

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('CampusSettingsSection', () => {
  const adminId = 'admin-1';
  const churchId = 'church-1';
  const campusId = 'campus-1';

  const authState = {
    status: 'authenticated' as const,
    volunteerId: adminId,
    displayName: 'Pat Admin',
    uiLocale: 'en',
    refresh: async () => {},
  };

  const initialContext = {
    churches: [
      {
        id: churchId,
        name: 'Test Church',
        defaultTimezone: 'UTC',
        isAccreditedAdmin: true,
        campuses: [
          {
            id: campusId,
            name: 'Main Campus',
            timezone: 'America/New_York',
          },
        ],
        ministries: [],
      },
    ],
  };

  const updatedContext = {
    churches: [
      {
        ...initialContext.churches[0],
        campuses: [
          {
            id: campusId,
            name: 'Renamed Campus',
            timezone: 'America/Sao_Paulo',
          },
        ],
      },
    ],
  };

  async function renderSection() {
    await initI18n(undefined, 'en');
    render(
      <I18nProvider>
        <AuthSessionContext.Provider value={authState}>
          <OrganizationContextProvider enabled={true}>
            <CampusSettingsSection />
          </OrganizationContextProvider>
        </AuthSessionContext.Provider>
      </I18nProvider>,
    );
  }

  it('saves campus metadata after timezone confirm and refreshes organization context', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchOrgContext.fetchOrganizationContext)
      .mockResolvedValueOnce(initialContext as never)
      .mockResolvedValueOnce(updatedContext as never);
    vi.mocked(campusMetadata.updateCampusMetadata).mockResolvedValue({
      id: campusId,
      churchId,
      name: 'Renamed Campus',
      timezone: 'America/Sao_Paulo',
    });

    await renderSection();

    const nameInput = await screen.findByLabelText('Campus name');
    await waitFor(() => expect(nameInput).toHaveValue('Main Campus'));
    await user.clear(nameInput);
    await user.type(nameInput, 'Renamed Campus');

    const timezoneInput = screen.getByLabelText('Campus timezone');
    await waitFor(() => expect(timezoneInput).toHaveValue('America/New_York'));
    await user.clear(timezoneInput);
    await user.type(timezoneInput, 'America/Sao_Paulo');

    await user.click(screen.getByRole('button', { name: 'Save campus settings' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Change campus timezone?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save timezone change' }));

    await waitFor(() => {
      expect(campusMetadata.updateCampusMetadata).toHaveBeenCalledWith({
        campusId,
        actingVolunteerId: adminId,
        name: 'Renamed Campus',
        timezone: 'America/Sao_Paulo',
      });
    });
    await waitFor(() => {
      expect(fetchOrgContext.fetchOrganizationContext).toHaveBeenCalledTimes(2);
    });
    expect(screen.getByText('Campus settings saved.')).toBeInTheDocument();
  });

  it('saves name-only changes without a timezone confirm dialog', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchOrgContext.fetchOrganizationContext)
      .mockResolvedValueOnce(initialContext as never)
      .mockResolvedValueOnce({
        churches: [
          {
            ...initialContext.churches[0],
            campuses: [
              {
                id: campusId,
                name: 'Renamed Campus',
                timezone: 'America/New_York',
              },
            ],
          },
        ],
      } as never);
    vi.mocked(campusMetadata.updateCampusMetadata).mockResolvedValue({
      id: campusId,
      churchId,
      name: 'Renamed Campus',
      timezone: 'America/New_York',
    });

    await renderSection();

    const nameInput = await screen.findByLabelText('Campus name');
    await waitFor(() => expect(nameInput).toHaveValue('Main Campus'));
    await user.clear(nameInput);
    await user.type(nameInput, 'Renamed Campus');

    await user.click(screen.getByRole('button', { name: 'Save campus settings' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(campusMetadata.updateCampusMetadata).toHaveBeenCalledWith({
        campusId,
        actingVolunteerId: adminId,
        name: 'Renamed Campus',
        timezone: 'America/New_York',
      });
    });
  });

  it('does not render for non-accredited volunteers', async () => {
    await initI18n(undefined, 'en');
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue({
      churches: [
        {
          ...initialContext.churches[0],
          isAccreditedAdmin: false,
        },
      ],
    } as never);

    render(
      <I18nProvider>
        <AuthSessionContext.Provider value={authState}>
          <OrganizationContextProvider enabled={true}>
            <CampusSettingsSection />
          </OrganizationContextProvider>
        </AuthSessionContext.Provider>
      </I18nProvider>,
    );

    expect(screen.queryByText('Campus settings')).not.toBeInTheDocument();
  });
});
