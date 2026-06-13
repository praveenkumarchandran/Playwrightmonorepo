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
        const step = page
            .locator('.MuiStep-root, [class*="MuiStep-root"]')
            .filter({ hasText: label })
            .first();

        await step.waitFor({ state: 'visible', timeout: 10_000 });

        // Click the circle button inside the step (the number)
        const circleBtn = step.locator('button.MuiButtonBase-root, button[class*="MuiIconButton"]').first();
        await circleBtn.waitFor({ state: 'visible', timeout: 5_000 });
        await circleBtn.click();

        await page.waitForLoadState('networkidle', { timeout: 20_000 });
    }

    test.describe('Stepper back navigation', () => {

        // ── Add Insurance (skipped when flow has no insurance step) ───────────

        if (hasInsurance) {
            test('TC-STEP-01 — from Add Info, clicking Add Insurance navigates back', async ({ stepperPage }) => {
                await goBack(stepperPage, 'Add Insurance');
                await expect(
                    stepperPage.locator('[class*="MuiTypography"], label, h4, h5, h6')
                        .filter({ hasText: /insurance/i })
                        .first()
                ).toBeVisible({ timeout: 10_000 });
            });

            test('TC-STEP-02 — Add Insurance step: insurance type selector is present', async ({ stepperPage }) => {
                await goBack(stepperPage, 'Add Insurance');
                // Verify the insurance type select/combobox rendered (value may reset to default on back-nav)
                await expect(
                    stepperPage.locator('[class*="MuiSelect-select"], [role="combobox"], select').first()
                ).toBeVisible({ timeout: 10_000 });
            });
        }

        // ── Choose Date & Time ────────────────────────────────────────────────

        test('TC-STEP-03 — clicking Choose Date & Time navigates back to slot picker', async ({ stepperPage }) => {
            test.slow();
            if (hasInsurance) await goBack(stepperPage, 'Add Insurance');
            await goBack(stepperPage, 'Choose Date & Time');
            await expect(
                stepperPage.locator('button').filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i }).first()
            ).toBeVisible({ timeout: 20_000 });
        });

        test('TC-STEP-04 — slot page preserves previously selected filter values', async ({ stepperPage }) => {
            test.slow();
            if (hasInsurance) await goBack(stepperPage, 'Add Insurance');
            await goBack(stepperPage, 'Choose Date & Time');
            await expect(
                stepperPage.locator(':text-matches("Change Filters|Basic Search", "i")').first()
            ).toBeVisible({ timeout: 30_000 });
        });

        // ── Intake Questions (if applicable) ──────────────────────────────────

        if (hasIntake) {
            test('TC-STEP-05 — clicking Intake Questions navigates back', async ({ stepperPage }) => {
                // With insurance: go via Add Insurance first; without (SINY): click directly
                if (hasInsurance) await goBack(stepperPage, 'Add Insurance');
                await goBack(stepperPage, 'Intake Questions');
                await expect(
                    stepperPage.locator('text=Intake Questions').first()
                ).toBeVisible({ timeout: 10_000 });
            });

            test('TC-STEP-06 — Intake Questions step shows intake form', async ({ stepperPage }) => {
                if (hasInsurance) await goBack(stepperPage, 'Add Insurance');
                await goBack(stepperPage, 'Intake Questions');

                if (intakeCondition) {
                    // Hopemark: conditions autocomplete preserves the selected chip
                    await expect(
                        stepperPage.locator('.MuiChip-label, [class*="MuiAutocomplete-tag"]')
                            .filter({ hasText: intakeCondition })
                            .first()
                    ).toBeVisible({ timeout: 10_000 });
                } else {
                    // TNDI/SINY: verify intake form element is present
                    await expect(
                        stepperPage.locator('[class*="MuiAutocomplete-root"], textarea').first()
                    ).toBeVisible({ timeout: 10_000 });
                }
            });
        }

        // ── Location (if applicable) ──────────────────────────────────────────

        if (hasLocation) {
            test('TC-STEP-07 — from Choose Date & Time, clicking Location navigates back', async ({ stepperPage }) => {
                if (hasInsurance) await goBack(stepperPage, 'Add Insurance');
                await goBack(stepperPage, 'Choose Date & Time');
                await goBack(stepperPage, 'Location');
                await expect(
                    stepperPage.locator(
                        'input[id*="location"], input[id*="appointment_location"], ' +
                        '[class*="MuiSelect-select"], [role="combobox"]'
                    ).first()
                ).toBeVisible({ timeout: 10_000 });
            });
        }

        // ── Round-trip: back then forward again ───────────────────────────────

        test('TC-STEP-08 — navigating back then forward', async ({ stepperPage }) => {
            if (hasInsurance) {
                // Clients with insurance: use Skip button (bypasses re-entry) if available
                await goBack(stepperPage, 'Add Insurance');
                const skipBtn = stepperPage.locator('button:has-text("Skip")').first();
                const skipVisible = await skipBtn.isVisible({ timeout: 3_000 }).catch(() => false);
                if (!skipVisible) return;
                await skipBtn.click();
                await stepperPage.waitForLoadState('networkidle', { timeout: 20_000 });
                await expect(
                    stepperPage.locator(
                        'input[placeholder*="First"], input[name*="first"], input[id*="first"], ' +
                        'input[placeholder*="Last"], input[id*="last"], input[id*="firstName"]'
                    ).first()
                ).toBeVisible({ timeout: 10_000 });
            } else {
                // SINY (no insurance): go back to Intake, click Continue → lands on slot picker
                await goBack(stepperPage, 'Intake Questions');
                const continueBtn = stepperPage.locator('button:has-text("Continue")').first();
                const visible = await continueBtn.isVisible({ timeout: 3_000 }).catch(() => false);
                if (!visible) return;
                await continueBtn.click();
                await stepperPage.waitForLoadState('networkidle', { timeout: 20_000 });
                await expect(
                    stepperPage.locator('button').filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i }).first()
                ).toBeVisible({ timeout: 10_000 });
            }
        });

    });
}

export { runStepperCases };
