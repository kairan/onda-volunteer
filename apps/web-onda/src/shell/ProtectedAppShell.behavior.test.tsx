import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthSessionTestProvider } from '@/auth/AuthSessionProvider';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { ProtectedAppShell } from '@/shell/ProtectedAppShell';
import * as supabaseModule from '@/supabaseClient';

vi.mock('@/supabaseClient', () => ({
  getSupabaseClient: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderAuthGate() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthSessionTestProvider state={{ status: 'unauthenticated' }}>
          <ProtectedAppShell>
            <p>Protected content</p>
          </ProtectedAppShell>
        </AuthSessionTestProvider>
      </I18nProvider>
    </QueryClientProvider>,
  );
}

describe('AuthGateLayout', () => {
  it('shows brand gradient background and branco wordmark with solid auth form', async () => {
    await initI18n(undefined, 'en');
    vi.mocked(supabaseModule.getSupabaseClient).mockReturnValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
      },
    } as never);

    renderAuthGate();

    const layout = screen.getByTestId('auth-gate-layout');
    expect(layout.className).toContain('auth-brand-gradient');
    expect(layout.className).not.toContain('bg-background');

    const wordmark = screen.getByRole('img', { name: /igreja onda/i });
    expect(wordmark.getAttribute('src')).toMatch(/logo-igreja-onda-branco/);

    const authPanel = screen.getByRole('complementary');
    expect(authPanel.className).toContain('bg-surface');
    expect(authPanel.className).not.toContain('backdrop-blur');
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });
});
