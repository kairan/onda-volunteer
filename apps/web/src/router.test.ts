import type { AnyRoute } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';
import { PRIMARY_NAV_MANIFEST } from './navigation/manifest';
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
  it('registers every primary nav manifest path', () => {
    const registeredPaths = new Set(collectRoutePaths(buildRouteTree()));

    for (const item of PRIMARY_NAV_MANIFEST) {
      expect(registeredPaths, `missing route for nav item "${item.id}"`).toContain(
        item.path,
      );
    }
  });
});
