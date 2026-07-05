import '@/test/volunteerRouteTestSetup';
import { cleanup, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { initI18n } from '@/i18n/controller';
import { fetchIdentityMe } from '@/identity/fetchIdentityMe';
import { systemAdminIdentityMeFixture } from '@/identity/testFixtures';
import { getJsonMock } from '@/test/volunteerRouteTestSetup';
import { renderSystemAdminRoute } from '@/test/systemAdminRouteTestUtils';

vi.mock('@/identity/fetchIdentityMe', () => ({
  fetchIdentityMe: vi.fn(),
}));

vi.mock('@/organization/fetchOrganizationContext', () => ({
  fetchOrganizationContext: vi.fn(async () => ({ churches: [] })),
}));

const fetchIdentityMeMock = vi.mocked(fetchIdentityMe);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('SystemAdminSchedulingPage', () => {
  it('lists events read-only without write actions', async () => {
    await initI18n(undefined, 'en');
    fetchIdentityMeMock.mockResolvedValue(systemAdminIdentityMeFixture());

    getJsonMock.mockImplementation(async (path: string) => {
      if (path.startsWith('/events')) {
        return [
          {
            id: 'event-1',
            kind: 'PUBLIC',
            title: 'Sunday Service',
            window: {
              startsAtUtc: '2026-06-01T14:00:00.000Z',
              endsAtUtc: '2026-06-01T16:00:00.000Z',
            },
            framing: {
              churchDefaultTimezone: 'UTC',
              startsDisplayInChurchTz: '2026-06-01T14:00:00+00:00',
              endsDisplayInChurchTz: '2026-06-01T16:00:00+00:00',
            },
            ministry: null,
            church: { id: 'church-1', name: 'Alpha Church' },
          },
        ];
      }
      throw new Error(`Unexpected getJson path: ${path}`);
    });

    await renderSystemAdminRoute('/system-admin/scheduling');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /scheduling support/i,
      }),
    ).toBeInTheDocument();

    expect(await screen.findByText('Sunday Service')).toBeInTheDocument();
    expect(
      screen.getByText(/organizational default timezone/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/read-only/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: /create/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /assign/i })).not.toBeInTheDocument();

    await waitFor(() => {
      expect(getJsonMock).toHaveBeenCalledWith('/events', expect.any(Object));
    });
  });
});
