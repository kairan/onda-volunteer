import { afterEach, describe, expect, it, vi } from 'vitest';
import * as apiClient from '@/api/apiClient';
import { queryKeys } from '@/query/queryKeys';
import { fetchVolunteerAssignments, volunteerAssignmentsQuery } from './volunteerAssignmentsQuery';
import {
  fetchVolunteerUnavailability,
  volunteerUnavailabilityQuery,
} from './volunteerUnavailabilityQuery';
import {
  createVolunteerUnavailability,
  deleteVolunteerUnavailability,
  updateVolunteerUnavailability,
} from './unavailabilityMutations';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('volunteerAssignmentsQuery', () => {
  it('returns queryOptions with assignments key', () => {
    const options = volunteerAssignmentsQuery({
      volunteerId: 'vol-1',
      churchId: 'church-1',
    });

    expect(options.queryKey).toEqual(
      queryKeys.assignments('vol-1', 'church-1'),
    );
    expect(options.enabled).toBe(true);
  });

  it('fetchVolunteerAssignments calls getJson with churchId query param', async () => {
    vi.spyOn(apiClient, 'getJson').mockResolvedValue([]);

    await fetchVolunteerAssignments({
      volunteerId: 'vol-1',
      churchId: 'church-1',
    });

    expect(apiClient.getJson).toHaveBeenCalledWith(
      '/volunteers/vol-1/assignments?churchId=church-1',
      { volunteerId: 'vol-1' },
    );
  });
});

describe('volunteerUnavailabilityQuery', () => {
  it('returns queryOptions with unavailability key', () => {
    const options = volunteerUnavailabilityQuery({
      volunteerId: 'vol-1',
      churchId: 'church-1',
    });

    expect(options.queryKey).toEqual(
      queryKeys.unavailability('vol-1', 'church-1'),
    );
  });

  it('fetchVolunteerUnavailability calls getJson with church scope', async () => {
    vi.spyOn(apiClient, 'getJson').mockResolvedValue([]);

    await fetchVolunteerUnavailability({
      volunteerId: 'vol-1',
      churchId: 'church-1',
    });

    expect(apiClient.getJson).toHaveBeenCalledWith(
      '/volunteers/vol-1/unavailability?churchId=church-1',
      { volunteerId: 'vol-1' },
    );
  });
});

describe('unavailabilityMutations', () => {
  it('createVolunteerUnavailability posts payload via mutateJson', async () => {
    vi.spyOn(apiClient, 'mutateJson').mockResolvedValue({
      id: 'away-1',
      ministryId: 'min-1',
      window: {
        startsAtUtc: '2026-07-01T00:00:00.000Z',
        endsAtUtc: '2026-07-02T00:00:00.000Z',
      },
    });

    await createVolunteerUnavailability({
      volunteerId: 'vol-1',
      ministryId: 'min-1',
      startsAtUtc: '2026-07-01T00:00:00.000Z',
      endsAtUtc: '2026-07-02T00:00:00.000Z',
    });

    expect(apiClient.mutateJson).toHaveBeenCalledWith(
      '/volunteers/vol-1/unavailability',
      { volunteerId: 'vol-1' },
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          ministryId: 'min-1',
          startsAtUtc: '2026-07-01T00:00:00.000Z',
          endsAtUtc: '2026-07-02T00:00:00.000Z',
        }),
      }),
    );
  });

  it('updateVolunteerUnavailability patches window via mutateJson', async () => {
    vi.spyOn(apiClient, 'mutateJson').mockResolvedValue({
      id: 'away-1',
      ministryId: 'min-1',
      window: {
        startsAtUtc: '2026-07-03T00:00:00.000Z',
        endsAtUtc: '2026-07-04T00:00:00.000Z',
      },
    });

    await updateVolunteerUnavailability({
      unavailabilityId: 'away-1',
      actingVolunteerId: 'vol-1',
      startsAtUtc: '2026-07-03T00:00:00.000Z',
      endsAtUtc: '2026-07-04T00:00:00.000Z',
    });

    expect(apiClient.mutateJson).toHaveBeenCalledWith(
      '/unavailability/away-1',
      { volunteerId: 'vol-1' },
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('deleteVolunteerUnavailability deletes via mutateJson', async () => {
    vi.spyOn(apiClient, 'mutateJson').mockResolvedValue({ id: 'away-1' });

    await deleteVolunteerUnavailability({
      unavailabilityId: 'away-1',
      actingVolunteerId: 'vol-1',
    });

    expect(apiClient.mutateJson).toHaveBeenCalledWith(
      '/unavailability/away-1',
      { volunteerId: 'vol-1' },
      { method: 'DELETE' },
    );
  });
});
