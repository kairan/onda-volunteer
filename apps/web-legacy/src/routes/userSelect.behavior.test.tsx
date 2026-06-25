import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { AuthSessionContext } from '@/auth/AuthSessionProvider';
import {
  DEV_VOLUNTEER_STORAGE_KEY,
  clearStoredDevVolunteerId,
} from '@/auth/devVolunteerStorage';
import { ToastProvider } from '@/feedback/ToastHost';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { buildTestRouteTree } from '@/router.testUtils';

vi.mock('@/organization/fetchOrganizationContext', () => ({
  fetchOrganizationContext: vi.fn(async () => ({ churches: [] })),
}));

vi.mock('@/identity/fetchIdentityMe', () => ({
  fetchIdentityMe: vi.fn(async () => ({
    volunteer: { id: 'seed-volunteer-demo', displayName: 'Demo', uiLocale: null },
    authSubjectId: null,
    isSystemAdmin: false,
    newlyFulfilledInvites: [],
  })),
}));

const selectDevVolunteer = vi.fn();

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  clearStoredDevVolunteerId();
});

beforeEach(async () => {
  await initI18n(undefined, 'en');
  vi.stubEnv('VITE_AUTH_USE_DEV_HEADERS', 'true');
  vi.stubEnv('VITE_DEMO_VOLUNTEER_ID', 'seed-volunteer-demo');
});

describe('UserSelectPage', () => {
  function renderAtUserSelect() {
    const { routeTree } = buildTestRouteTree();
    const history = createMemoryHistory({ initialEntries: ['/user-select'] });
    const router = createRouter({ routeTree, history });

    render(
      <I18nProvider>
        <ToastProvider>
          <AuthSessionContext.Provider
            value={{
              status: 'dev-bypass',
              volunteerId: 'seed-volunteer-demo',
              refresh: async () => {},
              selectDevVolunteer,
            }}
          >
            <RouterProvider router={router} />
          </AuthSessionContext.Provider>
        </ToastProvider>
      </I18nProvider>,
    );

    return { router, history };
  }

  it('lists seed personas and selects one via dev session', async () => {
    const user = userEvent.setup();
    const { router } = renderAtUserSelect();

    expect(
      await screen.findByRole('heading', { name: /choose volunteer/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('seed-volunteer-system-admin')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /system admin/i }),
    );

    expect(selectDevVolunteer).toHaveBeenCalledWith('seed-volunteer-system-admin');
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/dashboard');
    });
  });

  it('marks the active volunteer', async () => {
    renderAtUserSelect();

    const demoButton = await screen.findByRole('button', {
      name: /demo volunteer/i,
    });
    expect(demoButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });
});

describe('demoVolunteerId localStorage', () => {
  it('uses stored id for protected requests fallback', async () => {
    const { demoVolunteerId, syncAuthVolunteerId, volunteerIdForProtectedRequests } =
      await import('@/auth/authSession');

    localStorage.setItem(DEV_VOLUNTEER_STORAGE_KEY, 'seed-volunteer-admin');
    expect(demoVolunteerId()).toBe('seed-volunteer-admin');
    syncAuthVolunteerId({ status: 'loading' });
    expect(volunteerIdForProtectedRequests()).toBe('seed-volunteer-admin');
    clearStoredDevVolunteerId();
  });
});
