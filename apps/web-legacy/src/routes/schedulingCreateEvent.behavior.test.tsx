import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { changeLocale, initI18n } from '@/i18n/controller';
import { SchedulingCreateEventPage } from './schedulingCreateEvent';

const mockOrganization = {
  activeChurch: {
    id: 'church-1',
    name: 'Onda Dura',
    isAccreditedAdmin: true,
    defaultTimezone: 'America/Sao_Paulo',
  },
  activeCampus: null as { id: string; name: string; timezone: string } | null,
};

vi.mock('@/auth/AuthSessionProvider', () => ({
  useAuthSession: () => ({ status: 'dev-bypass', volunteerId: 'vol-1' }),
}));

vi.mock('@/organization/OrganizationContextProvider', () => ({
  useOrganization: () => mockOrganization,
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
}));

afterEach(() => {
  cleanup();
  mockOrganization.activeCampus = null;
});

function renderPage() {
  return render(
    <I18nProvider>
      <SchedulingCreateEventPage />
    </I18nProvider>,
  );
}

describe('SchedulingCreateEventPage timezone copy', () => {
  it('names campus timezone when an active campus is selected', async () => {
    await initI18n();
    await changeLocale('en');
    mockOrganization.activeCampus = {
      id: 'campus-porto',
      name: 'Campus Porto',
      timezone: 'Europe/Lisbon',
    };

    renderPage();

    expect(
      screen.getByText(/campus timezone \(Europe\/Lisbon\).*Onda Dura/i),
    ).toBeInTheDocument();
  });

  it('names church default timezone when no campus is active', async () => {
    await initI18n();
    await changeLocale('en');

    renderPage();

    expect(
      screen.getByText(/church default timezone \(America\/Sao_Paulo\).*Onda Dura/i),
    ).toBeInTheDocument();
  });
});
