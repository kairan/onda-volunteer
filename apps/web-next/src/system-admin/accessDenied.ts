const STORAGE_KEY = 'onda.systemAdmin.accessDenied';

export function markSystemAdminAccessDenied(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // ignore storage failures (private mode, SSR)
  }
}

export function consumeSystemAdminAccessDenied(): boolean {
  try {
    if (sessionStorage.getItem(STORAGE_KEY) !== '1') {
      return false;
    }
    sessionStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
