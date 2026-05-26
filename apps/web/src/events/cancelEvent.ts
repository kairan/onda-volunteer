import { fetchWithProtectedHeaders } from '@/apiAuthHeaders';

export async function cancelEvent(input: {
  eventId: string;
  actingVolunteerId: string;
}): Promise<{ eventId: string; cancelledAtUtc: string }> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const res = await fetchWithProtectedHeaders(
    `${base}/events/${input.eventId}/cancel`,
    { volunteerId: input.actingVolunteerId },
    { method: 'POST' },
  );
  if (!res.ok) {
    const { apiErrorFromResponse } = await import('@/apiError');
    throw await apiErrorFromResponse(res);
  }
  return res.json() as Promise<{ eventId: string; cancelledAtUtc: string }>;
}
