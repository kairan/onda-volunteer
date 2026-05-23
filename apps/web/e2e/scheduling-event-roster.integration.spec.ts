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

  test('authorized leader can assign a volunteer, release it, and handle post-release unavailability offer', async ({
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
    const assignHeading = page.getByRole('heading', { name: 'Assign Volunteer', level: 2 });
    await expect(assignHeading).toBeVisible();

    const startInput = page.getByLabel('startsAtUtc');
    const endInput = page.getByLabel('endsAtUtc');
    await expect(startInput).toBeVisible();
    await expect(endInput).toBeVisible();

    // 8. Try to assign during the volunteer's unavailability block (15:00 to 16:00) to verify conflict handling
    await startInput.fill('2026-06-07T15:00:00.000Z');
    await endInput.fill('2026-06-07T16:00:00.000Z');
    
    const submitBtn = page.getByRole('button', { name: 'Create assignment' });
    await submitBtn.click();

    // 9. Should display the conflict error message
    const errorAlert = page.locator('p[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/unavailable/i);

    // 10. Now assign to a valid slot (16:00 to 16:30)
    await startInput.fill('2026-06-07T16:00:00.000Z');
    await endInput.fill('2026-06-07T16:30:00.000Z');
    await submitBtn.click();

    // 11. The new assignment should appear in the table and the error should be cleared
    await expect(errorAlert).not.toBeVisible();
    await expect(rosterTable.getByRole('cell', { name: 'Demo Volunteer' })).toBeVisible();

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

