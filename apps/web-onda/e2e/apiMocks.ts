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
};

const smokeRoles = [{ id: 'seed-role-greeter', name: 'Greeter', retired: false }];

export function shouldUseSmokeApiMocks(): boolean {
  return process.env.PLAYWRIGHT_WITH_API !== 'true';
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

  await page.route(/\/events\/[^/?]+$/, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(smokeEventDetail),
    });
  });

  await page.route(/\/ministries\/[^/]+\/roles/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(smokeRoles),
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
