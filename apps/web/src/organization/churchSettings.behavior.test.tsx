import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthSessionTestProvider } from '@/auth/AuthSessionProvider';
import { I18nProvider } from '@/i18n/I18nProvider';
import i18n from 'i18next';
import { initI18n } from '@/i18n/controller';
import { ChurchSettingsSection } from '@/organization/ChurchSettingsSection';
import { updateChurchMetadata } from '@/organization/updateChurchMetadata';

vi.mock('@/organization/OrganizationContextProvider', () => ({
  useOrganization: vi.fn(),
}));

vi.mock('@/organization/updateChurchMetadata', () => ({
  updateChurchMetadata: vi.fn(),
}));

import { useOrganization } from '@/organization/OrganizationContextProvider';

const useOrganizationMock = vi.mocked(useOrganization);
const updateMock = vi.mocked(updateChurchMetadata);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('Church settings section', () => {
  it('saves church metadata and refreshes organization context', async () => {
    await initI18n();
    await i18n.changeLanguage('en');
    const refresh = vi.fn(async () => undefined);
    useOrganizationMock.mockReturnValue({
      activeChurch: {
        id: 'ch-1',
        name: 'Old',
        defaultTimezone: 'UTC',
        isAccreditedAdmin: true,
        campuses: [],
        ministries: [],
      },
      refresh,
    } as ReturnType<typeof useOrganization>);
    updateMock.mockResolvedValue({
      id: 'ch-1',
      name: 'Renamed',
      defaultTimezone: 'America/Sao_Paulo',
    });

    render(
      <I18nProvider>
        <AuthSessionTestProvider state={{ status: 'dev-bypass', volunteerId: 'admin-1' }}>
          <ChurchSettingsSection />
        </AuthSessionTestProvider>
      </I18nProvider>,
    );

    const user = userEvent.setup();
    const nameInput = screen.getByLabelText('Church name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Renamed');
    await user.click(screen.getByRole('button', { name: 'Save settings' }));

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalled();
      expect(refresh).toHaveBeenCalled();
    });
  });
});
