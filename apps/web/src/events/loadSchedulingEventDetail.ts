import { ApiRequestError } from '@/apiError';
import { demoVolunteerId } from '@/auth/authSession';
import type { EventDetailPayload } from '@/eventDetailPayload';
import { fetchEventDetail } from './fetchEventDetail';

export async function loadSchedulingEventDetail(input: {
  eventId: string;
  volunteerId?: string;
}): Promise<EventDetailPayload> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  try {
    return await fetchEventDetail({
      eventId: input.eventId,
      volunteerId: input.volunteerId ?? demoVolunteerId(),
    });
  } catch (err) {
    if (err instanceof ApiRequestError) {
      if (err.status === 404) {
        throw new Error('Event not found');
      }
      throw new Error(err.message);
    }
    const message = err instanceof Error ? err.message : 'Unable to load event';
    if (message.toLowerCase().includes('not found')) {
      throw new Error('Event not found');
    }
    if (message.includes('fetch')) {
      throw new Error(
        `Cannot reach the API at ${base}. Start Postgres (docker compose up -d), then run pnpm dev:api in another terminal.`,
      );
    }
    throw new Error(message);
  }
}
