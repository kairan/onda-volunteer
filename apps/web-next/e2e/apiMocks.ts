import type { Page } from '@playwright/test';

const smokeOrganizationContext = {
  churches: [
    {
      id: 'seed-church-demo',
      name: 'Igreja Central',
      defaultTimezone: 'America/Sao_Paulo',
      isAccreditedAdmin: false,
      campuses: [
        { id: 'seed-campus-central-sede', name: 'Sede', timezone: 'America/Sao_Paulo' },
      ],
      ministries: [
        {
          id: 'seed-ministry-demo',
          name: 'Hospitality',
          membershipStatus: 'ACTIVE',
          isLeader: true,
        },
        {
          id: 'seed-ministry-technical',
          name: 'Technical',
          membershipStatus: 'ACTIVE',
          isLeader: true,
        },
      ],
    },
  ],
};

const smokeIdentityMe = {
  volunteer: {
    id: 'seed-volunteer-demo',
    displayName: 'Demo Volunteer',
    uiLocale: 'en',
  },
  authSubjectId: null,
  isSystemAdmin: false,
  newlyFulfilledInvites: [],
};

const smokeEvents = [
  {
    id: 'seed-event-public',
    kind: 'PUBLIC',
    title: 'Sunday Gathering',
    window: {
      startsAtUtc: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      endsAtUtc: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    },
    framing: {
      churchDefaultTimezone: 'America/Sao_Paulo',
      startsDisplayInChurchTz: '10:00',
      endsDisplayInChurchTz: '12:00',
    },
    ministry: null,
  },
];

const smokeEventDetail = {
  church: {
    id: 'seed-church-demo',
    name: 'Igreja Central',
    defaultTimezone: 'America/Sao_Paulo',
  },
  event: {
    id: 'seed-event-public',
    kind: 'PUBLIC',
    title: 'Sunday Gathering',
    window: {
      startsAtUtc: '2026-06-28T13:00:00.000Z',
      endsAtUtc: '2026-06-28T15:00:00.000Z',
    },
    framing: {
      churchDefaultTimezone: 'America/Sao_Paulo',
      startsDisplayInChurchTz: '10:00',
      endsDisplayInChurchTz: '12:00',
    },
    cancelledAtUtc: null,
  },
  ministry: null,
  assignments: [
    {
      id: 'seed-assignment-public-greeter',
      volunteer: { id: 'seed-volunteer-demo', displayName: 'Demo Volunteer' },
      ministry: { id: 'seed-ministry-demo', name: 'Hospitality' },
      role: { id: 'seed-role-greeter', name: 'Greeter' },
      window: {
        startsAtUtc: '2026-06-28T14:00:00.000Z',
        endsAtUtc: '2026-06-28T15:00:00.000Z',
      },
    },
  ],
  roleCapacities: [],
};

const smokePrivateMultiSlotEventDetail = {
  church: {
    id: 'seed-church-demo',
    name: 'Igreja Central',
    defaultTimezone: 'America/Sao_Paulo',
  },
  event: {
    id: 'seed-event-private',
    kind: 'PRIVATE',
    title: 'Technical Rehearsal',
    window: {
      startsAtUtc: '2026-06-28T18:00:00.000Z',
      endsAtUtc: '2026-06-28T20:00:00.000Z',
    },
    framing: {
      churchDefaultTimezone: 'America/Sao_Paulo',
      startsDisplayInChurchTz: '15:00',
      endsDisplayInChurchTz: '17:00',
    },
    cancelledAtUtc: null,
  },
  ministry: { id: 'seed-ministry-technical', name: 'Technical' },
  roleCapacities: [
    {
      ministryId: 'seed-ministry-technical',
      roleId: 'seed-role-audio',
      capacity: 2,
    },
  ],
  assignments: [
    {
      id: 'seed-assignment-audio-1',
      volunteer: { id: 'seed-volunteer-a', displayName: 'Alex Audio' },
      ministry: { id: 'seed-ministry-technical', name: 'Technical' },
      role: { id: 'seed-role-audio', name: 'Audio' },
      window: {
        startsAtUtc: '2026-06-28T18:30:00.000Z',
        endsAtUtc: '2026-06-28T19:30:00.000Z',
      },
    },
    {
      id: 'seed-assignment-audio-2',
      volunteer: { id: 'seed-volunteer-b', displayName: 'Blake Audio' },
      ministry: { id: 'seed-ministry-technical', name: 'Technical' },
      role: { id: 'seed-role-audio', name: 'Audio' },
      window: {
        startsAtUtc: '2026-06-28T18:30:00.000Z',
        endsAtUtc: '2026-06-28T19:30:00.000Z',
      },
    },
  ],
};

const smokeRoles = [
  { id: 'seed-role-greeter', name: 'Greeter', retired: false },
  { id: 'seed-role-audio', name: 'Audio', retired: false },
];

export function shouldUseSmokeApiMocks(): boolean {
  return process.env.PLAYWRIGHT_WITH_API !== 'true';
}

function isApiEventDetailRequest(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.port === '3000' &&
      parsed.pathname.startsWith('/events/') &&
      !parsed.pathname.includes('/assignments') &&
      !parsed.pathname.includes('/role-capacities') &&
      parsed.pathname.split('/').length === 3
    );
  } catch {
    return false;
  }
}

export async function installSmokeApiMocks(page: Page): Promise<void> {
  if (!shouldUseSmokeApiMocks()) {
    return;
  }

  await page.route('**/organization/context', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(smokeOrganizationContext),
    });
  });

  await page.route('**/identity/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(smokeIdentityMe),
    });
  });

  await page.route(/\/events(\?|$)/, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(smokeEvents),
    });
  });

  await page.route((url) => isApiEventDetailRequest(url), async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    const eventId = new URL(route.request().url()).pathname.split('/')[2];
    const body =
      eventId === 'seed-event-private'
        ? smokePrivateMultiSlotEventDetail
        : smokeEventDetail;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });

  await page.route(/\/ministries\/([^/]+)\/roles/, async (route) => {
    const ministryId = route
      .request()
      .url()
      .match(/\/ministries\/([^/]+)\/roles/)?.[1];
    const roles =
      ministryId === 'seed-ministry-technical'
        ? [{ id: 'seed-role-audio', name: 'Audio', retired: false }]
        : smokeRoles;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(roles),
    });
  });

  await page.route(/\/ministries\/[^/]+\/memberships/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          volunteerId: 'seed-volunteer-hospitality',
          displayName: 'Hospitality Volunteer',
          status: 'ACTIVE',
        },
      ]),
    });
  });

  await page.route(/\/volunteers\/[^/]+\/assignments/, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route(/\/volunteers\/[^/]+\/unavailability/, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
}
