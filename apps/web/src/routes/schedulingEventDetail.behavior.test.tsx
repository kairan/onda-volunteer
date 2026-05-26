import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import { SchedulingEventDetailView } from './schedulingEventDetail';
import type { EventDetailPayload } from '@/eventDetailPayload';

vi.mock('@/auth/AuthSessionProvider', () => ({
  useAuthSession: () => ({ status: 'dev-bypass', volunteerId: 'vol-demo' }),
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useRouter: () => ({ invalidate: async () => {} }),
}));

vi.mock('@/feedback/ToastHost', () => ({
  useToasts: () => ({ push: vi.fn() }),
}));

const payload: EventDetailPayload = {
  church: { name: 'Demo Church', defaultTimezone: 'America/New_York' },
  event: {
    id: 'evt-1',
    kind: 'PUBLIC',
    title: 'Sunday Service',
    window: {
      startsAtUtc: '2026-06-01T14:00:00.000Z',
      endsAtUtc: '2026-06-01T16:00:00.000Z',
    },
  },
  ministry: null,
  assignments: [
    {
      id: 'asg-1',
      ministry: { id: 'min-1', name: 'Band' },
      volunteer: { id: 'vol-other', displayName: 'Alex' },
      role: { id: 'role-1', name: 'Guitar' },
      window: {
        startsAtUtc: '2026-06-01T14:30:00.000Z',
        endsAtUtc: '2026-06-01T15:30:00.000Z',
      },
    },
  ],
};

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe('SchedulingEventDetailView dual time', () => {
  it('shows personal-local companion when toggle is on and zones differ', async () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      ...new Intl.DateTimeFormat().resolvedOptions(),
      timeZone: 'Europe/London',
    });

    await initI18n();
    sessionStorage.setItem('onda.useLocalTime', 'true');

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <SchedulingEventDetailView data={payload} />
        </LocalTimeProvider>
      </I18nProvider>,
    );

    expect(screen.getAllByText(/Seu horário:/i).length).toBeGreaterThan(0);
  });

  it('hides personal-local line when toggle is off', async () => {
    await initI18n();
    sessionStorage.setItem('onda.useLocalTime', 'false');

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <SchedulingEventDetailView data={payload} />
        </LocalTimeProvider>
      </I18nProvider>,
    );

    expect(screen.queryByText(/Seu horário:/i)).toBeNull();
    expect(screen.getByText('Sunday Service')).toBeInTheDocument();
  });
});
