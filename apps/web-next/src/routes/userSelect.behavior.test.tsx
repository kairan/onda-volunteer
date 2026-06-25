import '@/test/volunteerRouteTestSetup';
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthSessionContextValue } from '@/auth/AuthSessionProvider';
import {
  DEV_VOLUNTEER_STORAGE_KEY,
  clearStoredDevVolunteerId,
} from '@/auth/devVolunteerStorage';
import { initI18n } from '@/i18n/controller';
import { renderAppRoute } from '@/test/routeTestUtils';

const selectDevVolunteer = vi.fn();

function authValue(
  overrides: Partial<AuthSessionContextValue> = {},
): AuthSessionContextValue {
  return {
    status: 'dev-bypass',
    volunteerId: 'seed-volunteer-demo',
    refresh: async () => {},
    selectDevVolunteer,
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  clearStoredDevVolunteerId();
  vi.unstubAllEnvs();
});

beforeEach(async () => {
  await initI18n(undefined, 'en');
  vi.stubEnv('VITE_AUTH_USE_DEV_HEADERS', 'true');
  vi.stubEnv('VITE_DEMO_VOLUNTEER_ID', 'seed-volunteer-demo');
});

describe('UserSelectPage', () => {
  it('lists seed personas and switches the active dev volunteer', async () => {
    await renderAppRoute('/user-select', { authContext: authValue() });

    expect(
      await screen.findByRole('heading', { name: /choose volunteer/i }),
    ).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', {
        name: /system admin seed-volunteer-system-admin/i,
      }),
    );

    await waitFor(() => {
      expect(selectDevVolunteer).toHaveBeenCalledWith('seed-volunteer-system-admin');
    });
  });

  it('shows unavailable state when dev headers are disabled', async () => {
    vi.stubEnv('VITE_AUTH_USE_DEV_HEADERS', 'false');

    await renderAppRoute('/user-select', {
      authContext: {
        status: 'unauthenticated',
        refresh: async () => {},
        selectDevVolunteer,
      },
    });

    expect(
      await screen.findByRole('heading', { name: /^not available$/i }),
    ).toBeInTheDocument();
    expect(localStorage.getItem(DEV_VOLUNTEER_STORAGE_KEY)).toBeNull();
  });
});
