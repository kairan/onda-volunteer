import { redirect } from '@tanstack/react-router';
import {
  devAuthBypassAllowed,
  volunteerIdForProtectedRequests,
} from '@/auth/authSession';
import { getSupabaseClient } from '@/supabaseClient';

export async function ensureShellRouteAuth(): Promise<void> {
  if (volunteerIdForProtectedRequests()) {
    return;
  }
  if (devAuthBypassAllowed()) {
    return;
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      return;
    }
  }

  throw redirect({ to: '/auth' });
}
