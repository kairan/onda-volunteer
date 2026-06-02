import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearStoredDevVolunteerId, setStoredDevVolunteerId } from './devVolunteerStorage';
import {
  demoVolunteerId,
  devAuthBypassAllowed,
  shouldForceDevHeadersForApi,
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

  it('is true when dev headers and volunteer id is only in localStorage', () => {
    setStoredDevVolunteerId('seed-volunteer-admin');
    expect(
      devAuthBypassAllowed({
        VITE_AUTH_USE_DEV_HEADERS: 'true',
        VITE_DEMO_VOLUNTEER_ID: '',
      }),
    ).toBe(true);
    clearStoredDevVolunteerId();
  });
});

describe('demoVolunteerId', () => {
  afterEach(() => {
    clearStoredDevVolunteerId();
    vi.unstubAllEnvs();
  });

  it('prefers localStorage over env default', () => {
    setStoredDevVolunteerId('seed-volunteer-admin');
    expect(
      demoVolunteerId({
        VITE_AUTH_USE_DEV_HEADERS: 'true',
        VITE_DEMO_VOLUNTEER_ID: 'seed-volunteer-demo',
      }),
    ).toBe('seed-volunteer-admin');
  });

  it('falls back to env when localStorage is empty', () => {
    expect(
      demoVolunteerId({
        VITE_DEMO_VOLUNTEER_ID: 'seed-volunteer-demo',
      }),
    ).toBe('seed-volunteer-demo');
  });
});

describe('shouldForceDevHeadersForApi', () => {
  afterEach(() => {
    syncAuthVolunteerId({ status: 'loading' });
  });

  it('is true only during dev-bypass with dev headers enabled', () => {
    syncAuthVolunteerId({ status: 'dev-bypass', volunteerId: 'seed-volunteer-demo' });
    expect(
      shouldForceDevHeadersForApi({
        VITE_AUTH_USE_DEV_HEADERS: 'true',
      }),
    ).toBe(true);
    syncAuthVolunteerId({
      status: 'authenticated',
      volunteerId: 'seed-volunteer-demo',
      displayName: 'Demo',
      uiLocale: null,
    });
    expect(
      shouldForceDevHeadersForApi({
        VITE_AUTH_USE_DEV_HEADERS: 'true',
      }),
    ).toBe(false);
  });
});

describe('volunteerIdForProtectedRequests', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_DEMO_VOLUNTEER_ID', 'seed-volunteer-demo');
    clearStoredDevVolunteerId();
  });

  afterEach(() => {
    clearStoredDevVolunteerId();
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
