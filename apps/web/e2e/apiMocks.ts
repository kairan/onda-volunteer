import type { Page } from '@playwright/test';

/** Minimal org + events payloads for @smoke e2e without a live API. */
const smokeOrganizationContext = {
  churches: [
    {
      id: 'church-seed',
      name: 'Onda Brasil',
      defaultTimezone: 'America/Sao_Paulo',
      isAccreditedAdmin: true,
      campuses: [
        { id: 'campus-seed', name: 'Joinville', timezone: 'America/Sao_Paulo' },
      ],
      ministries: [
        {
          id: 'seed-ministry-demo',
          name: 'Hospitality',
          membershipStatus: 'ACTIVE',
          // Single-church mock: leader flows pass without API. With PLAYWRIGHT_WITH_API,
          // seed has multiple churches — pick Onda Brasil in tests that need led ministries.
          isLeader: true,
        },
      ],
    },
  ],
};

const smokeEvents = [
  {
    id: 'seed-event-public',
    kind: 'PUBLIC',
    title: 'Sunday Gathering',
    window: {
      startsAtUtc: '2026-06-07T10:00:00.000Z',
      endsAtUtc: '2026-06-07T12:00:00.000Z',
    },
    framing: {
      churchDefaultTimezone: 'America/Sao_Paulo',
      startsDisplayInChurchTz: '07:00',
      endsDisplayInChurchTz: '09:00',
    },
    ministry: null,
  },
];

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

  await page.route(/\/ministries\/[^/]+\/memberships/, async (route) => {
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
