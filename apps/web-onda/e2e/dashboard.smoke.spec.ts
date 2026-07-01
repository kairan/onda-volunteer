import { expect, test } from './fixtures';

test.describe('dashboard @smoke', () => {
  test('redirects / to dashboard when dev auth is enabled', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('loads signed-in shell and dashboard placeholder', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(
      page.getByRole('heading', { name: 'Dashboard', exact: true }),
    ).toBeVisible();
    await expect(page.getByText('Coming soon.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  });
});
