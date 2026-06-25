import { vi } from 'vitest';
import type { EventDetailPayload } from './eventDetailPayload';
import { buildRouteTree } from './router';

export function buildTestRouteTree() {
  const schedulingEventDetailLoader = vi.fn<
    (ctx: { params: { eventId: string } }) => Promise<EventDetailPayload>
  >();

  const routeTree = buildRouteTree({ schedulingEventDetailLoader });
  return { routeTree, schedulingEventDetailLoader };
}
