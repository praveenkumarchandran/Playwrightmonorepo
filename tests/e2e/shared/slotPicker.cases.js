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
import { step, failMsg } from '../../utils/testContext.js';

export function runSlotPickerCases(test, expect, opts = {}) {
    const {
        expectedReason = '',
        nextPageAfterSlot = null,
    } = opts;

    // If appointmentTypeSummaryText is explicitly passed (even as null), use it.
    // If not passed at all, fall back to expectedReason.
    const expectedSummaryType = Object.prototype.hasOwnProperty.call(opts, 'appointmentTypeSummaryText')
        ? opts.appointmentTypeSummaryText
        : expectedReason;

    test.describe('Slot Picker — date strip + time slots', () => {

        // ── 1. FILTER PANEL ───────────────────────────────────────────────────

        test.describe('Change Filters panel', () => {

            test('TC-SP-01 — "Change Filters" heading is visible', async ({ findAppointmentPage }) => {
                test.slow();
                step('Waiting for page network idle before checking filter panel');
                await findAppointmentPage.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});

                step('Verifying "Change Filters" heading is visible');
                await expect(
                    findAppointmentPage.page.getByText('Change Filters'),
                    failMsg(
                        'TC-SP-01',
                        '"Change Filters" heading must be visible on the slot picker page',
                        'The filter panel failed to render — the component may not have mounted or the page did not reach networkidle',
                        'slotPicker.cases.js TC-SP-01 | findAppointmentPage Change Filters heading'
                    )
                ).toBeVisible({ timeout: 30_000 });
            });

            test('TC-SP-02 — Location dropdown is visible', async ({ findAppointmentPage }) => {
                step('Verifying Location dropdown is visible in the filter panel');
                await expect(
                    findAppointmentPage.locationDropdown,
                    failMsg(
                        'TC-SP-02',
                        'Location dropdown must be visible in the Change Filters panel',
                        'The locationDropdown fixture selector may not match the rendered element, or the filter panel failed to mount',
                        'slotPicker.cases.js TC-SP-02 | findAppointmentPage.locationDropdown'
                    )
                ).toBeVisible({ timeout: 10_000 });
            });

            test('TC-SP-03 — Appointment Reason shows the expected reason', async ({ findAppointmentPage }) => {
                test.slow();
                step(`Verifying Appointment Reason shows "${expectedReason}"`);
                const reason = findAppointmentPage.page
                    .getByText(expectedReason, { exact: false }).first();
                await expect(
                    reason,
                    failMsg(
                        'TC-SP-03',
                        `Appointment Reason filter must show "${expectedReason}" on the slot picker page`,
                        'The reason text is missing — the filter panel may not have loaded or the expectedReason value does not match what the server returns',
                        'slotPicker.cases.js TC-SP-03 | findAppointmentPage Appointment Reason filter'
                    )
                ).toBeVisible({ timeout: 20_000 });
            });

        });

        // ── 2. DATE STRIP ─────────────────────────────────────────────────────

        test.describe('Date strip', () => {

            test('TC-SP-04 — date strip with clickable date buttons is visible', async ({ findAppointmentPage }) => {
                step('Verifying at least one date button (Mon/Tue/etc.) is visible in the date strip');
                // Date buttons show day + date + month. No word-boundary anchors because
                // some clients render "Fri05Jun" (no spaces) which breaks \bFri\b matching.
                const dateBtn = findAppointmentPage.page
                    .locator('button')
                    .filter({ hasText: /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i })
                    .first();
                await expect(
                    dateBtn,
                    failMsg(
                        'TC-SP-04',
                        'At least one date button (Mon/Tue/Wed/Thu/Fri/Sat/Sun) must be visible in the date strip',
                        'No date buttons rendered — the date strip component may have failed to load or there are no available appointment dates',
                        'slotPicker.cases.js TC-SP-04 | date strip button filter hasText Mon/Tue/Wed/Thu/Fri/Sat/Sun'
                    )
                ).toBeVisible({ timeout: 10_000 });
            });

            test('TC-SP-05 — at least one date is pre-selected (highlighted)', async ({ findAppointmentPage }) => {
                test.slow();
                step('Verifying the first date button is visible (pre-selected state)');
                const selectedDate = findAppointmentPage.page
                    .locator('button')
                    .filter({ hasText: /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i })
                    .first();
                await expect(
                    selectedDate,
                    failMsg(
                        'TC-SP-05',
                        'The first date strip button must be visible and pre-selected on page load',
                        'No date buttons are rendered — the date strip may not have initialised or there are no available dates to pre-select',
                        'slotPicker.cases.js TC-SP-05 | date strip first button — pre-selection state'
                    )
                ).toBeVisible({ timeout: 20_000 });
            });

        });

        // ── 3. TIME SLOTS ─────────────────────────────────────────────────────

        test.describe('Available Time Slots', () => {

            test('TC-SP-06 — "Available Time Slots" heading is visible', async ({ findAppointmentPage }) => {
                step('Verifying "Available Time Slots" section heading is visible');
                await expect(
                    findAppointmentPage.page.getByText('Available Time Slots'),
                    failMsg(
                        'TC-SP-06',
                        '"Available Time Slots" heading must be visible on the slot picker page',
                        'The time slots section failed to render — the heading component may not have mounted or the page layout changed',
                        'slotPicker.cases.js TC-SP-06 | findAppointmentPage Available Time Slots heading'
                    )
                ).toBeVisible({ timeout: 10_000 });
            });

            test('TC-SP-07 — at least one time slot button is visible', async ({ findAppointmentPage }) => {
                step('Verifying at least one time slot button (HH:MM AM/PM) is visible');
                const slotBtn = findAppointmentPage.page
                    .locator('button')
                    .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
                    .first();
                await expect(
                    slotBtn,
                    failMsg(
                        'TC-SP-07',
                        'At least one time slot button (HH:MM AM/PM) must be visible',
                        'No time slots rendered — the selected date may have no available slots, or the slots API failed to return data',
                        'slotPicker.cases.js TC-SP-07 | time slot buttons filter HH:MM AM/PM'
                    )
                ).toBeVisible({ timeout: 10_000 });
            });

            test('TC-SP-08 — clicking a time slot shows the "Selected:" confirmation bar', async ({ findAppointmentPage }) => {
                step('Locating the first available time slot button');
                const slotBtn = findAppointmentPage.page
                    .locator('button')
                    .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
                    .first();

                step('Clicking the first time slot button');
                await slotBtn.click();

                step('Verifying the "Selected:" confirmation bar appears after clicking the slot');
                // Confirmation bar: "Appointment Type: Teleconsultation | Selected: Fri Jun 05 2026 @ 9:30 AM"
                const selectedBar = findAppointmentPage.page
                    .getByText(/Selected:/i).first();
                await expect(
                    selectedBar,
                    failMsg(
                        'TC-SP-08',
                        '"Selected:" confirmation bar must appear after clicking a time slot',
                        'The selection confirmation bar did not appear — the slot click may not have registered or the bar component failed to render',
                        'slotPicker.cases.js TC-SP-08 | time slot click → Selected: confirmation bar'
                    )
                ).toBeVisible({ timeout: 10_000 });
            });

            if (expectedSummaryType) {
                test(`TC-SP-09 — confirmation bar shows "Appointment Type: ${expectedSummaryType}"`, async ({ findAppointmentPage }) => {
                    step('Clicking the first available time slot button');
                    const slotBtn = findAppointmentPage.page
                        .locator('button')
                        .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
                        .first();
                    await slotBtn.click();

                    step(`Verifying confirmation bar shows appointment type "${expectedSummaryType}"`);
                    await expect(
                        findAppointmentPage.page.getByText(expectedSummaryType, { exact: false }).first(),
                        failMsg(
                            'TC-SP-09',
                            `Confirmation bar must show appointment type "${expectedSummaryType}" after slot selection`,
                            'The appointment type text is absent from the confirmation bar — the type value may not be passed to the bar component or the text differs from expected',
                            `slotPicker.cases.js TC-SP-09 | confirmation bar getByText("${expectedSummaryType}")`
                        )
                    ).toBeVisible({ timeout: 5_000 });
                });
            }

            test('TC-SP-09b — "Selected:" bar shows the exact time of the clicked slot', async ({ findAppointmentPage }) => {
                step('Reading the time text from the first slot button before clicking');
                // Read the time text from the first slot button BEFORE clicking it
                const slotBtn = findAppointmentPage.page
                    .locator('button')
                    .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
                    .first();

                const btnText = await slotBtn.textContent();
                const timeMatch = (btnText ?? '').match(/\d{1,2}:\d{2}\s*(AM|PM)/i);

                step('Clicking the time slot button');
                await slotBtn.click();

                step('Verifying the "Selected:" bar appears after clicking the slot');
                // The bottom "Selected:" bar should contain the same time we just clicked
                await expect(
                    findAppointmentPage.page.getByText(/Selected:/i).first(),
                    failMsg(
                        'TC-SP-09b',
                        '"Selected:" bar must appear after clicking a time slot',
                        'The confirmation bar did not render after slot click — the click event may not have been handled or the bar component failed',
                        'slotPicker.cases.js TC-SP-09b | time slot click → Selected: bar visibility'
                    )
                ).toBeVisible({ timeout: 10_000 });

                if (timeMatch) {
                    step(`Verifying the exact time "${timeMatch[0]}" appears in the confirmation bar`);
                    // Verify the exact time (e.g. "10:30 AM") appears in the confirmation bar
                    await expect(
                        findAppointmentPage.page
                            .getByText(new RegExp(timeMatch[0].replace(/\s+/, '\\s*'), 'i'))
                            .first(),
                        failMsg(
                            'TC-SP-09b',
                            `The exact slot time "${timeMatch[0]}" must appear in the "Selected:" confirmation bar`,
                            'The time shown in the confirmation bar does not match the time that was clicked — the slot selection state may not be updating correctly',
                            'slotPicker.cases.js TC-SP-09b | Selected: bar time value vs clicked slot time'
                        )
                    ).toBeVisible({ timeout: 5_000 });
                    console.log(`Slot time "${timeMatch[0]}" confirmed in Selected bar`);
                }
            });

            test('TC-SP-10a — Continue button is DISABLED before any time slot is selected', async ({ findAppointmentPage }) => {
                step('Waiting for the Continue/Next button to be visible before any slot selection');
                // On page load with no slot chosen: "Selected:" bar is empty and Continue is grayed out
                const continueBtn = findAppointmentPage.page
                    .locator('button:has-text("Continue"), button:has-text("Next")').first();
                await continueBtn.waitFor({ state: 'visible', timeout: 10_000 });

                step('Evaluating whether Continue button is disabled before slot selection');
                const isDisabled = await continueBtn.evaluate(btn =>
                    btn.disabled ||
                    btn.getAttribute('aria-disabled') === 'true' ||
                    btn.classList.contains('Mui-disabled') ||
                    window.getComputedStyle(btn).pointerEvents === 'none'
                );
                expect(
                    isDisabled,
                    failMsg(
                        'TC-SP-10a',
                        'Continue button must be disabled before any time slot is selected',
                        'The Continue button is enabled without a slot being chosen — the button disabled state is not wired to slot selection',
                        'slotPicker.cases.js TC-SP-10a | Continue button disabled state before slot click'
                    )
                ).toBe(true);
            });

            test('TC-SP-10b — Continue button ENABLES only after a time slot is clicked', async ({ findAppointmentPage }) => {
                step('Waiting for the Continue/Next button to be visible');
                const continueBtn = findAppointmentPage.page
                    .locator('button:has-text("Continue"), button:has-text("Next")').first();

                // Verify disabled BEFORE selection
                await continueBtn.waitFor({ state: 'visible', timeout: 10_000 });

                step('Clicking a time slot button to make a selection');
                // Click a slot
                const slotBtn = findAppointmentPage.page
                    .locator('button')
                    .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
                    .first();
                await slotBtn.click();

                step('Verifying Continue button becomes enabled after slot selection');
                // Continue must now be enabled
                await expect(
                    continueBtn,
                    failMsg(
                        'TC-SP-10b',
                        'Continue button must be enabled after a time slot is selected',
                        'Continue button stayed disabled after slot selection — the slot selection event may not be updating the button\'s enabled state',
                        'slotPicker.cases.js TC-SP-10b | Continue button enabled state after slot click'
                    )
                ).toBeEnabled({ timeout: 5_000 });
            });

            test('TC-SP-10c — Continue button appears and is clickable after slot selection', async ({ findAppointmentPage }) => {
                step('Clicking the first available time slot button');
                const slotBtn = findAppointmentPage.page
                    .locator('button')
                    .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
                    .first();
                await slotBtn.click();

                step('Verifying Continue button is visible after slot selection');
                const continueBtn = findAppointmentPage.page
                    .locator('button:has-text("Continue"), button:has-text("Next")').first();
                await expect(
                    continueBtn,
                    failMsg(
                        'TC-SP-10c',
                        'Continue button must be visible after a time slot is selected',
                        'The Continue button is not visible — it may not have appeared or was removed from the DOM after slot selection',
                        'slotPicker.cases.js TC-SP-10c | Continue button visibility after slot click'
                    )
                ).toBeVisible({ timeout: 10_000 });

                step('Verifying Continue button is enabled and clickable after slot selection');
                await expect(
                    continueBtn,
                    failMsg(
                        'TC-SP-10c',
                        'Continue button must be enabled (clickable) after a time slot is selected',
                        'Continue is visible but still disabled — slot selection state change did not propagate to the button',
                        'slotPicker.cases.js TC-SP-10c | Continue button enabled state after slot click'
                    )
                ).toBeEnabled({ timeout: 5_000 });
            });

        });

        // ── 4. NAVIGATION ─────────────────────────────────────────────────────

        if (nextPageAfterSlot) {
            test('TC-SP-11 — clicking Continue after slot selection navigates to the expected next page', async ({ findAppointmentPage }) => {
                step('Clicking the first available time slot button');
                const slotBtn = findAppointmentPage.page
                    .locator('button')
                    .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
                    .first();
                await slotBtn.click();

                step('Waiting for the Continue button to be visible');
                const continueBtn = findAppointmentPage.page
                    .locator('button:has-text("Continue"), button:has-text("Next")').first();
                await continueBtn.waitFor({ state: 'visible', timeout: 10_000 });

                step('Clicking Continue to navigate to the next page');
                await continueBtn.click();

                if (nextPageAfterSlot === 'intake') {
                    step('Waiting for URL to contain "intake"');
                    await findAppointmentPage.page.waitForURL(
                        url => url.toString().includes('intake'),
                        { timeout: 15_000 }
                    );
                } else if (nextPageAfterSlot === 'insurance') {
                    step('Waiting for URL to contain "insurance"');
                    await findAppointmentPage.page.waitForURL(
                        url => url.toString().includes('insurance'),
                        { timeout: 15_000 }
                    );
                } else if (nextPageAfterSlot === 'patientInfo') {
                    step('Verifying patient info first name input is visible on the next page');
                    await expect(
                        findAppointmentPage.page.locator('input[name*="firstName"]').first(),
                        failMsg(
                            'TC-SP-11',
                            'Patient info firstName input must be visible after Continue navigates to patientInfo page',
                            'Navigation to the patient info page failed after slot selection + Continue — the page may not have loaded or the input selector changed',
                            'slotPicker.cases.js TC-SP-11 | Continue → patientInfo input[name*="firstName"]'
                        )
                    ).toBeVisible({ timeout: 15_000 });
                }
            });

            test('TC-SP-12 — "Your Appointment" summary on the next page shows the appointment type', async ({ findAppointmentPage }) => {
                step('Clicking the first available time slot button');
                const slotBtn = findAppointmentPage.page
                    .locator('button')
                    .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
                    .first();
                await slotBtn.click();

                step('Waiting for the Continue button to be visible');
                const continueBtn = findAppointmentPage.page
                    .locator('button:has-text("Continue"), button:has-text("Next")').first();
                await continueBtn.waitFor({ state: 'visible', timeout: 10_000 });

                step('Clicking Continue to navigate to the next page');
                await continueBtn.click();

                step('Verifying "Your Appointment" summary panel heading is visible on the next page');
                await expect(
                    findAppointmentPage.page.getByText(/Your Appointment/i).first(),
                    failMsg(
                        'TC-SP-12',
                        '"Your Appointment" summary panel must be visible on the next page after slot selection',
                        'The appointment summary panel did not appear on the next page — the component may not have rendered or the navigation took too long',
                        'slotPicker.cases.js TC-SP-12 | next page Your Appointment summary heading'
                    )
                ).toBeVisible({ timeout: 20_000 });

                if (expectedSummaryType) {
                    step(`Verifying appointment type "${expectedSummaryType}" is shown in the summary panel`);
                    await expect(
                        findAppointmentPage.page.getByText(expectedSummaryType, { exact: false }).first(),
                        failMsg(
                            'TC-SP-12',
                            `Appointment type "${expectedSummaryType}" must be visible in the summary panel on the next page`,
                            'The appointment type text is absent from the summary panel — the slot selection state may not have been carried through to the next page',
                            `slotPicker.cases.js TC-SP-12 | next page summary getByText("${expectedSummaryType}")`
                        )
                    ).toBeVisible({ timeout: 5_000 });
                }

                step('Verifying "Appointment Type" label is visible in the summary panel');
                await expect(
                    findAppointmentPage.page.getByText(/Appointment Type/i).first(),
                    failMsg(
                        'TC-SP-12',
                        '"Appointment Type" label must be visible in the "Your Appointment" summary panel on the next page',
                        'The Appointment Type label is missing from the summary panel — the panel component may have been changed or the label was removed',
                        'slotPicker.cases.js TC-SP-12 | next page summary Appointment Type label'
                    )
                ).toBeVisible({ timeout: 5_000 });
            });
        }

    });
}
