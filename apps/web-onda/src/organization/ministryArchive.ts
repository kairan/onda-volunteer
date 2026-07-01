import { mutateJson } from '@/api/apiClient';
import type { MinistrySummary } from './types';

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
  return mutateJson<ArchivedMinistryRow>(
    `/ministries/${input.ministryId}/archive`,
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
