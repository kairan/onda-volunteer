import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { getJson, mutateJson } from '@/api/apiClient';
import type { EventListItem } from '@/leader/types';
import { queryKeys } from '@/query/queryKeys';

export type SystemAdminChurchRow = {
  id: string;
  name: string;
  defaultTimezone: string;
  campuses: { id: string; name: string; timezone: string }[];
};

export type SystemAdminChurchSummary = {
  id: string;
  name: string;
  defaultTimezone: string;
};

export type SystemAdminChurchListPage = {
  items: SystemAdminChurchRow[];
  nextCursor: string | null;
};

export type SystemAdminVolunteerSummary = {
  id: string;
  displayName: string;
  accreditations: { churchId: string; churchName: string }[];
  leaderships: {
    ministryId: string;
    ministryName: string;
    churchId: string;
    churchName: string;
  }[];
  memberships: {
    ministryId: string;
    ministryName: string;
    churchId: string;
    churchName: string;
    status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  }[];
};

export type SystemAdminVolunteerListPage = {
  items: SystemAdminVolunteerSummary[];
  nextCursor: string | null;
};

export type AdminInviteSummary = {
  id: string;
  email: string;
  status: 'PENDING' | 'FULFILLED' | 'REVOKED';
  createdAt: string;
  fulfilledAt: string | null;
};

export async function fetchSystemAdminChurches(input: {
  volunteerId: string;
  q?: string;
  limit?: number;
  cursor?: string;
}): Promise<SystemAdminChurchListPage> {
  const params = new URLSearchParams();
  if (input.q?.trim()) {
    params.set('q', input.q.trim());
  }
  if (input.limit !== undefined) {
    params.set('limit', String(input.limit));
  }
  if (input.cursor) {
    params.set('cursor', input.cursor);
  }
  const query = params.toString();
  return getJson<SystemAdminChurchListPage>(
    `/system-admin/churches${query ? `?${query}` : ''}`,
    { volunteerId: input.volunteerId },
  );
}

export function systemAdminChurchesInfiniteQuery(input: {
  volunteerId: string;
  limit?: number;
}) {
  const limit = input.limit ?? 100;
  return infiniteQueryOptions({
    queryKey: queryKeys.systemAdmin.churches(),
    queryFn: ({ pageParam }) =>
      fetchSystemAdminChurches({
        volunteerId: input.volunteerId,
        limit,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(input.volunteerId),
  });
}

export async function createSystemAdminChurch(input: {
  volunteerId: string;
  name: string;
  defaultTimezone: string;
}): Promise<SystemAdminChurchRow> {
  return mutateJson<SystemAdminChurchRow>(
    '/system-admin/churches',
    { volunteerId: input.volunteerId },
    {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        defaultTimezone: input.defaultTimezone,
      }),
    },
  );
}

export async function fetchSystemAdminChurch(input: {
  volunteerId: string;
  churchId: string;
}): Promise<SystemAdminChurchSummary> {
  return getJson<SystemAdminChurchSummary>(
    `/system-admin/churches/${encodeURIComponent(input.churchId)}`,
    { volunteerId: input.volunteerId },
  );
}

export function systemAdminChurchQuery(input: {
  volunteerId: string;
  churchId: string;
}) {
  return queryOptions({
    queryKey: queryKeys.systemAdmin.church(input.churchId),
    queryFn: () => fetchSystemAdminChurch(input),
    enabled: Boolean(input.volunteerId && input.churchId),
  });
}

export async function fetchAdminInvites(input: {
  volunteerId: string;
  churchId: string;
}): Promise<AdminInviteSummary[]> {
  const page = await getJson<{ items: AdminInviteSummary[] }>(
    `/system-admin/churches/${encodeURIComponent(input.churchId)}/admin-invites`,
    { volunteerId: input.volunteerId },
  );
  return page.items;
}

export function systemAdminAdminInvitesQuery(input: {
  volunteerId: string;
  churchId: string;
}) {
  return queryOptions({
    queryKey: queryKeys.systemAdmin.adminInvites(input.churchId),
    queryFn: () => fetchAdminInvites(input),
    enabled: Boolean(input.volunteerId && input.churchId),
  });
}

export async function createAdminInvite(input: {
  volunteerId: string;
  churchId: string;
  email: string;
}): Promise<AdminInviteSummary> {
  return mutateJson<AdminInviteSummary>(
    `/system-admin/churches/${encodeURIComponent(input.churchId)}/admin-invites`,
    { volunteerId: input.volunteerId },
    {
      method: 'POST',
      body: JSON.stringify({ email: input.email }),
    },
  );
}

export async function revokeAdminInvite(input: {
  volunteerId: string;
  churchId: string;
  inviteId: string;
}): Promise<AdminInviteSummary> {
  return mutateJson<AdminInviteSummary>(
    `/system-admin/churches/${encodeURIComponent(input.churchId)}/admin-invites/${encodeURIComponent(input.inviteId)}`,
    { volunteerId: input.volunteerId },
    { method: 'DELETE' },
  );
}

export async function fetchSystemAdminVolunteers(input: {
  volunteerId: string;
  q?: string;
  limit?: number;
  cursor?: string;
}): Promise<SystemAdminVolunteerListPage> {
  const params = new URLSearchParams();
  if (input.q) {
    params.set('q', input.q);
  }
  if (input.limit !== undefined) {
    params.set('limit', String(input.limit));
  }
  if (input.cursor) {
    params.set('cursor', input.cursor);
  }
  const query = params.toString();
  return getJson<SystemAdminVolunteerListPage>(
    `/system-admin/volunteers${query ? `?${query}` : ''}`,
    { volunteerId: input.volunteerId },
  );
}

export function systemAdminVolunteersInfiniteQuery(input: {
  volunteerId: string;
  q?: string;
  limit?: number;
}) {
  const limit = input.limit ?? 50;
  const q = input.q?.trim() ?? '';
  return infiniteQueryOptions({
    queryKey: queryKeys.systemAdmin.volunteers(q),
    queryFn: ({ pageParam }) =>
      fetchSystemAdminVolunteers({
        volunteerId: input.volunteerId,
        q: q || undefined,
        limit,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(input.volunteerId),
  });
}

export async function fetchSystemAdminVolunteerDetail(input: {
  volunteerId: string;
  targetVolunteerId: string;
}): Promise<SystemAdminVolunteerSummary> {
  return getJson<SystemAdminVolunteerSummary>(
    `/system-admin/volunteers/${input.targetVolunteerId}`,
    { volunteerId: input.volunteerId },
  );
}

export function systemAdminVolunteerQuery(input: {
  volunteerId: string;
  targetVolunteerId: string;
}) {
  return queryOptions({
    queryKey: queryKeys.systemAdmin.volunteer(input.targetVolunteerId),
    queryFn: () => fetchSystemAdminVolunteerDetail(input),
    enabled: Boolean(input.volunteerId && input.targetVolunteerId),
  });
}

export async function grantSystemAdminAccreditation(input: {
  volunteerId: string;
  targetVolunteerId: string;
  churchId: string;
}): Promise<{ volunteerId: string; churchId: string }> {
  return mutateJson(
    `/system-admin/volunteers/${input.targetVolunteerId}/churches/${input.churchId}/admin-accreditation`,
    { volunteerId: input.volunteerId },
    { method: 'PUT' },
  );
}

export async function revokeSystemAdminAccreditation(input: {
  volunteerId: string;
  targetVolunteerId: string;
  churchId: string;
}): Promise<{ volunteerId: string; churchId: string }> {
  return mutateJson(
    `/system-admin/volunteers/${input.targetVolunteerId}/churches/${input.churchId}/admin-accreditation`,
    { volunteerId: input.volunteerId },
    { method: 'DELETE' },
  );
}

export async function grantSystemAdminMinistryLeader(input: {
  volunteerId: string;
  ministryId: string;
  targetVolunteerId: string;
}): Promise<unknown> {
  return mutateJson(
    `/system-admin/ministries/${encodeURIComponent(input.ministryId)}/leaders`,
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
  return mutateJson(
    `/system-admin/ministries/${encodeURIComponent(input.ministryId)}/leaders/${encodeURIComponent(input.targetVolunteerId)}`,
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
  return mutateJson(
    `/system-admin/ministries/${encodeURIComponent(input.ministryId)}/memberships`,
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
  return mutateJson<{ status: string }>(
    `/system-admin/ministries/${encodeURIComponent(input.ministryId)}/memberships/${encodeURIComponent(input.targetVolunteerId)}`,
    { volunteerId: input.volunteerId },
    {
      method: 'PATCH',
      body: JSON.stringify({ status: input.status }),
    },
  );
}

export async function fetchSystemAdminEvents(input: {
  volunteerId: string;
  churchId?: string;
}): Promise<EventListItem[]> {
  const params = new URLSearchParams();
  if (input.churchId) {
    params.set('churchId', input.churchId);
  }
  const query = params.toString();
  return getJson<EventListItem[]>(
    `/events${query ? `?${query}` : ''}`,
    { volunteerId: input.volunteerId },
  );
}

export function systemAdminEventsQuery(input: {
  volunteerId: string;
  churchId?: string;
}) {
  const churchId = input.churchId ?? '';
  return queryOptions({
    queryKey: queryKeys.systemAdmin.events(churchId),
    queryFn: () =>
      fetchSystemAdminEvents({
        volunteerId: input.volunteerId,
        churchId: churchId || undefined,
      }),
    enabled: Boolean(input.volunteerId),
  });
}
