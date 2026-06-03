/**
 * Find Appointment page — Basic Search filter test cases
 *
 * Covers: Location / Service Type / Provider dropdowns, gray-option popups,
 * Provider Gender checkboxes, provider card visibility, and slot selection flow.
 *
 * @param {import('@playwright/test').TestType} test  from makeNewPatientFixtures()
 * @param {Function} expect
 * @param {object}  opts
 * @param {string}  opts.expectedServiceType    — service type chosen on the landing page
 * @param {'insurance'|'patientInfo'} [opts.nextPageAfterSlot]
 *   Expected page after selecting a slot and clicking Continue.
 *   'insurance'  — Add Insurance page (e.g. SINY Medical, TNDI)
 *   'patientInfo' — Add Info page (e.g. SINY Cosmetic — no insurance step)
 */
export function runFindAppointmentCases(test, expect, opts = {}) {
    const { expectedServiceType, nextPageAfterSlot } = opts;

    test.describe('Find Appointment — Basic Search filters', () => {

        // ── Positive ──────────────────────────────────────────────────────────

        test.describe('Filter dropdowns', () => {

            test('TC-FA-01 — Location, Service Type and Provider dropdowns are visible', async ({ findAppointmentPage }) => {
                await expect(findAppointmentPage.locationDropdown).toBeVisible();
                await expect(findAppointmentPage.serviceTypeDropdown).toBeVisible();
                await expect(findAppointmentPage.providerDropdown).toBeVisible();
            });

            test('TC-FA-02 — Service Type matches the service selected on the landing page', async ({ findAppointmentPage }) => {
                const value = await findAppointmentPage._getDropdownText(findAppointmentPage.serviceTypeDropdown);
                expect(value).toMatch(new RegExp(expectedServiceType, 'i'));
            });

            test('TC-FA-03 — Provider dropdown defaults to "Any Provider"', async ({ findAppointmentPage }) => {
                const value = await findAppointmentPage._getDropdownText(findAppointmentPage.providerDropdown);
                expect(value).toMatch(/any provider/i);
            });

        });

        // ── Provider cards ────────────────────────────────────────────────────

        test.describe('Provider cards', () => {

            test('TC-FA-04 — at least one provider card with slots is visible', async ({ findAppointmentPage }) => {
                const count = await findAppointmentPage.getProviderCardCount();
                expect(count).toBeGreaterThan(0);
            });

        });

        // ── Provider Gender filter ─────────────────────────────────────────────

        test.describe('Provider Gender filter', () => {

            test('TC-FA-05 — Male and Female checkboxes are both checked by default', async ({ findAppointmentPage }) => {
                await expect(findAppointmentPage.maleCheckbox).toBeChecked();
                await expect(findAppointmentPage.femaleCheckbox).toBeChecked();
            });

            test('TC-FA-06 — unchecking Female filters provider cards', async ({ findAppointmentPage }) => {
                const before = await findAppointmentPage.getProviderCardCount();
                await findAppointmentPage.femaleCheckbox.uncheck({ force: true });
                await findAppointmentPage.page.waitForTimeout(1_000);
                const after = await findAppointmentPage.getProviderCardCount();
                expect(after).toBeLessThanOrEqual(before);
            });

            test('TC-FA-07 — unchecking Male filters provider cards', async ({ findAppointmentPage }) => {
                const before = await findAppointmentPage.getProviderCardCount();
                await findAppointmentPage.maleCheckbox.uncheck({ force: true });
                await findAppointmentPage.page.waitForTimeout(1_000);
                const after = await findAppointmentPage.getProviderCardCount();
                expect(after).toBeLessThanOrEqual(before);
            });

            test('TC-FA-08 — re-checking Female restores provider cards', async ({ findAppointmentPage }) => {
                const before = await findAppointmentPage.getProviderCardCount();
                await findAppointmentPage.femaleCheckbox.uncheck({ force: true });
                await findAppointmentPage.page.waitForTimeout(800);
                await findAppointmentPage.femaleCheckbox.check({ force: true });
                // Wait for provider cards to reload after re-enabling filter
                await findAppointmentPage.showMoreLinks.first().waitFor({ state: 'visible', timeout: 10_000 });
                const after = await findAppointmentPage.getProviderCardCount();
                expect(after).toBe(before);
            });

            test('TC-FA-09 — unchecking both Male and Female shows no provider cards', async ({ findAppointmentPage }) => {
                await findAppointmentPage.maleCheckbox.uncheck({ force: true });
                await findAppointmentPage.femaleCheckbox.uncheck({ force: true });
                // Wait until "Show More" disappears (cards removed) rather than a fixed timeout
                // CI machines are slower — polling is more reliable than waitForTimeout
                await findAppointmentPage.page.waitForFunction(
                    () => !document.body.innerText.includes('Show More'),
                    { timeout: 10_000 }
                ).catch(() => {}); // if already 0, waitForFunction resolves immediately
                const count = await findAppointmentPage.getProviderCardCount();
                expect(count).toBe(0);
            });

        });

        // ── Negative — gray option popups ─────────────────────────────────────

        test.describe('Unavailability popups', () => {

            test('TC-FA-10 — selecting a gray location shows "not available" popup', async ({ findAppointmentPage }) => {
                const gray = await findAppointmentPage.triggerGrayOption(findAppointmentPage.locationDropdown);
                if (!gray) return; // no gray locations for this client/service combination
                await expect(findAppointmentPage.popup).toBeVisible({ timeout: 8_000 });
                await expect(findAppointmentPage.popup).toContainText(/not available/i);
            });

            test('TC-FA-11 — selecting a gray provider shows unavailability popup', async ({ findAppointmentPage }) => {
                const gray = await findAppointmentPage.triggerGrayOption(findAppointmentPage.providerDropdown);
                if (!gray) return; // no gray providers for this client/service combination
                await expect(findAppointmentPage.popup).toBeVisible({ timeout: 8_000 });
                await expect(findAppointmentPage.popup).toContainText(/does not offer|not available/i);
            });

            test('TC-FA-12 — popup has a close button that dismisses it', async ({ findAppointmentPage }) => {
                // Try location first, fall back to provider
                let gray = await findAppointmentPage.triggerGrayOption(findAppointmentPage.locationDropdown);
                if (!gray) gray = await findAppointmentPage.triggerGrayOption(findAppointmentPage.providerDropdown);
                if (!gray) return; // no gray options available for this client
                await expect(findAppointmentPage.popup).toBeVisible({ timeout: 8_000 });
                await findAppointmentPage.closePopup();
                await expect(findAppointmentPage.popup).not.toBeVisible({ timeout: 5_000 });
            });

        });

        // ── Edge cases ────────────────────────────────────────────────────────

        test.describe('Edge cases', () => {

            test('TC-FA-13 — dismissing gray location popup keeps Service Type unchanged', async ({ findAppointmentPage }) => {
                const serviceBefore = await findAppointmentPage._getDropdownText(findAppointmentPage.serviceTypeDropdown);
                const gray = await findAppointmentPage.triggerGrayOption(findAppointmentPage.locationDropdown);
                if (!gray) return; // no gray locations — nothing to dismiss
                await findAppointmentPage.closePopup();
                const serviceAfter = await findAppointmentPage._getDropdownText(findAppointmentPage.serviceTypeDropdown);
                expect(serviceAfter).toBe(serviceBefore);
            });

            test('TC-FA-14 — dismissing gray provider popup keeps provider filter on "Any Provider"', async ({ findAppointmentPage }) => {
                const gray = await findAppointmentPage.triggerGrayOption(findAppointmentPage.providerDropdown);
                if (!gray) return; // no gray providers
                await findAppointmentPage.closePopup();
                const value = await findAppointmentPage._getDropdownText(findAppointmentPage.providerDropdown);
                expect(value).toMatch(/any provider/i);
            });

        });

        // ── Slot selection ────────────────────────────────────────────────────
        // Screenshots confirmed the DOM layout:
        //   Before Show More: each provider card shows 3 inline slots —
        //     buttons with both date + time text ("Thu Jun 4 / 9:20 AM").
        //   After  Show More: a "More Slots" section expands below the card with:
        //     • a scrollable Dates strip  (buttons like "Thu Jun 4", "Fri Jun 5")
        //     • an Available Slots grid   (pure time-only buttons: "9:20 AM", "9:30 AM" …)
        //     "Show More" text changes to "Show Less".

        test.describe('Slot selection', () => {

            test('TC-FA-15 — Show More expands into a "More Slots" section with available time buttons', async ({ findAppointmentPage }) => {
                await findAppointmentPage.clickShowMore(0);
                // "More Slots" heading must be visible
                await expect(findAppointmentPage.page.getByText('More Slots')).toBeVisible({ timeout: 8_000 });
                // At least one pure time-only button ("9:20 AM") must appear in Available Slots
                const timeBtn = findAppointmentPage.page
                    .locator('button')
                    .filter({ hasText: /^\d{1,2}:\d{2}\s*(AM|PM)$/i })
                    .first();
                await expect(timeBtn).toBeVisible({ timeout: 5_000 });
            });

            test('TC-FA-16 — selecting a slot and clicking Continue navigates to the expected next page', async ({ findAppointmentPage }) => {
                await findAppointmentPage.clickShowMore(0);
                await findAppointmentPage.clickFirstSlot();
                await findAppointmentPage.clickContinue();

                if (nextPageAfterSlot === 'insurance') {
                    // Insurance page — use URL since insurance input style varies by client:
                    // autocomplete (#insurance-select-box) for TNDI/Clarus, MUI Select for SINY
                    await findAppointmentPage.page.waitForURL(
                        url => url.toString().includes('insurance'),
                        { timeout: 15_000 }
                    );
                } else if (nextPageAfterSlot === 'patientInfo') {
                    // Patient Info page — firstName input present on all clients
                    await expect(
                        findAppointmentPage.page.locator('input[name*="firstName"]').first()
                    ).toBeVisible({ timeout: 15_000 });
                } else {
                    // nextPageAfterSlot not specified — verify navigation away from findappointment
                    await findAppointmentPage.page.waitForURL(
                        url => !url.toString().includes('findappointment'),
                        { timeout: 15_000 }
                    );
                }
            });

        });

    });
}
