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
import { I18nProvider } from '@/i18n/I18nProvider';
import { clearStoredOrganizationSelection } from '@/organization/organizationContextStorage';
import { buildRouteTree } from '@/router';
import { getJsonMock, mutateJsonMock } from './volunteerRouteTestSetup';

export async function renderVolunteerRoute(
  initialEntry: string,
  authState: AuthSessionState = {
    status: 'authenticated',
    volunteerId: 'vol-1',
    displayName: 'Alex Volunteer',
    uiLocale: 'en',
    isSystemAdmin: false,
    newlyFulfilledInvites: [],
  },
) {
  getJsonMock.mockClear();
  mutateJsonMock.mockClear();
  clearStoredOrganizationSelection();
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
        <AuthSessionTestProvider state={authState}>
          <RouterProvider router={router} />
        </AuthSessionTestProvider>
      </I18nProvider>
    </QueryClientProvider>,
  );

  await router.load();
  return view;
}

export { getJsonMock, mutateJsonMock } from './volunteerRouteTestSetup';
