import { describe, expect, it } from 'vitest';
import { queryKeys } from './queryKeys';

describe('queryKeys', () => {
  it('organizationContext partitions by session user and dev header scope', () => {
    expect(queryKeys.organizationContext()).toEqual([
      'org-context',
      'anonymous',
      'default',
    ]);
    expect(queryKeys.organizationContext('vol-1')).toEqual([
      'org-context',
      'vol-1',
      'default',
    ]);
    expect(queryKeys.organizationContext('vol-1', 'dev-vol')).toEqual([
      'org-context',
      'vol-1',
      'dev-vol',
    ]);
    expect(queryKeys.organizationContext(null, 'dev-vol')).toEqual([
      'org-context',
      'anonymous',
      'dev-vol',
    ]);
  });

  it('events includes church and ministry scope', () => {
    expect(
      queryKeys.events({ churchId: 'a', ministryId: 'b' }),
    ).toEqual(['events', 'a', 'b']);
  });

  it('eventDetail is keyed by event id', () => {
    expect(queryKeys.eventDetail('evt-1')).toEqual(['event-detail', 'evt-1']);
  });

  it('unavailability includes volunteer and optional church', () => {
    expect(queryKeys.unavailability('vol-1', 'church-a')).toEqual([
      'unavailability',
      'vol-1',
      'church-a',
    ]);
    expect(queryKeys.unavailability('vol-1')).toEqual([
      'unavailability',
      'vol-1',
      null,
    ]);
  });

  it('ministryMemberships is keyed by ministry id', () => {
    expect(queryKeys.ministryMemberships('min-1')).toEqual([
      'ministry-memberships',
      'min-1',
    ]);
  });

  it('ministry admin keys include ministry scope', () => {
    expect(queryKeys.ministryRoles('min-1')).toEqual(['ministry-roles', 'min-1']);
    expect(queryKeys.ministryLeaders('min-1')).toEqual([
      'ministry-leaders',
      'min-1',
    ]);
    expect(queryKeys.volunteerInvites('min-1')).toEqual([
      'volunteer-invites',
      'min-1',
    ]);
    expect(
      queryKeys.volunteerSearch('church-1', 'min-1', 'ali'),
    ).toEqual(['volunteer-search', 'church-1', 'min-1', 'ali']);
  });

  it('assignments includes volunteer and optional church', () => {
    expect(queryKeys.assignments('vol-1', 'church-a')).toEqual([
      'assignments',
      'vol-1',
      'church-a',
    ]);
    expect(queryKeys.assignments('vol-1')).toEqual([
      'assignments',
      'vol-1',
      null,
    ]);
  });

  it('systemAdmin keys use a dedicated namespace', () => {
    expect(queryKeys.systemAdmin.churches()).toEqual([
      'system-admin',
      'churches',
    ]);
    expect(queryKeys.systemAdmin.volunteer('vol-1')).toEqual([
      'system-admin',
      'volunteer',
      'vol-1',
    ]);
  });
});
