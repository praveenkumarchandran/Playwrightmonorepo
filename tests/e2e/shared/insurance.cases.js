/**
 * SHARED INSURANCE TEST CASES
 * Used by all clients that have an insurance step.
 * Wire into a spec: runInsuranceCases(test, expect)
 * Requires fixture: insurancePage (from newPatient.fixture.js)
 */

/**
 * @param {object} opts
 * @param {boolean} [opts.hasInsuranceGating=true]     — Continue/Next is disabled before selecting a type
 * @param {boolean} [opts.hasInsuranceDOB=false]       — Insurance page has a DOB field
 * @param {boolean} [opts.hasManualEntryBtn=true]      — false when fields appear directly (Hopemark)
 * @param {boolean} [opts.hasAutocompleteSearch=true]  — false for MUI-Select clients (SINY, Kronson); gates TC-INS-10/11/12
 * @param {boolean} [opts.hasSkipButton=false]         — true when a Skip button is present (SINY, Hopemark)
 * @param {boolean} [opts.hasTakePicture=false]        — true when "Take Picture of Card" button appears (SINY)
 * @param {string}  [opts.defaultInsuranceType]        — a valid non-self-pay type for this client used in TC-INS-04/05/06/07/08
 *                                                       TNDI/Clarus default: 'Insurance'
 *                                                       SINY: 'Private or Employer Insurance'
 * @param {string[]}[opts.insuranceTypes]              — all non-self-pay types to test individually (TC-INS-15+)
 * @param {string[]}[opts.holderOptions]              — Primary Insurance Holder options to test (['Self','Spouse','Other'])
 * @param {string}  [opts.stepBeforeInsurance]         — stepper label of the step just before insurance (e.g. 'Choose Date & Time')
 *                                                       When set, enables TC-INS-H06 (navigate to that step and back, verify pre-fill)
 * @param {string}  [opts.intakeStepLabel]             — stepper label of the intake step (e.g. 'Intake Questions')
 *                                                       When set, enables TC-INS-H07 (navigate to intake and back, verify pre-fill)
 * @param {string}  [opts.errorSelector]               — CSS selector for inline validation errors
 */
function runInsuranceCases(test, expect, opts = {}) {
    const {
        hasInsuranceGating          = true,
        hasInsuranceDOB             = false,
        hasManualEntryBtn           = true,
        hasAutocompleteSearch       = true,
        hasPlanAutocomplete         = true,
        hasSkipButton               = false,
        hasTakePicture              = false,
        canCompletePrivateInsurance = true,
        defaultInsuranceType        = 'Insurance',
        stepBeforeInsurance         = null,
        intakeStepLabel             = null,
        errorSelector               = '[class*="Mui-error"], [aria-invalid="true"]',
    } = opts;

    // ── 1. SELF-PAY ───────────────────────────────────────────────────────────

    test.describe('Self-pay selection', () => {

        test('TC-INS-01 — Self-pay option is selectable', async ({ insurancePage }) => {
            await insurancePage.selectSelfPay();
            await expect(insurancePage.nextBtn).toBeVisible({ timeout: 10_000 });
        });

        test('TC-INS-02 — Continue/Next is enabled after Self-pay selected', async ({ insurancePage }) => {
            await insurancePage.selectSelfPay();
            await expect(insurancePage.nextBtn).toBeEnabled();
        });

        if (hasInsuranceGating) {
            test('TC-INS-03 — Continue is disabled before any insurance type selected', async ({ insurancePage }) => {
                await insurancePage.nextBtn.waitFor({ state: 'visible', timeout: 10_000 });
                const isDisabled = await insurancePage.nextBtn.evaluate(btn =>
                    btn.disabled || btn.getAttribute('aria-disabled') === 'true'
                );
                expect(isDisabled).toBe(true);
            });
        }

    });

    // ── 2. MANUAL ENTRY ───────────────────────────────────────────────────────

    // "Take Picture of Card" and "Manually Enter Details" are admin-configurable.
    // All tests here detect button presence at runtime — resilient to admin config changes.

    test.describe('Manual entry flow', () => {

        test('TC-INS-04 — insurance detail UI is accessible after selecting type', async ({ insurancePage }) => {
            await insurancePage.selectInsuranceType(defaultInsuranceType);
            const hasBtn = await insurancePage.manualEntryBtn.isVisible({ timeout: 5_000 }).catch(() => false);
            if (hasBtn) {
                // Admin has enabled the button choice flow
                await expect(insurancePage.manualEntryBtn).toBeVisible();
            } else {
                // Admin has disabled buttons — detail fields appear directly
                await expect(insurancePage.nextBtn).toBeEnabled({ timeout: 10_000 });
            }
        });

        test('TC-INS-04b — Take Picture of Card appears when admin enables the button flow', async ({ insurancePage }) => {
            await insurancePage.selectInsuranceType(defaultInsuranceType);
            const hasManualBtn = await insurancePage.manualEntryBtn.isVisible({ timeout: 5_000 }).catch(() => false);
            if (!hasManualBtn) {
                console.log('Take Picture / Manually Enter buttons absent — admin config off');
                return; // skip gracefully when admin disabled
            }
            await expect(insurancePage.takePictureBtn).toBeVisible({ timeout: 5_000 });
        });

        test('TC-INS-05 — insurance detail fields are visible after entering manual mode', async ({ insurancePage }) => {
            // prepareInsuranceForm clicks "Manually Enter Details" if present, no-op if admin disabled it
            await insurancePage.prepareInsuranceForm(defaultInsuranceType);
            const planVisible = await insurancePage.planInput.isVisible({ timeout: 5_000 }).catch(() => false);
            const groupIdVisible = await insurancePage.groupIdInput.isVisible({ timeout: 5_000 }).catch(() => false);
            expect(planVisible || groupIdVisible).toBe(true);
        });

        test('TC-INS-05b — Group ID and Member ID text inputs are fillable', async ({ insurancePage }) => {
            await insurancePage.prepareInsuranceForm(defaultInsuranceType);
            await insurancePage.groupIdInput.waitFor({ state: 'visible', timeout: 10_000 });
            await insurancePage.groupIdInput.fill('GRP123');
            await insurancePage.memberIdInput.fill('MBR456');
            await expect(insurancePage.groupIdInput).toHaveValue('GRP123');
            await expect(insurancePage.memberIdInput).toHaveValue('MBR456');
        });

        if (hasPlanAutocomplete) {
            test('TC-INS-05c — Insurance plan search returns results', async ({ insurancePage }) => {
                await insurancePage.prepareInsuranceForm(defaultInsuranceType);
                await insurancePage.planInput.waitFor({ state: 'visible', timeout: 10_000 });
                await insurancePage.planInput.fill('Blue');
                await expect(
                    insurancePage.page.locator('.MuiAutocomplete-option, [role="option"]').first()
                ).toBeVisible({ timeout: 10_000 });
            });

            test('TC-INS-05d — Selecting "Other" as insurance plan reveals the plan name field', async ({ insurancePage }) => {
                await insurancePage.prepareInsuranceForm(defaultInsuranceType);
                await insurancePage.selectPlan('Other');
                await expect(insurancePage.planNameInput).toBeVisible({ timeout: 10_000 });
            });
        }

    });

    // ── 3. FIELD VALIDATION ───────────────────────────────────────────────────

    test.describe('Field validation', () => {

        test('TC-INS-06 — Submitting without required fields shows errors', async ({ insurancePage }) => {
            await insurancePage.prepareInsuranceForm(defaultInsuranceType);
            await insurancePage.nextBtn.click();
            await expect(
                insurancePage.page.locator(errorSelector).first()
            ).toBeVisible({ timeout: 5_000 });
        });

        if (hasInsuranceDOB) {
            test('TC-INS-07 — Invalid DOB format shows error', async ({ insurancePage }) => {
                await insurancePage.prepareInsuranceForm(defaultInsuranceType);
                await insurancePage.fillDOBInsurance('99999999');
                await insurancePage.nextBtn.click();
                await expect(
                    insurancePage.page.locator(errorSelector).first()
                ).toBeVisible({ timeout: 5_000 });
            });
        }

    });

    // ── 4. SWITCHING TYPES ────────────────────────────────────────────────────

    test.describe('Switching insurance types', () => {

        test('TC-INS-08 — Switching from a non-self-pay type to Self-pay hides manual fields', async ({ insurancePage }) => {
            await insurancePage.prepareInsuranceForm(defaultInsuranceType);
            await insurancePage.selectSelfPay();
            // Verify the manual entry UI (if it was shown) is gone after switching to Self-pay
            const btnStillVisible = await insurancePage.manualEntryBtn.isVisible({ timeout: 2_000 }).catch(() => false);
            expect(btnStillVisible).toBe(false);
            // Next must still be enabled after switching
            await expect(insurancePage.nextBtn).toBeEnabled();
        });

        test('TC-INS-09 — Re-selecting same type works without errors', async ({ insurancePage }) => {
            await insurancePage.selectSelfPay();
            await insurancePage.selectSelfPay();
            await expect(insurancePage.nextBtn).toBeEnabled();
        });

    });

    // ── 5. EDGE CASES (autocomplete clients only) ─────────────────────────────
    // TC-INS-10/11/12 use the typed-search input (#insurance-select-box) which
    // is only present for MUI-Autocomplete clients (TNDI, Clarus, SINY, Freedman).
    // Set hasAutocompleteSearch: false for MUI-Select clients (Kronson) to skip.

    if (hasAutocompleteSearch) {
        test.describe('Edge cases', () => {

            test('TC-INS-10 — Insurance dropdown accepts typed search input', async ({ insurancePage }) => {
                await insurancePage.insuranceInput.click();
                await insurancePage.insuranceInput.fill('Self');
                await expect(
                    insurancePage.page.locator('.MuiAutocomplete-option').first()
                ).toBeVisible({ timeout: 10_000 });
            });

            test('TC-INS-11 — Invalid search shows no dropdown options', async ({ insurancePage }) => {
                await insurancePage.insuranceInput.click();
                await insurancePage.insuranceInput.fill('zzzzinvalidinsurance9999');
                await expect(
                    insurancePage.page.locator('.MuiAutocomplete-option')
                ).toHaveCount(0, { timeout: 5_000 });
            });

            test('TC-INS-12 — Page loads without any pre-selected insurance', async ({ insurancePage }) => {
                const value = await insurancePage.insuranceInput.inputValue();
                expect(value).toBe('');
            });

        });
    }

    // ── 6. INSURANCE TYPE VARIANTS ────────────────────────────────────────────
    // opts.insuranceTypes: every non-self-pay type available in the dropdown for
    // this client (e.g. ['Insurance', 'Medicare', 'Medicaid']).
    // A test is generated for each type verifying it is selectable and reveals
    // the expected detail UI (manual entry button OR direct fields).

    const insuranceTypes = opts.insuranceTypes ?? [];

    if (insuranceTypes.length > 0) {
        test.describe('Insurance type variants', () => {

            insuranceTypes.forEach((type, i) => {
                const tcNum = `TC-INS-${15 + i}`;

                test(`${tcNum} — "${type}" is selectable and insurance detail UI appears`, async ({ insurancePage }) => {
                    await insurancePage.selectInsuranceType(type);
                    // Detect dynamically: button flow OR direct fields
                    const hasBtn = await insurancePage.manualEntryBtn.isVisible({ timeout: 5_000 }).catch(() => false);
                    if (hasBtn) {
                        await expect(insurancePage.manualEntryBtn).toBeVisible();
                    } else {
                        await expect(insurancePage.nextBtn).toBeEnabled({ timeout: 10_000 });
                    }
                });

            });

        });
    }

    // ── 7. PRIMARY INSURANCE HOLDER ───────────────────────────────────────────
    // opts.holderOptions: holder options available for this client (Self / Spouse / Other).
    // Tests verify:
    //   Self    → insured name / DOB fields are NOT shown (it's the patient themselves)
    //   Spouse / Other → insured FirstName, LastName, DOB fields ARE shown

    const holderOptions = opts.holderOptions ?? [];

    if (holderOptions.length > 0) {
        test.describe('Primary Insurance Holder', () => {

            test('TC-INS-H01 — Primary Insurance Holder dropdown is visible after entering detail mode', async ({ insurancePage }) => {
                await insurancePage.prepareInsuranceForm(defaultInsuranceType);
                // At least one holder option should be reachable — click to open the dropdown
                await insurancePage.selectPrimaryHolder(holderOptions[0]);
                // Verify a holder value was accepted (no error thrown)
                await expect(insurancePage.nextBtn).toBeVisible({ timeout: 5_000 });
            });

            if (holderOptions.includes('Self')) {
                test('TC-INS-H02 — selecting "Self" as holder hides the insured name / DOB fields', async ({ insurancePage }) => {
                    await insurancePage.prepareInsuranceForm(defaultInsuranceType);
                    await insurancePage.selectPrimaryHolder('Self');
                    await expect(insurancePage.insuredFirstName).not.toBeVisible({ timeout: 3_000 });
                    await expect(insurancePage.insuredLastName).not.toBeVisible({ timeout: 3_000 });
                });
            }

            const dependentOptions = holderOptions.filter(o => o !== 'Self');
            for (const holder of dependentOptions) {
                test(`TC-INS-H0${holderOptions.indexOf(holder) + 2} — selecting "${holder}" reveals insured name, last name, and DOB fields`, async ({ insurancePage }) => {
                    await insurancePage.prepareInsuranceForm(defaultInsuranceType);
                    await insurancePage.selectPrimaryHolder(holder);
                    await expect(insurancePage.insuredFirstName).toBeVisible({ timeout: 5_000 });
                    await expect(insurancePage.insuredLastName).toBeVisible({ timeout: 5_000 });
                    await expect(insurancePage.insuredDOB).toBeVisible({ timeout: 5_000 });
                });
            }

            // ── Edge: toggle holder back to Self ────────────────────────────
            if (holderOptions.includes('Self') && dependentOptions.length > 0) {
                test(`TC-INS-H08 — switching holder from "${dependentOptions[0]}" back to "Self" hides the insured fields again`, async ({ insurancePage }) => {
                    await insurancePage.prepareInsuranceForm(defaultInsuranceType);
                    await insurancePage.selectPrimaryHolder(dependentOptions[0]);
                    await expect(insurancePage.insuredFirstName).toBeVisible({ timeout: 5_000 });
                    await insurancePage.selectPrimaryHolder('Self');
                    await expect(insurancePage.insuredFirstName).not.toBeVisible({ timeout: 5_000 });
                });
            }

            // ── Fill & persistence tests ─────────────────────────────────────
            const dependentHolder = holderOptions.find(o => o !== 'Self') ?? holderOptions[0];
            const TEST_FNAME = 'InsuredTest';
            const TEST_LNAME = 'PersonTest';

            test(`TC-INS-H05 — insured fields accept input after selecting "${dependentHolder}"`, async ({ insurancePage }) => {
                await insurancePage.prepareInsuranceForm(defaultInsuranceType);
                await insurancePage.selectPrimaryHolder(dependentHolder);
                await insurancePage.insuredFirstName.fill(TEST_FNAME);
                await insurancePage.insuredLastName.fill(TEST_LNAME);
                await insurancePage.selectInsuredGender('Male');
                await insurancePage.insuredDOB.click();
                await insurancePage.insuredDOB.pressSequentially('01011990', { delay: 30 });
                await expect(insurancePage.insuredFirstName).toHaveValue(TEST_FNAME);
                await expect(insurancePage.insuredLastName).toHaveValue(TEST_LNAME);
            });

            if (stepBeforeInsurance) {
                test(`TC-INS-H06 — navigating to "${stepBeforeInsurance}" via stepper and back preserves insured field values`, async ({ insurancePage }) => {
                    await insurancePage.prepareInsuranceForm(defaultInsuranceType);
                    await insurancePage.selectPrimaryHolder(dependentHolder);
                    await insurancePage.insuredFirstName.fill(TEST_FNAME);
                    await insurancePage.insuredLastName.fill(TEST_LNAME);
                    await insurancePage.clickStepperStep(stepBeforeInsurance);
                    await insurancePage.page.waitForLoadState('networkidle', { timeout: 20_000 });
                    await insurancePage.clickStepperStep('Add Insurance');
                    await insurancePage.page.waitForLoadState('networkidle', { timeout: 20_000 });
                    await expect(insurancePage.insuredFirstName).toBeVisible({ timeout: 10_000 });
                    await expect(insurancePage.insuredFirstName).toHaveValue(TEST_FNAME);
                    await expect(insurancePage.insuredLastName).toHaveValue(TEST_LNAME);
                });
            }

            if (intakeStepLabel && stepBeforeInsurance) {
                test(`TC-INS-H07 — navigating Insurance → "${intakeStepLabel}" → "${stepBeforeInsurance}" → "Add Insurance" preserves insured field values`, async ({ insurancePage }) => {
                    await insurancePage.prepareInsuranceForm(defaultInsuranceType);
                    await insurancePage.selectPrimaryHolder(dependentHolder);
                    await insurancePage.insuredFirstName.fill(TEST_FNAME);
                    await insurancePage.insuredLastName.fill(TEST_LNAME);
                    await insurancePage.clickStepperStep(intakeStepLabel);
                    await insurancePage.page.waitForLoadState('networkidle', { timeout: 20_000 });
                    await insurancePage.clickStepperStep(stepBeforeInsurance);
                    await insurancePage.page.waitForLoadState('networkidle', { timeout: 20_000 });
                    await insurancePage.clickStepperStep('Add Insurance');
                    await insurancePage.page.waitForLoadState('networkidle', { timeout: 20_000 });
                    await expect(insurancePage.insuredFirstName).toBeVisible({ timeout: 10_000 });
                    await expect(insurancePage.insuredFirstName).toHaveValue(TEST_FNAME);
                    await expect(insurancePage.insuredLastName).toHaveValue(TEST_LNAME);
                });
            }

        });
    }

    // ── 8. NAVIGATION ────────────────────────────────────────────────────────

    test.describe('Navigation', () => {

        test('TC-INS-13 — completing Self-pay and clicking Continue navigates to the patient info page', async ({ insurancePage }) => {
            await insurancePage.selectSelfPay();
            await insurancePage.continue();
            await expect(
                insurancePage.page.locator('input[name*="firstName"]').first()
            ).toBeVisible({ timeout: 15_000 });
        });

        if (canCompletePrivateInsurance) {
            test('TC-INS-13b — completing private insurance with Self as holder navigates to patient info', async ({ insurancePage }) => {
                await insurancePage.prepareInsuranceForm(defaultInsuranceType);
                await insurancePage.groupIdInput.waitFor({ state: 'visible', timeout: 10_000 });
                await insurancePage.groupIdInput.fill('GRP123');
                await insurancePage.memberIdInput.fill('MBR456');
                if ((opts.holderOptions ?? []).includes('Self')) {
                    await insurancePage.selectPrimaryHolder('Self');
                }
                await insurancePage.continue();
                await expect(
                    insurancePage.page.locator('input[name*="firstName"]').first()
                ).toBeVisible({ timeout: 15_000 });
            });
        }

        if (hasSkipButton) {
            test('TC-INS-14 — Skip button bypasses insurance and navigates to the patient info page', async ({ insurancePage }) => {
                const skipBtn = insurancePage.page
                    .locator('button:has-text("Skip")')
                    .first();
                await expect(skipBtn).toBeVisible({ timeout: 10_000 });
                await skipBtn.click();
                await expect(
                    insurancePage.page.locator('input[name*="firstName"]').first()
                ).toBeVisible({ timeout: 15_000 });
            });
        }

    });
}

export { runInsuranceCases };
