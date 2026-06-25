import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';

const base = () => import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type SystemAdminChurchRow = {
  id: string;
  name: string;
  defaultTimezone: string;
  campuses: { id: string; name: string; timezone: string }[];
};

export type SystemAdminChurchListPage = {
  items: SystemAdminChurchRow[];
  nextCursor: string | null;
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
  const url = `${base()}/system-admin/churches${query ? `?${query}` : ''}`;
  return fetchJsonWithProtectedHeaders<SystemAdminChurchListPage>(url, {
    volunteerId: input.volunteerId,
  });
}

export async function createSystemAdminChurch(input: {
  volunteerId: string;
  name: string;
  defaultTimezone: string;
}): Promise<SystemAdminChurchRow> {
  return fetchJsonWithProtectedHeaders<SystemAdminChurchRow>(
    `${base()}/system-admin/churches`,
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
