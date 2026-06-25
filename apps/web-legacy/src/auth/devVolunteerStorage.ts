export const DEV_VOLUNTEER_STORAGE_KEY = 'onda:devVolunteerId';

export function readStoredDevVolunteerId(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    const value = window.localStorage.getItem(DEV_VOLUNTEER_STORAGE_KEY)?.trim();
    return value || undefined;
  } catch {
    return undefined;
  }
}

export function setStoredDevVolunteerId(volunteerId: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(DEV_VOLUNTEER_STORAGE_KEY, volunteerId);
  } catch {
    // ignore quota / private mode
  }
}

export function clearStoredDevVolunteerId(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.removeItem(DEV_VOLUNTEER_STORAGE_KEY);
  } catch {
    // ignore
  }
}
