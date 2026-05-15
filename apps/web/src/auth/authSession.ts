export type AuthSessionState =
  | { status: 'loading' }
  | { status: 'unauthenticated'; reason?: 'signed-out' | 'supabase-not-configured' }
  | { status: 'dev-bypass'; volunteerId: string }
  | {
      status: 'authenticated';
      volunteerId: string;
      displayName: string;
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
