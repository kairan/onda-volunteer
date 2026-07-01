import type { WorkingContext } from './workingContext';

const CHURCH_KEY = 'onda:activeChurchId';
const CAMPUS_KEY = 'onda:activeCampusId';
const MINISTRY_KEY = 'onda:activeMinistryId';

const workingContextKey = (churchId: string) =>
  `onda:activeWorkingContext:${churchId}`;

export function readStoredActiveChurchId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const value = window.localStorage.getItem(CHURCH_KEY)?.trim();
    return value || null;
  } catch {
    return null;
  }
}

export function readStoredActiveCampusId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const value = window.localStorage.getItem(CAMPUS_KEY)?.trim();
    return value || null;
  } catch {
    return null;
  }
}

export function readStoredActiveMinistryId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const value = window.localStorage.getItem(MINISTRY_KEY)?.trim();
    return value || null;
  } catch {
    return null;
  }
}

export function readStoredWorkingContext(
  churchId: string,
): WorkingContext | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(workingContextKey(churchId));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as { ministryId?: string; mode?: string };
    if (
      typeof parsed.ministryId !== 'string' ||
      !parsed.ministryId.trim() ||
      (parsed.mode !== 'leader' && parsed.mode !== 'volunteer')
    ) {
      return null;
    }
    return { ministryId: parsed.ministryId.trim(), mode: parsed.mode };
  } catch {
    return null;
  }
}

export function writeStoredWorkingContext(
  churchId: string,
  ctx: WorkingContext | null,
): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const key = workingContextKey(churchId);
    if (!ctx) {
      window.localStorage.removeItem(key);
      return;
    }
    window.localStorage.setItem(
      key,
      JSON.stringify({ ministryId: ctx.ministryId, mode: ctx.mode }),
    );
  } catch {
    // ignore quota / private mode
  }
}

export function setStoredOrganizationSelection(
  churchId: string | null,
  campusId: string | null,
  ministryId?: string | null,
): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    if (churchId) {
      window.localStorage.setItem(CHURCH_KEY, churchId);
    } else {
      window.localStorage.removeItem(CHURCH_KEY);
    }
    if (campusId) {
      window.localStorage.setItem(CAMPUS_KEY, campusId);
    } else {
      window.localStorage.removeItem(CAMPUS_KEY);
    }
    if (ministryId === undefined) {
      return;
    }
    if (ministryId) {
      window.localStorage.setItem(MINISTRY_KEY, ministryId);
    } else {
      window.localStorage.removeItem(MINISTRY_KEY);
    }
  } catch {
    // ignore quota / private mode
  }
}

export function clearStoredOrganizationSelection(): void {
  setStoredOrganizationSelection(null, null, null);
}
