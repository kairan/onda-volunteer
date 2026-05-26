import { expect, test } from './fixtures';

test.describe('volunteers membership admin @integration', () => {
  test('non-accredited demo volunteer sees accreditation message', async ({ page }) => {
    await page.goto('/volunteers');

    await expect(page.getByRole('heading', { name: 'Volunteers', level: 1 })).toBeVisible();
    await expect(
      page.getByText(/church admin accreditation/i),
    ).toBeVisible();
  });
});
