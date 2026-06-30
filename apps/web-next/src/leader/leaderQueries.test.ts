import { afterEach, describe, expect, it, vi } from 'vitest';
import * as apiClient from '@/api/apiClient';
import { queryKeys } from '@/query/queryKeys';
import {
  createAssignment,
  invalidateAfterAssignOrRelease,
} from './assignMutation';
import { eventDetailQuery, fetchEventDetail } from './eventDetailQuery';
import {
  buildRosterRows,
  rosterFillCounts,
} from './buildRosterRows';
import { leaderEventsQuery, fetchLeaderEvents } from './leaderEventsQuery';
import { voidAssignment } from './releaseMutation';
import { queryClient } from '@/query/queryClient';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('leaderEventsQuery', () => {
  it('returns queryOptions with events key', () => {
    const options = leaderEventsQuery({
      volunteerId: 'vol-1',
      churchId: 'church-1',
      ministryId: 'min-1',
    });
    expect(options.queryKey).toEqual(
      queryKeys.events({ churchId: 'church-1', ministryId: 'min-1' }),
    );
  });

  it('fetchLeaderEvents calls getJson with churchId', async () => {
    vi.spyOn(apiClient, 'getJson').mockResolvedValue([]);
    await fetchLeaderEvents({ volunteerId: 'vol-1', churchId: 'church-1' });
    expect(apiClient.getJson).toHaveBeenCalledWith('/events?churchId=church-1', {
      volunteerId: 'vol-1',
    });
  });
});

describe('eventDetailQuery', () => {
  it('returns queryOptions with eventDetail key', () => {
    const options = eventDetailQuery({
      eventId: 'evt-1',
      volunteerId: 'vol-1',
    });
    expect(options.queryKey).toEqual(queryKeys.eventDetail('evt-1'));
  });

  it('fetchEventDetail calls getJson for event path', async () => {
    vi.spyOn(apiClient, 'getJson').mockResolvedValue({
      event: { id: 'evt-1' },
      roleCapacities: [{ ministryId: 'min-1', roleId: 'role-1', capacity: 2 }],
    });
    const result = await fetchEventDetail({ eventId: 'evt-1', volunteerId: 'vol-1' });
    expect(apiClient.getJson).toHaveBeenCalledWith('/events/evt-1', {
      volunteerId: 'vol-1',
    });
    expect(result.roleCapacities).toEqual([
      { ministryId: 'min-1', roleId: 'role-1', capacity: 2 },
    ]);
  });
});

describe('assignMutation', () => {
  it('createAssignment posts assignment payload', async () => {
    vi.spyOn(apiClient, 'mutateJson').mockResolvedValue({ id: 'asg-1' });
    await createAssignment({
      eventId: 'evt-1',
      volunteerId: 'vol-target',
      ministryId: 'min-1',
      roleId: 'role-1',
      actingVolunteerId: 'vol-leader',
      startsAtUtc: '2026-06-22T13:00:00.000Z',
      endsAtUtc: '2026-06-22T15:00:00.000Z',
    });
    expect(apiClient.mutateJson).toHaveBeenCalledWith(
      '/events/evt-1/assignments',
      { volunteerId: 'vol-leader', leaderMinistryId: 'min-1' },
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('invalidateAfterAssignOrRelease invalidates event and list keys', () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    invalidateAfterAssignOrRelease(queryClient, {
      churchId: 'church-1',
      ministryId: 'min-1',
      eventId: 'evt-1',
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.eventDetail('evt-1'),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.events({ churchId: 'church-1', ministryId: 'min-1' }),
    });
  });
});

describe('releaseMutation', () => {
  it('voidAssignment posts to void endpoint', async () => {
    vi.spyOn(apiClient, 'mutateJson').mockResolvedValue({
      id: 'asg-1',
      voidedAtUtc: '2026-06-22T13:00:00.000Z',
    });
    await voidAssignment({ assignmentId: 'asg-1', actingVolunteerId: 'vol-leader' });
    expect(apiClient.mutateJson).toHaveBeenCalledWith(
      '/assignments/asg-1/void',
      { volunteerId: 'vol-leader' },
      { method: 'POST' },
    );
  });
});

describe('buildRosterRows', () => {
  it('maps roles to roster rows with fill counts', () => {
    const roster = buildRosterRows({
      ministryId: 'min-1',
      roles: [
        { id: 'role-1', name: 'Greeter', retired: false },
        { id: 'role-2', name: 'Usher', retired: false },
      ],
      assignments: [
        {
          id: 'asg-1',
          volunteer: { id: 'vol-1', displayName: 'Alex' },
          ministry: { id: 'min-1', name: 'Hospitality' },
          role: { id: 'role-1', name: 'Greeter' },
          window: {
            startsAtUtc: '2026-06-22T13:00:00.000Z',
            endsAtUtc: '2026-06-22T15:00:00.000Z',
          },
        },
      ],
    });
    expect(roster).toHaveLength(2);
    expect(rosterFillCounts(roster)).toEqual({ filled: 1, total: 2 });
  });
});
