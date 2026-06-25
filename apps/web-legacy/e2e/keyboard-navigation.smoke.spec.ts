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

  test('leader volunteer time away form controls accept keyboard focus', async ({
    page,
  }) => {
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/organization/context') && res.status() === 200,
      ),
      page.goto('/leader/volunteer-time-away'),
    ]);

    await page
      .getByRole('combobox', { name: /church|igreja/i })
      .selectOption('Igreja Central');

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /volunteer time away|ausências do voluntário/i,
      }),
    ).toBeVisible({ timeout: 30_000 });

    const ministrySelect = page
      .locator('label')
      .filter({ hasText: /ministry you lead|ministério que você lidera/i })
      .locator('select');
    await expect(ministrySelect).toBeVisible({ timeout: 30_000 });
    await ministrySelect.focus();
    await expect(ministrySelect).toBeFocused();
  });

  test('respects prefers-reduced-motion for pulse skeletons', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/dashboard');

    const animationDuration = await page.evaluate(() => {
      const el = document.createElement('div');
      el.className = 'animate-pulse';
      document.body.appendChild(el);
      return window.getComputedStyle(el).animationDuration;
    });

    // globals.css sets 0.01ms on * and animation:none on .animate-pulse; Chromium may report 0s.
    expect(['0s', '0.01ms']).toContain(animationDuration);
  });

  test('scheduling list links are focusable', async ({ page }) => {
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
