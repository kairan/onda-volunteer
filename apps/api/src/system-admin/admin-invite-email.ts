const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeAdminInviteEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!email || !EMAIL_PATTERN.test(email)) {
    return null;
  }
  return email;
}

export function displayNameFromInviteEmail(email: string): string {
  const local = email.split('@')[0] ?? email;
  const segment = local.replace(/[._-]+/g, ' ').trim();
  if (!segment) {
    return email;
  }
  return segment
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
