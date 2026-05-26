import { expect, test } from './fixtures';

test.describe('keyboard navigation @smoke @a11y', () => {
  test('skip link and shell nav are reachable by keyboard', async ({ page }) => {
    await page.goto('/dashboard');

    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: /skip to main/i });
    await expect(skip).toBeFocused();

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
    await page.goto('/scheduling');

    await expect(page.getByRole('heading', { name: /schedule/i })).toBeVisible();

    const firstLink = page.getByRole('link').filter({ hasText: /.+/ }).first();
    await firstLink.focus();
    await expect(firstLink).toBeFocused();
  });
});
