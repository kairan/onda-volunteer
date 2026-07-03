import { test as base } from '@playwright/test';
import { installSmokeApiMocks } from './apiMocks';

const usesRealApi = Boolean(
  process.env.CI || process.env.PLAYWRIGHT_WITH_API === 'true',
);

const seedChurchSelection = {
  churchId: 'seed-church-demo',
  campusId: 'seed-campus-central-sede',
  workingContext: {
    ministryId: 'seed-ministry-demo',
    mode: 'volunteer' as const,
  },
};

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(
      ({ churchId, campusId, workingContext, pinSeedChurch }) => {
        localStorage.setItem('onda.ui.locale', 'en');
        sessionStorage.setItem('onda.ui.locale', 'en');
        if (pinSeedChurch) {
          localStorage.setItem('onda:activeChurchId', churchId);
          localStorage.setItem('onda:activeCampusId', campusId);
          localStorage.setItem(
            `onda:activeWorkingContext:${churchId}`,
            JSON.stringify(workingContext),
          );
        }
      },
      { ...seedChurchSelection, pinSeedChurch: usesRealApi },
    );
    await installSmokeApiMocks(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
