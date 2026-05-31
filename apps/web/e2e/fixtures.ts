import { test as base } from '@playwright/test';
import { installSmokeApiMocks } from './apiMocks';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      localStorage.setItem('onda.ui.locale', 'en');
      sessionStorage.setItem('onda.ui.locale', 'en');
    });
    await installSmokeApiMocks(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
