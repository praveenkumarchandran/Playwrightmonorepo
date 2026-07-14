/**
 * SHARED INSURANCE TEST CASES
 * Used by all clients that have an insurance step.
 * Wire into a spec: runInsuranceCases(test, expect)
 * Requires fixture: insurancePage (from newPatient.fixture.js)
 */

import { step, failMsg } from '../../utils/testContext.js';

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

    // Admin can switch between type-based (Self-pay / Medicaid / Private or Employer Insurance)
    // and plan-based (Aetna Better Health / Ambetter Medicaid / …) at any time.
    // liveNonSelfPayType() checks the live dropdown:
    //   1. If defaultInsuranceType exists in the dropdown → use it (exact match for the
    //      configured plan/type, e.g. 'Aetna Better Health' when plan-based is active)
    //   2. Otherwise → first available non-self-pay option (works for any config)
    async function liveNonSelfPayType(insurancePage) {
        const options = await insurancePage.getInsuranceTypeOptions();
        const preferred = options.find(o =>
            o.toLowerCase().includes(defaultInsuranceType.toLowerCase())
        );
        if (preferred) return preferred;
        return options.find(o => !/self.?pay/i.test(o)) ?? defaultInsuranceType;
    }

    // ── 1. SELF-PAY ───────────────────────────────────────────────────────────

    test.describe('Self-pay selection', () => {

        test('TC-INS-01 — Self-pay option is selectable', async ({ insurancePage }) => {
            test.slow();

            step('Selecting Self-pay insurance type from the dropdown');
            await insurancePage.selectSelfPay();

            step('Verifying Continue/Next button is visible after Self-pay selection');
            await expect(insurancePage.nextBtn,
                failMsg('TC-INS-01',
                    'Continue/Next button must be visible after selecting Self-pay.',
                    'Self-pay option may not have been found in the dropdown, or the page did not re-render the footer button after selection.',
                    'insurance.cases.js | InsurancePage.selectSelfPay() → insurancePage.nextBtn'
                )
            ).toBeVisible({ timeout: 30_000 });
        });

        test('TC-INS-02 — Continue/Next is enabled after Self-pay selected', async ({ insurancePage }) => {
            test.slow();

            step('Selecting Self-pay insurance type');
            await insurancePage.selectSelfPay();

            step('Verifying Continue/Next button becomes enabled after Self-pay is selected');
            await expect(insurancePage.nextBtn,
                failMsg('TC-INS-02',
                    'Continue/Next button must be enabled (not disabled) after selecting Self-pay.',
                    'Button may still be in a loading/disabled state — the UI may not have responded to the Self-pay selection. Check for pending API calls or form state guards.',
                    'insurance.cases.js | InsurancePage.selectSelfPay() → insurancePage.nextBtn'
                )
            ).toBeEnabled({ timeout: 20_000 });
        });

        if (hasInsuranceGating) {
            test('TC-INS-03 — Continue is disabled before any insurance type selected', async ({ insurancePage }) => {
                step('Waiting for the Continue/Next button to be visible before any selection');
                await insurancePage.nextBtn.waitFor({ state: 'visible', timeout: 10_000 });

                step('Reading disabled state of Continue/Next before any insurance type is chosen');
                const isDisabled = await insurancePage.nextBtn.evaluate(btn =>
                    btn.disabled || btn.getAttribute('aria-disabled') === 'true'
                );

                step('Asserting Continue/Next is disabled when no insurance type has been selected');
                expect(isDisabled,
                    failMsg('TC-INS-03',
                        'Continue/Next button must be disabled before the user selects any insurance type.',
                        'Button gating logic may have been removed or the button renders enabled by default. Check the insurance form initialState / isValid guard in the frontend component.',
                        'insurance.cases.js | InsurancePage.nextBtn aria-disabled / disabled attribute'
                    )
                ).toBe(true);
            });
        }

    });

    // ── 2. MANUAL ENTRY ───────────────────────────────────────────────────────

    // "Take Picture of Card" and "Manually Enter Details" are admin-configurable.
    // All tests here detect button presence at runtime — resilient to admin config changes.

    test.describe('Manual entry flow', () => {

        test('TC-INS-04 — insurance detail UI is accessible after selecting type', async ({ insurancePage }) => {
            test.slow();
            const typeToUse = await liveNonSelfPayType(insurancePage);

            step(`Selecting insurance type "${typeToUse}"`);
            await insurancePage.selectInsuranceType(typeToUse);

            step('Checking whether "Manually Enter Details" button or the Next button is visible (admin-config dependent)');
            const hasBtn = await insurancePage.manualEntryBtn.isVisible({ timeout: 10_000 }).catch(() => false);
            if (hasBtn) {
                step('Admin has enabled the manual-entry button flow — verifying "Manually Enter Details" is visible');
                await expect(insurancePage.manualEntryBtn,
                    failMsg('TC-INS-04',
                        `After selecting "${defaultInsuranceType}", the "Manually Enter Details" button must be visible.`,
                        'The button may have been hidden by an admin config change, or the insurance type selection did not register correctly.',
                        'insurance.cases.js | InsurancePage.selectInsuranceType() → insurancePage.manualEntryBtn'
                    )
                ).toBeVisible();
            } else {
                step('Admin has fields-direct mode — verifying Next button is enabled without a manual-entry button');
                await expect(insurancePage.nextBtn,
                    failMsg('TC-INS-04',
                        `When the manual-entry button is absent (fields-direct mode), Continue/Next must be enabled after selecting "${defaultInsuranceType}".`,
                        'The insurance type may not have been accepted, or the direct-fields mode is not rendering the form correctly.',
                        'insurance.cases.js | InsurancePage.selectInsuranceType() → insurancePage.nextBtn'
                    )
                ).toBeEnabled({ timeout: 20_000 });
            }
        });

        test('TC-INS-04b — Take Picture of Card appears when admin enables the button flow', async ({ insurancePage }) => {
            test.slow();
            const typeToUse = await liveNonSelfPayType(insurancePage);

            step(`Selecting insurance type "${typeToUse}" to trigger the card-capture UI`);
            await insurancePage.selectInsuranceType(typeToUse);

            step('Checking whether the manual-entry button flow is enabled by admin config');
            const hasManualBtn = await insurancePage.manualEntryBtn.isVisible({ timeout: 10_000 }).catch(() => false);
            if (!hasManualBtn) {
                console.log('Take Picture / Manually Enter buttons absent — admin config off');
                return; // skip gracefully when admin disabled
            }

            step('Admin has button flow enabled — verifying "Take Picture of Card" button is also visible');
            await expect(insurancePage.takePictureBtn,
                failMsg('TC-INS-04b',
                    '"Take Picture of Card" button must be visible alongside "Manually Enter Details" when admin enables the button flow.',
                    'Admin may have enabled only one of the two buttons, or the take-picture feature flag was disabled separately. Check admin panel → Insurance settings.',
                    'insurance.cases.js | InsurancePage.takePictureBtn'
                )
            ).toBeVisible({ timeout: 5_000 });
        });

        test('TC-INS-05 — insurance detail fields are visible after entering manual mode', async ({ insurancePage }) => {
            const typeToUse = await liveNonSelfPayType(insurancePage);
            step(`Preparing insurance form for type "${typeToUse}" (clicks "Manually Enter Details" if present)`);
            // prepareInsuranceForm clicks "Manually Enter Details" if present, no-op if admin disabled it
            await insurancePage.prepareInsuranceForm(typeToUse);

            step('Checking that at least one of plan input or group ID input is visible after entering manual mode');
            const planVisible = await insurancePage.planInput.isVisible({ timeout: 5_000 }).catch(() => false);
            const groupIdVisible = await insurancePage.groupIdInput.isVisible({ timeout: 5_000 }).catch(() => false);

            step('Asserting plan or group ID field is rendered');
            expect(planVisible || groupIdVisible,
                failMsg('TC-INS-05',
                    'At least one of the insurance detail fields (plan input or group ID) must be visible after entering manual entry mode.',
                    'The "Manually Enter Details" button click may not have triggered the form expansion, or the fields are hidden behind an animation/conditional render. Check InsurancePage.prepareInsuranceForm() and the manual entry form component.',
                    'insurance.cases.js | InsurancePage.prepareInsuranceForm() → planInput / groupIdInput'
                )
            ).toBe(true);
        });

        test('TC-INS-05b — Group ID and Member ID text inputs are fillable', async ({ insurancePage }) => {
            const typeToUse = await liveNonSelfPayType(insurancePage);
            step(`Preparing insurance form for type "${typeToUse}"`);
            await insurancePage.prepareInsuranceForm(typeToUse);

            step('Checking if Group ID input is present (file-upload-based clients may not have it)');
            // Some clients (Kronson) use file-upload insurance — Group ID/Member ID don't appear
            const isVisible = await insurancePage.groupIdInput.isVisible({ timeout: 5_000 }).catch(() => false);
            if (!isVisible) {
                console.log('TC-INS-05b: Group ID not present (file-upload based insurance) — skipping');
                return;
            }

            step('Filling Group ID with "GRP123"');
            await insurancePage.groupIdInput.fill('GRP123');

            step('Filling Member ID with "MBR456"');
            await insurancePage.memberIdInput.fill('MBR456');

            step('Asserting Group ID field retained the entered value');
            await expect(insurancePage.groupIdInput,
                failMsg('TC-INS-05b',
                    'Group ID input must retain the value "GRP123" after being filled.',
                    'The field may be clearing itself due to a controlled-component re-render or a form reset triggered by another field. Check the insurance form state management.',
                    'insurance.cases.js | InsurancePage.groupIdInput → fill("GRP123")'
                )
            ).toHaveValue('GRP123');

            step('Asserting Member ID field retained the entered value');
            await expect(insurancePage.memberIdInput,
                failMsg('TC-INS-05b',
                    'Member ID input must retain the value "MBR456" after being filled.',
                    'The field may be clearing itself due to a controlled-component re-render or a form reset. Check the insurance form state management.',
                    'insurance.cases.js | InsurancePage.memberIdInput → fill("MBR456")'
                )
            ).toHaveValue('MBR456');
        });

        if (hasPlanAutocomplete) {
            test('TC-INS-05c — Insurance plan search returns results', async ({ insurancePage }) => {
                const typeToUse = await liveNonSelfPayType(insurancePage);
                step(`Preparing insurance form for type "${typeToUse}"`);
                await insurancePage.prepareInsuranceForm(typeToUse);

                step('Waiting for the plan input to be visible');
                await insurancePage.planInput.waitFor({ state: 'visible', timeout: 10_000 });

                step('Typing "Blue" into the plan search autocomplete');
                await insurancePage.planInput.fill('Blue');

                step('Waiting for autocomplete dropdown options to appear');
                await expect(
                    insurancePage.page.locator('.MuiAutocomplete-option, [role="option"]').first(),
                    failMsg('TC-INS-05c',
                        'Typing "Blue" in the insurance plan search must return at least one autocomplete option.',
                        'The plan search API may be slow, returning no results for "Blue", or the autocomplete is not wired to the correct endpoint. Check network tab for the plan-search request and its response.',
                        'insurance.cases.js | InsurancePage.planInput → .MuiAutocomplete-option'
                    )
                ).toBeVisible({ timeout: 10_000 });
            });

            test('TC-INS-05d — Selecting "Other" as insurance plan reveals the plan name field', async ({ insurancePage }) => {
                const typeToUse = await liveNonSelfPayType(insurancePage);
                step(`Preparing insurance form for type "${typeToUse}"`);
                await insurancePage.prepareInsuranceForm(typeToUse);

                step('Selecting "Other" from the plan autocomplete');
                await insurancePage.selectPlan('Other');

                step('Verifying the free-text plan name input is now visible');
                await expect(insurancePage.planNameInput,
                    failMsg('TC-INS-05d',
                        'Selecting "Other" as the insurance plan must reveal a free-text plan name input field.',
                        'The conditional render for the "Other" plan name field may be broken, or "Other" was not accepted as a valid option by the autocomplete. Check the plan-select onChange handler.',
                        'insurance.cases.js | InsurancePage.selectPlan("Other") → insurancePage.planNameInput'
                    )
                ).toBeVisible({ timeout: 10_000 });
            });
        }

    });

    // ── 3. FIELD VALIDATION ───────────────────────────────────────────────────

    test.describe('Field validation', () => {

        test('TC-INS-06 — Submitting without required fields shows errors', async ({ insurancePage }) => {
            test.slow();
            const typeToUse = await liveNonSelfPayType(insurancePage);

            step(`Preparing insurance form for type "${typeToUse}" without filling any fields`);
            await insurancePage.prepareInsuranceForm(typeToUse);

            step('Clicking Continue/Next without filling any required fields to trigger validation');
            await insurancePage.nextBtn.click();

            step('Waiting for at least one inline validation error to appear');
            await expect(
                insurancePage.page.locator(errorSelector).first(),
                failMsg('TC-INS-06',
                    'Clicking Continue with empty required fields must show at least one inline validation error.',
                    'The form may be submitting without validating, required-field guards may have been removed, or the error selector is wrong for this client. Check errorSelector in opts and the form validation logic.',
                    `insurance.cases.js | InsurancePage.nextBtn.click() → errorSelector: "${errorSelector}"`
                )
            ).toBeVisible({ timeout: 15_000 });
        });

        if (hasInsuranceDOB) {
            test('TC-INS-07 — Invalid DOB format shows error', async ({ insurancePage }) => {
                const typeToUse = await liveNonSelfPayType(insurancePage);
                step(`Preparing insurance form for type "${typeToUse}"`);
                await insurancePage.prepareInsuranceForm(typeToUse);

                step('Entering an invalid DOB value "99999999"');
                await insurancePage.fillDOBInsurance('99999999');

                step('Clicking Continue/Next to trigger DOB validation');
                await insurancePage.nextBtn.click();

                step('Waiting for a DOB validation error to appear');
                await expect(
                    insurancePage.page.locator(errorSelector).first(),
                    failMsg('TC-INS-07',
                        'Entering an invalid DOB ("99999999") and clicking Continue must show a validation error.',
                        'The DOB field may not be validating the format, the error may use a different selector, or the invalid date was silently coerced to a valid one. Check the DOB input mask and validation logic.',
                        `insurance.cases.js | InsurancePage.fillDOBInsurance("99999999") → errorSelector: "${errorSelector}"`
                    )
                ).toBeVisible({ timeout: 5_000 });
            });
        }

    });

    // ── 4. SWITCHING TYPES ────────────────────────────────────────────────────

    test.describe('Switching insurance types', () => {

        test('TC-INS-08 — Switching from a non-self-pay type to Self-pay hides manual fields', async ({ insurancePage }) => {
            // Detect first non-self-pay type from dropdown — handles admin switching between
            // plan-based (specific plan names) and type-based (generic types) configs.
            const detectedType = await insurancePage.getFirstNonSelfPayOption() ?? defaultInsuranceType;
            step(`Preparing insurance form for type "${detectedType}" to bring up manual entry fields`);
            await insurancePage.prepareInsuranceForm(detectedType);

            step('Switching to Self-pay — manual entry UI should collapse');
            await insurancePage.selectSelfPay();

            step('Checking that the "Manually Enter Details" button is no longer visible after switching to Self-pay');
            // Verify the manual entry UI (if it was shown) is gone after switching to Self-pay
            const btnStillVisible = await insurancePage.manualEntryBtn.isVisible({ timeout: 2_000 }).catch(() => false);

            step('Asserting manual entry button has been hidden after switching to Self-pay');
            expect(btnStillVisible,
                failMsg('TC-INS-08',
                    'After switching from a non-self-pay type to Self-pay, the "Manually Enter Details" button must no longer be visible.',
                    'The UI may not be correctly collapsing the manual entry section when the insurance type changes. Check the insurance type onChange handler and the conditional render logic for the manual entry form.',
                    'insurance.cases.js | InsurancePage.selectSelfPay() → insurancePage.manualEntryBtn'
                )
            ).toBe(false);

            step('Verifying Continue/Next is still enabled after switching to Self-pay');
            // Next must still be enabled after switching
            await expect(insurancePage.nextBtn,
                failMsg('TC-INS-08',
                    'Continue/Next must remain enabled after switching to Self-pay from a non-self-pay type.',
                    'The form may have reset its valid state when the type changed. Check that the Self-pay selection properly sets the form as valid.',
                    'insurance.cases.js | InsurancePage.selectSelfPay() → insurancePage.nextBtn'
                )
            ).toBeEnabled();
        });

        test('TC-INS-09 — Re-selecting same type works without errors', async ({ insurancePage }) => {
            test.slow();

            step('Selecting Self-pay for the first time');
            await insurancePage.selectSelfPay();

            step('Re-selecting Self-pay a second time to verify idempotent behavior');
            await insurancePage.selectSelfPay();

            step('Verifying Continue/Next is still enabled after re-selecting the same type');
            await expect(insurancePage.nextBtn,
                failMsg('TC-INS-09',
                    'Continue/Next must be enabled after re-selecting the same insurance type (Self-pay) twice.',
                    'Re-selecting the same type may be causing a form state reset or toggle-off behavior, leaving the selection empty. Check the insurance type selection handler for toggle/deselect logic.',
                    'insurance.cases.js | InsurancePage.selectSelfPay() × 2 → insurancePage.nextBtn'
                )
            ).toBeEnabled({ timeout: 20_000 });
        });

    });

    // ── 5. EDGE CASES (autocomplete clients only) ─────────────────────────────
    // TC-INS-10/11/12 use the typed-search input (#insurance-select-box) which
    // is only present for MUI-Autocomplete clients (TNDI, Clarus, SINY, Freedman).
    // Set hasAutocompleteSearch: false for MUI-Select clients (Kronson) to skip.

    if (hasAutocompleteSearch) {
        test.describe('Edge cases', () => {

            test('TC-INS-10 — Insurance dropdown accepts typed search input', async ({ insurancePage }) => {
                step('Clicking the insurance autocomplete input to focus it');
                await insurancePage.insuranceInput.click();

                step('Typing "Self" to search for the Self-pay option in the dropdown');
                await insurancePage.insuranceInput.fill('Self');

                step('Waiting for at least one autocomplete dropdown option to appear');
                await expect(
                    insurancePage.page.locator('.MuiAutocomplete-option').first(),
                    failMsg('TC-INS-10',
                        'Typing "Self" in the insurance autocomplete must display at least one dropdown option.',
                        'The autocomplete may not be filtering options client-side, or the options may not have loaded yet. Check that the insurance options API call has completed and the MUI Autocomplete filterOptions is working.',
                        'insurance.cases.js | InsurancePage.insuranceInput.fill("Self") → .MuiAutocomplete-option'
                    )
                ).toBeVisible({ timeout: 10_000 });
            });

            test('TC-INS-11 — Invalid search shows no dropdown options', async ({ insurancePage }) => {
                step('Clicking the insurance autocomplete input to focus it');
                await insurancePage.insuranceInput.click();

                step('Typing a nonsense string "zzzzinvalidinsurance9999" to test empty results');
                await insurancePage.insuranceInput.fill('zzzzinvalidinsurance9999');

                step('Verifying no autocomplete options are shown for the invalid search term');
                await expect(
                    insurancePage.page.locator('.MuiAutocomplete-option'),
                    failMsg('TC-INS-11',
                        'Typing a nonsense search string must result in zero autocomplete options being displayed.',
                        'The autocomplete filterOptions may not be filtering correctly, or a "no results" option with the class .MuiAutocomplete-option is being rendered. Check MUI Autocomplete noOptionsText and filterOptions config.',
                        'insurance.cases.js | InsurancePage.insuranceInput.fill("zzzzinvalidinsurance9999") → .MuiAutocomplete-option count'
                    )
                ).toHaveCount(0, { timeout: 5_000 });
            });

            test('TC-INS-12 — Page loads without any pre-selected insurance', async ({ insurancePage }) => {
                step('Reading the current value of the insurance autocomplete input on fresh page load');
                const value = await insurancePage.insuranceInput.inputValue();

                step('Asserting the insurance input is empty on initial page load');
                expect(value,
                    failMsg('TC-INS-12',
                        'The insurance autocomplete input must be empty when the page first loads (no pre-selection).',
                        'A previous test session may have left state in localStorage/sessionStorage, or the booking flow is pre-populating the field from a prior step. Check for persisted form state and session cleanup.',
                        'insurance.cases.js | InsurancePage.insuranceInput.inputValue() on fresh load'
                    )
                ).toBe('');
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
                    test.slow();

                    // Skip gracefully if this specific type was removed from admin config
                    const available = await insurancePage.getInsuranceTypeOptions();
                    if (!available.some(o => o.toLowerCase().includes(type.toLowerCase()))) {
                        test.skip(true, `${tcNum}: "${type}" not in current dropdown — admin may have switched insurance config`);
                        return;
                    }

                    step(`Selecting insurance type "${type}" from the dropdown`);
                    await insurancePage.selectInsuranceType(type);

                    step('Checking whether "Manually Enter Details" button or Next button appears (depends on admin config)');
                    const hasBtn = await insurancePage.manualEntryBtn.isVisible({ timeout: 10_000 }).catch(() => false);
                    if (hasBtn) {
                        step(`"Manually Enter Details" button is visible — asserting it for type "${type}"`);
                        await expect(insurancePage.manualEntryBtn,
                            failMsg(tcNum,
                                `After selecting "${type}", the "Manually Enter Details" button must be visible.`,
                                `The "${type}" insurance type may not have been accepted by the dropdown, or the manual-entry button is not rendering for this type. Check that "${type}" is a valid option in the insurance API response and that the button renders for non-self-pay types.`,
                                `insurance.cases.js | InsurancePage.selectInsuranceType("${type}") → insurancePage.manualEntryBtn`
                            )
                        ).toBeVisible();
                    } else {
                        step(`Fields-direct mode detected — asserting Next button is enabled for type "${type}"`);
                        await expect(insurancePage.nextBtn,
                            failMsg(tcNum,
                                `When manual-entry button is absent, Continue/Next must be enabled after selecting "${type}".`,
                                `The "${type}" insurance type may not have been accepted, leaving the form in an invalid state. Check that the type is valid for this client and that the direct-fields form renders correctly.`,
                                `insurance.cases.js | InsurancePage.selectInsuranceType("${type}") → insurancePage.nextBtn`
                            )
                        ).toBeEnabled({ timeout: 20_000 });
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

            // Skip all holder tests if the insurance type options aren't loading from the backend.
            // This happens when staging's insurance API returns no options — a server-side issue.
            test.beforeEach(async ({ insurancePage }, testInfo) => {
                const typeToCheck = await liveNonSelfPayType(insurancePage);
                const optionsAvailable = await insurancePage.hasInsuranceOptions(typeToCheck);
                if (!optionsAvailable) {
                    testInfo.skip(true,
                        `Insurance type "${typeToCheck}" options not loading from staging backend — ` +
                        `skipping Primary Insurance Holder tests until server is healthy.`
                    );
                }
            });

            test('TC-INS-H01 — Primary Insurance Holder dropdown is visible after entering detail mode', async ({ insurancePage }) => {
                const typeToUse = await liveNonSelfPayType(insurancePage);
                step(`Preparing insurance form for type "${typeToUse}"`);
                await insurancePage.prepareInsuranceForm(typeToUse);

                step(`Selecting primary holder option "${holderOptions[0]}" to open/interact with the holder dropdown`);
                // At least one holder option should be reachable — click to open the dropdown
                await insurancePage.selectPrimaryHolder(holderOptions[0]);

                step('Verifying Continue/Next button is still visible after selecting a holder (no crash/reset)');
                // Verify a holder value was accepted (no error thrown)
                await expect(insurancePage.nextBtn,
                    failMsg('TC-INS-H01',
                        'Continue/Next must be visible after selecting a primary insurance holder option — confirming the holder dropdown interaction did not crash the form.',
                        'The holder selection may have triggered a form error or page reload. Check InsurancePage.selectPrimaryHolder() and the holder dropdown component for errors.',
                        'insurance.cases.js | InsurancePage.selectPrimaryHolder() → insurancePage.nextBtn'
                    )
                ).toBeVisible({ timeout: 5_000 });
            });

            if (holderOptions.includes('Self')) {
                test('TC-INS-H02 — selecting "Self" as holder hides the insured name / DOB fields', async ({ insurancePage }) => {
                    const typeToUse = await liveNonSelfPayType(insurancePage);
                    step(`Preparing insurance form for type "${typeToUse}"`);
                    await insurancePage.prepareInsuranceForm(typeToUse);

                    step('Selecting "Self" as the primary insurance holder');
                    await insurancePage.selectPrimaryHolder('Self');

                    step('Asserting the insured first name field is NOT visible when holder is "Self"');
                    await expect(insurancePage.insuredFirstName,
                        failMsg('TC-INS-H02',
                            'Insured first name field must be hidden when "Self" is selected as the primary holder.',
                            'The conditional render for dependent-holder fields may be showing them for "Self" incorrectly. Check the holder onChange handler and the conditional visibility logic.',
                            'insurance.cases.js | InsurancePage.selectPrimaryHolder("Self") → insurancePage.insuredFirstName'
                        )
                    ).not.toBeVisible({ timeout: 3_000 });

                    step('Asserting the insured last name field is NOT visible when holder is "Self"');
                    await expect(insurancePage.insuredLastName,
                        failMsg('TC-INS-H02',
                            'Insured last name field must be hidden when "Self" is selected as the primary holder.',
                            'The conditional render for dependent-holder fields may be showing them for "Self" incorrectly. Check the holder onChange handler and the conditional visibility logic.',
                            'insurance.cases.js | InsurancePage.selectPrimaryHolder("Self") → insurancePage.insuredLastName'
                        )
                    ).not.toBeVisible({ timeout: 3_000 });
                });
            }

            const dependentOptions = holderOptions.filter(o => o !== 'Self');
            for (const holder of dependentOptions) {
                test(`TC-INS-H0${holderOptions.indexOf(holder) + 2} — selecting "${holder}" reveals insured name, last name, and DOB fields`, async ({ insurancePage }) => {
                    const typeToUse = await liveNonSelfPayType(insurancePage);
                    step(`Preparing insurance form for type "${typeToUse}"`);
                    await insurancePage.prepareInsuranceForm(typeToUse);

                    step(`Selecting "${holder}" as the primary insurance holder`);
                    await insurancePage.selectPrimaryHolder(holder);

                    step('Asserting insured first name field becomes visible');
                    await expect(insurancePage.insuredFirstName,
                        failMsg(`TC-INS-H0${holderOptions.indexOf(holder) + 2}`,
                            `Insured first name field must be visible when "${holder}" is selected as the primary holder.`,
                            `The conditional render for dependent-holder fields may not be triggering for "${holder}". Check the holder onChange handler and the conditional visibility logic for non-Self holders.`,
                            `insurance.cases.js | InsurancePage.selectPrimaryHolder("${holder}") → insurancePage.insuredFirstName`
                        )
                    ).toBeVisible({ timeout: 5_000 });

                    step('Asserting insured last name field becomes visible');
                    await expect(insurancePage.insuredLastName,
                        failMsg(`TC-INS-H0${holderOptions.indexOf(holder) + 2}`,
                            `Insured last name field must be visible when "${holder}" is selected as the primary holder.`,
                            `The conditional render for dependent-holder fields may not be triggering for "${holder}". Check the holder onChange handler and the conditional visibility logic for non-Self holders.`,
                            `insurance.cases.js | InsurancePage.selectPrimaryHolder("${holder}") → insurancePage.insuredLastName`
                        )
                    ).toBeVisible({ timeout: 5_000 });

                    step('Asserting insured DOB field becomes visible');
                    await expect(insurancePage.insuredDOB,
                        failMsg(`TC-INS-H0${holderOptions.indexOf(holder) + 2}`,
                            `Insured date-of-birth field must be visible when "${holder}" is selected as the primary holder.`,
                            `The DOB field may be separately gated or using a different conditional check than first/last name. Check the holder form section for the DOB field's visibility condition.`,
                            `insurance.cases.js | InsurancePage.selectPrimaryHolder("${holder}") → insurancePage.insuredDOB`
                        )
                    ).toBeVisible({ timeout: 5_000 });
                });
            }

            // ── Edge: toggle holder back to Self ────────────────────────────
            if (holderOptions.includes('Self') && dependentOptions.length > 0) {
                test(`TC-INS-H08 — switching holder from "${dependentOptions[0]}" back to "Self" hides the insured fields again`, async ({ insurancePage }) => {
                    const typeToUse = await liveNonSelfPayType(insurancePage);
                    step(`Preparing insurance form for type "${typeToUse}"`);
                    await insurancePage.prepareInsuranceForm(typeToUse);

                    step(`Selecting "${dependentOptions[0]}" as holder to reveal insured fields`);
                    await insurancePage.selectPrimaryHolder(dependentOptions[0]);

                    step('Confirming insured first name field appeared after selecting a dependent holder');
                    await expect(insurancePage.insuredFirstName,
                        failMsg('TC-INS-H08',
                            `Insured first name must be visible after selecting "${dependentOptions[0]}" (prerequisite for the toggle-back check).`,
                            `The dependent-holder fields did not appear for "${dependentOptions[0]}". This is a pre-condition failure — fix TC-INS-H0${holderOptions.indexOf(dependentOptions[0]) + 2} first.`,
                            `insurance.cases.js | InsurancePage.selectPrimaryHolder("${dependentOptions[0]}") → insurancePage.insuredFirstName`
                        )
                    ).toBeVisible({ timeout: 5_000 });

                    step('Switching holder back to "Self" — insured fields should collapse');
                    await insurancePage.selectPrimaryHolder('Self');

                    step('Asserting insured first name field is hidden again after switching back to "Self"');
                    await expect(insurancePage.insuredFirstName,
                        failMsg('TC-INS-H08',
                            `After switching the holder back to "Self" from "${dependentOptions[0]}", the insured first name field must be hidden.`,
                            'The toggle-back logic may not be collapsing the dependent fields. Check the holder onChange handler — it may only handle the initial selection, not re-selection of Self after a dependent was chosen.',
                            'insurance.cases.js | InsurancePage.selectPrimaryHolder("Self") after dependent → insurancePage.insuredFirstName'
                        )
                    ).not.toBeVisible({ timeout: 5_000 });
                });
            }

            // ── Fill & persistence tests ─────────────────────────────────────
            const dependentHolder = holderOptions.find(o => o !== 'Self') ?? holderOptions[0];
            const TEST_FNAME = 'InsuredTest';
            const TEST_LNAME = 'PersonTest';

            test(`TC-INS-H05 — insured fields accept input after selecting "${dependentHolder}"`, async ({ insurancePage }) => {
                const typeToUse = await liveNonSelfPayType(insurancePage);
                step(`Preparing insurance form for type "${typeToUse}"`);
                await insurancePage.prepareInsuranceForm(typeToUse);

                step(`Selecting "${dependentHolder}" as holder to reveal insured detail fields`);
                await insurancePage.selectPrimaryHolder(dependentHolder);

                step(`Filling insured first name with "${TEST_FNAME}"`);
                await insurancePage.insuredFirstName.fill(TEST_FNAME);

                step(`Filling insured last name with "${TEST_LNAME}"`);
                await insurancePage.insuredLastName.fill(TEST_LNAME);

                step('Selecting "Male" as the insured gender');
                await insurancePage.selectInsuredGender('Male');

                step('Clicking insured DOB field and entering date "01011990"');
                await insurancePage.insuredDOB.click();
                await insurancePage.insuredDOB.pressSequentially('01011990', { delay: 30 });

                step('Asserting insured first name retained the entered value');
                await expect(insurancePage.insuredFirstName,
                    failMsg('TC-INS-H05',
                        `Insured first name field must retain the value "${TEST_FNAME}" after being filled.`,
                        'The field may be clearing on re-render or losing focus. Check if a form state update (e.g. gender selection or DOB) is resetting the first name field.',
                        'insurance.cases.js | InsurancePage.insuredFirstName.fill() → toHaveValue'
                    )
                ).toHaveValue(TEST_FNAME);

                step('Asserting insured last name retained the entered value');
                await expect(insurancePage.insuredLastName,
                    failMsg('TC-INS-H05',
                        `Insured last name field must retain the value "${TEST_LNAME}" after being filled.`,
                        'The field may be clearing on re-render. Check if any other field interaction (gender, DOB) is causing a form reset that clears the last name.',
                        'insurance.cases.js | InsurancePage.insuredLastName.fill() → toHaveValue'
                    )
                ).toHaveValue(TEST_LNAME);
            });

            if (stepBeforeInsurance) {
                test(`TC-INS-H06 — navigating to "${stepBeforeInsurance}" via stepper and back preserves insured field values`, async ({ insurancePage }) => {
                    const typeToUse = await liveNonSelfPayType(insurancePage);
                    step(`Preparing insurance form for type "${typeToUse}"`);
                    await insurancePage.prepareInsuranceForm(typeToUse);

                    step(`Selecting "${dependentHolder}" as holder and filling insured name fields`);
                    await insurancePage.selectPrimaryHolder(dependentHolder);
                    await insurancePage.insuredFirstName.fill(TEST_FNAME);
                    await insurancePage.insuredLastName.fill(TEST_LNAME);

                    step(`Navigating away to stepper step "${stepBeforeInsurance}"`);
                    await insurancePage.clickStepperStep(stepBeforeInsurance);
                    await insurancePage.page.waitForLoadState('networkidle', { timeout: 20_000 });

                    step('Navigating back to the "Add Insurance" step');
                    await insurancePage.clickStepperStep('Add Insurance');
                    await insurancePage.page.waitForLoadState('networkidle', { timeout: 20_000 });

                    step('Waiting for the insured first name field to be visible after returning');
                    await expect(insurancePage.insuredFirstName,
                        failMsg('TC-INS-H06',
                            'Insured first name field must be visible after navigating away and back to the insurance step.',
                            'The insurance step may not be restoring the holder selection on return, so the dependent fields are hidden. Check that the booking flow persists the holder state across stepper navigation.',
                            `insurance.cases.js | clickStepperStep("${stepBeforeInsurance}") → clickStepperStep("Add Insurance") → insurancePage.insuredFirstName`
                        )
                    ).toBeVisible({ timeout: 10_000 });

                    step('Asserting insured first name was preserved after round-trip navigation');
                    await expect(insurancePage.insuredFirstName,
                        failMsg('TC-INS-H06',
                            `Insured first name must still be "${TEST_FNAME}" after navigating to "${stepBeforeInsurance}" and back.`,
                            'The form state is not persisting across stepper navigation. Check if the insurance form state is stored in a global context or re-fetched, and whether the insured fields are re-populated from saved state on return.',
                            `insurance.cases.js | Round-trip via "${stepBeforeInsurance}" → insurancePage.insuredFirstName value`
                        )
                    ).toHaveValue(TEST_FNAME);

                    step('Asserting insured last name was preserved after round-trip navigation');
                    await expect(insurancePage.insuredLastName,
                        failMsg('TC-INS-H06',
                            `Insured last name must still be "${TEST_LNAME}" after navigating to "${stepBeforeInsurance}" and back.`,
                            'The form state is not persisting across stepper navigation. Check global state/context for the insuredLastName field.',
                            `insurance.cases.js | Round-trip via "${stepBeforeInsurance}" → insurancePage.insuredLastName value`
                        )
                    ).toHaveValue(TEST_LNAME);
                });
            }

            if (intakeStepLabel && stepBeforeInsurance) {
                test(`TC-INS-H07 — navigating Insurance → "${intakeStepLabel}" → "${stepBeforeInsurance}" → "Add Insurance" preserves insured field values`, async ({ insurancePage }) => {
                    const typeToUse = await liveNonSelfPayType(insurancePage);
                    step(`Preparing insurance form for type "${typeToUse}"`);
                    await insurancePage.prepareInsuranceForm(typeToUse);

                    step(`Selecting "${dependentHolder}" as holder and filling insured name fields`);
                    await insurancePage.selectPrimaryHolder(dependentHolder);
                    await insurancePage.insuredFirstName.fill(TEST_FNAME);
                    await insurancePage.insuredLastName.fill(TEST_LNAME);

                    step(`Navigating to intake step "${intakeStepLabel}" via stepper`);
                    await insurancePage.clickStepperStep(intakeStepLabel);
                    await insurancePage.page.waitForLoadState('networkidle', { timeout: 20_000 });

                    step(`Navigating from intake to "${stepBeforeInsurance}" via stepper`);
                    await insurancePage.clickStepperStep(stepBeforeInsurance);
                    await insurancePage.page.waitForLoadState('networkidle', { timeout: 20_000 });

                    step('Navigating back to the "Add Insurance" step');
                    await insurancePage.clickStepperStep('Add Insurance');
                    await insurancePage.page.waitForLoadState('networkidle', { timeout: 20_000 });

                    step('Waiting for the insured first name field to be visible after multi-step round-trip');
                    await expect(insurancePage.insuredFirstName,
                        failMsg('TC-INS-H07',
                            `Insured first name field must be visible after the multi-step round-trip (Insurance → ${intakeStepLabel} → ${stepBeforeInsurance} → Add Insurance).`,
                            'The insurance step may not be restoring the holder selection after a longer navigation away. Check that the booking flow persists holder state across multiple stepper hops.',
                            `insurance.cases.js | Multi-step round-trip → insurancePage.insuredFirstName visible`
                        )
                    ).toBeVisible({ timeout: 10_000 });

                    step('Asserting insured first name survived the multi-step round-trip');
                    await expect(insurancePage.insuredFirstName,
                        failMsg('TC-INS-H07',
                            `Insured first name must still be "${TEST_FNAME}" after the multi-step stepper round-trip.`,
                            `The state may be cleared when navigating through "${intakeStepLabel}" — check if that step resets the global booking state. Compare behavior with TC-INS-H06 (single detour) to isolate which hop causes the reset.`,
                            `insurance.cases.js | Multi-step round-trip → insurancePage.insuredFirstName value`
                        )
                    ).toHaveValue(TEST_FNAME);

                    step('Asserting insured last name survived the multi-step round-trip');
                    await expect(insurancePage.insuredLastName,
                        failMsg('TC-INS-H07',
                            `Insured last name must still be "${TEST_LNAME}" after the multi-step stepper round-trip.`,
                            `The state may be cleared when navigating through "${intakeStepLabel}". Check global state persistence for insuredLastName across all stepper steps.`,
                            `insurance.cases.js | Multi-step round-trip → insurancePage.insuredLastName value`
                        )
                    ).toHaveValue(TEST_LNAME);
                });
            }

        });
    }

    // ── 8. NAVIGATION ────────────────────────────────────────────────────────

    test.describe('Navigation', () => {

        test('TC-INS-13 — completing Self-pay and clicking Continue navigates to the patient info page', async ({ insurancePage }) => {
            step('Selecting Self-pay insurance type');
            await insurancePage.selectSelfPay();

            step('Clicking Continue/Next to navigate away from the insurance step');
            await insurancePage.continue();

            step('Waiting for the patient info page to render (first name input must appear)');
            await expect(
                insurancePage.page.locator('input[name*="firstName"]').first(),
                failMsg('TC-INS-13',
                    'After selecting Self-pay and clicking Continue, the patient info page must load and show a first name input.',
                    'Continue button may have been disabled, the navigation target route may have changed, or the patient info form is not rendering. Check the booking flow router and the patient info page component.',
                    'insurance.cases.js | InsurancePage.continue() → input[name*="firstName"]'
                )
            ).toBeVisible({ timeout: 15_000 });
        });

        if (canCompletePrivateInsurance) {
            test('TC-INS-13b — completing private insurance with Self as holder navigates to patient info', async ({ insurancePage }) => {
                const typeToUse = await liveNonSelfPayType(insurancePage);
                step(`Preparing insurance form for type "${typeToUse}"`);
                await insurancePage.prepareInsuranceForm(typeToUse);

                step('Waiting for Group ID input to be visible before filling');
                await insurancePage.groupIdInput.waitFor({ state: 'visible', timeout: 10_000 });

                step('Filling Group ID with "GRP123"');
                await insurancePage.groupIdInput.fill('GRP123');

                step('Filling Member ID with "MBR456"');
                await insurancePage.memberIdInput.fill('MBR456');

                if ((opts.holderOptions ?? []).includes('Self')) {
                    step('Selecting "Self" as the primary insurance holder');
                    await insurancePage.selectPrimaryHolder('Self');
                }

                step('Clicking Continue to submit the insurance form and navigate to patient info');
                await insurancePage.continue();

                step('Waiting for the patient info page to render (first name input must appear)');
                await expect(
                    insurancePage.page.locator('input[name*="firstName"]').first(),
                    failMsg('TC-INS-13b',
                        'After completing private insurance (Group ID + Member ID + Self holder) and clicking Continue, the patient info page must load.',
                        'The form may still have validation errors (e.g. plan name required), the Continue button may have been disabled, or the navigation route changed. Check the insurance form submit handler and any required fields that were not filled.',
                        'insurance.cases.js | InsurancePage.continue() after private insurance → input[name*="firstName"]'
                    )
                ).toBeVisible({ timeout: 15_000 });
            });
        }

        if (hasSkipButton) {
            test('TC-INS-14 — Skip button bypasses insurance and navigates to the patient info page', async ({ insurancePage }) => {
                step('Locating the Skip button on the insurance page');
                const skipBtn = insurancePage.page
                    .locator('button:has-text("Skip")')
                    .first();

                step('Verifying the Skip button is visible');
                const skipVisible = await skipBtn.isVisible({ timeout: 10_000 }).catch(() => false);
                if (!skipVisible) {
                    // Admin can toggle Skip button on/off — skip the test rather than fail it
                    test.skip(true, 'TC-INS-14: Skip button absent — admin config may have disabled it');
                    return;
                }

                step('Clicking the Skip button to bypass insurance');
                await skipBtn.click();

                step('Waiting for the patient info page to load after skipping insurance');
                await expect(
                    insurancePage.page.locator('input[name*="firstName"]').first(),
                    failMsg('TC-INS-14',
                        'After clicking Skip on the insurance page, the patient info page must load and show a first name input.',
                        'The Skip button may not be navigating correctly, or the patient info page is failing to render. Check the Skip button onClick handler and the booking flow router.',
                        'insurance.cases.js | skipBtn.click() → input[name*="firstName"]'
                    )
                ).toBeVisible({ timeout: 15_000 });
            });
        }

    });
}

export { runInsuranceCases };
