import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { TimeAwayPage } from './time-away';
import { AuthSessionContext } from '@/auth/AuthSessionProvider';
import { OrganizationContextProvider } from '@/organization/OrganizationContextProvider';
import { ToastProvider } from '@/feedback/ToastHost';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import * as fetchUnavail from '@/identity/fetchVolunteerUnavailability';
import * as createUnavail from '@/identity/createVolunteerUnavailability';
import * as fetchOrgContext from '@/organization/fetchOrganizationContext';

vi.mock('@/identity/fetchVolunteerUnavailability');
vi.mock('@/identity/createVolunteerUnavailability');
vi.mock('@/organization/fetchOrganizationContext');

describe('TimeAwayPage', () => {
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

  it('lists unavailabilities and allows creating a new one', async () => {
    await initI18n();
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(orgContext);
    vi.mocked(fetchUnavail.fetchVolunteerUnavailability).mockResolvedValue([
      {
        id: 'unavail-1',
        startsAtUtc: '2026-06-01T10:00:00Z',
        endsAtUtc: '2026-06-01T12:00:00Z',
        ministry: { id: 'min-1', name: 'Music' },
      },
    ]);

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <ToastProvider>
            <AuthSessionContext.Provider value={authState}>
              <OrganizationContextProvider enabled={true}>
                <TimeAwayPage />
              </OrganizationContextProvider>
            </AuthSessionContext.Provider>
          </ToastProvider>
        </LocalTimeProvider>
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Music')).toBeInTheDocument();
    });

    // Create new
    const startsInput = screen.getByLabelText(/Início/);
    const endsInput = screen.getByLabelText(/Término/);
    const submitBtn = screen.getByRole('button', { name: /Registrar indisponibilidade/ });

    fireEvent.change(startsInput, { target: { value: '2026-06-02T10:00' } });
    fireEvent.change(endsInput, { target: { value: '2026-06-02T12:00' } });
    
    vi.mocked(createUnavail.createVolunteerUnavailability).mockResolvedValue({ id: 'new-unavail' });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Indisponibilidade registrada com sucesso')).toBeInTheDocument();
    });
    
    expect(createUnavail.createVolunteerUnavailability).toHaveBeenCalled();
  });
});
