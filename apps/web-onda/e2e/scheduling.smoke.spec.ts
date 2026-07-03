import { expect, test } from './fixtures';

test.describe('scheduling @smoke', () => {
  test('loads volunteer assignment grid at /scheduling', async ({ page }) => {
    await page.goto('/scheduling?previewRole=volunteer');

    await expect(
      page.getByRole('heading', { name: 'Upcoming assignments' }),
    ).toBeVisible();
    await expect(page.getByText('Sunday Gathering')).toBeVisible();
    await expect(page.getByText('Hospitality · Greeter')).toBeVisible();
    await expect(page.getByText('Confirmed')).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Sunday Gathering/i }),
    ).toHaveAttribute('href', '/scheduling/events/seed-event-public');
  });
});
