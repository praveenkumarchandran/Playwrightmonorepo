const VALID_PATIENT = {
    basicInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        phone: '5551234567',
        address: '123 Main St',
        city: 'Farmington Hills',
        zip: '48335',
    },
    dob: '01151990',
    gender: 'Male',
    state: 'MI-Michigan',
    referral: 'Google',
    smsConsent: true,
};

function runPatientInfoCases(test, expect) {

    // ── 1. HAPPY PATH ─────────────────────────────────────────────────────────

    // test.describe('Happy path', () => {

    //     test('TC01 — fills and submits full form with valid data', async ({ patientPage, page }) => {
    //         await patientPage.fillAll(VALID_PATIENT);

    //         await expect(patientPage.firstName).toHaveValue(VALID_PATIENT.basicInfo.firstName);
    //         await expect(patientPage.lastName).toHaveValue(VALID_PATIENT.basicInfo.lastName);
    //         await expect(patientPage.email).toHaveValue(VALID_PATIENT.basicInfo.email);
    //         await expect(patientPage.address1).toHaveValue(VALID_PATIENT.basicInfo.address);
    //         await expect(patientPage.city).toHaveValue(VALID_PATIENT.basicInfo.city);
    //         await expect(patientPage.zip).toHaveValue(String(VALID_PATIENT.basicInfo.zip));

    //         await patientPage.submit();
    //         await expect(page).not.toHaveURL(/additionaldetails/);
    //     });

    //     test('TC02 — fills form without optional Address2', async ({ patientPage }) => {
    //         await patientPage.fillAll(VALID_PATIENT);
    //         await expect(patientPage.address2).toHaveValue('');
    //         await expect(patientPage.submitBtn).toBeEnabled();
    //     });

    //     test('TC03 — fills form with Address2 provided', async ({ patientPage }) => {
    //         await patientPage.fillAll({
    //             ...VALID_PATIENT,
    //             basicInfo: { ...VALID_PATIENT.basicInfo, address2: 'Suite 400' },
    //         });
    //         await expect(patientPage.address2).toHaveValue('Suite 400');
    //     });

    // });

    // ── 2. BASIC INFO ─────────────────────────────────────────────────────────

    // test.describe('Basic info fields', () => {

    //     test('TC04 — first and last name accept alphabetical input', async ({ patientPage }) => {
    //         await patientPage.fillBasicInfo(VALID_PATIENT.basicInfo);
    //         await expect(patientPage.firstName).toHaveValue('John');
    //         await expect(patientPage.lastName).toHaveValue('Doe');
    //     });

    //     test('TC05 — email accepts valid format', async ({ patientPage }) => {
    //         await patientPage.fillBasicInfo(VALID_PATIENT.basicInfo);
    //         await expect(patientPage.email).toHaveValue('johndoe@example.com');
    //     });

    //     test('TC06 — phone accepts 10-digit number', async ({ patientPage }) => {
    //         await patientPage.fillBasicInfo(VALID_PATIENT.basicInfo);
    //         await expect(patientPage.phone).toHaveValue('5551234567');
    //     });

    //     test('TC07 — zip accepts 5-digit value', async ({ patientPage }) => {
    //         await patientPage.fillBasicInfo(VALID_PATIENT.basicInfo);
    //         await expect(patientPage.zip).toHaveValue('48335');
    //     });

    //     test('TC08 — name fields accept hyphenated and apostrophe names', async ({ patientPage }) => {
    //         await patientPage.fillBasicInfo({
    //             ...VALID_PATIENT.basicInfo,
    //             firstName: 'Mary-Jane',
    //             lastName: "O'Brien",
    //         });
    //         await expect(patientPage.firstName).toHaveValue('Mary-Jane');
    //         await expect(patientPage.lastName).toHaveValue("O'Brien");
    //     });

    // });

    // ── 3. DATE OF BIRTH ──────────────────────────────────────────────────────

    // test.describe('Date of Birth', () => {

    //     test('TC09 — fills DOB in MM/DD/YYYY format', async ({ patientPage }) => {
    //         await patientPage.fillDOB('01151990');
    //         await expect(patientPage.dob).toHaveValue('01/15/1990');
    //     });

    //     test('TC10 — fills DOB for a minor', async ({ patientPage }) => {
    //         await patientPage.fillDOB('06202010');
    //         await expect(patientPage.dob).toHaveValue('06/20/2010');
    //     });

    //     test('TC11 — fills DOB for an elderly patient', async ({ patientPage }) => {
    //         await patientPage.fillDOB('03011935');
    //         await expect(patientPage.dob).toHaveValue('03/01/1935');
    //     });

    // });

    // ── 4. GENDER ─────────────────────────────────────────────────────────────

    // test.describe('Gender dropdown', () => {

    //     test('TC12 — selects Male', async ({ patientPage }) => {
    //         await patientPage.selectGender('Male');
    //         await expect(patientPage.genderTrigger).toContainText('Male');
    //     });

    //     test('TC13 — selects Female', async ({ patientPage }) => {
    //         await patientPage.selectGender('Female');
    //         await expect(patientPage.genderTrigger).toContainText('Female');
    //     });

    //     test('TC14 — selects Other', async ({ patientPage }) => {
    //         await patientPage.selectGender('Other');
    //         await expect(patientPage.genderTrigger).toContainText('Other');
    //     });

    //     test('TC15 — dropdown closes after selection', async ({ patientPage }) => {
    //         await patientPage.selectGender('Male');
    //         await expect(patientPage.genderTrigger).toHaveAttribute('aria-expanded', 'false');
    //     });

    // });

    // // ── 5. STATE ──────────────────────────────────────────────────────────────

    // test.describe('State dropdown', () => {

    // test('TC16 — selects MI-Michigan', async ({ patientPage }) => {
    //     await patientPage.selectState('MI-Michigan');
    //     await expect(patientPage.stateInput).toHaveValue('MI-Michigan');
    // });

    // test('TC17 — selects CA-California', async ({ patientPage }) => {
    //     await patientPage.selectState('CA-California');
    //     await expect(patientPage.stateInput).toHaveValue('CA-California');
    // });

    // test('TC18 — selects TX-Texas', async ({ patientPage }) => {
    //     await patientPage.selectState('TX-Texas');
    //     await expect(patientPage.stateInput).toHaveValue('TX-Texas');
    // });

    //     test('TC19 — filters options by typed text', async ({ patientPage }) => {
    //         await patientPage.stateInput.click();
    //         await patientPage.stateInput.clear();
    //         await patientPage.stateInput.pressSequentially('Mich', { delay: 50 });
    //         await expect(
    //             patientPage.page.locator('[role="option"]').filter({ hasText: 'MI-Michigan' }).first()
    //         ).toBeVisible();
    //     });

    // });

    // // ── 6. REFERRAL ───────────────────────────────────────────────────────────

    // test.describe('How Did You Hear About Us', () => {

    //     const referralOptions = [
    //         'Facebook', 'Friend/Relative', 'Google',
    //         'Physician Coordinator', 'WJR', '95.5 WKQI', '106.7 WLLZ',
    //     ];

    //     for (const option of referralOptions) {
    //         test(`TC — selects "${option}"`, async ({ patientPage }) => {
    //             await patientPage.selectReferral(option);
    //             await expect(patientPage.referralInput).toHaveValue(option);
    //         });
    //     }

    //     test('TC20 — selecting Doctor shows Doctor Name field', async ({ patientPage }) => {
    //         await patientPage.selectReferral('Doctor');
    //         await expect(patientPage.doctorName).toBeVisible();
    //     });

    //     test('TC21 — selecting non-Doctor hides Doctor Name field', async ({ patientPage }) => {
    //         await patientPage.selectReferral('Google');
    //         await expect(patientPage.doctorName).not.toBeVisible();
    //     });

    //     test('TC22 — Doctor Name field accepts text', async ({ patientPage }) => {
    //         await patientPage.selectReferral('Doctor');
    //         await patientPage.selectReferralOther('Dr. Smith');
    //         await expect(patientPage.doctorName).toHaveValue('Dr. Smith');
    //     });

    // });

    // // ── 7. SMS CONSENT ────────────────────────────────────────────────────────

    // test.describe('SMS consent checkbox', () => {

    //     test('TC23 — unchecked by default', async ({ patientPage }) => {
    //         await expect(patientPage.smsConsent).not.toBeChecked();
    //     });

    //     test('TC24 — clicking MUI span checks the box', async ({ patientPage }) => {
    //         await patientPage.checkSmsConsent();
    //         await expect(patientPage.smsConsent).toBeChecked();
    //     });

    //     test('TC25 — calling twice stays checked', async ({ patientPage }) => {
    //         await patientPage.checkSmsConsent();
    //         await patientPage.checkSmsConsent();
    //         await expect(patientPage.smsConsent).toBeChecked();
    //     });

    // });

    // // ── 8. VALIDATION ─────────────────────────────────────────────────────────

    test.describe('Form validation', () => {

        test('TC26 — empty form shows required errors', async ({ patientPage }) => {
            await patientPage.submit();
            await expect(
                patientPage.page.locator('[class*="Mui-error"]').first()
            ).toBeVisible({ timeout: 5_000 });
        });

        test('TC27 — partial form still shows errors', async ({ patientPage }) => {
            await patientPage.firstName.fill('John');
            await patientPage.submit();
            await expect(
                patientPage.page.locator('[class*="Mui-error"]').first()
            ).toBeVisible({ timeout: 5_000 });
        });

        test('TC28 — invalid email shows validation error', async ({ patientPage }) => {
            await patientPage.fillBasicInfo({ ...VALID_PATIENT.basicInfo, email: 'not-an-email' });
            await patientPage.submit();
            await expect(
                patientPage.page.locator('[class*="Mui-error"]').first()
            ).toBeVisible({ timeout: 5_000 });
        });

        test('TC29 — Book Now button is visible and enabled', async ({ patientPage }) => {
            await expect(patientPage.submitBtn).toBeVisible();
            await expect(patientPage.submitBtn).toBeEnabled();
        });

    });

    // ── 9. FULL FORM VARIATIONS ───────────────────────────────────────────────

    test.describe('Full form variations', () => {

        test('TC30 — Female gender + Facebook referral', async ({ patientPage }) => {
            await patientPage.fillAll({ ...VALID_PATIENT, gender: 'Female', referral: 'Facebook' });
            await expect(patientPage.genderTrigger).toContainText('Female');
            await expect(patientPage.referralInput).toHaveValue('Facebook');
        });

        test('TC31 — Doctor referral fills Doctor Name', async ({ patientPage }) => {
            await patientPage.fillAll({ ...VALID_PATIENT, referral: 'Doctor', referralOther: 'Dr. Johnson' });
            await expect(patientPage.referralInput).toHaveValue('Doctor');
            await expect(patientPage.doctorName).toHaveValue('Dr. Johnson');
        });

        test('TC32 — smsConsent false stays unchecked', async ({ patientPage, page }) => {
            await patientPage.fillAll({ ...VALID_PATIENT, smsConsent: false });
            await expect(page.locator('input[type="checkbox"]').first()).not.toBeChecked();
        });

        test('TC33 — Friend/Relative referral', async ({ patientPage }) => {
            await patientPage.fillAll({ ...VALID_PATIENT, referral: 'Friend/Relative' });
            await expect(patientPage.referralInput).toHaveValue('Friend/Relative');
        });

    });
}

export { runPatientInfoCases };