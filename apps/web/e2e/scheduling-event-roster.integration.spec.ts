import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from './fixtures';

/** Keep in sync with `apps/api/prisma/seed.ts` (`SEED_DEMO_EVENT_DAY_OFFSET`). */
const SEED_DEMO_EVENT_DAY_OFFSET = 14;

function daysFromNowIso(days: number, hourUtc: number, minuteUtc = 0): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hourUtc, minuteUtc, 0, 0);
  return date.toISOString();
}

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
  // Reseed mutates shared Postgres; parallel workers cause flaky roster rows.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(() => {
    reseedDatabase();
  });

  test('authorized viewer reaches shell roster from the scheduling list', async ({
    page,
  }) => {
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/organization/context') && res.status() === 200,
      ),
      page.goto('/scheduling'),
    ]);
    await page.getByRole('combobox', { name: /church|igreja/i }).selectOption('Onda Brasil');

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
      rosterTable.getByRole('columnheader', { name: /ministry|ministério/i }),
    ).toBeVisible();
    await expect(
      rosterTable.getByRole('columnheader', { name: /volunteer|voluntário/i }),
    ).toBeVisible();
    await expect(rosterTable.getByRole('cell', { name: 'Hospitality' })).toBeVisible({
      timeout: 30_000,
    });
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

  test('volunteer release and production assign with post-release unavailability offer', async ({
    page,
  }) => {
    // 1. Load org context and open the event roster with the seeded church selected
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/organization/context') && res.status() === 200,
      ),
      page.goto('/scheduling'),
    ]);
    await page.getByRole('combobox', { name: /church|igreja/i }).selectOption('Onda Brasil');
    await page.getByRole('link', { name: 'Sunday Gathering' }).click();
    await expect(page).toHaveURL(/\/scheduling\/events\/seed-event-public$/);
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

    // 7. Verify the production assign form is visible for the seeded leader
    const assignForm = page.getByRole('form', { name: 'Assign volunteer' });
    await expect(assignForm).toBeVisible({ timeout: 15_000 });
    const volunteerSelect = assignForm.getByLabel(/^volunteer$/i);
    await expect(volunteerSelect).toBeEnabled({ timeout: 15_000 });
    await expect(volunteerSelect).toContainText('Demo Volunteer');
    const startInput = assignForm.getByLabel(/starts \(utc iso\)/i);
    const endInput = assignForm.getByLabel(/ends \(utc iso\)/i);
    await expect(startInput).toBeVisible();
    await expect(endInput).toBeVisible();

    // 8. Try to assign during the volunteer's unavailability block (15:00 to 16:00) to verify conflict handling
    await startInput.fill(
      daysFromNowIso(SEED_DEMO_EVENT_DAY_OFFSET, 15, 0),
    );
    await endInput.fill(daysFromNowIso(SEED_DEMO_EVENT_DAY_OFFSET, 16, 0));
    
    const submitBtn = assignForm.getByRole('button', { name: 'Create assignment' });
    await submitBtn.click();

    // 9. Should display the conflict error inline on the assign form
    const assignError = assignForm.getByRole('alert');
    await expect(assignError).toBeVisible();
    await expect(assignError).toContainText(/unavailable/i);

    // 10. Now assign to a valid slot (16:00 to 16:30)
    await startInput.fill(
      daysFromNowIso(SEED_DEMO_EVENT_DAY_OFFSET, 16, 0),
    );
    await endInput.fill(daysFromNowIso(SEED_DEMO_EVENT_DAY_OFFSET, 16, 30));
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

