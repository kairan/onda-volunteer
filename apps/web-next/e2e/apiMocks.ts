import type { Page } from '@playwright/test';

const smokeOrganizationContext = {
  churches: [
    {
      id: 'church-seed',
      name: 'Igreja Central',
      defaultTimezone: 'America/Sao_Paulo',
      isAccreditedAdmin: false,
      campuses: [
        { id: 'campus-seed', name: 'Sede', timezone: 'America/Sao_Paulo' },
      ],
      ministries: [
        {
          id: 'seed-ministry-demo',
          name: 'Hospitality',
          membershipStatus: 'ACTIVE',
          isLeader: false,
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
