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
            const urlBefore = patientPage.page.url();
            await patientPage.submit();
            await patientPage.page.waitForTimeout(2_000);
            // Form validation must keep us on the same URL
            expect(patientPage.page.url()).toBe(urlBefore);
            // Submit button still visible confirms we didn't navigate away
            await expect(patientPage.submitBtn).toBeVisible({ timeout: 5_000 });
        });

        test('TC-PI-34 — partial form (only firstName) stays on the patient info page', async ({ patientPage }) => {
            await patientPage.firstName.fill('John');
            const urlBefore = patientPage.page.url();
            await patientPage.submit();
            await patientPage.page.waitForTimeout(2_000);
            expect(patientPage.page.url()).toBe(urlBefore);
        });

        test('TC-PI-35 — invalid email format stays on the patient info page', async ({ patientPage }) => {
            await patientPage.email.fill('not-an-email');
            const urlBefore = patientPage.page.url();
            await patientPage.submit();
            await patientPage.page.waitForTimeout(2_000);
            expect(patientPage.page.url()).toBe(urlBefore);
        });

    });

    // ── 1b. INVALID INPUT FORMAT VALIDATION ───────────────────────────────────
    // Uses test-scoped patientInfoPage so each test gets a clean form state.

    test.describe('Invalid input format validation', () => {

        test('TC-PI-VAL-01 — future date as DOB keeps form on page (not submitted)', async ({ patientInfoPage }) => {
            await patientInfoPage.firstName.waitFor({ state: 'visible', timeout: 10_000 });
            await patientInfoPage.fillDOB('01012099'); // Jan 1, 2099 — far future
            const urlBefore = patientInfoPage.page.url();
            await patientInfoPage.submit();
            await patientInfoPage.page.waitForTimeout(2_000);
            expect(patientInfoPage.page.url()).toBe(urlBefore);
        });

        test('TC-PI-VAL-02 — too-short phone number keeps form on page', async ({ patientInfoPage }) => {
            test.slow(); // CI runners are slower — triple timeout
            await patientInfoPage.firstName.waitFor({ state: 'visible', timeout: 10_000 });
            await patientInfoPage.phone.click();
            await patientInfoPage.phone.fill('123');
            const urlBefore = patientInfoPage.page.url();
            await patientInfoPage.submit();
            await patientInfoPage.page.waitForTimeout(3_000);
            expect(patientInfoPage.page.url()).toBe(urlBefore);
        });

        test('TC-PI-VAL-03 — email missing domain (abc@) keeps form on page', async ({ patientInfoPage }) => {
            test.slow();
            await patientInfoPage.firstName.waitFor({ state: 'visible', timeout: 10_000 });
            await patientInfoPage.email.fill('testuser@');
            const urlBefore = patientInfoPage.page.url();
            await patientInfoPage.submit();
            await patientInfoPage.page.waitForTimeout(3_000);
            expect(patientInfoPage.page.url()).toBe(urlBefore);
        });

        test('TC-PI-VAL-04 — email with no @ symbol keeps form on page', async ({ patientInfoPage }) => {
            await patientInfoPage.firstName.waitFor({ state: 'visible', timeout: 10_000 });
            await patientInfoPage.email.fill('notanemail');
            const urlBefore = patientInfoPage.page.url();
            await patientInfoPage.submit();
            await patientInfoPage.page.waitForTimeout(2_000);
            expect(patientInfoPage.page.url()).toBe(urlBefore);
        });

        test('TC-PI-VAL-05 — form with valid data but too-short phone does not submit', async ({ patientInfoPage }) => {
            test.slow();
            await patientInfoPage.firstName.waitFor({ state: 'visible', timeout: 10_000 });
            await patientInfoPage.firstName.fill('John');
            await patientInfoPage.lastName.fill('Doe');
            await patientInfoPage.email.fill('john@example.com');
            await patientInfoPage.phone.click();
            await patientInfoPage.phone.fill('123');
            const urlBefore = patientInfoPage.page.url();
            await patientInfoPage.submit();
            await patientInfoPage.page.waitForTimeout(3_000);
            expect(patientInfoPage.page.url()).toBe(urlBefore);
        });

    });

    // ── 2. SMS CONSENT ────────────────────────────────────────────────────────
    // Run SECOND — checkbox is still unchecked (no previous test has checked it).

    if (hasSmsConsent) {
        test.describe('SMS consent checkbox', () => {

            test('TC-PI-30 — SMS consent is unchecked by default', async ({ patientPage }) => {
                test.slow();
                await patientPage.page.waitForTimeout(1_000); // CI: let page fully settle
                await expect(
                    patientPage.page.locator('input[type="checkbox"]').first()
                ).not.toBeChecked();
            });

            test('TC-PI-39 — fillAll with smsConsent: false leaves the SMS checkbox unchecked', async ({ patientPage }) => {
                // Runs before TC-PI-31 so the box is still unchecked
                await patientPage.fillAll({ ...VALID_PATIENT, smsConsent: false });
                await expect(
                    patientPage.page.locator('input[type="checkbox"]').first()
                ).not.toBeChecked();
            });

            test('TC-PI-31 — SMS consent can be checked', async ({ patientPage }) => {
                await patientPage.checkSmsConsent();
                await expect(
                    patientPage.page.locator('input[type="checkbox"]').first()
                ).toBeChecked();
            });

            test('TC-PI-32 — SMS consent stays checked when called twice', async ({ patientPage }) => {
                await patientPage.checkSmsConsent();
                await patientPage.checkSmsConsent();
                await expect(
                    patientPage.page.locator('input[type="checkbox"]').first()
                ).toBeChecked();
            });

        });
    }

    // ── 3. FIELD VISIBILITY ───────────────────────────────────────────────────

    test.describe('Field visibility', () => {

        test('TC-PI-01 — First Name, Last Name, Email and Phone fields are visible', async ({ patientPage }) => {
            await expect(patientPage.firstName).toBeVisible();
            await expect(patientPage.lastName).toBeVisible();
            await expect(patientPage.email).toBeVisible();
            await expect(patientPage.phone).toBeVisible();
        });

        test('TC-PI-02 — Date of Birth field is visible', async ({ patientPage }) => {
            await expect(patientPage.dob).toBeVisible();
        });

        test('TC-PI-03 — Gender dropdown trigger is visible', async ({ patientPage }) => {
            await expect(patientPage.genderTrigger).toBeVisible();
        });

        if (hasAddress) {
            test('TC-PI-04 — Address, City, and Zip fields are visible', async ({ patientPage }) => {
                await expect(patientPage.address1).toBeVisible();
                await expect(patientPage.city).toBeVisible();
                await expect(patientPage.zip).toBeVisible();
            });
        }

        if (hasState) {
            test('TC-PI-05 — State autocomplete is visible', async ({ patientPage }) => {
                await expect(patientPage.stateInput).toBeVisible();
            });
        }

        if (hasReferral) {
            test('TC-PI-06 — "How did you hear" referral field is visible', async ({ patientPage }) => {
                await expect(patientPage.referralInput).toBeVisible();
            });
        }

        test('TC-PI-08 — Book Now button is visible and enabled', async ({ patientPage }) => {
            await expect(patientPage.submitBtn).toBeVisible();
            await expect(patientPage.submitBtn).toBeEnabled();
        });

    });

    // ── 4. BASIC INFO FIELDS ──────────────────────────────────────────────────

    test.describe('Basic info fields', () => {

        test('TC-PI-09 — First Name and Last Name accept alphabetical input', async ({ patientPage }) => {
            await patientPage.firstName.fill('John');
            await patientPage.lastName.fill('Doe');
            await expect(patientPage.firstName).toHaveValue('John');
            await expect(patientPage.lastName).toHaveValue('Doe');
        });

        test('TC-PI-10 — Name fields accept hyphenated and apostrophe characters', async ({ patientPage }) => {
            await patientPage.firstName.fill("Mary-Jane");
            await patientPage.lastName.fill("O'Brien");
            await expect(patientPage.firstName).toHaveValue("Mary-Jane");
            await expect(patientPage.lastName).toHaveValue("O'Brien");
        });

        test('TC-PI-11 — Email accepts valid format', async ({ patientPage }) => {
            await patientPage.email.fill('johndoe@example.com');
            await expect(patientPage.email).toHaveValue('johndoe@example.com');
        });

        test('TC-PI-12 — Phone accepts 10-digit number', async ({ patientPage }) => {
            await patientPage.phone.click();
            await patientPage.phone.fill('5551234567');
            await expect(patientPage.phone).not.toHaveValue('');
        });

        if (hasAddress) {
            test('TC-PI-13 — Address, City, and Zip accept text input', async ({ patientPage }) => {
                await patientPage.address1.fill('123 Main St');
                await patientPage.city.fill('Farmington Hills');
                await patientPage.zip.fill('48335');
                await expect(patientPage.address1).toHaveValue('123 Main St');
                await expect(patientPage.city).toHaveValue('Farmington Hills');
                await expect(patientPage.zip).toHaveValue('48335');
            });

            test('TC-PI-14 — Address2 is optional and accepts input', async ({ patientPage }) => {
                await patientPage.address2.fill('Suite 400');
                await expect(patientPage.address2).toHaveValue('Suite 400');
            });
        }

    });

    // ── 5. DATE OF BIRTH ──────────────────────────────────────────────────────

    test.describe('Date of Birth', () => {

        test('TC-PI-15 — DOB accepts a standard adult date', async ({ patientPage }) => {
            await patientPage.fillDOB('01151990');
            await expect(patientPage.dob).not.toHaveValue('');
        });

        test('TC-PI-16 — DOB accepts a minor date', async ({ patientPage }) => {
            await patientPage.fillDOB('06202015');
            await expect(patientPage.dob).not.toHaveValue('');
        });

        test('TC-PI-17 — DOB accepts an elderly patient date', async ({ patientPage }) => {
            await patientPage.fillDOB('03011940');
            await expect(patientPage.dob).not.toHaveValue('');
        });

    });

    // ── 6. GENDER ─────────────────────────────────────────────────────────────

    test.describe('Gender dropdown', () => {

        test('TC-PI-18 — Male is selectable', async ({ patientPage }) => {
            await patientPage.selectGender('Male');
            await expect(patientPage.genderTrigger).toContainText('Male');
        });

        test('TC-PI-19 — Female is selectable', async ({ patientPage }) => {
            await patientPage.selectGender('Female');
            await expect(patientPage.genderTrigger).toContainText('Female');
        });

        test('TC-PI-20 — Gender dropdown closes after selection', async ({ patientPage }) => {
            await patientPage.selectGender('Male');
            await expect(patientPage.page.locator('[role="listbox"]')).not.toBeVisible({ timeout: 3_000 });
        });

    });

    // ── 7. STATE ──────────────────────────────────────────────────────────────

    if (hasState) {
        test.describe('State dropdown', () => {

            test('TC-PI-21 — State accepts typed search and selects a result', async ({ patientPage }) => {
                await patientPage.selectState('MI-Michigan');
                await expect(patientPage.stateInput).toHaveValue('MI-Michigan');
            });

            test('TC-PI-22 — State filters options by typed text', async ({ patientPage }) => {
                await patientPage.stateInput.click();
                await patientPage.stateInput.clear();
                await patientPage.stateInput.pressSequentially('Mich', { delay: 30 });
                await expect(
                    patientPage.page.locator('[role="option"]').filter({ hasText: 'MI-Michigan' }).first()
                ).toBeVisible({ timeout: 10_000 });
            });

            test('TC-PI-23 — invalid state search shows no matching options', async ({ patientPage }) => {
                await patientPage.stateInput.click();
                await patientPage.stateInput.clear();
                await patientPage.stateInput.pressSequentially('zzzznotastate', { delay: 30 });
                await expect(
                    patientPage.page.locator('[role="option"]')
                ).toHaveCount(0, { timeout: 5_000 });
            });

        });
    }

    // ── 8. REFERRAL ───────────────────────────────────────────────────────────

    if (hasReferral) {
        test.describe('How did you hear about us', () => {

            test('TC-PI-24 — Google referral is selectable', async ({ patientPage }) => {
                await patientPage.selectReferral('Google');
                await expect(patientPage.referralInput).toHaveValue('Google');
            });

            test('TC-PI-25 — Facebook referral is selectable', async ({ patientPage }) => {
                await patientPage.selectReferral('Facebook');
                await expect(patientPage.referralInput).toHaveValue('Facebook');
            });

            test('TC-PI-26 — Friend/Relative referral is selectable', async ({ patientPage }) => {
                await patientPage.selectReferral('Friend/Relative');
                await expect(patientPage.referralInput).toHaveValue('Friend/Relative');
            });

            test('TC-PI-27 — selecting Doctor shows Doctor Name field', async ({ patientPage }) => {
                await patientPage.selectReferral('Doctor');
                await expect(patientPage.doctorName).toBeVisible({ timeout: 5_000 });
            });

            test('TC-PI-28 — Doctor Name field accepts input', async ({ patientPage }) => {
                await patientPage.selectReferral('Doctor');
                await patientPage.selectReferralOther('Dr. Smith');
                await expect(patientPage.doctorName).toHaveValue('Dr. Smith');
            });

            test('TC-PI-29 — switching from Doctor to Google hides Doctor Name field', async ({ patientPage }) => {
                await patientPage.selectReferral('Doctor');
                await expect(patientPage.doctorName).toBeVisible({ timeout: 5_000 });
                await patientPage.selectReferral('Google');
                await expect(patientPage.doctorName).not.toBeVisible({ timeout: 5_000 });
            });

        });
    }

    // ── 9. FULL FORM COMBINATIONS ─────────────────────────────────────────────

    test.describe('Full form combinations', () => {

        test('TC-PI-36 — all basic fields accept valid data together', async ({ patientPage }) => {
            await patientPage.fillBasicInfo(VALID_PATIENT.basicInfo);
            await expect(patientPage.firstName).toHaveValue(VALID_PATIENT.basicInfo.firstName);
            await expect(patientPage.lastName).toHaveValue(VALID_PATIENT.basicInfo.lastName);
            await expect(patientPage.email).toHaveValue(VALID_PATIENT.basicInfo.email);
        });

        test('TC-PI-37 — Female gender with valid basic info', async ({ patientPage }) => {
            await patientPage.fillBasicInfo(VALID_PATIENT.basicInfo);
            await patientPage.selectGender('Female');
            await expect(patientPage.genderTrigger).toContainText('Female');
        });

        if (hasReferral) {
            test('TC-PI-38 — Facebook referral with full basic info', async ({ patientPage }) => {
                await patientPage.fillAll({ ...VALID_PATIENT, gender: 'Female', referral: 'Facebook' });
                await expect(patientPage.genderTrigger).toContainText('Female');
                await expect(patientPage.referralInput).toHaveValue('Facebook');
            });
        }

    });

    }); // end Patient Info Page describe
}

export { runPatientInfoCases };
