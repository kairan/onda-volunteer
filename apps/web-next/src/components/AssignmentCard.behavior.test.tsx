import type { ReactElement } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import { AssignmentCard, AssignmentCardSkeleton } from './AssignmentCard';

async function renderWithRouter(ui: ReactElement) {
  const rootRoute = createRootRoute({
    component: () => ui,
  });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  render(
    <I18nProvider>
      <LocalTimeProvider>
        <RouterProvider router={router} />
      </LocalTimeProvider>
    </I18nProvider>,
  );
  await router.load();
}

afterEach(() => {
  cleanup();
});

describe('AssignmentCard', () => {
  it('renders event title, ministry · role, and localized time', async () => {
    await initI18n(undefined, 'en');
    await renderWithRouter(
      <AssignmentCard
        eventId="evt-1"
        eventTitle="Sunday Service"
        ministryName="Worship"
        roleName="Greeter"
        timeLabels={{ church: 'Sun, Jun 22 · 9:00 AM' }}
      />,
    );

    expect(screen.getByText('Sunday Service')).toBeInTheDocument();
    expect(screen.getByText('Worship · Greeter')).toBeInTheDocument();
    expect(screen.getByText('Sun, Jun 22 · 9:00 AM')).toBeInTheDocument();
  });

  it('shows confirmed badge for rostered assignments', async () => {
    await initI18n(undefined, 'en');
    await renderWithRouter(
      <AssignmentCard
        eventId="evt-1"
        eventTitle="Sunday Service"
        ministryName="Worship"
        roleName="Greeter"
        timeLabels={{ church: 'Sun, Jun 22 · 9:00 AM' }}
        status="ROSTERED"
      />,
    );

    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });

  it('renders skeleton placeholders without layout-breaking text', async () => {
    await initI18n(undefined, 'en');
    const { container } = render(
      <I18nProvider>
        <AssignmentCardSkeleton />
      </I18nProvider>,
    );

    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
    expect(screen.queryByText('Confirmed')).not.toBeInTheDocument();
  });
});
