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

  test('private event shows multi-slot audio roster with 2/2 fill badge', async ({
    page,
  }) => {
    await page.goto('/scheduling/events/seed-event-private');

    await expect(
      page.getByRole('heading', { name: 'Technical Rehearsal', level: 1 }),
    ).toBeVisible();
    await expect(page.getByTestId('roster-fill-badge')).toHaveText('2/2 filled');
    await expect(page.getByText('Audio (1)')).toBeVisible();
    await expect(page.getByText('Audio (2)')).toBeVisible();
    await expect(page.getByText('Alex Audio')).toBeVisible();
    await expect(page.getByText('Blake Audio')).toBeVisible();
    await expect(page.getByTestId('role-capacity-editor')).toBeVisible();
  });
});
