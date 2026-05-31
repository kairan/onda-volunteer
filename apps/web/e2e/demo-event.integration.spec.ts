import { expect, test } from './fixtures';

test.describe('demo event @integration', () => {
  test('loads seeded public event from home via shell route', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'View demo event' }).click();

    await expect(page).toHaveURL(/\/scheduling\/events\/seed-event-public$/);
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Sunday Gathering', level: 1 }),
    ).toBeVisible();
  });

  test('redirects legacy /events/:id to shell scheduling detail', async ({ page }) => {
    await page.goto('/events/seed-event-public');

    await expect(page).toHaveURL(/\/scheduling\/events\/seed-event-public$/);
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Sunday Gathering', level: 1 }),
    ).toBeVisible();
  });
});
