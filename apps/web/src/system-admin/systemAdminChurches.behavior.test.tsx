import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { AuthSessionTestProvider } from '@/auth/AuthSessionProvider';
import { ToastProvider } from '@/feedback/ToastHost';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { fetchIdentityMe } from '@/identity/fetchIdentityMe';
import { systemAdminIdentityMeFixture } from '@/identity/testFixtures';
import { buildTestRouteTree } from '@/router.testUtils';
import {
  createSystemAdminChurch,
  fetchSystemAdminChurches,
} from './systemAdminChurches';

vi.mock('@/identity/fetchIdentityMe', () => ({
  fetchIdentityMe: vi.fn(),
}));

vi.mock('./systemAdminChurches', () => ({
  fetchSystemAdminChurches: vi.fn(),
  createSystemAdminChurch: vi.fn(),
}));

vi.mock('@/organization/fetchOrganizationContext', () => ({
  fetchOrganizationContext: vi.fn(async () => ({ churches: [] })),
}));

const fetchIdentityMeMock = vi.mocked(fetchIdentityMe);
const fetchChurchesMock = vi.mocked(fetchSystemAdminChurches);
const createChurchMock = vi.mocked(createSystemAdminChurch);

function renderChurchesPage() {
  const { routeTree } = buildTestRouteTree();
  const history = createMemoryHistory({
    initialEntries: ['/system-admin/churches'],
  });
  const routed = createRouter({ routeTree, history });
  render(
    <I18nProvider>
      <ToastProvider>
        <AuthSessionTestProvider
          state={{
            status: 'dev-bypass',
            volunteerId: 'seed-volunteer-system-admin',
          }}
        >
          <RouterProvider router={routed} />
        </AuthSessionTestProvider>
      </ToastProvider>
    </I18nProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  fetchIdentityMeMock.mockResolvedValue(systemAdminIdentityMeFixture());
});

describe('System Admin churches page', () => {
  it('lists churches and refreshes after create', async () => {
    await initI18n();
    fetchChurchesMock
      .mockResolvedValueOnce({ items: [], nextCursor: null })
      .mockResolvedValueOnce({
        items: [
          {
            id: 'church-1',
            name: 'New Parish',
            defaultTimezone: 'UTC',
            campuses: [{ id: 'c1', name: 'Principal', timezone: 'UTC' }],
          },
        ],
        nextCursor: null,
      });

    createChurchMock.mockResolvedValue({
      id: 'church-1',
      name: 'New Parish',
      defaultTimezone: 'UTC',
      campuses: [{ id: 'c1', name: 'Principal', timezone: 'UTC' }],
    });

    renderChurchesPage();

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /^churches$|^igrejas$/i,
      }),
    ).toBeInTheDocument();

    const user = userEvent.setup();
    await user.type(
      screen.getByLabelText(/church name|nome da igreja/i),
      'New Parish',
    );
    await user.click(screen.getByRole('button', { name: /create church|criar igreja/i }));

    await waitFor(() => {
      expect(createChurchMock).toHaveBeenCalledWith({
        volunteerId: 'seed-volunteer-system-admin',
        name: 'New Parish',
        defaultTimezone: 'UTC',
      });
    });

    expect(await screen.findByText('New Parish')).toBeInTheDocument();
    expect(fetchChurchesMock).toHaveBeenCalledTimes(2);
  });

  it('loads additional pages when nextCursor is present', async () => {
    await initI18n();
    fetchChurchesMock
      .mockResolvedValueOnce({
        items: [
          {
            id: 'church-1',
            name: 'First Parish',
            defaultTimezone: 'UTC',
            campuses: [{ id: 'c1', name: 'Principal', timezone: 'UTC' }],
          },
        ],
        nextCursor: 'church-1',
      })
      .mockResolvedValueOnce({
        items: [
          {
            id: 'church-2',
            name: 'Second Parish',
            defaultTimezone: 'UTC',
            campuses: [{ id: 'c2', name: 'Principal', timezone: 'UTC' }],
          },
        ],
        nextCursor: null,
      });

    renderChurchesPage();

    expect(await screen.findByText('First Parish')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /load more|carregar mais/i }));

    expect(await screen.findByText('Second Parish')).toBeInTheDocument();
    expect(fetchChurchesMock).toHaveBeenLastCalledWith({
      volunteerId: 'seed-volunteer-system-admin',
      limit: 100,
      cursor: 'church-1',
    });
  });
});
