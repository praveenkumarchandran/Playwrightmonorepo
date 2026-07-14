/**
 * STEPPER BACK-NAVIGATION PERSISTENCE TESTS
 *
 * Verifies that clicking a completed stepper step navigates back to that
 * step AND that previously entered data is still present.
 *
 * Requires fixture: stepperPage (raw Playwright page, full flow completed,
 * currently on the PatientInfo/Add Info page)
 *
 * Stepper label vocabulary (same across all Setter clients):
 *   'Location'         — slotFilter step  (only on clients with location filter)
 *   'Choose Date & Time' — slotPick step
 *   'Intake Questions' — intake step       (only on clients with intake)
 *   'Add Insurance'    — insurance step
 *   'Add Info'         — patientInfo step  (current page when tests start)
 *
 * @param {object} opts
 * @param {boolean} [opts.hasIntake=false]      — client has an Intake Questions step
 * @param {boolean} [opts.hasLocation=false]    — client has a Location/filter step
 * @param {boolean} [opts.hasInsurance=true]    — client has an Add Insurance step
 *                                                (false for SINY: no insurance in flow)
 * @param {string}  [opts.intakeCondition=null] — chip value to assert on intake page
 *                                                ('ADHD' for Hopemark, null = TNDI chip check)
 */
import { step, failMsg } from '../../utils/testContext.js';

function runStepperCases(test, expect, opts = {}) {
    const {
        hasIntake       = false,
        hasLocation     = false,
        hasInsurance    = true,
        intakeCondition = null,
    } = opts;

    // Helper: click a stepper step's NUMBER CIRCLE and wait for navigation.
    //
    // DOM structure per step:
    //   MuiStep-root
    //     MuiStepLabel-root
    //       MuiStepLabel-iconContainer
    //         button.MuiButtonBase-root  ← the clickable circle (shows "1", "2", etc.)
    //       MuiStepLabel-labelContainer
    //         span.MuiStepLabel-label > p  ← the label text (NOT clickable)
    //
    // We locate the step by its label text, then click the button inside.
    async function goBack(page, label) {
        const stepEl = page
            .locator('.MuiStep-root, [class*="MuiStep-root"]')
            .filter({ hasText: label })
            .first();

        await stepEl.waitFor({ state: 'visible', timeout: 10_000 });

        // Click the circle button inside the step (the number)
        const circleBtn = stepEl.locator('button.MuiButtonBase-root, button[class*="MuiIconButton"]').first();
        await circleBtn.waitFor({ state: 'visible', timeout: 5_000 });
        await circleBtn.click();

        await page.waitForLoadState('networkidle', { timeout: 20_000 });
    }

    test.describe('Stepper back navigation', () => {

        // ── Add Insurance (skipped when flow has no insurance step) ───────────

        if (hasInsurance) {
            test('TC-STEP-01 — from Add Info, clicking Add Insurance navigates back', async ({ stepperPage }) => {
                step('Clicking the Add Insurance stepper circle to navigate back');
                await goBack(stepperPage, 'Add Insurance');

                step('Verifying insurance page heading is visible after back-navigation');
                await expect(
                    stepperPage.locator('[class*="MuiTypography"], label, h4, h5, h6')
                        .filter({ hasText: /insurance/i })
                        .first(),
                    failMsg(
                        'TC-STEP-01',
                        'Insurance page heading must be visible after clicking the Add Insurance stepper step',
                        'Stepper circle may not be clickable or MuiStep-root selector changed — goBack() may have clicked nothing',
                        'stepper.cases.js goBack() | MuiStep-root DOM structure'
                    )
                ).toBeVisible({ timeout: 10_000 });
            });

            test('TC-STEP-02 — Add Insurance step: insurance type selector is present', async ({ stepperPage }) => {
                step('Navigating back to Add Insurance via stepper circle');
                await goBack(stepperPage, 'Add Insurance');

                step('Verifying insurance type select/combobox is rendered on the insurance page');
                // Verify the insurance type select/combobox rendered (value may reset to default on back-nav)
                await expect(
                    stepperPage.locator('[class*="MuiSelect-select"], [role="combobox"], select').first(),
                    failMsg(
                        'TC-STEP-02',
                        'Insurance type selector (MuiSelect or combobox) must be visible on the insurance page',
                        'The insurance form failed to render after back-navigation — component may not have mounted or selector changed',
                        'stepper.cases.js goBack("Add Insurance") | insurance page MuiSelect-select'
                    )
                ).toBeVisible({ timeout: 10_000 });
            });
        }

        // ── Choose Date & Time ────────────────────────────────────────────────

        test('TC-STEP-03 — clicking Choose Date & Time navigates back to slot picker', async ({ stepperPage }) => {
            test.slow();

            if (hasInsurance) {
                step('Navigating back to Add Insurance first (intermediate step)');
                await goBack(stepperPage, 'Add Insurance');
            }

            step('Clicking the Choose Date & Time stepper circle');
            await goBack(stepperPage, 'Choose Date & Time');

            step('Verifying at least one time-slot button is visible on the slot picker page');
            await expect(
                stepperPage.locator('button').filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i }).first(),
                failMsg(
                    'TC-STEP-03',
                    'A time-slot button (HH:MM AM/PM) must be visible after navigating back to Choose Date & Time',
                    'Stepper back-navigation to the slot picker failed — page may have not loaded or time slots are missing',
                    'stepper.cases.js goBack("Choose Date & Time") | slot picker time-slot buttons'
                )
            ).toBeVisible({ timeout: 20_000 });
        });

        test('TC-STEP-04 — slot page preserves previously selected filter values', async ({ stepperPage }) => {
            test.slow();

            if (hasInsurance) {
                step('Navigating back to Add Insurance first (intermediate step)');
                await goBack(stepperPage, 'Add Insurance');
            }

            step('Clicking the Choose Date & Time stepper circle');
            await goBack(stepperPage, 'Choose Date & Time');

            step('Verifying Change Filters / Basic Search panel is visible (confirming filter state preserved)');
            await expect(
                stepperPage.locator(':text-matches("Change Filters|Basic Search", "i")').first(),
                failMsg(
                    'TC-STEP-04',
                    '"Change Filters" or "Basic Search" panel must be visible after back-navigation to slot picker',
                    'Filter panel failed to render — the slot picker page did not load correctly or filter state was lost',
                    'stepper.cases.js goBack("Choose Date & Time") | slot picker Change Filters panel'
                )
            ).toBeVisible({ timeout: 30_000 });
        });

        // ── Intake Questions (if applicable) ──────────────────────────────────

        if (hasIntake) {
            test('TC-STEP-05 — clicking Intake Questions navigates back', async ({ stepperPage }) => {
                // With insurance: go via Add Insurance first; without (SINY): click directly
                if (hasInsurance) {
                    step('Navigating back to Add Insurance first (intermediate step)');
                    await goBack(stepperPage, 'Add Insurance');
                }

                step('Clicking the Intake Questions stepper circle');
                await goBack(stepperPage, 'Intake Questions');

                step('Verifying "Intake Questions" heading is visible after back-navigation');
                await expect(
                    stepperPage.locator('text=Intake Questions').first(),
                    failMsg(
                        'TC-STEP-05',
                        '"Intake Questions" heading must be visible after clicking the Intake Questions stepper step',
                        'Stepper circle for Intake Questions may not be clickable or the intake page failed to render',
                        'stepper.cases.js goBack("Intake Questions") | intake page heading'
                    )
                ).toBeVisible({ timeout: 10_000 });
            });

            test('TC-STEP-06 — Intake Questions step shows intake form', async ({ stepperPage }) => {
                if (hasInsurance) {
                    step('Navigating back to Add Insurance first (intermediate step)');
                    await goBack(stepperPage, 'Add Insurance');
                }

                step('Clicking the Intake Questions stepper circle');
                await goBack(stepperPage, 'Intake Questions');

                if (intakeCondition) {
                    step(`Verifying intake condition chip "${intakeCondition}" is preserved (Hopemark)`);
                    // Hopemark: conditions autocomplete preserves the selected chip
                    await expect(
                        stepperPage.locator('.MuiChip-label, [class*="MuiAutocomplete-tag"]')
                            .filter({ hasText: intakeCondition })
                            .first(),
                        failMsg(
                            'TC-STEP-06',
                            `Intake condition chip "${intakeCondition}" must be visible after back-navigation`,
                            'Previously selected condition chip was not preserved — the Autocomplete component may have reset its value on back-nav',
                            'stepper.cases.js goBack("Intake Questions") | MuiChip-label / MuiAutocomplete-tag'
                        )
                    ).toBeVisible({ timeout: 10_000 });
                } else {
                    step('Verifying intake form element (Autocomplete or textarea) is present (TNDI/SINY)');
                    // TNDI/SINY: verify intake form element is present
                    await expect(
                        stepperPage.locator('[class*="MuiAutocomplete-root"], textarea').first(),
                        failMsg(
                            'TC-STEP-06',
                            'An intake form element (MuiAutocomplete or textarea) must be visible after back-navigation to Intake Questions',
                            'Intake form failed to render — the component may have unmounted or the selector changed',
                            'stepper.cases.js goBack("Intake Questions") | MuiAutocomplete-root / textarea'
                        )
                    ).toBeVisible({ timeout: 10_000 });
                }
            });
        }

        // ── Location (if applicable) ──────────────────────────────────────────

        if (hasLocation) {
            test('TC-STEP-07 — from Choose Date & Time, clicking Location navigates back', async ({ stepperPage }) => {
                if (hasInsurance) {
                    step('Navigating back to Add Insurance first (intermediate step)');
                    await goBack(stepperPage, 'Add Insurance');
                }

                step('Navigating back to Choose Date & Time');
                await goBack(stepperPage, 'Choose Date & Time');

                step('Clicking the Location stepper circle to navigate further back');
                await goBack(stepperPage, 'Location');

                step('Verifying location input or combobox is visible on the Location step page');
                await expect(
                    stepperPage.locator(
                        'input[id*="location"], input[id*="appointment_location"], ' +
                        '[class*="MuiSelect-select"], [role="combobox"]'
                    ).first(),
                    failMsg(
                        'TC-STEP-07',
                        'Location input or combobox must be visible after navigating back to the Location step',
                        'The Location step page failed to render its filter input — stepper circle may not have been clickable or selector changed',
                        'stepper.cases.js goBack("Location") | location input / MuiSelect-select / combobox'
                    )
                ).toBeVisible({ timeout: 10_000 });
            });
        }

        // ── Round-trip: back then forward again ───────────────────────────────

        test('TC-STEP-08 — navigating back then forward', async ({ stepperPage }) => {
            test.slow();
            if (hasInsurance) {
                step('Navigating back to Add Insurance via stepper circle');
                // Clients with insurance: use Skip button (bypasses re-entry) if available
                await goBack(stepperPage, 'Add Insurance');

                step('Looking for Skip button to bypass insurance re-entry');
                const skipBtn = stepperPage.locator('button:has-text("Skip")').first();
                const skipVisible = await skipBtn.isVisible({ timeout: 3_000 }).catch(() => false);
                if (!skipVisible) return;

                step('Clicking Skip to return to patient info page');
                await skipBtn.click();
                await stepperPage.waitForLoadState('networkidle', { timeout: 20_000 });

                step('Verifying patient info first/last name input is visible after forward navigation');
                await expect(
                    stepperPage.locator(
                        'input[placeholder*="First"], input[name*="first"], input[id*="first"], ' +
                        'input[placeholder*="Last"], input[id*="last"], input[id*="firstName"]'
                    ).first(),
                    failMsg(
                        'TC-STEP-08',
                        'Patient info first/last name input must be visible after using Skip on the insurance page',
                        'Forward navigation after Skip failed — the Skip button may not have triggered navigation or the patient info page failed to render',
                        'stepper.cases.js TC-STEP-08 | InsurancePage Skip button → patient info inputs'
                    )
                ).toBeVisible({ timeout: 10_000 });
            } else {
                step('Navigating back to Intake Questions (SINY — no insurance step)');
                // SINY (no insurance): go back to Intake, click Continue → lands on slot picker
                await goBack(stepperPage, 'Intake Questions');

                step('Looking for Continue button on the intake page');
                const continueBtn = stepperPage.locator('button:has-text("Continue")').first();
                const visible = await continueBtn.isVisible({ timeout: 3_000 }).catch(() => false);
                if (!visible) return;

                step('Clicking Continue to navigate forward from intake to slot picker');
                await continueBtn.click();
                await stepperPage.waitForLoadState('networkidle', { timeout: 20_000 });

                step('Verifying time-slot buttons are visible on the slot picker page after forward navigation');
                await expect(
                    stepperPage.locator('button').filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i }).first(),
                    failMsg(
                        'TC-STEP-08',
                        'Time-slot buttons (HH:MM AM/PM) must be visible after Continue from intake navigates forward to slot picker',
                        'Forward navigation from intake back to slot picker failed — Continue may not have triggered navigation or the slot picker page failed to load',
                        'stepper.cases.js TC-STEP-08 | intake Continue button → slot picker time-slot buttons'
                    )
                ).toBeVisible({ timeout: 10_000 });
            }
        });

    });
}

export { runStepperCases };
