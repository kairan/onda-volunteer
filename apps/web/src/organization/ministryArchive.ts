import { fetchJsonWithProtectedHeaders } from '@/apiAuthHeaders';
import type { MinistrySummary } from './types';

const base = () => import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type ArchivedMinistryRow = {
  id: string;
  churchId: string;
  name: string;
  archivedAt: string;
};

export async function archiveMinistry(input: {
  ministryId: string;
  actingVolunteerId: string;
}): Promise<ArchivedMinistryRow> {
  return fetchJsonWithProtectedHeaders(
    `${base()}/ministries/${input.ministryId}/archive`,
    { volunteerId: input.actingVolunteerId },
    { method: 'POST' },
  );
}

export function isMinistryWritable(ministry: MinistrySummary): boolean {
  return !ministry.archivedAt;
}

export function ministriesForWritePickers(
  ministries: MinistrySummary[],
): MinistrySummary[] {
  return ministries.filter(isMinistryWritable);
}

export function ministriesForShellSwitcher(
  ministries: MinistrySummary[],
  canSeeArchived: boolean,
): MinistrySummary[] {
  return canSeeArchived ? ministries : ministries.filter(isMinistryWritable);
}
