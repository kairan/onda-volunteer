import { fetchJsonWithProtectedHeaders } from '@/api/apiClient';
import type { IdentityMePayload } from './types';

export async function fetchIdentityMe(input?: {
  volunteerId?: string;
  bearerAccessToken?: string;
}): Promise<IdentityMePayload> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  return fetchJsonWithProtectedHeaders<IdentityMePayload>(
    `${base}/identity/me`,
    { volunteerId: input?.volunteerId },
    undefined,
    input?.bearerAccessToken,
  );
}
