import { expect, test } from './fixtures';

test.describe('scheduling create public event @integration', () => {
  test('hides create link for non-accredited demo volunteer', async ({ page }) => {
    await page.goto('/scheduling');
    await page.getByRole('combobox', { name: 'Church' }).selectOption('Igreja Central');

    await expect(
      page.getByRole('link', { name: 'Create public event' }),
    ).not.toBeVisible();
  });

  test('blocks create route for non-accredited demo volunteer', async ({ page }) => {
    await page.goto('/scheduling/events/new');

    await expect(
      page.getByText(/Church admin accreditation is required/i),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: '← Back to events' })).toBeVisible();
    await expect(page.getByLabel('Title')).not.toBeVisible();
  });
});
