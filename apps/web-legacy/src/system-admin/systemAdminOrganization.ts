import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

const base = () => import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function grantSystemAdminMinistryLeader(input: {
  volunteerId: string;
  ministryId: string;
  targetVolunteerId: string;
}): Promise<unknown> {
  return fetchJsonWithProtectedHeaders(
    `${base()}/system-admin/ministries/${encodeURIComponent(input.ministryId)}/leaders`,
    { volunteerId: input.volunteerId },
    {
      method: 'POST',
      body: JSON.stringify({ volunteerId: input.targetVolunteerId }),
    },
  );
}

export async function revokeSystemAdminMinistryLeader(input: {
  volunteerId: string;
  ministryId: string;
  targetVolunteerId: string;
}): Promise<unknown> {
  return fetchJsonWithProtectedHeaders(
    `${base()}/system-admin/ministries/${encodeURIComponent(input.ministryId)}/leaders/${encodeURIComponent(input.targetVolunteerId)}`,
    { volunteerId: input.volunteerId },
    { method: 'DELETE' },
  );
}

export async function addSystemAdminMinistryMembership(input: {
  volunteerId: string;
  ministryId: string;
  targetVolunteerId: string;
  status: 'PENDING' | 'ACTIVE';
}): Promise<unknown> {
  return fetchJsonWithProtectedHeaders(
    `${base()}/system-admin/ministries/${encodeURIComponent(input.ministryId)}/memberships`,
    { volunteerId: input.volunteerId },
    {
      method: 'POST',
      body: JSON.stringify({
        volunteerId: input.targetVolunteerId,
        status: input.status,
      }),
    },
  );
}

export async function patchSystemAdminMinistryMembership(input: {
  volunteerId: string;
  ministryId: string;
  targetVolunteerId: string;
  status: 'ACTIVE' | 'INACTIVE';
}): Promise<{ status: string }> {
  return fetchJsonWithProtectedHeaders<{ status: string }>(
    `${base()}/system-admin/ministries/${encodeURIComponent(input.ministryId)}/memberships/${encodeURIComponent(input.targetVolunteerId)}`,
    { volunteerId: input.volunteerId },
    {
      method: 'PATCH',
      body: JSON.stringify({ status: input.status }),
    },
  );
}
