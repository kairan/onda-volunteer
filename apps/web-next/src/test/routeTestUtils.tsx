import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import {
  AuthSessionContext,
  AuthSessionTestProvider,
  type AuthSessionContextValue,
} from '@/auth/AuthSessionProvider';
import type { AuthSessionState } from '@/auth/authSession';
import { syncAuthVolunteerId } from '@/auth/authSession';
import { ToastProvider } from '@/feedback/ToastHost';
import { I18nProvider } from '@/i18n/I18nProvider';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import { buildRouteTree } from '@/router';

type RenderAppRouteOptions = {
  authState?: AuthSessionState;
  authContext?: AuthSessionContextValue;
};

export async function renderAppRoute(
  initialEntry: string,
  options: RenderAppRouteOptions | AuthSessionState = {
    status: 'dev-bypass',
    volunteerId: 'seed-volunteer-demo',
  },
) {
  const normalized: RenderAppRouteOptions =
    'status' in options ? { authState: options } : options;
  const authState =
    normalized.authState ?? {
      status: 'dev-bypass',
      volunteerId: 'seed-volunteer-demo',
    };

  syncAuthVolunteerId(authState);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const routeTree = buildRouteTree();
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });

  const authNode = normalized.authContext ? (
    <AuthSessionContext.Provider value={normalized.authContext}>
      <RouterProvider router={router} />
    </AuthSessionContext.Provider>
  ) : (
    <AuthSessionTestProvider state={authState}>
      <RouterProvider router={router} />
    </AuthSessionTestProvider>
  );

  const view = render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <LocalTimeProvider>
          <ToastProvider>{authNode}</ToastProvider>
        </LocalTimeProvider>
      </I18nProvider>
    </QueryClientProvider>,
  );

  await router.load();
  return { view, router, queryClient };
}
