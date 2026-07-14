import { step, failMsg } from '../../utils/testContext.js';

const VALID_PATIENT = {
    basicInfo: {
        firstName: 'John',
        lastName:  'Doe',
        email:     'johndoe@example.com',
        phone:     '5551234567',
        address:   '123 Main St',
        city:      'Farmington Hills',
        zip:       '48335',
    },
    dob:          '01151990',
    gender:       'Male',
    state:        'MI-Michigan',
    referral:     'Google',
    smsConsent:   true,
};

/**
 * @param {object} opts
 * @param {boolean} [opts.hasReferral=true]     — "How did you hear" field is present
 * @param {boolean} [opts.hasSmsConsent=true]   — SMS consent checkbox is present
 * @param {boolean} [opts.hasAddress=true]      — Address / City / Zip fields are present
 * @param {boolean} [opts.hasState=true]        — State autocomplete is present
 * @param {string}  [opts.errorSelector]        — CSS selector for inline validation errors
 *
 * NOTE — Test order is intentional:
 *   Sections 1–2 run BEFORE any fill operations so the worker-scoped patientPage
 *   still has an empty form. This avoids needing a separate test-scoped fixture.
 *   Section 1: Validation   — needs empty form (submit → no navigation)
 *   Section 2: SMS consent  — needs checkbox unchecked
 *   Sections 3+ fill form fields progressively.
 */
function runPatientInfoCases(test, expect, opts = {}) {
    const {
        hasReferral   = true,
        hasSmsConsent = true,
        hasAddress    = true,
        hasState      = true,
        errorSelector = '[class*="Mui-error"], [aria-invalid="true"]',
    } = opts;

    test.describe('Patient Info Page', () => {

    // Skip all tests in this describe when patientPage is null (no slots / network error)
    test.beforeEach(async ({ patientPage }, testInfo) => {
        if (patientPage === null) testInfo.skip(true, 'No slots available — patient info tests skipped');
    });

    // ── 1. VALIDATION ─────────────────────────────────────────────────────────

    test.describe('Form validation', () => {

        test('TC-PI-33 — empty form submit stays on the patient info page', async ({ patientPage }) => {
            step('Recording current URL before submitting empty form');
            const urlBefore = patientPage.page.url();

            step('Submitting the form with all fields empty');
            await patientPage.submit();
            await patientPage.page.waitForTimeout(2_000);

            step('Verifying URL has not changed after empty-form submission');
            // Form validation must keep us on the same URL
            expect(patientPage.page.url(),
                failMsg('TC-PI-33',
                    'Submitting an empty form must keep the user on the patient info page.',
                    'Client-side validation may have been removed or bypassed. Check that all required fields still carry the "required" attribute and that the submit handler short-circuits on validation failure.',
                    'patientInfo.cases.js | PatientInfoPage.submit()'
                )
            ).toBe(urlBefore);

            step('Verifying submit button is still visible (confirms no navigation occurred)');
            // Submit button still visible confirms we didn't navigate away
            await expect(patientPage.submitBtn,
                failMsg('TC-PI-33',
                    'Submit button must remain visible after an empty-form submission attempt.',
                    'If the button is gone the page navigated away, meaning validation is not blocking submission. Verify required-field validation logic in the patient info form component.',
                    'patientInfo.cases.js | PatientInfoPage.submitBtn'
                )
            ).toBeVisible({ timeout: 5_000 });
        });

        test('TC-PI-34 — partial form (only firstName) stays on the patient info page', async ({ patientPage }) => {
            step('Filling only the First Name field on an otherwise empty form');
            await patientPage.firstName.fill('John');

            step('Recording current URL before partial-form submission');
            const urlBefore = patientPage.page.url();

            step('Submitting the partially filled form');
            await patientPage.submit();
            await patientPage.page.waitForTimeout(2_000);

            step('Verifying URL has not changed after partial-form submission');
            expect(patientPage.page.url(),
                failMsg('TC-PI-34',
                    'Submitting with only First Name filled must keep the user on the patient info page.',
                    'Other required fields (Last Name, Email, Phone, DOB, Gender) may have lost their "required" constraint. Check form validation rules in the patient info component.',
                    'patientInfo.cases.js | PatientInfoPage.submit()'
                )
            ).toBe(urlBefore);
        });

        test('TC-PI-35 — invalid email format stays on the patient info page', async ({ patientPage }) => {
            step('Filling the email field with a value that has no domain (invalid format)');
            await patientPage.email.fill('not-an-email');

            step('Recording current URL before submission with bad email');
            const urlBefore = patientPage.page.url();

            step('Submitting the form with the malformed email value');
            await patientPage.submit();
            await patientPage.page.waitForTimeout(2_000);

            step('Verifying URL has not changed — invalid email must block navigation');
            expect(patientPage.page.url(),
                failMsg('TC-PI-35',
                    'Submitting with an invalid email format must keep the user on the patient info page.',
                    'Email format validation may have been weakened or removed. Check the regex / HTML5 type="email" constraint in the form and ensure the submit handler validates before proceeding.',
                    'patientInfo.cases.js | PatientInfoPage.submit()'
                )
            ).toBe(urlBefore);
        });

    });

    // ── 1b. INVALID INPUT FORMAT VALIDATION ───────────────────────────────────
    // Uses test-scoped patientInfoPage so each test gets a clean form state.

    test.describe('Invalid input format validation', () => {

        test('TC-PI-VAL-01 — future date as DOB keeps form on page (not submitted)', async ({ patientInfoPage }) => {
            step('Waiting for the First Name field to confirm the patient info page has loaded');
            await patientInfoPage.firstName.waitFor({ state: 'visible', timeout: 10_000 });

            step('Filling DOB with a far-future date (Jan 1, 2099) — should be rejected');
            await patientInfoPage.fillDOB('01012099'); // Jan 1, 2099 — far future

            step('Recording URL before submission with future DOB');
            const urlBefore = patientInfoPage.page.url();

            step('Submitting the form with the future date of birth');
            await patientInfoPage.submit();
            await patientInfoPage.page.waitForTimeout(2_000);

            step('Verifying URL has not changed — future DOB must block submission');
            expect(patientInfoPage.page.url(),
                failMsg('TC-PI-VAL-01',
                    'A future date of birth must prevent form submission and keep the user on the patient info page.',
                    'DOB validation may not be checking whether the date is in the future. Inspect the fillDOB handler and any date-range constraints on the DOB field in PatientInfoPage.js.',
                    'patientInfo.cases.js | PatientInfoPage.fillDOB()'
                )
            ).toBe(urlBefore);
        });

        test('TC-PI-VAL-02 — too-short phone number keeps form on page', async ({ patientInfoPage }) => {
            test.slow(); // CI runners are slower — triple timeout

            step('Waiting for the First Name field to confirm the patient info page has loaded');
            await patientInfoPage.firstName.waitFor({ state: 'visible', timeout: 10_000 });

            step('Clicking the phone field and entering a 3-digit value (too short)');
            await patientInfoPage.phone.click();
            await patientInfoPage.phone.fill('123');

            step('Recording URL before submission with short phone number');
            const urlBefore = patientInfoPage.page.url();

            step('Submitting the form with the incomplete phone number');
            await patientInfoPage.submit();
            await patientInfoPage.page.waitForTimeout(3_000);

            step('Verifying URL has not changed — short phone must block submission');
            expect(patientInfoPage.page.url(),
                failMsg('TC-PI-VAL-02',
                    'A phone number shorter than 10 digits must prevent form submission.',
                    'Phone length validation may be missing or the minLength constraint was removed. Check the phone field validation in PatientInfoPage.js and the form submit handler.',
                    'patientInfo.cases.js | PatientInfoPage.phone'
                )
            ).toBe(urlBefore);
        });

        test('TC-PI-VAL-03 — email missing domain (abc@) keeps form on page', async ({ patientInfoPage }) => {
            test.slow();

            step('Waiting for the First Name field to confirm the patient info page has loaded');
            await patientInfoPage.firstName.waitFor({ state: 'visible', timeout: 10_000 });

            step('Filling the email field with a value missing its domain (testuser@)');
            await patientInfoPage.email.fill('testuser@');

            step('Recording URL before submission with incomplete email');
            const urlBefore = patientInfoPage.page.url();

            step('Submitting the form with the incomplete email address');
            await patientInfoPage.submit();
            await patientInfoPage.page.waitForTimeout(3_000);

            step('Verifying URL has not changed — email without domain must block submission');
            expect(patientInfoPage.page.url(),
                failMsg('TC-PI-VAL-03',
                    'An email address with no domain part (e.g. "testuser@") must prevent form submission.',
                    'Email validation may only check for the presence of "@" without requiring a domain. Verify the regex or HTML5 pattern on the email input in PatientInfoPage.js.',
                    'patientInfo.cases.js | PatientInfoPage.email'
                )
            ).toBe(urlBefore);
        });

        test('TC-PI-VAL-04 — email with no @ symbol keeps form on page', async ({ patientInfoPage }) => {
            step('Waiting for the First Name field to confirm the patient info page has loaded');
            await patientInfoPage.firstName.waitFor({ state: 'visible', timeout: 10_000 });

            step('Filling the email field with a plain string that has no @ character');
            await patientInfoPage.email.fill('notanemail');

            step('Recording URL before submission with invalid email (no @)');
            const urlBefore = patientInfoPage.page.url();

            step('Submitting the form with the no-@ email value');
            await patientInfoPage.submit();
            await patientInfoPage.page.waitForTimeout(2_000);

            step('Verifying URL has not changed — email with no @ must block submission');
            expect(patientInfoPage.page.url(),
                failMsg('TC-PI-VAL-04',
                    'An email address with no "@" symbol must prevent form submission.',
                    'The email field may be missing type="email" or the custom validator was removed. Check the email input definition in PatientInfoPage.js and confirm browser-native or custom validation is active.',
                    'patientInfo.cases.js | PatientInfoPage.email'
                )
            ).toBe(urlBefore);
        });

        test('TC-PI-VAL-05 — form with valid data but too-short phone does not submit', async ({ patientInfoPage }) => {
            test.slow();

            step('Waiting for the First Name field to confirm the patient info page has loaded');
            await patientInfoPage.firstName.waitFor({ state: 'visible', timeout: 10_000 });

            step('Filling First Name, Last Name, and Email with valid values');
            await patientInfoPage.firstName.fill('John');
            await patientInfoPage.lastName.fill('Doe');
            await patientInfoPage.email.fill('john@example.com');

            step('Clicking the phone field and entering only 3 digits (too short)');
            await patientInfoPage.phone.click();
            await patientInfoPage.phone.fill('123');

            step('Recording URL before submitting otherwise-valid form with short phone');
            const urlBefore = patientInfoPage.page.url();

            step('Submitting the form — phone validation should block navigation');
            await patientInfoPage.submit();
            await patientInfoPage.page.waitForTimeout(3_000);

            step('Verifying URL has not changed — short phone must block submission even when all other fields are valid');
            expect(patientInfoPage.page.url(),
                failMsg('TC-PI-VAL-05',
                    'Even with all other fields valid, a too-short phone number must prevent form submission.',
                    'Phone validation may be skipped when other fields are filled correctly, suggesting the validator runs per-field rather than on submit. Check the submit handler and phone field validation in PatientInfoPage.js.',
                    'patientInfo.cases.js | PatientInfoPage.phone'
                )
            ).toBe(urlBefore);
        });

    });

    // ── 2. SMS CONSENT ────────────────────────────────────────────────────────
    // Run SECOND — checkbox is still unchecked (no previous test has checked it).

    if (hasSmsConsent) {
        test.describe('SMS consent checkbox', () => {

            test('TC-PI-30 — SMS consent is unchecked by default', async ({ patientPage }) => {
                test.slow();

                step('Waiting for the page to fully settle before inspecting the checkbox');
                await patientPage.page.waitForTimeout(1_000); // CI: let page fully settle

                step('Verifying SMS consent checkbox is unchecked on initial page load');
                await expect(
                    patientPage.page.locator('input[type="checkbox"]').first(),
                    failMsg('TC-PI-30',
                        'SMS consent checkbox must be unchecked by default when the page first loads.',
                        'The checkbox default state may have changed in the form component, or a previous test left it checked due to missing fixture isolation. Confirm the patientPage fixture reloads the page for each worker.',
                        'patientInfo.cases.js | PatientPage checkbox locator (input[type="checkbox"]:first)'
                    )
                ).not.toBeChecked();
            });

            test('TC-PI-39 — fillAll with smsConsent: false leaves the SMS checkbox unchecked', async ({ patientPage }) => {
                step('Calling fillAll() with smsConsent: false — checkbox must remain unchecked');
                // Runs before TC-PI-31 so the box is still unchecked
                await patientPage.fillAll({ ...VALID_PATIENT, smsConsent: false });

                step('Verifying the SMS checkbox is still unchecked after fillAll with smsConsent: false');
                await expect(
                    patientPage.page.locator('input[type="checkbox"]').first(),
                    failMsg('TC-PI-39',
                        'fillAll({ smsConsent: false }) must leave the SMS consent checkbox unchecked.',
                        'PatientPage.fillAll() may be ignoring the smsConsent flag or always checking the box. Review the fillAll implementation in PatientPage.js and confirm the conditional check on smsConsent.',
                        'patientInfo.cases.js | PatientPage.fillAll() | smsConsent: false branch'
                    )
                ).not.toBeChecked();
            });

            test('TC-PI-31 — SMS consent can be checked', async ({ patientPage }) => {
                step('Calling checkSmsConsent() to tick the SMS consent checkbox');
                await patientPage.checkSmsConsent();

                step('Verifying the SMS consent checkbox is now checked');
                await expect(
                    patientPage.page.locator('input[type="checkbox"]').first(),
                    failMsg('TC-PI-31',
                        'SMS consent checkbox must be checked after calling checkSmsConsent().',
                        'PatientPage.checkSmsConsent() may be targeting the wrong element or the click is not registering. Check the checkbox locator and click action in PatientPage.js.',
                        'patientInfo.cases.js | PatientPage.checkSmsConsent()'
                    )
                ).toBeChecked();
            });

            test('TC-PI-32 — SMS consent stays checked when called twice', async ({ patientPage }) => {
                step('Calling checkSmsConsent() twice — idempotent check, box must stay checked');
                await patientPage.checkSmsConsent();
                await patientPage.checkSmsConsent();

                step('Verifying the SMS consent checkbox remains checked after two consecutive calls');
                await expect(
                    patientPage.page.locator('input[type="checkbox"]').first(),
                    failMsg('TC-PI-32',
                        'SMS consent checkbox must remain checked after checkSmsConsent() is called twice.',
                        'checkSmsConsent() may be toggling instead of ensuring a checked state (i.e. clicking unconditionally). Check whether the method reads the current state before clicking in PatientPage.js.',
                        'patientInfo.cases.js | PatientPage.checkSmsConsent() — idempotency'
                    )
                ).toBeChecked();
            });

        });
    }

    // ── 3. FIELD VISIBILITY ───────────────────────────────────────────────────

    test.describe('Field visibility', () => {

        test('TC-PI-01 — First Name, Last Name, Email and Phone fields are visible', async ({ patientPage }) => {
            step('Checking that all four core contact fields are rendered on the patient info page');
            await expect(patientPage.firstName,
                failMsg('TC-PI-01',
                    'First Name input must be visible on the patient info page.',
                    'The form may not have loaded, the firstName locator in PatientPage.js may be stale, or the input placeholder/name attribute changed in the latest deploy.',
                    'patientInfo.cases.js | PatientPage.firstName'
                )
            ).toBeVisible();

            await expect(patientPage.lastName,
                failMsg('TC-PI-01',
                    'Last Name input must be visible on the patient info page.',
                    'The lastName locator in PatientPage.js may be stale, or the field was conditionally hidden by a recent UI change. Check the name/placeholder attribute.',
                    'patientInfo.cases.js | PatientPage.lastName'
                )
            ).toBeVisible();

            await expect(patientPage.email,
                failMsg('TC-PI-01',
                    'Email input must be visible on the patient info page.',
                    'The email locator in PatientPage.js may be stale. Confirm type="email" or the placeholder/name selector still matches the rendered field.',
                    'patientInfo.cases.js | PatientPage.email'
                )
            ).toBeVisible();

            await expect(patientPage.phone,
                failMsg('TC-PI-01',
                    'Phone input must be visible on the patient info page.',
                    'The phone locator in PatientPage.js may be stale or the phone field was moved/hidden. Check the placeholder or name attribute used in the locator.',
                    'patientInfo.cases.js | PatientPage.phone'
                )
            ).toBeVisible();
        });

        test('TC-PI-02 — Date of Birth field is visible', async ({ patientPage }) => {
            step('Checking that the Date of Birth field is rendered on the patient info page');
            await expect(patientPage.dob,
                failMsg('TC-PI-02',
                    'Date of Birth input must be visible on the patient info page.',
                    'The dob locator in PatientPage.js may target an attribute (placeholder, label, name) that changed in a recent deploy. Check the DOB field selector.',
                    'patientInfo.cases.js | PatientPage.dob'
                )
            ).toBeVisible();
        });

        test('TC-PI-03 — Gender dropdown trigger is visible', async ({ patientPage }) => {
            step('Checking that the Gender dropdown trigger is rendered on the patient info page');
            await expect(patientPage.genderTrigger,
                failMsg('TC-PI-03',
                    'Gender dropdown trigger must be visible on the patient info page.',
                    'The genderTrigger locator in PatientPage.js may be targeting a MUI element whose role or aria-label changed. Inspect the rendered dropdown trigger in the DOM.',
                    'patientInfo.cases.js | PatientPage.genderTrigger'
                )
            ).toBeVisible();
        });

        if (hasAddress) {
            test('TC-PI-04 — Address, City, and Zip fields are visible', async ({ patientPage }) => {
                step('Checking that Address, City, and Zip fields are rendered on the patient info page');
                await expect(patientPage.address1,
                    failMsg('TC-PI-04',
                        'Address line 1 input must be visible on the patient info page.',
                        'The address1 locator in PatientPage.js may be stale, or the Address field was conditionally hidden because this client does not require address. Confirm hasAddress=true is correct for this client.',
                        'patientInfo.cases.js | PatientPage.address1'
                    )
                ).toBeVisible();

                await expect(patientPage.city,
                    failMsg('TC-PI-04',
                        'City input must be visible on the patient info page.',
                        'The city locator in PatientPage.js may be stale, or City was removed from the form for this client. Check the placeholder/name attribute used in the locator.',
                        'patientInfo.cases.js | PatientPage.city'
                    )
                ).toBeVisible();

                await expect(patientPage.zip,
                    failMsg('TC-PI-04',
                        'Zip code input must be visible on the patient info page.',
                        'The zip locator in PatientPage.js may be stale, or the Zip field label/placeholder changed. Check the selector used in PatientPage.js.',
                        'patientInfo.cases.js | PatientPage.zip'
                    )
                ).toBeVisible();
            });
        }

        if (hasState) {
            test('TC-PI-05 — State autocomplete is visible', async ({ patientPage }) => {
                step('Checking that the State autocomplete field is rendered on the patient info page');
                await expect(patientPage.stateInput,
                    failMsg('TC-PI-05',
                        'State autocomplete input must be visible on the patient info page.',
                        'The stateInput locator in PatientPage.js may target an aria-label or placeholder that changed, or the State field was removed for this client. Confirm hasState=true is correct.',
                        'patientInfo.cases.js | PatientPage.stateInput'
                    )
                ).toBeVisible();
            });
        }

        if (hasReferral) {
            test('TC-PI-06 — "How did you hear" referral field is visible', async ({ patientPage }) => {
                step('Checking that the "How did you hear about us" referral field is rendered');
                await expect(patientPage.referralInput,
                    failMsg('TC-PI-06',
                        '"How did you hear about us" referral input must be visible on the patient info page.',
                        'The referralInput locator in PatientPage.js may be stale, or the referral field was toggled off in client config. Confirm hasReferral=true is correct and check the locator selector.',
                        'patientInfo.cases.js | PatientPage.referralInput'
                    )
                ).toBeVisible();
            });
        }

        test('TC-PI-08 — Book Now button is visible and enabled', async ({ patientPage }) => {
            step('Checking that the Book Now submit button is visible on the patient info page');
            await expect(patientPage.submitBtn,
                failMsg('TC-PI-08',
                    'Book Now / Submit button must be visible on the patient info page.',
                    'The submitBtn locator in PatientPage.js may be targeting text or a role that changed. Check the button text or aria role selector used in PatientPage.js.',
                    'patientInfo.cases.js | PatientPage.submitBtn — visibility'
                )
            ).toBeVisible();

            step('Checking that the Book Now submit button is enabled (not disabled)');
            await expect(patientPage.submitBtn,
                failMsg('TC-PI-08',
                    'Book Now / Submit button must be enabled on the patient info page.',
                    'The submit button may have been conditionally disabled pending some required field or global state. Check if any form-level validation is pre-disabling the button in the patient info component.',
                    'patientInfo.cases.js | PatientPage.submitBtn — enabled state'
                )
            ).toBeEnabled();
        });

    });

    // ── 4. BASIC INFO FIELDS ──────────────────────────────────────────────────

    test.describe('Basic info fields', () => {

        test('TC-PI-09 — First Name and Last Name accept alphabetical input', async ({ patientPage }) => {
            step('Filling First Name with "John" and Last Name with "Doe"');
            await patientPage.firstName.fill('John');
            await patientPage.lastName.fill('Doe');

            step('Verifying First Name field holds the entered value');
            await expect(patientPage.firstName,
                failMsg('TC-PI-09',
                    'First Name field must retain the value "John" after fill.',
                    'The firstName locator may be resolving to a read-only or masked input. Check whether the field is editable and that the locator in PatientPage.js targets the correct input element.',
                    'patientInfo.cases.js | PatientPage.firstName — value after fill'
                )
            ).toHaveValue('John');

            step('Verifying Last Name field holds the entered value');
            await expect(patientPage.lastName,
                failMsg('TC-PI-09',
                    'Last Name field must retain the value "Doe" after fill.',
                    'The lastName locator may be resolving to a read-only or masked input. Check whether the field is editable and that the locator in PatientPage.js targets the correct input element.',
                    'patientInfo.cases.js | PatientPage.lastName — value after fill'
                )
            ).toHaveValue('Doe');
        });

        test('TC-PI-10 — Name fields accept hyphenated and apostrophe characters', async ({ patientPage }) => {
            step('Filling First Name with "Mary-Jane" (hyphen) and Last Name with "O\'Brien" (apostrophe)');
            await patientPage.firstName.fill("Mary-Jane");
            await patientPage.lastName.fill("O'Brien");

            step('Verifying First Name retains the hyphenated value');
            await expect(patientPage.firstName,
                failMsg('TC-PI-10',
                    'First Name field must accept and retain a hyphenated value like "Mary-Jane".',
                    'The input may be stripping special characters via an onKeyPress filter or maxLength constraint. Check the firstName input handler and any sanitisation in PatientPage.js.',
                    'patientInfo.cases.js | PatientPage.firstName — special characters'
                )
            ).toHaveValue("Mary-Jane");

            step('Verifying Last Name retains the apostrophe value');
            await expect(patientPage.lastName,
                failMsg('TC-PI-10',
                    'Last Name field must accept and retain an apostrophe value like "O\'Brien".',
                    'The input may be stripping apostrophes via a character filter. Check the lastName input handler and any sanitisation applied in PatientPage.js.',
                    'patientInfo.cases.js | PatientPage.lastName — special characters'
                )
            ).toHaveValue("O'Brien");
        });

        test('TC-PI-11 — Email accepts valid format', async ({ patientPage }) => {
            step('Filling the Email field with a standard valid email address');
            await patientPage.email.fill('johndoe@example.com');

            step('Verifying the Email field retains the entered value');
            await expect(patientPage.email,
                failMsg('TC-PI-11',
                    'Email field must retain the value "johndoe@example.com" after fill.',
                    'The email locator may be resolving to a different element, or the field may be auto-clearing the value. Check the email locator in PatientPage.js.',
                    'patientInfo.cases.js | PatientPage.email — value after fill'
                )
            ).toHaveValue('johndoe@example.com');
        });

        test('TC-PI-12 — Phone accepts 10-digit number', async ({ patientPage }) => {
            step('Clicking the Phone field and filling it with a 10-digit number');
            await patientPage.phone.click();
            await patientPage.phone.fill('5551234567');

            step('Verifying the Phone field is not empty after the fill');
            await expect(patientPage.phone,
                failMsg('TC-PI-12',
                    'Phone field must not be empty after filling with a 10-digit number.',
                    'The phone input may be a masked field that rejects programmatic fill(). Try pressSequentially() if fill() is ignored. Check the phone locator and input type in PatientPage.js.',
                    'patientInfo.cases.js | PatientPage.phone — value after fill'
                )
            ).not.toHaveValue('');
        });

        if (hasAddress) {
            test('TC-PI-13 — Address, City, and Zip accept text input', async ({ patientPage }) => {
                step('Filling Address line 1, City, and Zip with valid values');
                await patientPage.address1.fill('123 Main St');
                await patientPage.city.fill('Farmington Hills');
                await patientPage.zip.fill('48335');

                step('Verifying Address line 1 holds the entered value');
                await expect(patientPage.address1,
                    failMsg('TC-PI-13',
                        'Address line 1 field must retain "123 Main St" after fill.',
                        'The address1 locator may be stale or target a read-only element. Check the locator definition in PatientPage.js.',
                        'patientInfo.cases.js | PatientPage.address1 — value after fill'
                    )
                ).toHaveValue('123 Main St');

                step('Verifying City holds the entered value');
                await expect(patientPage.city,
                    failMsg('TC-PI-13',
                        'City field must retain "Farmington Hills" after fill.',
                        'The city locator may be stale. Check the placeholder or name attribute used in PatientPage.js.',
                        'patientInfo.cases.js | PatientPage.city — value after fill'
                    )
                ).toHaveValue('Farmington Hills');

                step('Verifying Zip holds the entered value');
                await expect(patientPage.zip,
                    failMsg('TC-PI-13',
                        'Zip field must retain "48335" after fill.',
                        'The zip locator may be stale or the field may apply a mask that drops non-numeric characters. Check the locator in PatientPage.js.',
                        'patientInfo.cases.js | PatientPage.zip — value after fill'
                    )
                ).toHaveValue('48335');
            });

            test('TC-PI-14 — Address2 is optional and accepts input', async ({ patientPage }) => {
                step('Filling Address line 2 (optional field) with "Suite 400"');
                await patientPage.address2.fill('Suite 400');

                step('Verifying Address line 2 holds the entered value');
                await expect(patientPage.address2,
                    failMsg('TC-PI-14',
                        'Address line 2 field must retain "Suite 400" after fill.',
                        'The address2 locator in PatientPage.js may be stale, or the field may have been removed from the form as it is optional. Check whether the element exists in the DOM.',
                        'patientInfo.cases.js | PatientPage.address2 — value after fill'
                    )
                ).toHaveValue('Suite 400');
            });
        }

    });

    // ── 5. DATE OF BIRTH ──────────────────────────────────────────────────────

    test.describe('Date of Birth', () => {

        test('TC-PI-15 — DOB accepts a standard adult date', async ({ patientPage }) => {
            step('Filling DOB with a standard adult date (Jan 15, 1990)');
            await patientPage.fillDOB('01151990');

            step('Verifying DOB field is not empty after fill');
            await expect(patientPage.dob,
                failMsg('TC-PI-15',
                    'DOB field must not be empty after filling with a valid adult date (01/15/1990).',
                    'fillDOB() may be using pressSequentially() on the wrong element, or the DOB input format may have changed (e.g. from MM/DD/YYYY to YYYY-MM-DD). Check PatientPage.fillDOB() and the DOB locator.',
                    'patientInfo.cases.js | PatientPage.fillDOB() — adult date'
                )
            ).not.toHaveValue('');
        });

        test('TC-PI-16 — DOB accepts a minor date', async ({ patientPage }) => {
            step('Filling DOB with a minor date (Jun 20, 2015)');
            await patientPage.fillDOB('06202015');

            step('Verifying DOB field is not empty after fill');
            await expect(patientPage.dob,
                failMsg('TC-PI-16',
                    'DOB field must not be empty after filling with a minor date (06/20/2015).',
                    'fillDOB() may be rejecting dates within the last 18 years if a min-age constraint was applied. Check PatientPage.fillDOB() and whether the DOB field has a min-date attribute.',
                    'patientInfo.cases.js | PatientPage.fillDOB() — minor date'
                )
            ).not.toHaveValue('');
        });

        test('TC-PI-17 — DOB accepts an elderly patient date', async ({ patientPage }) => {
            step('Filling DOB with an elderly patient date (Mar 1, 1940)');
            await patientPage.fillDOB('03011940');

            step('Verifying DOB field is not empty after fill');
            await expect(patientPage.dob,
                failMsg('TC-PI-17',
                    'DOB field must not be empty after filling with an elderly date (03/01/1940).',
                    'fillDOB() may be rejecting dates before a certain year if a max-age constraint was applied. Check PatientPage.fillDOB() and whether the DOB field has a min-date or earliest-allowed-year attribute.',
                    'patientInfo.cases.js | PatientPage.fillDOB() — elderly date'
                )
            ).not.toHaveValue('');
        });

    });

    // ── 6. GENDER ─────────────────────────────────────────────────────────────

    test.describe('Gender dropdown', () => {

        test('TC-PI-18 — Male is selectable', async ({ patientPage }) => {
            step('Selecting "Male" from the gender dropdown');
            await patientPage.selectGender('Male');

            step('Verifying gender trigger shows "Male" after selection');
            await expect(patientPage.genderTrigger,
                failMsg('TC-PI-18',
                    'Gender trigger must display "Male" after selecting Male from the dropdown.',
                    'selectGender() may be clicking the wrong option or the option text changed. Check the MUI Select option values in the form and the selectGender() implementation in PatientPage.js.',
                    'patientInfo.cases.js | PatientPage.selectGender("Male")'
                )
            ).toContainText('Male');
        });

        test('TC-PI-19 — Female is selectable', async ({ patientPage }) => {
            step('Selecting "Female" from the gender dropdown');
            await patientPage.selectGender('Female');

            step('Verifying gender trigger shows "Female" after selection');
            await expect(patientPage.genderTrigger,
                failMsg('TC-PI-19',
                    'Gender trigger must display "Female" after selecting Female from the dropdown.',
                    'selectGender() may be clicking the wrong option or the option text changed. Check the MUI Select option values in the form and the selectGender() implementation in PatientPage.js.',
                    'patientInfo.cases.js | PatientPage.selectGender("Female")'
                )
            ).toContainText('Female');
        });

        test('TC-PI-20 — Gender dropdown closes after selection', async ({ patientPage }) => {
            step('Selecting "Male" from the gender dropdown to trigger close behaviour');
            await patientPage.selectGender('Male');

            step('Verifying the gender listbox is no longer visible after selection');
            await expect(patientPage.page.locator('[role="listbox"]'),
                failMsg('TC-PI-20',
                    'Gender listbox (role="listbox") must not be visible after an option is selected.',
                    'The MUI Select dropdown may remain open if the option click did not register or the dropdown close animation is blocking detection. Check whether selectGender() waits for the listbox to close in PatientPage.js.',
                    'patientInfo.cases.js | PatientPage.selectGender() — listbox close'
                )
            ).not.toBeVisible({ timeout: 3_000 });
        });

    });

    // ── 7. STATE ──────────────────────────────────────────────────────────────

    if (hasState) {
        test.describe('State dropdown', () => {

            test('TC-PI-21 — State accepts typed search and selects a result', async ({ patientPage }) => {
                step('Selecting state "MI-Michigan" via the state autocomplete');
                await patientPage.selectState('MI-Michigan');

                step('Verifying the state input field shows "MI-Michigan" after selection');
                await expect(patientPage.stateInput,
                    failMsg('TC-PI-21',
                        'State autocomplete must show "MI-Michigan" after selectState() is called.',
                        'selectState() may be clicking the wrong option or the state option labels changed format (e.g. "Michigan" vs "MI-Michigan"). Check the state option values in the form and selectState() in PatientPage.js.',
                        'patientInfo.cases.js | PatientPage.selectState("MI-Michigan")'
                    )
                ).toHaveValue('MI-Michigan');
            });

            test('TC-PI-22 — State filters options by typed text', async ({ patientPage }) => {
                step('Clicking the state autocomplete and typing "Mich" to filter options');
                await patientPage.stateInput.click();
                await patientPage.stateInput.clear();
                await patientPage.stateInput.pressSequentially('Mich', { delay: 30 });

                step('Verifying that "MI-Michigan" appears in the filtered options list');
                await expect(
                    patientPage.page.locator('[role="option"]').filter({ hasText: 'MI-Michigan' }).first(),
                    failMsg('TC-PI-22',
                        'Typing "Mich" in the state autocomplete must show an option containing "MI-Michigan".',
                        'The state autocomplete filter may not be performing a substring match, or the option text format changed. Check the MUI Autocomplete filterOptions configuration and the option labels.',
                        'patientInfo.cases.js | PatientPage.stateInput — option filtering'
                    )
                ).toBeVisible({ timeout: 10_000 });
            });

            test('TC-PI-23 — invalid state search shows no matching options', async ({ patientPage }) => {
                step('Clicking the state autocomplete and typing a nonsense string to get zero results');
                await patientPage.stateInput.click();
                await patientPage.stateInput.clear();
                await patientPage.stateInput.pressSequentially('zzzznotastate', { delay: 30 });

                step('Verifying no options are shown for the nonsense search string');
                await expect(
                    patientPage.page.locator('[role="option"]'),
                    failMsg('TC-PI-23',
                        'Typing "zzzznotastate" in the state autocomplete must return zero matching options.',
                        'The state autocomplete may be showing a default/fallback option list instead of filtering. Check the filterOptions logic in the MUI Autocomplete and the state data source.',
                        'patientInfo.cases.js | PatientPage.stateInput — zero results for invalid input'
                    )
                ).toHaveCount(0, { timeout: 5_000 });
            });

        });
    }

    // ── 8. REFERRAL ───────────────────────────────────────────────────────────

    if (hasReferral) {
        test.describe('How did you hear about us', () => {

            test('TC-PI-24 — Google referral is selectable', async ({ patientPage }) => {
                step('Selecting "Google" from the referral dropdown');
                await patientPage.selectReferral('Google');

                step('Verifying the referral input shows "Google" after selection');
                await expect(patientPage.referralInput,
                    failMsg('TC-PI-24',
                        'Referral input must show "Google" after selecting Google from the dropdown.',
                        'selectReferral() may be clicking the wrong option or "Google" was renamed in the referral options list. Check the option values in the referral dropdown and selectReferral() in PatientPage.js.',
                        'patientInfo.cases.js | PatientPage.selectReferral("Google")'
                    )
                ).toHaveValue('Google');
            });

            test('TC-PI-25 — Facebook referral is selectable', async ({ patientPage }) => {
                step('Selecting "Facebook" from the referral dropdown');
                await patientPage.selectReferral('Facebook');

                step('Verifying the referral input shows "Facebook" after selection');
                await expect(patientPage.referralInput,
                    failMsg('TC-PI-25',
                        'Referral input must show "Facebook" after selecting Facebook from the dropdown.',
                        'selectReferral() may be clicking the wrong option or "Facebook" was renamed/removed from the referral options. Check the referral dropdown option list and selectReferral() in PatientPage.js.',
                        'patientInfo.cases.js | PatientPage.selectReferral("Facebook")'
                    )
                ).toHaveValue('Facebook');
            });

            test('TC-PI-26 — Friend/Relative referral is selectable', async ({ patientPage }) => {
                step('Selecting "Friend/Relative" from the referral dropdown');
                await patientPage.selectReferral('Friend/Relative');

                step('Verifying the referral input shows "Friend/Relative" after selection');
                await expect(patientPage.referralInput,
                    failMsg('TC-PI-26',
                        'Referral input must show "Friend/Relative" after selecting that option.',
                        'selectReferral() may be clicking the wrong option or the option label changed (e.g. "Friend" vs "Friend/Relative"). Check the referral option list and selectReferral() in PatientPage.js.',
                        'patientInfo.cases.js | PatientPage.selectReferral("Friend/Relative")'
                    )
                ).toHaveValue('Friend/Relative');
            });

            test('TC-PI-27 — selecting Doctor shows Doctor Name field', async ({ patientPage }) => {
                step('Selecting "Doctor" from the referral dropdown');
                await patientPage.selectReferral('Doctor');

                step('Verifying the Doctor Name input field appears after selecting Doctor referral');
                await expect(patientPage.doctorName,
                    failMsg('TC-PI-27',
                        'Doctor Name input field must become visible after selecting "Doctor" as the referral source.',
                        'The conditional rendering of the Doctor Name field may be broken. Check the form component logic that shows/hides doctorName based on the referral selection, and verify the doctorName locator in PatientPage.js.',
                        'patientInfo.cases.js | PatientPage.doctorName — visible after Doctor referral selected'
                    )
                ).toBeVisible({ timeout: 5_000 });
            });

            test('TC-PI-28 — Doctor Name field accepts input', async ({ patientPage }) => {
                step('Selecting "Doctor" from the referral dropdown to reveal the Doctor Name field');
                await patientPage.selectReferral('Doctor');

                step('Typing "Dr. Smith" into the Doctor Name field');
                await patientPage.selectReferralOther('Dr. Smith');

                step('Verifying the Doctor Name field holds the entered value');
                await expect(patientPage.doctorName,
                    failMsg('TC-PI-28',
                        'Doctor Name field must retain "Dr. Smith" after input.',
                        'selectReferralOther() may be targeting the wrong input or the Doctor Name field resets on interaction. Check the doctorName locator and selectReferralOther() in PatientPage.js.',
                        'patientInfo.cases.js | PatientPage.selectReferralOther("Dr. Smith")'
                    )
                ).toHaveValue('Dr. Smith');
            });

            test('TC-PI-29 — switching from Doctor to Google hides Doctor Name field', async ({ patientPage }) => {
                step('Selecting "Doctor" from the referral dropdown to reveal the Doctor Name field');
                await patientPage.selectReferral('Doctor');

                step('Verifying Doctor Name field is visible after selecting Doctor');
                await expect(patientPage.doctorName,
                    failMsg('TC-PI-29',
                        'Doctor Name field must be visible immediately after selecting "Doctor" as the referral.',
                        'The conditional rendering may not be showing the field. Check the form component logic and the doctorName locator in PatientPage.js.',
                        'patientInfo.cases.js | PatientPage.doctorName — visible after Doctor selected'
                    )
                ).toBeVisible({ timeout: 5_000 });

                step('Switching referral to "Google" — Doctor Name field should now hide');
                await patientPage.selectReferral('Google');

                step('Verifying Doctor Name field is hidden after switching referral to Google');
                await expect(patientPage.doctorName,
                    failMsg('TC-PI-29',
                        'Doctor Name field must be hidden after switching referral from "Doctor" to "Google".',
                        'The form may not be cleaning up the conditional Doctor Name field when a different referral is chosen. Check the conditional render logic in the patient info form component and the doctorName locator in PatientPage.js.',
                        'patientInfo.cases.js | PatientPage.doctorName — hidden after switching to Google'
                    )
                ).not.toBeVisible({ timeout: 5_000 });
            });

        });
    }

    // ── 9. FULL FORM COMBINATIONS ─────────────────────────────────────────────

    test.describe('Full form combinations', () => {

        test('TC-PI-36 — all basic fields accept valid data together', async ({ patientPage }) => {
            step('Filling all basic info fields together using fillBasicInfo()');
            await patientPage.fillBasicInfo(VALID_PATIENT.basicInfo);

            step('Verifying First Name holds the expected value after fillBasicInfo');
            await expect(patientPage.firstName,
                failMsg('TC-PI-36',
                    'First Name must equal "John" after fillBasicInfo() with VALID_PATIENT.basicInfo.',
                    'fillBasicInfo() may be filling fields in the wrong order or skipping firstName. Check the fillBasicInfo() implementation in PatientPage.js.',
                    'patientInfo.cases.js | PatientPage.fillBasicInfo() — firstName'
                )
            ).toHaveValue(VALID_PATIENT.basicInfo.firstName);

            step('Verifying Last Name holds the expected value after fillBasicInfo');
            await expect(patientPage.lastName,
                failMsg('TC-PI-36',
                    'Last Name must equal "Doe" after fillBasicInfo() with VALID_PATIENT.basicInfo.',
                    'fillBasicInfo() may be skipping lastName or clearing it after filling another field. Check the fillBasicInfo() implementation in PatientPage.js.',
                    'patientInfo.cases.js | PatientPage.fillBasicInfo() — lastName'
                )
            ).toHaveValue(VALID_PATIENT.basicInfo.lastName);

            step('Verifying Email holds the expected value after fillBasicInfo');
            await expect(patientPage.email,
                failMsg('TC-PI-36',
                    'Email must equal "johndoe@example.com" after fillBasicInfo() with VALID_PATIENT.basicInfo.',
                    'fillBasicInfo() may be skipping email or the email field is being cleared by auto-complete. Check the fillBasicInfo() implementation in PatientPage.js.',
                    'patientInfo.cases.js | PatientPage.fillBasicInfo() — email'
                )
            ).toHaveValue(VALID_PATIENT.basicInfo.email);
        });

        test('TC-PI-37 — Female gender with valid basic info', async ({ patientPage }) => {
            step('Filling all basic info fields using fillBasicInfo()');
            await patientPage.fillBasicInfo(VALID_PATIENT.basicInfo);

            step('Selecting "Female" from the gender dropdown');
            await patientPage.selectGender('Female');

            step('Verifying gender trigger displays "Female" after combined fill + gender selection');
            await expect(patientPage.genderTrigger,
                failMsg('TC-PI-37',
                    'Gender trigger must display "Female" after fillBasicInfo + selectGender("Female").',
                    'selectGender() may be losing focus after fillBasicInfo() fills other fields, or the dropdown interaction is interfering with previously filled values. Check selectGender() in PatientPage.js.',
                    'patientInfo.cases.js | PatientPage.selectGender("Female") after fillBasicInfo'
                )
            ).toContainText('Female');
        });

        if (hasReferral) {
            test('TC-PI-38 — Facebook referral with full basic info', async ({ patientPage }) => {
                step('Filling all fields including Female gender and Facebook referral using fillAll()');
                await patientPage.fillAll({ ...VALID_PATIENT, gender: 'Female', referral: 'Facebook' });

                step('Verifying gender trigger shows "Female" after fillAll');
                await expect(patientPage.genderTrigger,
                    failMsg('TC-PI-38',
                        'Gender trigger must display "Female" after fillAll({ gender: "Female", referral: "Facebook" }).',
                        'fillAll() may not be applying gender correctly, or a later field fill is resetting the gender dropdown. Check the order of operations in fillAll() in PatientPage.js.',
                        'patientInfo.cases.js | PatientPage.fillAll() — genderTrigger Female'
                    )
                ).toContainText('Female');

                step('Verifying referral input shows "Facebook" after fillAll');
                await expect(patientPage.referralInput,
                    failMsg('TC-PI-38',
                        'Referral input must show "Facebook" after fillAll({ referral: "Facebook" }).',
                        'fillAll() may not be applying the referral correctly, or selectReferral("Facebook") is failing silently. Check fillAll() and selectReferral() in PatientPage.js.',
                        'patientInfo.cases.js | PatientPage.fillAll() — referralInput Facebook'
                    )
                ).toHaveValue('Facebook');
            });
        }

    });

    }); // end Patient Info Page describe
}

export { runPatientInfoCases };
