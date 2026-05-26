import type { Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures';

async function tabUntilFocused(page: Page, locator: Locator, maxTabs = 25) {
  for (let i = 0; i < maxTabs; i += 1) {
    if (await locator.evaluate((el) => el === document.activeElement)) {
      return;
    }
    await page.keyboard.press('Tab');
  }
  await expect(locator).toBeFocused();
}

test.describe('keyboard navigation @smoke @a11y', () => {
  test('skip link and shell nav are reachable by keyboard', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    await page.locator('body').click();

    const skip = page.getByRole('link', { name: /skip to main/i });
    await tabUntilFocused(page, skip);
    await expect(skip).toBeFocused();

    const dashboardNav = page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'Dashboard' });
    await tabUntilFocused(page, dashboardNav);
    await expect(dashboardNav).toBeFocused();

    await skip.focus();
    await skip.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });

  test('time away form controls accept keyboard focus', async ({ page }) => {
    await page.goto('/time-away');

    await expect(
      page.getByRole('heading', { name: /time away/i }),
    ).toBeVisible();

    const ministrySelect = page.getByLabel(/ministry/i).first();
    await ministrySelect.focus();
    await expect(ministrySelect).toBeFocused();
  });

  test('scheduling list links are focusable', async ({ page }) => {
    test.skip(
      !process.env.CI && process.env.PLAYWRIGHT_WITH_API !== 'true',
      'Event list links require API-backed seed data',
    );

    await page.goto('/scheduling');

    await expect(page.getByRole('heading', { name: /schedule/i })).toBeVisible();

    const churchSelect = page.getByRole('combobox', { name: 'Church' });
    await churchSelect.selectOption('Igreja Central');

    const eventLink = page
      .locator('#main')
      .getByRole('link', { name: 'Sunday Gathering' });
    await expect(eventLink).toBeVisible({ timeout: 30_000 });
    await eventLink.focus();
    await expect(eventLink).toBeFocused();
  });
});
