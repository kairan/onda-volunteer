import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { SchedulingEventDetailView } from './schedulingEventDetail';
import type { EventDetailPayload } from '@/eventDetailPayload';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useRouter: () => ({ invalidate: async () => {} }),
}));

vi.mock('@/auth/AuthSessionProvider', () => ({
  useAuthSession: () => ({ status: 'dev-bypass', volunteerId: 'seed-volunteer-demo' }),
}));

vi.mock('@/organization/OrganizationContextProvider', () => ({
  useOrganization: () => ({ activeChurch: { isAccreditedAdmin: false } }),
}));

vi.mock('@/settings/LocalTimeProvider', () => ({
  useLocalTimeContext: () => ({
    buildDualInterval: () => ({ primary: '10:00', secondary: null }),
  }),
}));

vi.mock('@/feedback/ToastHost', () => ({
  useToasts: () => ({ push: vi.fn() }),
}));

const payload: EventDetailPayload = {
  church: {
    id: 'church-demo',
    name: 'Demo Church',
    defaultTimezone: 'America/Sao_Paulo',
  },
  event: {
    id: 'evt-1',
    title: 'Sunday Gathering',
    kind: 'PUBLIC',
    window: {
      startsAtUtc: '2026-06-01T14:00:00.000Z',
      endsAtUtc: '2026-06-01T16:00:00.000Z',
    },
    framing: {
      churchDefaultTimezone: 'America/Sao_Paulo',
      startsDisplayInChurchTz: '11:00',
      endsDisplayInChurchTz: '13:00',
    },
    cancelledAtUtc: null,
  },
  ministry: null,
  assignments: [
    {
      id: 'asg-1',
      volunteer: { id: 'v1', displayName: 'Demo Volunteer' },
      ministry: { id: 'm1', name: 'Hospitality' },
      role: { id: 'r1', name: 'Greeter' },
      window: {
        startsAtUtc: '2026-06-01T14:00:00.000Z',
        endsAtUtc: '2026-06-01T16:00:00.000Z',
      },
    },
  ],
};

describe('SchedulingEventDetailView roster table', () => {
  it('uses dense HOPE table framing for readability', async () => {
    await initI18n();
    const { container } = render(
      <I18nProvider>
        <SchedulingEventDetailView data={payload} />
      </I18nProvider>,
    );

    const table = screen.getByRole('table');
    expect(table.className).toContain('min-w-[640px]');
    expect(table.className).toContain('border-collapse');

    const wrapper = table.parentElement;
    expect(wrapper?.className).toContain('border-2');
    expect(wrapper?.className).toContain('border-border');

    const headerRow = container.querySelector('thead tr');
    expect(headerRow?.className).toContain('bg-surface-2');
    expect(headerRow?.className).toContain('border-b-2');
  });
});
