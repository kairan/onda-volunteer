import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OrganizationContextControls } from '@/shell/OrganizationContextControls';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n, resetI18nForTests } from '@/i18n/controller';
import {
  OrganizationContextProvider,
  useOrganization,
} from './OrganizationContextProvider';
import * as fetchOrgContext from './fetchOrganizationContext';
import {
  clearStoredOrganizationSelection,
  setStoredOrganizationSelection,
} from './organizationContextStorage';

vi.mock('./fetchOrganizationContext');

const churches = [
  {
    id: 'church-a',
    name: 'Alpha Church',
    defaultTimezone: 'UTC',
    isAccreditedAdmin: false,
    campuses: [{ id: 'campus-a1', name: 'Main', timezone: 'UTC' }],
  },
  {
    id: 'church-b',
    name: 'Beta Church',
    defaultTimezone: 'UTC',
    isAccreditedAdmin: false,
    campuses: [{ id: 'campus-b1', name: 'Downtown', timezone: 'UTC' }],
  },
];

function OrgControlsFromContext() {
  const {
    churches: loaded,
    loading,
    activeChurchId,
    activeCampusId,
    onChurchChange,
    onCampusChange,
  } = useOrganization();

  if (loading || !activeChurchId) {
    return null;
  }

  return (
    <OrganizationContextControls
      churches={loaded}
      activeChurchId={activeChurchId}
      activeCampusId={activeCampusId}
      onChurchChange={onChurchChange}
      onCampusChange={onCampusChange}
    />
  );
}

function renderOrgProvider() {
  return render(
    <I18nProvider>
      <LocalTimeProvider>
        <OrganizationContextProvider enabled>
          <OrgControlsFromContext />
        </OrganizationContextProvider>
      </LocalTimeProvider>
    </I18nProvider>,
  );
}

afterEach(() => {
  cleanup();
  resetI18nForTests();
  clearStoredOrganizationSelection();
  vi.clearAllMocks();
});

describe('OrganizationContextProvider', () => {
  it('restores stored church selection after remount', async () => {
    await initI18n();
    setStoredOrganizationSelection('church-b', 'campus-b1');
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue({
      churches,
    });

    const first = renderOrgProvider();

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /igreja/i })).toHaveValue(
        'church-b',
      );
    });

    first.unmount();
    renderOrgProvider();

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /igreja/i })).toHaveValue(
        'church-b',
      );
    });
  });

  it('persists church selection when the user changes church', async () => {
    await initI18n();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue({
      churches,
    });

    renderOrgProvider();

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /igreja/i })).toHaveValue(
        'church-a',
      );
    });

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: /igreja/i }),
      'church-b',
    );

    expect(screen.getByRole('combobox', { name: /igreja/i })).toHaveValue(
      'church-b',
    );

    cleanup();
    renderOrgProvider();

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /igreja/i })).toHaveValue(
        'church-b',
      );
    });
  });
});
