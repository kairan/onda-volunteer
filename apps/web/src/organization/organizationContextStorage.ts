const CHURCH_KEY = 'onda:activeChurchId';
const CAMPUS_KEY = 'onda:activeCampusId';

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

export function setStoredOrganizationSelection(
  churchId: string | null,
  campusId: string | null,
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
  } catch {
    // ignore quota / private mode
  }
}

export function clearStoredOrganizationSelection(): void {
  setStoredOrganizationSelection(null, null);
}
