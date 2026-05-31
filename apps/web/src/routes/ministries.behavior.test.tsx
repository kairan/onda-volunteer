import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AuthSessionContext } from '@/auth/AuthSessionProvider';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { OrganizationContextProvider } from '@/organization/OrganizationContextProvider';
import * as fetchOrgContext from '@/organization/fetchOrganizationContext';
import * as fetchRoles from '@/organization/fetchMinistryRoles';
import * as ministryStructure from '@/organization/ministryStructure';
import { MinistriesPage } from './ministries';

vi.mock('@/organization/fetchOrganizationContext');
vi.mock('@/organization/fetchMinistryRoles');
vi.mock('@/organization/ministryStructure');

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('MinistriesPage structure administration', () => {
  const adminId = 'admin-1';
  const churchId = 'church-1';
  const greetersId = 'min-greeters';
  const kidsId = 'min-kids';

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
        ministries: [
          {
            id: greetersId,
            name: 'Greeters',
            isChurchAdmin: true,
          },
        ],
      },
    ],
  };

  const contextWithKids = {
    churches: [
      {
        ...initialContext.churches[0],
        ministries: [
          ...initialContext.churches[0].ministries,
          {
            id: kidsId,
            name: 'Kids',
            isChurchAdmin: true,
          },
        ],
      },
    ],
  };

  async function renderPage() {
    await initI18n(undefined, 'en');
    vi.mocked(fetchRoles.fetchMinistryRoles).mockResolvedValue([]);

    render(
      <I18nProvider>
        <AuthSessionContext.Provider value={authState}>
          <OrganizationContextProvider enabled={true}>
            <MinistriesPage />
          </OrganizationContextProvider>
        </AuthSessionContext.Provider>
      </I18nProvider>,
    );
  }

  it('creates a ministry and refreshes organization context', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchOrgContext.fetchOrganizationContext)
      .mockResolvedValueOnce(initialContext as never)
      .mockResolvedValueOnce(contextWithKids as never);
    vi.mocked(ministryStructure.createMinistry).mockResolvedValue({
      id: kidsId,
      churchId,
      name: 'Kids',
    });

    await renderPage();

    await user.type(await screen.findByLabelText('New ministry name'), 'Kids');
    await user.click(screen.getByRole('button', { name: 'Create ministry' }));

    await waitFor(() => {
      expect(ministryStructure.createMinistry).toHaveBeenCalledWith({
        churchId,
        actingVolunteerId: adminId,
        name: 'Kids',
      });
    });
    await waitFor(() => {
      expect(fetchOrgContext.fetchOrganizationContext).toHaveBeenCalledTimes(2);
    });
    expect(screen.getByText('Ministry created.')).toBeInTheDocument();
    expect(screen.getAllByText('Kids').length).toBeGreaterThan(0);
  });

  it('renames a ministry through the structure section', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(
      initialContext as never,
    );
    vi.mocked(ministryStructure.renameMinistry).mockResolvedValue({
      id: greetersId,
      churchId,
      name: 'Welcome Team',
    });

    await renderPage();

    await user.click(
      await screen.findByRole('button', { name: 'Rename ministry Greeters' }),
    );
    const input = screen.getByLabelText('Ministry name for Greeters');
    await user.clear(input);
    await user.type(input, 'Welcome Team');
    await user.click(screen.getByRole('button', { name: 'Save ministry' }));

    await waitFor(() => {
      expect(ministryStructure.renameMinistry).toHaveBeenCalledWith({
        ministryId: greetersId,
        actingVolunteerId: adminId,
        name: 'Welcome Team',
      });
    });
    expect(screen.getByText('Ministry renamed.')).toBeInTheDocument();
  });
});
