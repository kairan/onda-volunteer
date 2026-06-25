import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';
import type { IdentityMePayload } from './types';

export async function updateIdentityMe(
  data: { uiLocale?: string },
  input?: {
    volunteerId?: string;
    bearerAccessToken?: string;
  },
): Promise<IdentityMePayload> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  return fetchJsonWithProtectedHeaders<IdentityMePayload>(
    `${base}/identity/me`,
    { volunteerId: input?.volunteerId },
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
    input?.bearerAccessToken,
  );
}
