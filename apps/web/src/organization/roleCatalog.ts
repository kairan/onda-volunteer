import { fetchJsonWithProtectedHeaders, fetchWithProtectedHeaders } from '@/apiAuthHeaders';
import type { MinistryRoleRow } from './fetchMinistryRoles';

const base = () => import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function createMinistryRole(input: {
  ministryId: string;
  actingVolunteerId: string;
  name: string;
}): Promise<MinistryRoleRow> {
  return fetchJsonWithProtectedHeaders(
    `${base()}/ministries/${input.ministryId}/roles`,
    {
      volunteerId: input.actingVolunteerId,
      leaderMinistryId: input.ministryId,
    },
    {
      method: 'POST',
      body: JSON.stringify({ name: input.name }),
    },
  );
}

export async function renameMinistryRole(input: {
  ministryId: string;
  roleId: string;
  actingVolunteerId: string;
  name: string;
}): Promise<MinistryRoleRow> {
  return fetchJsonWithProtectedHeaders(
    `${base()}/ministries/${input.ministryId}/roles/${input.roleId}`,
    {
      volunteerId: input.actingVolunteerId,
      leaderMinistryId: input.ministryId,
    },
    {
      method: 'PATCH',
      body: JSON.stringify({ name: input.name }),
    },
  );
}

export async function retireMinistryRole(input: {
  ministryId: string;
  roleId: string;
  actingVolunteerId: string;
}): Promise<MinistryRoleRow> {
  return fetchJsonWithProtectedHeaders(
    `${base()}/ministries/${input.ministryId}/roles/${input.roleId}/retire`,
    {
      volunteerId: input.actingVolunteerId,
      leaderMinistryId: input.ministryId,
    },
    { method: 'POST' },
  );
}
