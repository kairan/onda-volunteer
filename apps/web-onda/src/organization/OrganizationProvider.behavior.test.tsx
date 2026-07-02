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
      { id: 'min-active', name: 'Active Ministry', membershipStatus: 'ACTIVE' as const },
      { id: 'min-archived', name: 'Archived Ministry', archivedAt: '2026-01-01', membershipStatus: 'ACTIVE' as const },
    ],
  },
  {
    id: 'church-b',
    name: 'Beta Church',
    defaultTimezone: 'UTC',
    isAccreditedAdmin: true,
    campuses: [{ id: 'campus-b1', name: 'Downtown', timezone: 'UTC' }],
    ministries: [{ id: 'min-b1', name: 'Beta Ministry', membershipStatus: 'ACTIVE' as const }],
  },
];

function OrgProbe() {
  const org = useOrganization();
  return (
    <div>
      <span data-testid="loading">{String(org.loading)}</span>
      <span data-testid="error">{org.error ?? ''}</span>
      <span data-testid="church">{org.activeChurchId ?? ''}</span>
      <span data-testid="ministry">{org.activeMinistryId ?? ''}</span>
      <span data-testid="working-mode">{org.workingContext?.mode ?? ''}</span>
      <span data-testid="church-count">{String(org.churches.length)}</span>
      <button type="button" onClick={() => org.onChurchChange('church-b')}>
        switch church
      </button>
      <button type="button" onClick={() => void org.refresh()}>
        refresh
      </button>
      <button
        type="button"
        onClick={() =>
          org.onWorkingContextChange({
            ministryId: 'min-kids',
            mode: 'volunteer',
          })
        }
      >
        switch context
      </button>
    </div>
  );
}

function renderWithQueryClient(
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  props: {
    enabled?: boolean;
    sessionVolunteerId?: string | null;
    devVolunteerId?: string;
  } = {},
) {
  const { enabled = true, sessionVolunteerId = null, devVolunteerId } = props;
  return render(
    <QueryClientProvider client={client}>
      <OrganizationProvider
        enabled={enabled}
        sessionVolunteerId={sessionVolunteerId}
        devVolunteerId={devVolunteerId}
      >
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
    expect(screen.getByTestId('working-mode').textContent).toBe('volunteer');
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

  it('onWorkingContextChange updates active ministry and invalidates leader queries', async () => {
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue({
      churches: [
        {
          ...churches[0]!,
          ministries: [
            {
              id: 'min-louvor',
              name: 'Louvor',
              isLeader: true,
              membershipStatus: 'ACTIVE',
            },
            { id: 'min-kids', name: 'Kids', membershipStatus: 'ACTIVE' },
          ],
        },
      ],
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');

    const user = userEvent.setup();
    renderWithQueryClient(client);

    await waitFor(() => {
      expect(screen.getByTestId('working-mode').textContent).toBe('leader');
    });

    await user.click(screen.getByRole('button', { name: 'switch context' }));

    await waitFor(() => {
      expect(screen.getByTestId('ministry').textContent).toBe('min-kids');
      expect(screen.getByTestId('working-mode').textContent).toBe('volunteer');
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['events'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['event-detail'] });
  });

  it('ministriesForShellSwitcher hides archived ministries for non-admins', () => {
    const visible = ministriesForShellSwitcher(churches[0]!.ministries, false);
    expect(visible.map((m) => m.id)).toEqual(['min-active']);
    const adminVisible = ministriesForShellSwitcher(churches[0]!.ministries, true);
    expect(adminVisible.map((m) => m.id)).toEqual(['min-active', 'min-archived']);
  });

  it('refresh invalidates organization context query and re-resolves selection', async () => {
    vi.mocked(fetchOrgContext.fetchOrganizationContext)
      .mockResolvedValueOnce({ churches })
      .mockResolvedValueOnce({
        churches: [
          {
            ...churches[0]!,
            ministries: [
              {
                id: 'min-active',
                name: 'Active Ministry',
                archivedAt: '2026-06-01',
                membershipStatus: 'ACTIVE',
              },
              { id: 'min-other', name: 'Other Ministry', membershipStatus: 'ACTIVE' },
            ],
          },
          churches[1]!,
        ],
      });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');

    const user = userEvent.setup();
    renderWithQueryClient(client);

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('ministry').textContent).toBe('min-active');

    await user.click(screen.getByRole('button', { name: 'refresh' }));

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.organizationContext(null),
        refetchType: 'none',
      });
      expect(screen.getByTestId('ministry').textContent).toBe('min-other');
    });
  });

  it('partitions cache by sessionVolunteerId', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockImplementation(
      async () => ({ churches: [churches[0]!] }),
    );

    const { unmount } = renderWithQueryClient(client, {
      sessionVolunteerId: 'vol-a',
    });

    await waitFor(() => {
      expect(screen.getByTestId('church').textContent).toBe('church-a');
    });

    unmount();
    cleanup();

    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockImplementation(
      async () => ({ churches: [churches[1]!] }),
    );

    renderWithQueryClient(client, { sessionVolunteerId: 'vol-b' });

    await waitFor(() => {
      expect(screen.getByTestId('church').textContent).toBe('church-b');
      expect(screen.getByTestId('ministry').textContent).toBe('min-b1');
    });
    expect(fetchOrgContext.fetchOrganizationContext).toHaveBeenCalledTimes(2);
  });

  it('clears selection and churches on fetch failure', async () => {
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockRejectedValue(
      new Error('Network error'),
    );

    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('error').textContent).toBe('Network error');
    expect(screen.getByTestId('church').textContent).toBe('');
    expect(screen.getByTestId('church-count').textContent).toBe('0');
  });

  it('clears selection when refresh rejects', async () => {
    vi.mocked(fetchOrgContext.fetchOrganizationContext)
      .mockResolvedValueOnce({ churches })
      .mockRejectedValueOnce(new Error('Refresh failed'));

    const user = userEvent.setup();
    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByTestId('church').textContent).toBe('church-a');
    });

    await user.click(screen.getByRole('button', { name: 'refresh' }));

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('Refresh failed');
      expect(screen.getByTestId('church').textContent).toBe('');
      expect(screen.getByTestId('church-count').textContent).toBe('0');
    });
  });

  it('re-bootstraps selection when devVolunteerId changes', async () => {
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockImplementation(
      async (input) => {
        if (input?.volunteerId === 'vol-b') {
          return { churches: [churches[1]!] };
        }
        return { churches: [churches[0]!] };
      },
    );

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { rerender } = render(
      <QueryClientProvider client={client}>
        <OrganizationProvider enabled devVolunteerId="vol-a" sessionVolunteerId="vol-a">
          <OrgProbe />
        </OrganizationProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('church').textContent).toBe('church-a');
    });

    rerender(
      <QueryClientProvider client={client}>
        <OrganizationProvider enabled devVolunteerId="vol-b" sessionVolunteerId="vol-b">
          <OrgProbe />
        </OrganizationProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('church').textContent).toBe('church-b');
      expect(screen.getByTestId('ministry').textContent).toBe('min-b1');
    });
  });
});
