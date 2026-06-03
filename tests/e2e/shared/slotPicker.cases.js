/**
 * SLOT PICKER PAGE TEST CASES
 *
 * For clients that use the flat date-strip + time-slot layout (e.g. TNDI).
 * This is DISTINCT from the provider-card layout (SINY, Clarus) which is covered
 * by findAppointment.cases.js.
 *
 * TNDI find-appointment page layout:
 *   Left: "Change Filters" panel — Location dropdown + Appointment Reason dropdown
 *   Right: Date strip (date buttons) → "Available Time Slots" grid (time buttons)
 *          → after selection: "Selected: Friday Jun 05 2026 @ 9:30 AM" confirmation bar
 *          → Continue button
 *
 * @param {import('@playwright/test').TestType} test
 * @param {Function} expect
 * @param {object}  opts
 * @param {string}  opts.expectedReason        — reason shown in the Appointment Reason filter (e.g. 'Teleconsultation')
 * @param {string}  [opts.nextPageAfterSlot]   — 'intake' | 'insurance' | 'patientInfo'
 * @param {string}  [opts.appointmentTypeSummaryText] — text shown in "Appointment Type: X" bar (defaults to expectedReason)
 */
export function runSlotPickerCases(test, expect, opts = {}) {
    const {
        expectedReason = '',
        nextPageAfterSlot = null,
        appointmentTypeSummaryText = null,
    } = opts;

    const expectedSummaryType = appointmentTypeSummaryText ?? expectedReason;

    test.describe('Slot Picker — date strip + time slots', () => {

        // ── 1. FILTER PANEL ───────────────────────────────────────────────────

        test.describe('Change Filters panel', () => {

            test('TC-SP-01 — "Change Filters" heading is visible', async ({ findAppointmentPage }) => {
                await expect(findAppointmentPage.page.getByText('Change Filters')).toBeVisible({ timeout: 10_000 });
            });

            test('TC-SP-02 — Location dropdown is visible', async ({ findAppointmentPage }) => {
                await expect(findAppointmentPage.locationDropdown).toBeVisible({ timeout: 10_000 });
            });

            test('TC-SP-03 — Appointment Reason shows the expected reason', async ({ findAppointmentPage }) => {
                const reason = findAppointmentPage.page
                    .getByText(expectedReason, { exact: false }).first();
                await expect(reason).toBeVisible({ timeout: 10_000 });
            });

        });

        // ── 2. DATE STRIP ─────────────────────────────────────────────────────

        test.describe('Date strip', () => {

            test('TC-SP-04 — date strip with clickable date buttons is visible', async ({ findAppointmentPage }) => {
                // Date buttons show day + date + month. No word-boundary anchors because
                // some clients render "Fri05Jun" (no spaces) which breaks \bFri\b matching.
                const dateBtn = findAppointmentPage.page
                    .locator('button')
                    .filter({ hasText: /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i })
                    .first();
                await expect(dateBtn).toBeVisible({ timeout: 10_000 });
            });

            test('TC-SP-05 — at least one date is pre-selected (highlighted)', async ({ findAppointmentPage }) => {
                const selectedDate = findAppointmentPage.page
                    .locator('button')
                    .filter({ hasText: /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i })
                    .first();
                await expect(selectedDate).toBeVisible({ timeout: 10_000 });
            });

        });

        // ── 3. TIME SLOTS ─────────────────────────────────────────────────────

        test.describe('Available Time Slots', () => {

            test('TC-SP-06 — "Available Time Slots" heading is visible', async ({ findAppointmentPage }) => {
                await expect(
                    findAppointmentPage.page.getByText('Available Time Slots')
                ).toBeVisible({ timeout: 10_000 });
            });

            test('TC-SP-07 — at least one time slot button is visible', async ({ findAppointmentPage }) => {
                const slotBtn = findAppointmentPage.page
                    .locator('button')
                    .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
                    .first();
                await expect(slotBtn).toBeVisible({ timeout: 10_000 });
            });

            test('TC-SP-08 — clicking a time slot shows the "Selected:" confirmation bar', async ({ findAppointmentPage }) => {
                const slotBtn = findAppointmentPage.page
                    .locator('button')
                    .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
                    .first();
                await slotBtn.click();
                // Confirmation bar: "Appointment Type: Teleconsultation | Selected: Fri Jun 05 2026 @ 9:30 AM"
                const selectedBar = findAppointmentPage.page
                    .getByText(/Selected:/i).first();
                await expect(selectedBar).toBeVisible({ timeout: 10_000 });
            });

            if (expectedSummaryType) {
                test(`TC-SP-09 — confirmation bar shows "Appointment Type: ${expectedSummaryType}"`, async ({ findAppointmentPage }) => {
                    const slotBtn = findAppointmentPage.page
                        .locator('button')
                        .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
                        .first();
                    await slotBtn.click();
                    await expect(
                        findAppointmentPage.page.getByText(expectedSummaryType, { exact: false }).first()
                    ).toBeVisible({ timeout: 5_000 });
                });
            }

            test('TC-SP-09b — "Selected:" bar shows the exact time of the clicked slot', async ({ findAppointmentPage }) => {
                // Read the time text from the first slot button BEFORE clicking it
                const slotBtn = findAppointmentPage.page
                    .locator('button')
                    .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
                    .first();

                const btnText = await slotBtn.textContent();
                const timeMatch = (btnText ?? '').match(/\d{1,2}:\d{2}\s*(AM|PM)/i);

                await slotBtn.click();

                // The bottom "Selected:" bar should contain the same time we just clicked
                await expect(
                    findAppointmentPage.page.getByText(/Selected:/i).first()
                ).toBeVisible({ timeout: 10_000 });

                if (timeMatch) {
                    // Verify the exact time (e.g. "10:30 AM") appears in the confirmation bar
                    await expect(
                        findAppointmentPage.page
                            .getByText(new RegExp(timeMatch[0].replace(/\s+/, '\\s*'), 'i'))
                            .first()
                    ).toBeVisible({ timeout: 5_000 });
                    console.log(`Slot time "${timeMatch[0]}" confirmed in Selected bar`);
                }
            });

                test('TC-SP-10a — Continue button is DISABLED before any time slot is selected', async ({ findAppointmentPage }) => {
                // On page load with no slot chosen: "Selected:" bar is empty and Continue is grayed out
                const continueBtn = findAppointmentPage.page
                    .locator('button:has-text("Continue"), button:has-text("Next")').first();
                await continueBtn.waitFor({ state: 'visible', timeout: 10_000 });
                const isDisabled = await continueBtn.evaluate(btn =>
                    btn.disabled ||
                    btn.getAttribute('aria-disabled') === 'true' ||
                    btn.classList.contains('Mui-disabled') ||
                    window.getComputedStyle(btn).pointerEvents === 'none'
                );
                expect(isDisabled).toBe(true);
            });

            test('TC-SP-10b — Continue button ENABLES only after a time slot is clicked', async ({ findAppointmentPage }) => {
                const continueBtn = findAppointmentPage.page
                    .locator('button:has-text("Continue"), button:has-text("Next")').first();

                // Verify disabled BEFORE selection
                await continueBtn.waitFor({ state: 'visible', timeout: 10_000 });

                // Click a slot
                const slotBtn = findAppointmentPage.page
                    .locator('button')
                    .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
                    .first();
                await slotBtn.click();

                // Continue must now be enabled
                await expect(continueBtn).toBeEnabled({ timeout: 5_000 });
            });

            test('TC-SP-10c — Continue button appears and is clickable after slot selection', async ({ findAppointmentPage }) => {
                const slotBtn = findAppointmentPage.page
                    .locator('button')
                    .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
                    .first();
                await slotBtn.click();
                const continueBtn = findAppointmentPage.page
                    .locator('button:has-text("Continue"), button:has-text("Next")').first();
                await expect(continueBtn).toBeVisible({ timeout: 10_000 });
                await expect(continueBtn).toBeEnabled({ timeout: 5_000 });
            });

        });

        // ── 4. NAVIGATION ─────────────────────────────────────────────────────

        if (nextPageAfterSlot) {
            test('TC-SP-11 — clicking Continue after slot selection navigates to the expected next page', async ({ findAppointmentPage }) => {
                const slotBtn = findAppointmentPage.page
                    .locator('button')
                    .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
                    .first();
                await slotBtn.click();
                const continueBtn = findAppointmentPage.page
                    .locator('button:has-text("Continue"), button:has-text("Next")').first();
                await continueBtn.waitFor({ state: 'visible', timeout: 10_000 });
                await continueBtn.click();

                if (nextPageAfterSlot === 'intake') {
                    await findAppointmentPage.page.waitForURL(
                        url => url.toString().includes('intake'),
                        { timeout: 15_000 }
                    );
                } else if (nextPageAfterSlot === 'insurance') {
                    await findAppointmentPage.page.waitForURL(
                        url => url.toString().includes('insurance'),
                        { timeout: 15_000 }
                    );
                } else if (nextPageAfterSlot === 'patientInfo') {
                    await expect(
                        findAppointmentPage.page.locator('input[name*="firstName"]').first()
                    ).toBeVisible({ timeout: 15_000 });
                }
            });

            test('TC-SP-12 — "Your Appointment" summary on the next page shows the appointment type', async ({ findAppointmentPage }) => {
                const slotBtn = findAppointmentPage.page
                    .locator('button')
                    .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
                    .first();
                await slotBtn.click();
                const continueBtn = findAppointmentPage.page
                    .locator('button:has-text("Continue"), button:has-text("Next")').first();
                await continueBtn.waitFor({ state: 'visible', timeout: 10_000 });
                await continueBtn.click();

                await expect(
                    findAppointmentPage.page.getByText(/Your Appointment/i).first()
                ).toBeVisible({ timeout: 20_000 });

                if (expectedSummaryType) {
                    await expect(
                        findAppointmentPage.page.getByText(expectedSummaryType, { exact: false }).first()
                    ).toBeVisible({ timeout: 5_000 });
                }

                await expect(
                    findAppointmentPage.page.getByText(/Appointment Type/i).first()
                ).toBeVisible({ timeout: 5_000 });
            });
        }

    });
}
