import { expect, test } from './fixtures';

test.describe('volunteer dashboard @smoke', () => {
  test('loads greeting and time-away section', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(
      page.getByRole('heading', { name: /hi demo volunteer/i }),
    ).toBeVisible();
    await expect(page.getByText('1 upcoming assignments')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Time away', exact: true }),
    ).toBeVisible();
    const timeAway = page.getByRole('region', { name: 'Time away' });
    await expect(timeAway.getByText('Hospitality', { exact: true })).toBeVisible();
    await expect(timeAway.getByRole('link', { name: 'View all' })).toBeVisible();
  });
});
