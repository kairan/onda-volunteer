import { fetchWithProtectedHeaders } from '@/apiAuthHeaders';

export type EditEventInput = {
  eventId: string;
  title?: string;
  startsAtUtc?: string;
  endsAtUtc?: string;
  actingVolunteerId: string;
};

export type EditEventResult = {
  id: string;
  title: string;
  kind: 'PUBLIC' | 'PRIVATE';
  window: { startsAtUtc: string; endsAtUtc: string };
  voidedAssignmentCount: number;
};

export async function editEvent(input: EditEventInput): Promise<EditEventResult> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const body: Record<string, string> = {};
  if (input.title !== undefined) body.title = input.title;
  if (input.startsAtUtc !== undefined) body.startsAtUtc = input.startsAtUtc;
  if (input.endsAtUtc !== undefined) body.endsAtUtc = input.endsAtUtc;

  const res = await fetchWithProtectedHeaders(
    `${base}/events/${input.eventId}`,
    { volunteerId: input.actingVolunteerId },
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    const { apiErrorFromResponse } = await import('@/apiError');
    throw await apiErrorFromResponse(res);
  }
  return res.json() as Promise<EditEventResult>;
}
