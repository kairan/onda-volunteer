import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isAccessTokenUsable } from './sessionToken';

let client: SupabaseClient | null | undefined;

export function getSupabaseClient(): SupabaseClient | null {
  if (client !== undefined) {
    return client;
  }
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url?.trim() || !anonKey?.trim()) {
    client = null;
    return client;
  }
  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}

export async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  let session = sessionData.session;

  if (session && !isAccessTokenUsable(session.expires_at)) {
    const { data: refreshed } = await supabase.auth.refreshSession();
    if (refreshed.session?.access_token) {
      session = refreshed.session;
    }
  }

  if (!session?.access_token) {
    return null;
  }

  return session.access_token;
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }
  await supabase.auth.signOut();
}
