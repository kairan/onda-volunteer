import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  OrganizationProvider,
  useOrganization,
} from './OrganizationProvider';
import * as fetchOrgContext from './fetchOrganizationContext';
import { ministriesForShellSwitcher } from './ministryArchive';
import { clearStoredOrganizationSelection, readStoredActiveChurchId } from './organizationContextStorage';
import { queryKeys } from '@/query/queryKeys';

vi.mock('./fetchOrganizationContext');

const churches = [
  {
    id: 'church-a',
    name: 'Alpha Church',
    defaultTimezone: 'UTC',
    isAccreditedAdmin: false,
    campuses: [{ id: 'campus-a1', name: 'Main', timezone: 'UTC' }],
    ministries: [
      { id: 'min-active', name: 'Active Ministry' },
      { id: 'min-archived', name: 'Archived Ministry', archivedAt: '2026-01-01' },
    ],
  },
  {
    id: 'church-b',
    name: 'Beta Church',
    defaultTimezone: 'UTC',
    isAccreditedAdmin: true,
    campuses: [{ id: 'campus-b1', name: 'Downtown', timezone: 'UTC' }],
    ministries: [{ id: 'min-b1', name: 'Beta Ministry' }],
  },
];

function OrgProbe() {
  const org = useOrganization();
  return (
    <div>
      <span data-testid="loading">{String(org.loading)}</span>
      <span data-testid="church">{org.activeChurchId ?? ''}</span>
      <span data-testid="ministry">{org.activeMinistryId ?? ''}</span>
      <button type="button" onClick={() => org.onChurchChange('church-b')}>
        switch church
      </button>
      <button type="button" onClick={() => void org.refresh()}>
        refresh
      </button>
    </div>
  );
}

function renderWithQueryClient(client = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  return render(
    <QueryClientProvider client={client}>
      <OrganizationProvider enabled>
        <OrgProbe />
      </OrganizationProvider>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  clearStoredOrganizationSelection();
  vi.clearAllMocks();
});

describe('OrganizationProvider', () => {
  it('throws when useOrganization is called outside the provider', () => {
    function Orphan() {
      useOrganization();
      return null;
    }
    expect(() => render(<Orphan />)).toThrow(
      'useOrganization must be used within OrganizationProvider',
    );
  });

  it('loads initial church and ministry from API', async () => {
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue({
      churches,
    });

    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('church').textContent).toBe('church-a');
    expect(screen.getByTestId('ministry').textContent).toBe('min-active');
  });

  it('onChurchChange updates selection and storage', async () => {
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue({
      churches,
    });

    const user = userEvent.setup();
    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByTestId('church').textContent).toBe('church-a');
    });

    await user.click(screen.getByRole('button', { name: 'switch church' }));

    expect(screen.getByTestId('church').textContent).toBe('church-b');
    expect(screen.getByTestId('ministry').textContent).toBe('min-b1');
    expect(readStoredActiveChurchId()).toBe('church-b');
  });

  it('ministriesForShellSwitcher hides archived ministries for non-admins', () => {
    const visible = ministriesForShellSwitcher(churches[0]!.ministries, false);
    expect(visible.map((m) => m.id)).toEqual(['min-active']);
    const adminVisible = ministriesForShellSwitcher(churches[0]!.ministries, true);
    expect(adminVisible.map((m) => m.id)).toEqual(['min-active', 'min-archived']);
  });

  it('refresh invalidates organization context query', async () => {
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue({
      churches,
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');

    const user = userEvent.setup();
    renderWithQueryClient(client);

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    await user.click(screen.getByRole('button', { name: 'refresh' }));

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.organizationContext(),
      });
    });
  });
});
