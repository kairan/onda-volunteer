import { expect, test } from './fixtures';

test.describe('scheduling event detail @smoke', () => {
  test('loads event detail roster for seeded public event', async ({ page }) => {
    await page.goto('/scheduling/events/seed-event-public');

    await expect(
      page.getByRole('heading', { name: 'Sunday Gathering', level: 1 }),
    ).toBeVisible();
    await expect(page.getByTestId('roster-fill-badge')).toBeVisible();
    await expect(page.getByRole('link', { name: /back to events/i })).toBeVisible();
  });
});
