import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

export async function cancelEvent(input: {
  eventId: string;
  volunteerId: string;
}) {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const url = `${base}/events/${input.eventId}/cancel`;
  
  return fetchJsonWithProtectedHeaders(
    url,
    { volunteerId: input.volunteerId },
    { method: 'POST' }
  );
}
