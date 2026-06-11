import type { AnyRoute } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';
import { PRIMARY_NAV_MANIFEST } from './navigation/manifest';
import { buildRouteTree } from './router';

function collectRoutePaths(route: AnyRoute, parentPath = ''): string[] {
  const segment = route.options.path ?? '';
  const fullPath =
    segment === '/'
      ? parentPath || '/'
      : segment.startsWith('/')
        ? segment
        : parentPath
          ? `${parentPath.replace(/\/$/, '')}/${segment}`
          : `/${segment}`;

  const paths: string[] = [];
  if (segment && segment !== '/') {
    paths.push(fullPath);
  }

  for (const child of route.children ?? []) {
    paths.push(...collectRoutePaths(child, fullPath === '/' ? '' : fullPath));
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
