import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';
import type { OrganizationContextPayload } from './types';

export async function fetchOrganizationContext(input?: {
  volunteerId?: string;
}): Promise<OrganizationContextPayload> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  return fetchJsonWithProtectedHeaders<OrganizationContextPayload>(
    `${base}/organization/context`,
    { volunteerId: input?.volunteerId },
  );
}
