import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AuthSessionContext } from '@/auth/AuthSessionProvider';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { OrganizationContextProvider } from '@/organization/OrganizationContextProvider';
import * as fetchOrgContext from '@/organization/fetchOrganizationContext';
import * as churchMetadata from '@/organization/churchMetadata';
import { ChurchSettingsSection } from '@/organization/ChurchSettingsSection';

vi.mock('@/organization/fetchOrganizationContext');
vi.mock('@/organization/churchMetadata');

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('ChurchSettingsSection', () => {
  const adminId = 'admin-1';
  const churchId = 'church-1';

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
        campuses: [],
        ministries: [],
      },
    ],
  };

  const updatedContext = {
    churches: [
      {
        ...initialContext.churches[0],
        name: 'Renamed Church',
        defaultTimezone: 'America/New_York',
      },
    ],
  };

  async function renderSection() {
    await initI18n(undefined, 'en');
    render(
      <I18nProvider>
        <AuthSessionContext.Provider value={authState}>
          <OrganizationContextProvider enabled={true}>
            <ChurchSettingsSection />
          </OrganizationContextProvider>
        </AuthSessionContext.Provider>
      </I18nProvider>,
    );
  }

  it('saves church metadata and refreshes organization context', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchOrgContext.fetchOrganizationContext)
      .mockResolvedValueOnce(initialContext as never)
      .mockResolvedValueOnce(updatedContext as never);
    vi.mocked(churchMetadata.updateChurchMetadata).mockResolvedValue({
      id: churchId,
      name: 'Renamed Church',
      defaultTimezone: 'America/New_York',
    });

    await renderSection();

    const nameInput = await screen.findByLabelText('Church name');
    fireEvent.change(nameInput, { target: { value: 'Renamed Church' } });

    const timezoneInput = screen.getByLabelText('Default timezone');
    fireEvent.change(timezoneInput, { target: { value: 'America/New_York' } });

    await user.click(screen.getByRole('button', { name: 'Save church settings' }));

    await waitFor(() => {
      expect(churchMetadata.updateChurchMetadata).toHaveBeenCalledWith({
        churchId,
        actingVolunteerId: adminId,
        name: 'Renamed Church',
        defaultTimezone: 'America/New_York',
      });
    });
    await waitFor(() => {
      expect(fetchOrgContext.fetchOrganizationContext).toHaveBeenCalledTimes(2);
    });
    expect(screen.getByText('Church settings saved.')).toBeInTheDocument();
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
            <ChurchSettingsSection />
          </OrganizationContextProvider>
        </AuthSessionContext.Provider>
      </I18nProvider>,
    );

    expect(screen.queryByText('Church settings')).not.toBeInTheDocument();
  });
});
