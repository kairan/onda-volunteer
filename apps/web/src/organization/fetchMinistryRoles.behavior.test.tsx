import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchMinistryRoles } from './fetchMinistryRoles';

const mockFetchJson = vi.fn();

vi.mock('@/apiAuthHeaders', () => ({
  fetchJsonWithProtectedHeaders: (...args: unknown[]) => mockFetchJson(...args),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('fetchMinistryRoles', () => {
  it('requests ministry roles with protected headers', async () => {
    mockFetchJson.mockResolvedValue([
      { id: 'role-1', name: 'Greeter', retired: false },
      { id: 'role-2', name: 'Legacy', retired: true },
    ]);

    const rows = await fetchMinistryRoles({
      ministryId: 'min-1',
      actingVolunteerId: 'vol-leader',
    });

    expect(mockFetchJson).toHaveBeenCalledWith(
      'http://localhost:3000/ministries/min-1/roles',
      {
        volunteerId: 'vol-leader',
        leaderMinistryId: 'min-1',
      },
    );
    expect(rows).toEqual([
      { id: 'role-1', name: 'Greeter', retired: false },
      { id: 'role-2', name: 'Legacy', retired: true },
    ]);
  });
});
