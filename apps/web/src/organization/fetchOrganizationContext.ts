import { buildProtectedHeaders } from '@/apiAuthHeaders';
import type { OrganizationContextPayload } from './types';

export async function fetchOrganizationContext(input?: {
  volunteerId?: string;
}): Promise<OrganizationContextPayload> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const headers = await buildProtectedHeaders({
    volunteerId: input?.volunteerId,
  });
  const res = await fetch(`${base}/organization/context`, { headers });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Organization context failed (${res.status})`);
  }
  return res.json() as Promise<OrganizationContextPayload>;
}
