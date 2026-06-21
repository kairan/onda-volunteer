import { mutateJson } from '@/api/apiClient';
import type { CreateUnavailabilityResult } from './types';

export async function createVolunteerUnavailability(input: {
  volunteerId: string;
  ministryId: string;
  startsAtUtc: string;
  endsAtUtc: string;
  leaderMinistryId?: string;
  actingVolunteerId?: string;
}): Promise<CreateUnavailabilityResult> {
  const scopeVolunteerId = input.actingVolunteerId ?? input.volunteerId;
  return mutateJson<CreateUnavailabilityResult>(
    `/volunteers/${input.volunteerId}/unavailability`,
    {
      volunteerId: scopeVolunteerId,
      leaderMinistryId: input.leaderMinistryId,
    },
    {
      method: 'POST',
      body: JSON.stringify({
        ministryId: input.ministryId,
        startsAtUtc: input.startsAtUtc,
        endsAtUtc: input.endsAtUtc,
      }),
    },
  );
}

export async function updateVolunteerUnavailability(input: {
  unavailabilityId: string;
  actingVolunteerId: string;
  startsAtUtc: string;
  endsAtUtc: string;
  leaderMinistryId?: string;
}): Promise<CreateUnavailabilityResult> {
  return mutateJson<CreateUnavailabilityResult>(
    `/unavailability/${input.unavailabilityId}`,
    {
      volunteerId: input.actingVolunteerId,
      leaderMinistryId: input.leaderMinistryId,
    },
    {
      method: 'PATCH',
      body: JSON.stringify({
        startsAtUtc: input.startsAtUtc,
        endsAtUtc: input.endsAtUtc,
      }),
    },
  );
}

export async function deleteVolunteerUnavailability(input: {
  unavailabilityId: string;
  actingVolunteerId: string;
  leaderMinistryId?: string;
}): Promise<{ id: string }> {
  return mutateJson<{ id: string }>(
    `/unavailability/${input.unavailabilityId}`,
    {
      volunteerId: input.actingVolunteerId,
      leaderMinistryId: input.leaderMinistryId,
    },
    { method: 'DELETE' },
  );
}
