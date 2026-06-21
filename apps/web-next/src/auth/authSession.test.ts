import { afterEach, describe, expect, it } from 'vitest';
import { clearStoredDevVolunteerId } from './devVolunteerStorage';
import {
  demoVolunteerId,
  shouldForceDevHeadersForApi,
  syncAuthVolunteerId,
} from './authSession';

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
      isSystemAdmin: false,
      newlyFulfilledInvites: [],
    });
    expect(
      shouldForceDevHeadersForApi({
        VITE_AUTH_USE_DEV_HEADERS: 'true',
      }),
    ).toBe(false);
  });

  it('returns true when VITE_AUTH_USE_DEV_HEADERS is not set to false', () => {
    syncAuthVolunteerId({ status: 'dev-bypass', volunteerId: 'seed-volunteer-demo' });
    expect(shouldForceDevHeadersForApi({})).toBe(true);
  });
});

describe('demoVolunteerId', () => {
  afterEach(() => {
    clearStoredDevVolunteerId();
  });

  it('returns undefined when env var unset and localStorage empty', () => {
    expect(demoVolunteerId({})).toBeUndefined();
  });
});
