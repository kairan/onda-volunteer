import { expect, test } from './fixtures';

const DEV_VOLUNTEER_STORAGE_KEY = 'onda:devVolunteerId';

test.describe('volunteers membership admin @integration', () => {
  test('non-steward volunteer sees stewardship message', async ({ page }) => {
    await page.addInitScript(
      ([storageKey, volunteerId]) => {
        localStorage.setItem(storageKey, volunteerId);
      },
      [DEV_VOLUNTEER_STORAGE_KEY, 'seed-volunteer-hospitality'] as const,
    );

    await page.goto('/volunteers');

    await expect(page.getByRole('heading', { name: 'Volunteers', level: 1 })).toBeVisible();
    await expect(
      page.getByText(
        /You need to be a Leader or church Admin for a ministry to manage memberships here/i,
      ),
    ).toBeVisible();
  });
});
