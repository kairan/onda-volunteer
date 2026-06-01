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
import { createSystemAdminChurch } from './createSystemAdminChurch';
import { fetchSystemAdminChurches } from './fetchSystemAdminChurches';

vi.mock('@/identity/fetchIdentityMe', () => ({
  fetchIdentityMe: vi.fn(),
}));

vi.mock('@/organization/fetchOrganizationContext', () => ({
  fetchOrganizationContext: vi.fn(async () => ({ churches: [] })),
}));

vi.mock('./fetchSystemAdminChurches', () => ({
  fetchSystemAdminChurches: vi.fn(),
  fetchSystemAdminChurch: vi.fn(),
}));

vi.mock('./createSystemAdminChurch', () => ({
  createSystemAdminChurch: vi.fn(),
}));

const fetchIdentityMeMock = vi.mocked(fetchIdentityMe);
const fetchChurchesMock = vi.mocked(fetchSystemAdminChurches);
const createChurchMock = vi.mocked(createSystemAdminChurch);

function renderChurches() {
  const { routeTree } = buildTestRouteTree();
  const history = createMemoryHistory({ initialEntries: ['/system-admin/churches'] });
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
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('System Admin church create form', () => {
  it('creates a church and refreshes the list', async () => {
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
    fetchChurchesMock.mockResolvedValue([]);
    createChurchMock.mockResolvedValue({
      id: 'ch-new',
      name: 'New Parish',
      defaultTimezone: 'America/Sao_Paulo',
      campuses: [{ id: 'c1', name: 'Principal', timezone: 'America/Sao_Paulo' }],
    });

    const user = userEvent.setup();
    renderChurches();

    await screen.findByRole('button', { name: 'Create church' });

    await user.type(screen.getByLabelText('Church name'), 'New Parish');
    await user.click(screen.getByRole('button', { name: 'Create church' }));

    await waitFor(() => {
      expect(createChurchMock).toHaveBeenCalledWith({
        name: 'New Parish',
        defaultTimezone: 'America/Sao_Paulo',
      });
    });
    await waitFor(() => {
      expect(fetchChurchesMock).toHaveBeenCalledTimes(2);
    });
  });
});
