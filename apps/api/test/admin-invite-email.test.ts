import {
  displayNameFromInviteEmail,
  normalizeAdminInviteEmail,
} from '../src/system-admin/admin-invite-email';

describe('admin invite email helpers', () => {
  it('normalizes valid emails', () => {
    expect(normalizeAdminInviteEmail('  Admin@Example.COM ')).toBe(
      'admin@example.com',
    );
  });

  it('rejects invalid emails', () => {
    expect(normalizeAdminInviteEmail('not-an-email')).toBeNull();
    expect(normalizeAdminInviteEmail('')).toBeNull();
  });

  it('builds a display name from the local part', () => {
    expect(displayNameFromInviteEmail('new.admin@example.com')).toBe('New Admin');
  });
});
