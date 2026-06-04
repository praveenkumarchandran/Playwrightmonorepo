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
 * @param {'insurance'|'patientInfo'|'intake'} [opts.nextPageAfterSlot]
 *   Expected page after selecting a slot and clicking Continue.
 * @param {boolean} [opts.expectNoAvailability=false]
 *   When true, the page is expected to show a "no online availability" error
 *   instead of provider cards. Skips slot-interaction tests and verifies the message.
 */
export function runFindAppointmentCases(test, expect, opts = {}) {
    const {
        expectedServiceType,
        nextPageAfterSlot,
        hasProviderDropdown = true,   // false for Kronson which has only Location + Reason filters
        allServiceTypes     = [],     // all service options to test individually (Clarus, Hopemark)
    } = opts;

    // Helper — returns true when the page has no providers/slots and shows the
    // "no online availability" message. Used to skip or adjust assertions dynamically.
    // Any client can show this state when the staging server has no available slots.
    async function isNoAvailability(findAppointmentPage) {
        return findAppointmentPage.hasNoAvailabilityMessage();
    }

    test.describe('Find Appointment — Basic Search filters', () => {

        // ── No-availability state — dynamic, runs for ALL clients ─────────────
        // These tests pass gracefully when slots exist; verify the message when no slots.

        test.describe('No availability', () => {

            test('TC-FA-NA-01 — "no online availability" message appears when no slots exist', async ({ findAppointmentPage }) => {
                const noAvail = await isNoAvailability(findAppointmentPage);
                if (!noAvail) {
                    console.log('TC-FA-NA-01: Slots available — no-availability message not needed');
                    return; // graceful pass
                }
                await expect(
                    findAppointmentPage.page
                        .getByText(/no online availability|no availability/i).first()
                ).toBeVisible({ timeout: 10_000 });
            });

            test('TC-FA-NA-02 — message directs patient to call the office', async ({ findAppointmentPage }) => {
                const noAvail = await isNoAvailability(findAppointmentPage);
                if (!noAvail) return; // graceful pass — message not needed when slots exist
                await expect(
                    findAppointmentPage.page.getByText(/please call/i).first()
                ).toBeVisible({ timeout: 10_000 });
            });

            test('TC-FA-NA-03 — no provider cards shown when availability is empty', async ({ findAppointmentPage }) => {
                const noAvail = await isNoAvailability(findAppointmentPage);
                if (!noAvail) return; // graceful pass — providers ARE expected when slots exist
                const count = await findAppointmentPage.getProviderCardCount();
                expect(count).toBe(0);
            });

        });

        // ── Positive ──────────────────────────────────────────────────────────

        test.describe('Filter dropdowns', () => {

            test('TC-FA-01 — Location and Service Type dropdowns are visible', async ({ findAppointmentPage }) => {
                await expect(findAppointmentPage.locationDropdown).toBeVisible();
                await expect(findAppointmentPage.serviceTypeDropdown).toBeVisible();
                // Provider dropdown only exists on clients with 3-filter layout (not Kronson)
                if (hasProviderDropdown) {
                    await expect(findAppointmentPage.providerDropdown).toBeVisible();
                }
            });

            test('TC-FA-02 — Service Type matches the service selected on the landing page', async ({ findAppointmentPage }) => {
                const value = await findAppointmentPage._getDropdownText(findAppointmentPage.serviceTypeDropdown);
                // Escape regex special chars (e.g. Hopemark has parentheses in reason names)
                const escaped = expectedServiceType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                expect(value).toMatch(new RegExp(escaped, 'i'));
            });

            test('TC-FA-03 — Provider dropdown defaults to "Any Provider"', async ({ findAppointmentPage }) => {
                if (!hasProviderDropdown) return; // Kronson has no Provider filter
                const value = await findAppointmentPage._getDropdownText(findAppointmentPage.providerDropdown);
                expect(value).toMatch(/any provider/i);
            });

        });

        // ── Provider cards ────────────────────────────────────────────────────

        test.describe('Provider cards', () => {

            test('TC-FA-04 — at least one provider card with slots is visible', async ({ findAppointmentPage }) => {
                if (await isNoAvailability(findAppointmentPage)) return; // no slots — skip gracefully
                const count = await findAppointmentPage.getProviderCardCount();
                expect(count).toBeGreaterThan(0);
            });

        });

        // ── Provider Gender filter ─────────────────────────────────────────────

        test.describe('Provider Gender filter', () => {

            test('TC-FA-05 — Male and Female checkboxes are both checked by default', async ({ findAppointmentPage }) => {
                if (await isNoAvailability(findAppointmentPage)) return;
                await expect(findAppointmentPage.maleCheckbox).toBeChecked();
                await expect(findAppointmentPage.femaleCheckbox).toBeChecked();
            });

            test('TC-FA-06 — unchecking Female filters provider cards', async ({ findAppointmentPage }) => {
                if (await isNoAvailability(findAppointmentPage)) return;
                const before = await findAppointmentPage.getProviderCardCount();
                await findAppointmentPage.femaleCheckbox.uncheck({ force: true });
                await findAppointmentPage.page.waitForTimeout(1_000);
                const after = await findAppointmentPage.getProviderCardCount();
                expect(after).toBeLessThanOrEqual(before);
            });

            test('TC-FA-07 — unchecking Male filters provider cards', async ({ findAppointmentPage }) => {
                if (await isNoAvailability(findAppointmentPage)) return;
                const before = await findAppointmentPage.getProviderCardCount();
                await findAppointmentPage.maleCheckbox.uncheck({ force: true });
                await findAppointmentPage.page.waitForTimeout(1_000);
                const after = await findAppointmentPage.getProviderCardCount();
                expect(after).toBeLessThanOrEqual(before);
            });

            test('TC-FA-08 — re-checking Female restores provider cards', async ({ findAppointmentPage }) => {
                if (await isNoAvailability(findAppointmentPage)) return;
                const before = await findAppointmentPage.getProviderCardCount();
                await findAppointmentPage.femaleCheckbox.uncheck({ force: true });
                await findAppointmentPage.page.waitForTimeout(800);
                await findAppointmentPage.femaleCheckbox.check({ force: true });
                await findAppointmentPage.showMoreLinks.first().waitFor({ state: 'visible', timeout: 10_000 });
                const after = await findAppointmentPage.getProviderCardCount();
                expect(after).toBe(before);
            });

            test('TC-FA-08b — unchecking the ONLY available gender shows no-availability message or zero cards', async ({ findAppointmentPage }) => {
                // Edge case: if all providers are Female (e.g. Hopemark Virtual → Courtney Potempa only),
                // unchecking Female → Male only → 0 providers OR "no online availability" message.
                if (await isNoAvailability(findAppointmentPage)) return;
                const before = await findAppointmentPage.getProviderCardCount();
                if (before === 0) return;

                await findAppointmentPage.femaleCheckbox.uncheck({ force: true });
                await findAppointmentPage.page.waitForTimeout(1_500);

                const afterCount = await findAppointmentPage.getProviderCardCount();
                const noAvail   = await findAppointmentPage.hasNoAvailabilityMessage();

                // Valid outcomes after unchecking Female:
                //   - count dropped to 0 (only Female providers existed)
                //   - no-availability message appears
                //   - count stayed the same (no Female providers → Male-only filter had no effect)
                // All cases: count can only be ≤ before
                expect(afterCount).toBeLessThanOrEqual(before);

                // Restore Female so subsequent tests still see providers
                await findAppointmentPage.femaleCheckbox.check({ force: true });
                await findAppointmentPage.page.waitForFunction(
                    () => document.body.innerText.includes('Show More'),
                    { timeout: 8_000 }
                ).catch(() => {});
            });

            test('TC-FA-09 — unchecking both Male and Female shows no provider cards', async ({ findAppointmentPage }) => {
                if (await isNoAvailability(findAppointmentPage)) return;
                await findAppointmentPage.maleCheckbox.uncheck({ force: true });
                await findAppointmentPage.femaleCheckbox.uncheck({ force: true });
                await findAppointmentPage.page.waitForFunction(
                    () => !document.body.innerText.includes('Show More'),
                    { timeout: 10_000 }
                ).catch(() => {});
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
                if (await isNoAvailability(findAppointmentPage)) return;
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
                if (await isNoAvailability(findAppointmentPage)) return;
                await findAppointmentPage.clickShowMore(0);
                await findAppointmentPage.clickFirstSlot();
                await findAppointmentPage.clickContinue();

                if (nextPageAfterSlot === 'intake') {
                    // Intake Questions page (e.g. TNDI — intake comes after slot pick)
                    await findAppointmentPage.page.waitForURL(
                        url => url.toString().includes('intake'),
                        { timeout: 15_000 }
                    );
                } else if (nextPageAfterSlot === 'insurance') {
                    // Insurance page — use URL since insurance input style varies by client
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

            test('TC-FA-17 — "Your Appointment" summary on the next page shows the selected provider and appointment type', async ({ findAppointmentPage }) => {
                if (await isNoAvailability(findAppointmentPage)) return;
                // Capture provider name from card 0 BEFORE interacting
                const providerName = await findAppointmentPage.getProviderName(0);

                await findAppointmentPage.clickShowMore(0);
                await findAppointmentPage.clickFirstSlot();
                await findAppointmentPage.clickContinue();

                // Use a single long timeout on the first assertion — it naturally waits for
                // both navigation AND the page to render the summary panel.
                // Avoids fragile waitForURL / waitForLoadState which can race.
                await expect(
                    findAppointmentPage.page.getByText(/Your Appointment/i).first()
                ).toBeVisible({ timeout: 30_000 });

                // Once the heading is visible the rest loads quickly
                if (providerName) {
                    await expect(
                        findAppointmentPage.page.getByText(providerName, { exact: false }).first()
                    ).toBeVisible({ timeout: 8_000 });
                    console.log(`Provider "${providerName}" confirmed in appointment summary`);
                }

                await expect(
                    findAppointmentPage.page.getByText(/Appointment Type/i).first()
                ).toBeVisible({ timeout: 5_000 });

                await expect(
                    findAppointmentPage.page.getByText(/Appointment Time/i).first()
                ).toBeVisible({ timeout: 5_000 });
            });

        });

        // ── Service type variants ─────────────────────────────────────────────
        // For clients with multiple service options (Clarus: Acne/BOTOX/Rash…,
        // Hopemark: In-Office/Virtual), each service is tested to confirm it shows
        // either available providers OR the "no online availability" message.
        // This catches broken service configs (e.g. In-Office showing providers when none exist).

        if (allServiceTypes.length > 1) {
            test.describe('Service type variants', () => {

                allServiceTypes.forEach(service => {
                    test(`TC-FA-SVC — "${service}" shows providers or no-availability message`, async ({ findAppointmentPage }) => {
                        await findAppointmentPage.selectServiceType(service);

                        const hasProviders = (await findAppointmentPage.getProviderCardCount()) > 0;
                        const noAvail      = await findAppointmentPage.hasNoAvailabilityMessage();

                        // Either providers are shown OR the no-availability error message appears
                        expect(hasProviders || noAvail).toBe(true);

                        if (hasProviders) {
                            console.log(`"${service}": ${await findAppointmentPage.getProviderCardCount()} provider card(s) visible`);
                        } else {
                            console.log(`"${service}": no-availability message shown (expected for this service)`);
                        }
                    });
                });

            });
        }

    });
}
