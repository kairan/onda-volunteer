import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { AuthSessionTestProvider } from '@/auth/AuthSessionProvider';
import type { AuthSessionState } from '@/auth/authSession';
import { syncAuthVolunteerId } from '@/auth/authSession';
import { ToastProvider } from '@/feedback/ToastHost';
import { I18nProvider } from '@/i18n/I18nProvider';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import { buildRouteTree } from '@/router';

export async function renderSystemAdminRoute(
  initialEntry: string,
  authState: AuthSessionState = {
    status: 'dev-bypass',
    volunteerId: 'seed-volunteer-system-admin',
  },
) {
  syncAuthVolunteerId(authState);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const routeTree = buildRouteTree();
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });

  const view = render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <LocalTimeProvider>
          <ToastProvider>
            <AuthSessionTestProvider state={authState}>
              <RouterProvider router={router} />
            </AuthSessionTestProvider>
          </ToastProvider>
        </LocalTimeProvider>
      </I18nProvider>
    </QueryClientProvider>,
  );

  await router.load();
  return { view, router, queryClient };
}
