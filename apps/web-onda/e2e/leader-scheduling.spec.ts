import { expect, test } from './fixtures';

test.describe('leader scheduling @smoke', () => {
  test('loads ministry hero and roster section for leader', async ({ page }) => {
    await page.goto('/scheduling?previewRole=leader');

    await expect(page.getByTestId('leader-ministry-hero')).toBeVisible();
    await expect(page.getByTestId('leader-roster-section')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Roster' })).toBeVisible();
  });
});
