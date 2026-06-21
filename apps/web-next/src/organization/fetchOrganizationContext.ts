import { getJson } from '@/api/apiClient';
import type { OrganizationContextPayload } from './types';

export async function fetchOrganizationContext(input?: {
  volunteerId?: string;
}): Promise<OrganizationContextPayload> {
  return getJson<OrganizationContextPayload>('/organization/context', {
    volunteerId: input?.volunteerId,
  });
}
