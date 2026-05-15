import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { buildTestRouteTree } from '@/router.testUtils';

afterEach(() => {
  cleanup();
});

describe('App shell routing', () => {
  it('renders /dashboard inside the shell with skip link targeting main', async () => {
    await initI18n();
    const { routeTree } = buildTestRouteTree();
    const history = createMemoryHistory({ initialEntries: ['/dashboard'] });
    const routed = createRouter({ routeTree, history });

    render(
      <I18nProvider>
        <RouterProvider router={routed} />
      </I18nProvider>,
    );

    const skip = await screen.findByRole('link', { name: /conteúdo principal/i });
    expect(skip).toHaveAttribute('href', '#main');
    const main = document.getElementById('main');
    expect(main).toBeTruthy();
    expect(within(main!).getByRole('heading', { level: 1 })).toHaveTextContent(
      'Painel',
    );
  });

  it('keeps legacy / home outside the shell chrome', async () => {
    await initI18n();
    const { routeTree } = buildTestRouteTree();
    const history = createMemoryHistory({ initialEntries: ['/'] });
    const routed = createRouter({ routeTree, history });

    render(
      <I18nProvider>
        <RouterProvider router={routed} />
      </I18nProvider>,
    );

    expect(await screen.findByRole('heading', { name: /volunteer roster/i })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument();
  });

  it('still mounts the event detail route', async () => {
    await initI18n();
    const { routeTree, eventLoader } = buildTestRouteTree();
    eventLoader.mockImplementation(async () => ({
      church: { name: 'Demo Church', defaultTimezone: 'America/Sao_Paulo' },
      event: {
        id: 'evt-1',
        title: 'Sunday',
        kind: 'PUBLIC',
        window: { startsAtUtc: '2026-01-01T10:00:00Z', endsAtUtc: '2026-01-01T12:00:00Z' },
        framing: {
          churchDefaultTimezone: 'America/Sao_Paulo',
          startsDisplayInChurchTz: '07:00',
          endsDisplayInChurchTz: '09:00',
        },
      },
      ministry: null,
      assignments: [],
    }));
    const history = createMemoryHistory({ initialEntries: ['/events/evt-1'] });
    const routed = createRouter({ routeTree, history });

    render(
      <I18nProvider>
        <RouterProvider router={routed} />
      </I18nProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Sunday' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument();
  });
});
