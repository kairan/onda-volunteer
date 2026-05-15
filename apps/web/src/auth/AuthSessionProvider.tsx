import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ApiRequestError } from '@/apiError';
import { fetchIdentityMe } from '@/identity/fetchIdentityMe';
import { getSupabaseClient } from '@/supabaseClient';
import {
  type AuthSessionState,
  demoVolunteerId,
  devAuthBypassAllowed,
} from './authSession';

type AuthSessionContextValue = AuthSessionState & {
  refresh: () => Promise<void>;
};

export const AuthSessionContext =
  createContext<AuthSessionContextValue | null>(null);

export function AuthSessionTestProvider({
  children,
  state,
}: {
  children: ReactNode;
  state: AuthSessionState;
}) {
  const value = useMemo<AuthSessionContextValue>(
    () => ({
      ...state,
      refresh: async () => {},
    }),
    [state],
  );
  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthSessionState>({ status: 'loading' });

  const refresh = useCallback(async () => {
    const supabase = getSupabaseClient();
    const demoId = demoVolunteerId();

    if (!supabase) {
      if (devAuthBypassAllowed() && demoId) {
        setState({ status: 'dev-bypass', volunteerId: demoId });
        return;
      }
      setState({
        status: 'unauthenticated',
        reason: 'supabase-not-configured',
      });
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setState({ status: 'unauthenticated', reason: 'signed-out' });
      return;
    }

    const sessionUser = sessionData.session.user;
    const { data: userData } = await supabase.auth.getUser();

    const user = userData?.user ?? sessionUser;

    if (!user?.id) {
      setState({ status: 'unauthenticated', reason: 'signed-out' });
      return;
    }

    try {
      const me = await fetchIdentityMe();
      setState({
        status: 'authenticated',
        volunteerId: me.volunteer.id,
        displayName: me.volunteer.displayName,
      });
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === 'PROFILE_NOT_LINKED') {
        setState({ status: 'profile-not-linked' });
        return;
      }
      if (
        err instanceof ApiRequestError &&
        (err.code === 'AUTH_INVALID' || err.code === 'AUTH_MISCONFIGURED')
      ) {
        setState({
          status: 'error',
          message:
            'O backend não aceitou o token JWT. Copie o JWT Secret do Supabase (Settings → API) para SUPABASE_JWT_SECRET em apps/api/.env e reinicie o servidor da API. A sessão no navegador não foi encerrada — você não precisa pedir novo código só por isso.',
        });
        return;
      }
      setState({
        status: 'error',
        message:
          err instanceof Error ? err.message : 'Failed to load your profile',
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      await refresh();
    }

    void init();

    const supabase = getSupabaseClient();
    if (!supabase) {
      return;
    }

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      if (!cancelled) {
        void refresh();
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [refresh]);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      ...state,
      refresh,
    }),
    [state, refresh],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession(): AuthSessionContextValue {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error('useAuthSession must be used within AuthSessionProvider');
  }
  return ctx;
}
