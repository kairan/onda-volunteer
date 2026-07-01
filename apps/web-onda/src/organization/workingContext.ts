import { ministriesForShellSwitcher } from './ministryArchive';
import type { MinistrySummary } from './types';

export type WorkingMode = 'leader' | 'volunteer';

/** Active hat for church-scoped UX + API leader header */
export type WorkingContext = {
  ministryId: string;
  mode: WorkingMode;
};

export type WorkingContextOption = WorkingContext & {
  ministryName: string;
};

export function buildWorkingContextOptions(
  ministries: MinistrySummary[],
  canSeeArchived: boolean,
): WorkingContextOption[] {
  const visible = ministriesForShellSwitcher(ministries, canSeeArchived);
  const options: WorkingContextOption[] = [];

  for (const m of visible) {
    if (m.isLeader) {
      options.push({
        ministryId: m.id,
        mode: 'leader',
        ministryName: m.name,
      });
      continue;
    }
    if (m.membershipStatus === 'ACTIVE') {
      options.push({
        ministryId: m.id,
        mode: 'volunteer',
        ministryName: m.name,
      });
    }
  }

  return options.sort((a, b) => {
    if (a.mode !== b.mode) {
      return a.mode === 'leader' ? -1 : 1;
    }
    return a.ministryName.localeCompare(b.ministryName, 'pt-BR');
  });
}

export function resolveWorkingContext(
  options: WorkingContextOption[],
  stored: WorkingContext | null,
  legacyMinistryId: string | null,
): WorkingContext | null {
  if (options.length === 0) return null;
  if (options.length === 1) return options[0]!;

  if (stored) {
    const hit = options.find(
      (o) => o.ministryId === stored.ministryId && o.mode === stored.mode,
    );
    if (hit) return hit;
  }

  if (legacyMinistryId) {
    const asLeader = options.find(
      (o) => o.ministryId === legacyMinistryId && o.mode === 'leader',
    );
    if (asLeader) return asLeader;

    const asVolunteer = options.find(
      (o) => o.ministryId === legacyMinistryId && o.mode === 'volunteer',
    );
    if (asVolunteer) return asVolunteer;
  }

  return options.find((o) => o.mode === 'leader') ?? options[0]!;
}
