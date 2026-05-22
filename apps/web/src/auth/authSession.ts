export type AuthSessionState =
  | { status: 'loading' }
  | { status: 'unauthenticated'; reason?: 'signed-out' | 'supabase-not-configured' }
  | { status: 'dev-bypass'; volunteerId: string }
  | {
      status: 'authenticated';
      volunteerId: string;
      displayName: string;
      uiLocale: string | null;
    }
  | { status: 'profile-not-linked' }
  | { status: 'error'; message: string };

export function devAuthBypassAllowed(
  env: {
    VITE_AUTH_USE_DEV_HEADERS?: string;
    VITE_DEMO_VOLUNTEER_ID?: string;
  } = import.meta.env,
): boolean {
  return (
    env.VITE_AUTH_USE_DEV_HEADERS !== 'false' &&
    Boolean(env.VITE_DEMO_VOLUNTEER_ID?.trim())
  );
}

export function demoVolunteerId(): string | undefined {
  return import.meta.env.VITE_DEMO_VOLUNTEER_ID?.trim() || undefined;
}

let activeVolunteerId: string | undefined;

export function syncAuthVolunteerId(state: AuthSessionState): void {
  if (state.status === 'authenticated' || state.status === 'dev-bypass') {
    activeVolunteerId = state.volunteerId;
    return;
  }
  activeVolunteerId = undefined;
}

/** Volunteer id for API calls from route loaders (matches signed-in / dev-bypass session). */
export function volunteerIdForProtectedRequests(): string | undefined {
  return activeVolunteerId ?? demoVolunteerId();
}
