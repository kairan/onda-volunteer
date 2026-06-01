import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { AuthSessionTestProvider } from '@/auth/AuthSessionProvider';
import { I18nProvider } from '@/i18n/I18nProvider';
import i18n from 'i18next';
import { initI18n } from '@/i18n/controller';
import { fetchIdentityMe } from '@/identity/fetchIdentityMe';
import { buildTestRouteTree } from '@/router.testUtils';
import {
  fetchSystemAdminVolunteer,
  fetchSystemAdminVolunteers,
  grantSystemAdminAccreditation,
} from './fetchSystemAdminVolunteers';
import { fetchSystemAdminChurches } from './fetchSystemAdminChurches';

vi.mock('@/identity/fetchIdentityMe', () => ({
  fetchIdentityMe: vi.fn(),
}));

vi.mock('@/organization/fetchOrganizationContext', () => ({
  fetchOrganizationContext: vi.fn(async () => ({ churches: [] })),
}));

vi.mock('./fetchSystemAdminVolunteers', () => ({
  fetchSystemAdminVolunteers: vi.fn(),
  fetchSystemAdminVolunteer: vi.fn(),
  grantSystemAdminAccreditation: vi.fn(),
  revokeSystemAdminAccreditation: vi.fn(),
}));

vi.mock('./fetchSystemAdminChurches', () => ({
  fetchSystemAdminChurches: vi.fn(),
  fetchSystemAdminChurch: vi.fn(),
}));

const fetchIdentityMeMock = vi.mocked(fetchIdentityMe);
const fetchVolunteersMock = vi.mocked(fetchSystemAdminVolunteers);
const fetchVolunteerMock = vi.mocked(fetchSystemAdminVolunteer);
const grantMock = vi.mocked(grantSystemAdminAccreditation);
const fetchChurchesMock = vi.mocked(fetchSystemAdminChurches);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('System Admin user grants', () => {
  it('grants admin accreditation after refetch', async () => {
    await initI18n();
    await i18n.changeLanguage('en');
    fetchIdentityMeMock.mockResolvedValue({
      volunteer: {
        id: 'seed-volunteer-system-admin',
        displayName: 'Operator',
        uiLocale: null,
      },
      authSubjectId: null,
      isSystemAdmin: true,
    });
    fetchVolunteerMock
      .mockResolvedValueOnce({
        id: 'vol-1',
        displayName: 'Sam',
        authSubjectId: null,
        adminAccreditations: [],
        leaderships: [],
        memberships: [],
      })
      .mockResolvedValueOnce({
        id: 'vol-1',
        displayName: 'Sam',
        authSubjectId: null,
        adminAccreditations: [{ churchId: 'ch-1', churchName: 'Test Church' }],
        leaderships: [],
        memberships: [],
      });
    fetchChurchesMock.mockResolvedValue([
      { id: 'ch-1', name: 'Test Church', defaultTimezone: 'UTC' },
    ]);
    grantMock.mockResolvedValue(undefined);

    const { routeTree } = buildTestRouteTree();
    const history = createMemoryHistory({
      initialEntries: ['/system-admin/users/vol-1'],
    });
    const routed = createRouter({ routeTree, history });
    render(
      <I18nProvider>
        <AuthSessionTestProvider
          state={{ status: 'dev-bypass', volunteerId: 'seed-volunteer-system-admin' }}
        >
          <RouterProvider router={routed} />
        </AuthSessionTestProvider>
      </I18nProvider>,
    );

    await screen.findByText('Sam');
    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText('Grant Admin for church'), 'ch-1');
    await user.click(screen.getByRole('button', { name: 'Grant' }));

    await waitFor(() => {
      expect(grantMock).toHaveBeenCalledWith({
        volunteerId: 'vol-1',
        churchId: 'ch-1',
      });
    });
    await waitFor(() => {
      expect(fetchVolunteerMock).toHaveBeenCalledTimes(2);
    });
  });
});
