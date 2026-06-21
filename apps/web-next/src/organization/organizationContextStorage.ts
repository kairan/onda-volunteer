const CHURCH_KEY = 'onda:activeChurchId';
const CAMPUS_KEY = 'onda:activeCampusId';
const MINISTRY_KEY = 'onda:activeMinistryId';

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
