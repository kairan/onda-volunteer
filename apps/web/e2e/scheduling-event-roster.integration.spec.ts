import { expect, test } from './fixtures';

test.describe('scheduling event roster @integration', () => {
  test('authorized viewer reaches shell roster from the scheduling list', async ({
    page,
  }) => {
    await page.goto('/scheduling');
    await page.getByRole('combobox', { name: 'Church' }).selectOption('Igreja Central');

    const listLink = page.getByRole('link', { name: 'Sunday Gathering' });
    await expect(listLink).toBeVisible({ timeout: 30_000 });
    await expect(listLink).toHaveAttribute(
      'href',
      /\/scheduling\/events\/seed-event-public$/,
    );

    await listLink.click();

    await expect(page).toHaveURL(/\/scheduling\/events\/seed-event-public$/);
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Sunday Gathering', level: 1 }),
    ).toBeVisible();

    const rosterTable = page.getByRole('table');
    await expect(
      rosterTable.getByRole('row', { name: 'Ministry Volunteer Role Interval' }),
    ).toBeVisible();
    await expect(rosterTable.getByRole('cell', { name: 'Hospitality' })).toBeVisible();
    await expect(rosterTable.getByRole('cell', { name: 'Demo Volunteer' })).toBeVisible();
    await expect(rosterTable.getByRole('cell', { name: 'Greeter' })).toBeVisible();
  });

  test('viewer without access stays in the shell with a recoverable error', async ({
    page,
  }) => {
    await page.goto('/scheduling/events/does-not-exist-for-roster');

    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    await expect(page.locator('section[role="alert"]')).toContainText(/not found/i);
    await expect(
      page.getByRole('button', { name: /try again|tentar novamente/i }),
    ).toBeVisible();
  });
});
