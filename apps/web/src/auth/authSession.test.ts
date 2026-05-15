import { describe, expect, it } from 'vitest';
import { devAuthBypassAllowed } from './authSession';

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
