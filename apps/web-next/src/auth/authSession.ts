import type { FulfilledVolunteerInviteSummary } from '@/identity/types';
import { readStoredDevVolunteerId } from './devVolunteerStorage';

export type AuthSessionState =
  | { status: 'loading' }
  | { status: 'unauthenticated'; reason?: 'signed-out' | 'supabase-not-configured' }
  | { status: 'dev-bypass'; volunteerId: string }
  | {
      status: 'authenticated';
      volunteerId: string;
      displayName: string;
      uiLocale: string | null;
      isSystemAdmin: boolean;
      newlyFulfilledInvites: FulfilledVolunteerInviteSummary[];
    }
  | { status: 'profile-not-linked' }
  | { status: 'error'; message: string };

type DevAuthEnv = {
  VITE_AUTH_USE_DEV_HEADERS?: string;
  VITE_DEMO_VOLUNTEER_ID?: string;
};

export function devHeadersEnabled(
  env: DevAuthEnv = import.meta.env,
): boolean {
  return env.VITE_AUTH_USE_DEV_HEADERS !== 'false';
}

export function demoVolunteerId(
  env: DevAuthEnv = import.meta.env,
): string | undefined {
  return (
    readStoredDevVolunteerId() ||
    env.VITE_DEMO_VOLUNTEER_ID?.trim() ||
    undefined
  );
}

export function devAuthBypassAllowed(
  env: DevAuthEnv = import.meta.env,
): boolean {
  return devHeadersEnabled(env) && Boolean(demoVolunteerId(env));
}

/** Dev-only `/user-select` page (not shipped in production builds). */
export function devUserSelectAvailable(
  env: DevAuthEnv = import.meta.env,
): boolean {
  return !import.meta.env.PROD && devHeadersEnabled(env);
}

let activeVolunteerId: string | undefined;
let devBypassActive = false;

export function syncAuthVolunteerId(state: AuthSessionState): void {
  if (state.status === 'authenticated' || state.status === 'dev-bypass') {
    activeVolunteerId = state.volunteerId;
    devBypassActive = state.status === 'dev-bypass';
    return;
  }
  activeVolunteerId = undefined;
  devBypassActive = false;
}

/** When true, protected API calls must send X-Volunteer-Id instead of Bearer. */
export function shouldForceDevHeadersForApi(
  env: DevAuthEnv = import.meta.env,
): boolean {
  return devBypassActive && devHeadersEnabled(env);
}

/** Volunteer id for API calls from route loaders (matches signed-in / dev-bypass session). */
export function volunteerIdForProtectedRequests(): string | undefined {
  return activeVolunteerId ?? demoVolunteerId();
}
