/** True when Supabase session expiry (seconds) is still in the future. */
export function isAccessTokenUsable(expiresAtSec: number | undefined): boolean {
  if (expiresAtSec === undefined) {
    return true;
  }
  return expiresAtSec * 1000 > Date.now();
}
