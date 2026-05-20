import { expect, test } from './fixtures';

test.describe('demo event @integration', () => {
  test('loads seeded public event from home', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'View demo event' }).click();

    await expect(page).toHaveURL(/\/events\/seed-event-public$/);
    await expect(
      page.getByRole('heading', { name: 'Sunday Gathering' }),
    ).toBeVisible();
    await expect(page.getByText('Public event')).toBeVisible();
    await expect(page.getByText('When (canonical UTC)')).toBeVisible();
  });

  test('shows church context on event detail', async ({ page }) => {
    await page.goto('/events/seed-event-public');

    await expect(page.getByText(/default TZ/)).toBeVisible();
    await expect(page.getByRole('link', { name: '← Home' })).toBeVisible();
  });
});
