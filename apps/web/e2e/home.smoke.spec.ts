import { expect, test } from './fixtures';

test.describe('home @smoke', () => {
  test('shows volunteer roster landing', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: 'Volunteer roster' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open dashboard' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'View demo event' }),
    ).toBeVisible();
  });

  test('navigates to dashboard from home', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Open dashboard' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole('heading', { name: 'Dashboard' }),
    ).toBeVisible();
  });
});
