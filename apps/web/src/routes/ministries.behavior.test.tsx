import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { MinistriesPage } from './ministries';
import { AuthSessionContext } from '@/auth/AuthSessionProvider';
import { OrganizationContextProvider } from '@/organization/OrganizationContextProvider';
import { ToastProvider } from '@/feedback/ToastHost';
import * as fetchMinistry from '@/organization/fetchMinistryDetails';
import * as roleActions from '@/organization/roleActions';
import * as fetchOrgContext from '@/organization/fetchOrganizationContext';

vi.mock('@/organization/fetchMinistryDetails');
vi.mock('@/organization/roleActions');
vi.mock('@/organization/fetchOrganizationContext');

describe('MinistriesPage', () => {
  const mockVolunteerId = 'vol-123';
  const mockChurchId = 'church-456';

  const authState = {
    status: 'authenticated' as const,
    volunteerId: mockVolunteerId,
    displayName: 'Sam',
    uiLocale: 'pt-BR',
    refresh: async () => {},
  };

  const orgContext = {
    churches: [
      {
        id: mockChurchId,
        name: 'Test Church',
        defaultTimezone: 'UTC',
        campuses: [],
        ministries: [
          { id: 'min-1', name: 'Music' },
        ],
      },
    ],
  };

  it('lists roles and allows adding a new one', async () => {
    await initI18n();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(orgContext);
    vi.mocked(fetchMinistry.fetchMinistryRoles).mockResolvedValue([
      { id: 'role-1', name: 'Singer' },
    ]);

    render(
      <I18nProvider>
        <ToastProvider>
          <AuthSessionContext.Provider value={authState}>
            <OrganizationContextProvider enabled={true}>
              <MinistriesPage />
            </OrganizationContextProvider>
          </AuthSessionContext.Provider>
        </ToastProvider>
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Music')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Singer')).toBeInTheDocument();
    });

    // Add new role
    const input = screen.getByPlaceholderText(/New role name/i);
    const submitBtn = screen.getByRole('button', { name: /Add Role/i });

    fireEvent.change(input, { target: { value: 'Drummer' } });
    
    vi.mocked(roleActions.createMinistryRole).mockResolvedValue({ id: 'new-role' });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Role added')).toBeInTheDocument();
    });
    
    expect(roleActions.createMinistryRole).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Drummer',
    }));
  });
});
