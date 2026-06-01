import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { AuthSessionTestProvider } from '@/auth/AuthSessionProvider';
import { ToastProvider } from '@/feedback/ToastHost';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { fetchIdentityMe } from '@/identity/fetchIdentityMe';
import { buildTestRouteTree } from '@/router.testUtils';
import { createAdminInvite } from './createAdminInvite';
import { fetchSystemAdminChurch } from './fetchSystemAdminChurches';

vi.mock('@/identity/fetchIdentityMe', () => ({
  fetchIdentityMe: vi.fn(),
}));

vi.mock('@/organization/fetchOrganizationContext', () => ({
  fetchOrganizationContext: vi.fn(async () => ({ churches: [] })),
}));

vi.mock('./fetchSystemAdminChurches', () => ({
  fetchSystemAdminChurches: vi.fn(),
  fetchSystemAdminChurch: vi.fn(),
}));

vi.mock('./createAdminInvite', () => ({
  createAdminInvite: vi.fn(),
}));

const fetchIdentityMeMock = vi.mocked(fetchIdentityMe);
const fetchSystemAdminChurchMock = vi.mocked(fetchSystemAdminChurch);
const createAdminInviteMock = vi.mocked(createAdminInvite);

function renderChurchDetail(initialPath = '/system-admin/churches/ch-1') {
  const { routeTree } = buildTestRouteTree();
  const history = createMemoryHistory({ initialEntries: [initialPath] });
  const routed = createRouter({ routeTree, history });
  render(
    <I18nProvider>
      <ToastProvider>
        <AuthSessionTestProvider
          state={{ status: 'dev-bypass', volunteerId: 'seed-volunteer-system-admin' }}
        >
          <RouterProvider router={routed} />
        </AuthSessionTestProvider>
      </ToastProvider>
    </I18nProvider>,
  );
  return { history };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('System Admin admin invite form', () => {
  it('submits an invite and shows success feedback', async () => {
    await initI18n();
    fetchIdentityMeMock.mockResolvedValue({
      volunteer: {
        id: 'seed-volunteer-system-admin',
        displayName: 'System Operator',
        uiLocale: null,
      },
      authSubjectId: null,
      isSystemAdmin: true,
    });
    fetchSystemAdminChurchMock.mockResolvedValue({
      id: 'ch-1',
      name: 'Test Church',
      defaultTimezone: 'America/Sao_Paulo',
    });
    createAdminInviteMock.mockResolvedValue({
      id: 'invite-1',
      email: 'admin@example.com',
      churchId: 'ch-1',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    });

    const user = userEvent.setup();
    renderChurchDetail();

    expect(
      await screen.findByRole('heading', { name: /test church/i }),
    ).toBeInTheDocument();

    await user.type(
      screen.getByLabelText(/email|e-mail/i),
      'admin@example.com',
    );
    await user.click(
      screen.getByRole('button', { name: /send invite|enviar convite/i }),
    );

    await waitFor(() => {
      expect(createAdminInviteMock).toHaveBeenCalledWith({
        churchId: 'ch-1',
        email: 'admin@example.com',
      });
    });

    expect(
      await screen.findByText(/admin invite sent|convite de admin enviado/i),
    ).toBeInTheDocument();
  });

  it('shows invalid email copy from API errors', async () => {
    await initI18n();
    fetchIdentityMeMock.mockResolvedValue({
      volunteer: {
        id: 'seed-volunteer-system-admin',
        displayName: 'System Operator',
        uiLocale: null,
      },
      authSubjectId: null,
      isSystemAdmin: true,
    });
    fetchSystemAdminChurchMock.mockResolvedValue({
      id: 'ch-1',
      name: 'Test Church',
      defaultTimezone: 'America/Sao_Paulo',
    });
    const { ApiRequestError } = await import('@/apiError');
    createAdminInviteMock.mockRejectedValue(
      new ApiRequestError(400, 'Invalid', 'ADMIN_INVITE_INVALID'),
    );

    const user = userEvent.setup();
    renderChurchDetail();

    await screen.findByRole('heading', { name: /test church/i });
    await user.type(screen.getByLabelText(/email|e-mail/i), 'user@domain');
    await user.click(
      screen.getByRole('button', { name: /send invite|enviar convite/i }),
    );

    expect(
      await screen.findByText(/valid email|e-mail válido/i),
    ).toBeInTheDocument();
  });
});
