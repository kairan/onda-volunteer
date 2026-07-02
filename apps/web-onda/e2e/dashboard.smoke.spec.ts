import { expect, test } from './fixtures';

test.describe('dashboard @smoke', () => {
  test('redirects / to dashboard when dev auth is enabled', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('loads signed-in shell and volunteer dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(
      page.getByRole('heading', { name: /hi demo volunteer/i }),
    ).toBeVisible();
    await expect(page.getByText('1 upcoming assignments')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Time away', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText('No upcoming time away recorded.'),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'View all' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  });
});
