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
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import { clearStoredOrganizationSelection, setStoredOrganizationSelection, writeStoredWorkingContext } from '@/organization/organizationContextStorage';
import type { WorkingContext } from '@/organization/workingContext';
import { buildRouteTree } from '@/router';
import { getJsonMock, mutateJsonMock } from './volunteerRouteTestSetup';

export type VolunteerRouteRenderOptions = {
  churchId?: string;
  campusId?: string;
  workingContext?: WorkingContext;
};

export async function renderVolunteerRoute(
  initialEntry: string,
  authState: AuthSessionState | undefined = undefined,
  options?: VolunteerRouteRenderOptions,
) {
  const resolvedAuthState: AuthSessionState = authState ?? {
    status: 'authenticated',
    volunteerId: 'vol-1',
    displayName: 'Alex Volunteer',
    uiLocale: 'en',
    isSystemAdmin: false,
    newlyFulfilledInvites: [],
  };
  getJsonMock.mockClear();
  mutateJsonMock.mockClear();
  clearStoredOrganizationSelection();
  if (options?.churchId) {
    setStoredOrganizationSelection(options.churchId, options.campusId ?? null);
    if (options.workingContext) {
      writeStoredWorkingContext(options.churchId, options.workingContext);
    }
  }
  syncAuthVolunteerId(resolvedAuthState);
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
          <AuthSessionTestProvider state={resolvedAuthState}>
            <RouterProvider router={router} />
          </AuthSessionTestProvider>
        </LocalTimeProvider>
      </I18nProvider>
    </QueryClientProvider>,
  );

  await router.load();
  return view;
}

export {
  getJsonMock,
  mutateJsonMock,
  leaderRouteEvents,
  resetVolunteerRouteMocks,
} from './volunteerRouteTestSetup';
