import { vi } from 'vitest';
import type { EventDetailPayload } from './eventDetailPayload';
import { buildRouteTree } from './router';

export function buildTestRouteTree() {
  const eventLoader = vi.fn<
    (ctx: { params: { eventId: string } }) => Promise<EventDetailPayload>
  >();

  const routeTree = buildRouteTree({ eventLoader });
  return { routeTree, eventLoader };
}
