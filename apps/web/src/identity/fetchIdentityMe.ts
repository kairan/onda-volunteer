import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';
import type { IdentityMePayload } from './types';

export async function fetchIdentityMe(input?: {
  volunteerId?: string;
}): Promise<IdentityMePayload> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  return fetchJsonWithProtectedHeaders<IdentityMePayload>(
    `${base}/identity/me`,
    { volunteerId: input?.volunteerId },
  );
}
