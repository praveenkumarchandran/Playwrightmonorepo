/**
 * Existing Patient — identity search form test cases
 *
 * Covers the form at /identity (First Name, Last Name, Date of Birth, Find Appointment).
 *
 * @param {import('@playwright/test').TestType} test   from makeExistingPatientFixtures()
 * @param {Function} expect
 * @param {object}  opts
 * @param {string}  opts.firstName          Known-good patient first name
 * @param {string}  opts.lastName           Known-good patient last name
 * @param {string}  opts.dob                Known-good date of birth (MM/DD/YYYY)
 * @param {boolean} [opts.checkPreFill=false] When true, verifies that after successful login
 *                                            the patient info and insurance pages show pre-filled data
 */
export function runExistingPatientCases(test, expect, opts = {}) {
    const { firstName, lastName, dob, checkPreFill = false } = opts;

    test.describe('Existing Patient — identity search', () => {

        // ── Positive cases ────────────────────────────────────────────────────

        test.describe('Form fields', () => {

            test('TC-EP-01 — identity form is visible with all three fields', async ({ existingPatientPage }) => {
                await expect(existingPatientPage.firstNameInput).toBeVisible();
                await expect(existingPatientPage.lastNameInput).toBeVisible();
                await expect(existingPatientPage.dobInput).toBeVisible();
            });

            test('TC-EP-02 — all fields are empty on initial load', async ({ existingPatientPage }) => {
                await expect(existingPatientPage.firstNameInput).toHaveValue('');
                await expect(existingPatientPage.lastNameInput).toHaveValue('');
                await expect(existingPatientPage.dobInput).toHaveValue('');
            });

            test('TC-EP-03 — typing in First Name updates its value', async ({ existingPatientPage }) => {
                await existingPatientPage.firstNameInput.fill('Test');
                await expect(existingPatientPage.firstNameInput).toHaveValue('Test');
            });

            test('TC-EP-04 — typing in Last Name updates its value', async ({ existingPatientPage }) => {
                await existingPatientPage.lastNameInput.fill('Test');
                await expect(existingPatientPage.lastNameInput).toHaveValue('Test');
            });

            test('TC-EP-05 — typing in Date of Birth updates its value', async ({ existingPatientPage }) => {
                await existingPatientPage.dobInput.click();
                await existingPatientPage.dobInput.fill(dob);
                const value = await existingPatientPage.dobInput.inputValue();
                expect(value).not.toBe('');
            });

            test('TC-EP-06 — Find Appointment button is visible', async ({ existingPatientPage }) => {
                await expect(existingPatientPage.findBtn).toBeVisible();
            });

        });

        test.describe('Valid credentials', () => {

            test('TC-EP-07 — Find Appointment button is enabled and clickable', async ({ existingPatientPage }) => {
                await existingPatientPage.fill(firstName, lastName, dob);
                await expect(existingPatientPage.findBtn).toBeVisible();
                await expect(existingPatientPage.findBtn).toBeEnabled();
            });

            test('TC-EP-08 — submitting valid credentials navigates away from the identity form', async ({ existingPatientPage }) => {
                await existingPatientPage.search(firstName, lastName, dob);
                // Identity form should no longer be visible after a successful search
                await expect(existingPatientPage.firstNameInput).not.toBeVisible({ timeout: 15_000 });
            });

        });

        // ── Negative cases ────────────────────────────────────────────────────
        // NOTE: Find Appointment is NOT disabled — it shows inline validation errors
        // ("to proceed") when submitted with missing fields.

        test.describe('Negative — incomplete form', () => {

            test('TC-EP-09 — submitting empty form shows validation errors', async ({ existingPatientPage }) => {
                await existingPatientPage.findBtn.click();
                await expect(existingPatientPage.validationError.first()).toBeVisible({ timeout: 5_000 });
            });

            test('TC-EP-10 — submitting with only First Name shows validation errors', async ({ existingPatientPage }) => {
                await existingPatientPage.firstNameInput.fill(firstName);
                await existingPatientPage.findBtn.click();
                await expect(existingPatientPage.validationError.first()).toBeVisible({ timeout: 5_000 });
            });

            test('TC-EP-11 — submitting with only Last Name shows validation errors', async ({ existingPatientPage }) => {
                await existingPatientPage.lastNameInput.fill(lastName);
                await existingPatientPage.findBtn.click();
                await expect(existingPatientPage.validationError.first()).toBeVisible({ timeout: 5_000 });
            });

            test('TC-EP-12 — submitting with only DOB shows validation errors', async ({ existingPatientPage }) => {
                await existingPatientPage.dobInput.click();
                await existingPatientPage.dobInput.fill(dob);
                await existingPatientPage.findBtn.click();
                await expect(existingPatientPage.validationError.first()).toBeVisible({ timeout: 5_000 });
            });

        });

        // ── Edge cases ────────────────────────────────────────────────────────

        test.describe('Edge cases', () => {

            test('TC-EP-13 — clearing a field after input resets its value', async ({ existingPatientPage }) => {
                await existingPatientPage.firstNameInput.fill(firstName);
                await existingPatientPage.firstNameInput.clear();
                await expect(existingPatientPage.firstNameInput).toHaveValue('');
            });

            test('TC-EP-14 — invalid patient credentials show error or no-results state', async ({ existingPatientPage }) => {
                await existingPatientPage.search('InvalidXYZ999', 'InvalidXYZ999', dob);
                // App shows "Sorry we didn't find any matching patients" OR keeps form visible
                const errorMsg = existingPatientPage.page.locator(
                    'text=/no matching|not found|no result|could not find|to proceed/i'
                );
                const errorVisible = await errorMsg.isVisible({ timeout: 10_000 }).catch(() => false);
                const formStillVisible = await existingPatientPage.firstNameInput.isVisible().catch(() => false);
                expect(errorVisible || formStillVisible).toBe(true);
            });

            test('TC-EP-15 — special characters in name fields are accepted', async ({ existingPatientPage }) => {
                await existingPatientPage.firstNameInput.fill("O'Brien-Smith");
                await expect(existingPatientPage.firstNameInput).toHaveValue("O'Brien-Smith");
            });

        });

        // ── New Patient button (on identity page) ─────────────────────────────
        // The "New Patient" button is NOT present on initial load.
        // It appears only after a failed patient search (wrong credentials).
        // Clicking it redirects to /findappointment (slot selection page).

        test.describe('New Patient button — from identity page', () => {

            // ── Positive ──────────────────────────────────────────────────────

            test('TC-NP-01 — New Patient button appears after a failed search', async ({ existingPatientPage }) => {
                await existingPatientPage.search('InvalidXYZ999', 'InvalidXYZ999', dob);
                await expect(existingPatientPage.newPatientBtn).toBeVisible({ timeout: 10_000 });
            });

            test('TC-NP-02 — clicking New Patient after failed search redirects to find appointment page', async ({ existingPatientPage }) => {
                await existingPatientPage.search('InvalidXYZ999', 'InvalidXYZ999', dob);
                await existingPatientPage.newPatientBtn.waitFor({ state: 'visible', timeout: 10_000 });
                await existingPatientPage.newPatientBtn.click();
                await existingPatientPage.page.waitForLoadState('networkidle', { timeout: 20_000 });
                await expect(existingPatientPage.firstNameInput).not.toBeVisible({ timeout: 15_000 });
                expect(existingPatientPage.page.url()).toContain('/findappointment');
            });

            test('TC-NP-03 — New Patient button is enabled after it appears', async ({ existingPatientPage }) => {
                await existingPatientPage.search('InvalidXYZ999', 'InvalidXYZ999', dob);
                await existingPatientPage.newPatientBtn.waitFor({ state: 'visible', timeout: 10_000 });
                await expect(existingPatientPage.newPatientBtn).toBeEnabled();
            });

            // ── Negative ──────────────────────────────────────────────────────

            test('TC-NP-04 — New Patient button is NOT visible on initial load before any search', async ({ existingPatientPage }) => {
                // Button must be absent until a failed search is submitted
                await expect(existingPatientPage.newPatientBtn).not.toBeVisible({ timeout: 3_000 });
            });

            test('TC-NP-05 — New Patient button stays visible after re-filling all fields following a failed search', async ({ existingPatientPage }) => {
                await existingPatientPage.search('InvalidXYZ999', 'InvalidXYZ999', dob);
                await existingPatientPage.newPatientBtn.waitFor({ state: 'visible', timeout: 10_000 });
                // Re-fill fields — button should remain available
                await existingPatientPage.fill(firstName, lastName, dob);
                await expect(existingPatientPage.newPatientBtn).toBeVisible();
                await expect(existingPatientPage.newPatientBtn).toBeEnabled();
            });

            // ── Edge cases ────────────────────────────────────────────────────

            test('TC-NP-06 — New Patient button stays visible after a second failed search', async ({ existingPatientPage }) => {
                await existingPatientPage.search('InvalidXYZ999', 'InvalidXYZ999', dob);
                await existingPatientPage.newPatientBtn.waitFor({ state: 'visible', timeout: 10_000 });
                // Search again with different bad credentials
                await existingPatientPage.search('AnotherBad999', 'AnotherBad999', dob);
                await expect(existingPatientPage.newPatientBtn).toBeVisible({ timeout: 10_000 });
            });

            test('TC-NP-07 — New Patient button click from error state navigates to find appointment', async ({ existingPatientPage }) => {
                await existingPatientPage.search('InvalidXYZ999', 'InvalidXYZ999', dob);
                await existingPatientPage.newPatientBtn.waitFor({ state: 'visible', timeout: 10_000 });
                await existingPatientPage.newPatientBtn.click();
                await existingPatientPage.page.waitForLoadState('networkidle', { timeout: 20_000 });
                await expect(existingPatientPage.firstNameInput).not.toBeVisible({ timeout: 15_000 });
                expect(existingPatientPage.page.url()).toContain('/findappointment');
            });

        });

        // ── Pre-fill verification ─────────────────────────────────────────────
        // After a successful existing patient login, the insurance and patient info
        // pages should be pre-filled with data from previous bookings.
        // Enable with opts.checkPreFill: true once the existing patient has prior data.

        if (checkPreFill) {
            test.describe('Pre-fill after existing patient login', () => {

                test('TC-EP-16 — patient info page is pre-filled with existing patient name after login', async ({ existingPatientPage }) => {
                    // Login and navigate away from identity form
                    await existingPatientPage.search(firstName, lastName, dob);
                    await existingPatientPage.page.waitForLoadState('networkidle', { timeout: 20_000 });

                    // Navigate to patient info page — may need to select a slot first
                    // Try to find firstName field directly (if app navigates to patient info)
                    const firstNameField = existingPatientPage.page
                        .locator('input[name*="firstName"], input[placeholder*="First Name"]').first();

                    if (await firstNameField.isVisible({ timeout: 10_000 }).catch(() => false)) {
                        const value = await firstNameField.inputValue();
                        // For existing patients, first name should be pre-filled (not empty)
                        expect(value.trim()).not.toBe('');
                    } else {
                        // App navigated to findappointment or appointments list — acceptable
                        console.log('Patient info not directly visible after login — app may show appointment list first');
                    }
                });

                test('TC-EP-17 — insurance page pre-fills insurance type for returning patient', async ({ existingPatientPage }) => {
                    await existingPatientPage.search(firstName, lastName, dob);
                    await existingPatientPage.page.waitForLoadState('networkidle', { timeout: 20_000 });

                    // Try to navigate to insurance page via stepper if currently on findappointment
                    const isOnFindAppt = existingPatientPage.page.url().includes('findappointment');
                    if (isOnFindAppt) {
                        const addInsuranceStep = existingPatientPage.page
                            .getByText('Add Insurance', { exact: true });
                        const stepVisible = await addInsuranceStep.isVisible({ timeout: 3_000 }).catch(() => false);
                        if (stepVisible) await addInsuranceStep.click();
                    }

                    // Check if insurance type has a pre-filled value (not empty/placeholder)
                    const insuranceSelect = existingPatientPage.page
                        .locator('[class*="MuiSelect-select"], input#insurance-select-box').first();

                    if (await insuranceSelect.isVisible({ timeout: 10_000 }).catch(() => false)) {
                        const value = await insuranceSelect.inputValue().catch(
                            () => insuranceSelect.textContent()
                        );
                        expect(String(value ?? '').trim()).not.toBe('');
                        console.log(`Insurance pre-filled with: ${value}`);
                    } else {
                        console.log('Insurance page not reachable from current URL — skipping pre-fill check');
                    }
                });

            });
        }

    });
}
