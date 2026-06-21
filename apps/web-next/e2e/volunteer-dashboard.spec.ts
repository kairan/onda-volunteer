import { expect, test } from './fixtures';

test.describe('volunteer dashboard @smoke', () => {
  test('loads greeting and time-away section', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(
      page.getByRole('heading', { name: /hi demo volunteer/i }),
    ).toBeVisible();
    await expect(page.getByText('0 upcoming assignments')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Time away' })).toBeVisible();
    await expect(
      page.getByText('No upcoming time away recorded.'),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'View all' })).toBeVisible();
  });
});
