import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  devAuthBypassAllowed,
  syncAuthVolunteerId,
  volunteerIdForProtectedRequests,
} from './authSession';

describe('devAuthBypassAllowed', () => {
  it('is false when dev headers are disabled', () => {
    expect(
      devAuthBypassAllowed({
        VITE_AUTH_USE_DEV_HEADERS: 'false',
        VITE_DEMO_VOLUNTEER_ID: 'seed-volunteer-demo',
      }),
    ).toBe(false);
  });

  it('is true when dev headers and demo volunteer are configured', () => {
    expect(
      devAuthBypassAllowed({
        VITE_AUTH_USE_DEV_HEADERS: 'true',
        VITE_DEMO_VOLUNTEER_ID: 'seed-volunteer-demo',
      }),
    ).toBe(true);
  });
});

describe('volunteerIdForProtectedRequests', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_DEMO_VOLUNTEER_ID', 'seed-volunteer-demo');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    syncAuthVolunteerId({ status: 'loading' });
  });

  it('uses the signed-in volunteer from auth state', () => {
    syncAuthVolunteerId({
      status: 'dev-bypass',
      volunteerId: 'vol-session',
    });
    expect(volunteerIdForProtectedRequests()).toBe('vol-session');
  });

  it('falls back to demo volunteer when auth has no volunteer', () => {
    syncAuthVolunteerId({ status: 'unauthenticated', reason: 'signed-out' });
    expect(volunteerIdForProtectedRequests()).toBe('seed-volunteer-demo');
  });
});
