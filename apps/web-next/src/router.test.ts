import type { AnyRoute } from '@tanstack/react-router';
import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';
import { buildNavForGrants } from '@/navigation/manifest';
import { syncAuthVolunteerId } from '@/auth/authSession';
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

describe('buildRouteTree', () => {
  it('registers every primary nav manifest path for combined grants', () => {
    const registeredPaths = new Set(collectRoutePaths(buildRouteTree()));
    const navPaths = buildNavForGrants({
      isVolunteer: true,
      isLeader: true,
      isOrgAdmin: true,
    }).map((item) => item.path);

    for (const path of new Set(navPaths)) {
      expect(registeredPaths, `missing route for nav path "${path}"`).toContain(path);
    }
  });

  it('redirects unauthenticated dashboard access to the auth landing route', async () => {
    syncAuthVolunteerId({ status: 'unauthenticated', reason: 'signed-out' });

    const routeTree = buildRouteTree();
    const history = createMemoryHistory({ initialEntries: ['/dashboard'] });
    const router = createRouter({ routeTree, history });

    await router.load();

    expect(history.location.pathname).toBe('/');
    expect(history.location.search).toContain('auth=required');
  });
});
