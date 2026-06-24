import { mutateJson } from '@/api/apiClient';
import type { MinistryRoleRow } from '@/leader/types';

export type MinistryStructureRow = {
  id: string;
  churchId: string;
  name: string;
};

export type VolunteerSearchResult = {
  id: string;
  displayName: string;
  email: string | null;
};

export type VolunteerInviteRow = {
  id: string;
  email: string;
  sentAtUtc: string;
  expiresAtUtc: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
};

export type SendInviteSuccess = {
  id: string;
  email: string;
  sentAtUtc: string;
  expiresAtUtc: string;
  status: string;
};

export type SendInviteAlreadyExists = {
  code: 'VOLUNTEER_ALREADY_EXISTS';
  existingVolunteerId: string;
  displayName: string;
};

export type SendInviteResult = SendInviteSuccess | SendInviteAlreadyExists;

export function isSendInviteAlreadyExists(
  result: SendInviteResult,
): result is SendInviteAlreadyExists {
  return (
    typeof result === 'object' &&
    result !== null &&
    'code' in result &&
    result.code === 'VOLUNTEER_ALREADY_EXISTS'
  );
}

export async function createMinistry(input: {
  churchId: string;
  actingVolunteerId: string;
  name: string;
}): Promise<MinistryStructureRow> {
  return mutateJson<MinistryStructureRow>(
    `/churches/${input.churchId}/ministries`,
    { volunteerId: input.actingVolunteerId },
    {
      method: 'POST',
      body: JSON.stringify({ name: input.name }),
    },
  );
}

export async function renameMinistry(input: {
  ministryId: string;
  actingVolunteerId: string;
  name: string;
}): Promise<MinistryStructureRow> {
  return mutateJson<MinistryStructureRow>(
    `/ministries/${input.ministryId}`,
    { volunteerId: input.actingVolunteerId },
    {
      method: 'PATCH',
      body: JSON.stringify({ name: input.name }),
    },
  );
}

export async function createMinistryRole(input: {
  ministryId: string;
  actingVolunteerId: string;
  name: string;
}): Promise<MinistryRoleRow> {
  return mutateJson<MinistryRoleRow>(
    `/ministries/${input.ministryId}/roles`,
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
  return mutateJson<MinistryRoleRow>(
    `/ministries/${input.ministryId}/roles/${input.roleId}`,
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
  return mutateJson<MinistryRoleRow>(
    `/ministries/${input.ministryId}/roles/${input.roleId}/retire`,
    {
      volunteerId: input.actingVolunteerId,
      leaderMinistryId: input.ministryId,
    },
    { method: 'POST' },
  );
}

export async function addMinistryMembership(input: {
  ministryId: string;
  actingVolunteerId: string;
  volunteerId: string;
  status: 'PENDING' | 'ACTIVE';
}) {
  return mutateJson<{
    volunteerId: string;
    ministryId: string;
    status: string;
  }>(
    `/ministries/${input.ministryId}/memberships`,
    { volunteerId: input.actingVolunteerId },
    {
      method: 'POST',
      body: JSON.stringify({
        volunteerId: input.volunteerId,
        status: input.status,
      }),
    },
  );
}

export async function activateMinistryMembership(input: {
  ministryId: string;
  actingVolunteerId: string;
  volunteerId: string;
}) {
  return mutateJson(
    `/ministries/${input.ministryId}/memberships/${input.volunteerId}/activate`,
    { volunteerId: input.actingVolunteerId },
    { method: 'POST' },
  );
}

export async function deactivateMinistryMembership(input: {
  ministryId: string;
  actingVolunteerId: string;
  volunteerId: string;
  leaderMinistryId: string;
}) {
  return mutateJson(
    `/ministries/${input.ministryId}/memberships/${input.volunteerId}/deactivate`,
    {
      volunteerId: input.actingVolunteerId,
      leaderMinistryId: input.leaderMinistryId,
    },
    { method: 'POST' },
  );
}

export async function sendVolunteerInvite(input: {
  ministryId: string;
  email: string;
  actingVolunteerId: string;
}): Promise<SendInviteResult> {
  return mutateJson<SendInviteResult>(
    `/ministries/${input.ministryId}/invites`,
    { volunteerId: input.actingVolunteerId },
    {
      method: 'POST',
      body: JSON.stringify({ email: input.email }),
    },
  );
}

export async function grantMinistryLeader(input: {
  ministryId: string;
  volunteerId: string;
  actingVolunteerId: string;
}) {
  return mutateJson(
    `/ministries/${input.ministryId}/leaders/${input.volunteerId}`,
    { volunteerId: input.actingVolunteerId },
    { method: 'POST' },
  );
}

export async function revokeMinistryLeader(input: {
  ministryId: string;
  volunteerId: string;
  actingVolunteerId: string;
}) {
  return mutateJson(
    `/ministries/${input.ministryId}/leaders/${input.volunteerId}/revoke`,
    { volunteerId: input.actingVolunteerId },
    { method: 'POST' },
  );
}
