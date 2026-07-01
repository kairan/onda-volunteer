import type { AnyRoute } from '@tanstack/react-router';
import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as authSession from '@/auth/authSession';
import * as supabaseClient from '@/supabaseClient';
import { buildNavForWorkingContext } from '@/navigation/manifest';
import { buildRouteTree } from './router';

function collectRoutePaths(route: AnyRoute): string[] {
  const paths: string[] = [];
  if (route.fullPath && route.fullPath !== '/') {
    paths.push(route.fullPath);
  }

  for (const child of route.children ?? []) {
    paths.push(...collectRoutePaths(child));
  }

  return paths;
}

const PARITY_PATHS = [
  '/auth',
  '/dashboard',
  '/scheduling',
  '/scheduling/events/$eventId',
  '/scheduling/events/new',
  '/scheduling/events/new-private',
  '/time-away',
  '/leader/volunteer-time-away',
  '/ministries',
  '/volunteers',
  '/ministry-leaders',
  '/user-select',
  '/events/$eventId',
  '/system-admin',
  '/system-admin/churches',
  '/system-admin/churches/$churchId',
  '/system-admin/users',
  '/system-admin/users/$volunteerId',
  '/system-admin/scheduling',
  '/system-admin/scheduling/events/$eventId',
];

describe('buildRouteTree', () => {
  it('registers every primary nav manifest path for leader org-admin context', () => {
    const registeredPaths = new Set(collectRoutePaths(buildRouteTree()));
    const navPaths = buildNavForWorkingContext({
      isAuthenticated: true,
      isOrgAdmin: true,
      workingContext: { ministryId: 'min-louvor', mode: 'leader' },
    }).map((item) => item.path);

    for (const path of new Set(navPaths)) {
      expect(registeredPaths, `missing route for nav path "${path}"`).toContain(path);
    }
  });

  it('registers production parity paths from design §6', () => {
    const registeredPaths = new Set(collectRoutePaths(buildRouteTree()));
    for (const path of PARITY_PATHS) {
      expect(registeredPaths, `missing parity path "${path}"`).toContain(path);
    }
  });

  it('redirects unauthenticated dashboard access to /auth', async () => {
    vi.spyOn(authSession, 'devAuthBypassAllowed').mockReturnValue(false);
    vi.spyOn(authSession, 'demoVolunteerId').mockReturnValue(undefined);
    vi.spyOn(authSession, 'volunteerIdForProtectedRequests').mockReturnValue(undefined);
    vi.spyOn(supabaseClient, 'getSupabaseClient').mockReturnValue(null);
    authSession.syncAuthVolunteerId({
      status: 'unauthenticated',
      reason: 'signed-out',
    });

    const routeTree = buildRouteTree();
    const history = createMemoryHistory({ initialEntries: ['/dashboard'] });
    const router = createRouter({ routeTree, history });

    await router.load();

    expect(history.location.pathname).toBe('/auth');
  });

  it('redirects legacy /events/$eventId to scheduling event detail', async () => {
    vi.spyOn(authSession, 'volunteerIdForProtectedRequests').mockReturnValue(
      'seed-volunteer-demo',
    );
    authSession.syncAuthVolunteerId({
      status: 'dev-bypass',
      volunteerId: 'seed-volunteer-demo',
    });

    const routeTree = buildRouteTree();
    const history = createMemoryHistory({
      initialEntries: ['/events/event-123'],
    });
    const router = createRouter({ routeTree, history });

    await router.load();

    expect(history.location.pathname).toBe('/scheduling/events/event-123');
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  authSession.syncAuthVolunteerId({ status: 'loading' });
});
