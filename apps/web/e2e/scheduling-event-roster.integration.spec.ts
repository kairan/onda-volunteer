import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from './fixtures';

const apiDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../api');

function reseedDatabase() {
  const databaseUrl =
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/onda?schema=public';
  execSync('pnpm exec prisma db seed', {
    cwd: apiDir,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'pipe',
  });
}

test.describe('scheduling event roster @integration', () => {
  test.beforeEach(() => {
    reseedDatabase();
  });
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

  test('volunteer release and demo assign with post-release unavailability offer', async ({
    page,
  }) => {
    // 1. Go to the event roster detail page
    await page.goto('/scheduling/events/seed-event-public');
    await expect(page.getByRole('heading', { name: 'Sunday Gathering', level: 1 })).toBeVisible();

    // 2. We should see the existing seeded assignment: Demo Volunteer / Greeter
    const rosterTable = page.getByRole('table');
    await expect(rosterTable.getByRole('cell', { name: 'Demo Volunteer' })).toBeVisible();

    // 3. Since we are logged in as seed-volunteer-demo (default in dev-bypass), we should see the Release button in that row
    const releaseBtn = rosterTable.getByRole('button', { name: 'Release' });
    await expect(releaseBtn).toBeVisible();

    // 4. Click release to free up the slot
    await releaseBtn.click();

    // 5. The assignment should disappear from the table, and the optional unavailability offer should appear
    await expect(rosterTable.getByRole('cell', { name: 'Demo Volunteer' })).not.toBeVisible();
    
    const offerSection = page.locator('section[aria-labelledby="unavailability-offer-heading"]');
    await expect(offerSection).toBeVisible();
    await expect(offerSection.getByRole('heading', { name: 'Mark unavailable for this ministry?' })).toBeVisible();

    // 6. Dismiss the offer first (Decline)
    const noThanksBtn = offerSection.getByRole('button', { name: 'No thanks' });
    await noThanksBtn.click();
    await expect(offerSection).not.toBeVisible();

    // 7. Verify the Assign Form is visible (since demo credentials are set in E2E environment)
    const assignForm = page.getByRole('form', { name: 'Assign (demo)' });
    await expect(assignForm).toBeVisible();
    const startInput = assignForm.getByLabel('startsAtUtc');
    const endInput = assignForm.getByLabel('endsAtUtc');
    await expect(startInput).toBeVisible();
    await expect(endInput).toBeVisible();

    // 8. Try to assign during the volunteer's unavailability block (15:00 to 16:00) to verify conflict handling
    await startInput.fill('2026-06-07T15:00:00.000Z');
    await endInput.fill('2026-06-07T16:00:00.000Z');
    
    const submitBtn = assignForm.getByRole('button', { name: 'Create assignment' });
    await submitBtn.click();

    // 9. Should display the conflict error inline on the assign form
    const assignError = assignForm.getByRole('alert');
    await expect(assignError).toBeVisible();
    await expect(assignError).toContainText(/unavailable/i);

    // 10. Now assign to a valid slot (16:00 to 16:30)
    await startInput.fill('2026-06-07T16:00:00.000Z');
    await endInput.fill('2026-06-07T16:30:00.000Z');
    await submitBtn.click();

    // 11. The new assignment should appear in the table, error cleared, success toast shown
    await expect(assignError).not.toBeVisible();
    await expect(rosterTable.getByRole('cell', { name: 'Demo Volunteer' })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: 'Assignment created' })).toBeVisible();

    // 12. Let's release it again to test accepting the unavailability offer
    const newReleaseBtn = rosterTable.getByRole('button', { name: 'Release' });
    await newReleaseBtn.click();

    await expect(offerSection).toBeVisible();
    const yesMarkBtn = offerSection.getByRole('button', { name: 'Yes, mark unavailable' });
    await yesMarkBtn.click();

    // 13. Unavailability recorded message should appear, and offer box should disappear
    await expect(page.locator('p:has-text("Unavailability recorded")')).toBeVisible();
    await expect(offerSection).not.toBeVisible();
  });
});

