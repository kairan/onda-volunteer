import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AuthSessionProvider,
  useAuthSession,
} from './AuthSessionProvider';
import * as supabaseModule from '@/supabaseClient';
import { clearStoredDevVolunteerId } from './devVolunteerStorage';

function SessionProbe() {
  const session = useAuthSession();
  return <span data-testid="status">{session.status}</span>;
}

afterEach(() => {
  clearStoredDevVolunteerId();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('AuthSessionProvider', () => {
  it('throws when useAuthSession is called outside the provider', () => {
    function Orphan() {
      useAuthSession();
      return null;
    }
    expect(() => render(<Orphan />)).toThrow(
      'useAuthSession must be used within AuthSessionProvider',
    );
  });

  it('resolves to dev-bypass without Supabase after refresh', async () => {
    vi.stubEnv('VITE_AUTH_USE_DEV_HEADERS', 'true');
    vi.stubEnv('VITE_DEMO_VOLUNTEER_ID', 'seed-volunteer-demo');
    vi.spyOn(supabaseModule, 'getSupabaseClient').mockReturnValue(null);

    render(
      <AuthSessionProvider>
        <SessionProbe />
      </AuthSessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('dev-bypass');
    });
  });
});
