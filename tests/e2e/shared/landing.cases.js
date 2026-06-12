/**
 * SHARED LANDING PAGE TEST CASES
 * For standard clients that use a simple reason-selection landing page
 * (MUI Autocomplete or MUI Select for reason, New Patient + Existing Patient buttons).
 *
 * NOT for SINY (which has a two-level reason + gray-service flow — see sinyLanding.cases.js).
 *
 * @param {import('@playwright/test').TestType} test
 * @param {Function} expect
 * @param {object}  opts
 * @param {string}  opts.reason              — reason to select (e.g. 'Acne', 'Teleconsultation')
 * @param {boolean} [opts.hasGating=true]    — New Patient button is disabled until a reason is selected
 * @param {string}  [opts.locationName]      — text unique to the location info panel (e.g. 'Clarus Dermatology')
 *                                             When set, enables TC-LAND-09/10/11 panel visibility tests
 * @param {string}  [opts.anyUrl]            — the /any/ variant URL — enables URL panel tests
 * @param {string}  [opts.phoneNumber]       — expected phone number in the page header (e.g. '877-408-2431')
 *                                             When set, enables TC-LAND-12 header phone verification
 * @param {string[]}[opts.allServiceTypes]   — all service reasons available on the landing page
 *                                             When set, generates TC-LAND-SVC tests verifying each
 *                                             service navigates to findappointment and shows
 *                                             providers OR the "no online availability" message
 */
export function runLandingCases(test, expect, opts = {}) {
    const {
        reason,
        hasGating      = true,
        locationName   = null,
        anyUrl         = null,
        phoneNumber    = null,
        allServiceTypes = [],
    } = opts;

    test.describe('Landing page', () => {

        // ── 1. VISIBILITY ─────────────────────────────────────────────────────

        test.describe('Visibility', () => {

            test('TC-LAND-01 — reason dropdown is visible on page load', async ({ landingPage }) => {
                // Works for both MUI Autocomplete (input) and MUI Select (div trigger)
                const autocomplete = landingPage.reasonAutocomplete;
                const select       = landingPage.reasonSelect;
                const hasAuto = await autocomplete.isVisible({ timeout: 5_000 }).catch(() => false);
                const hasSel  = await select.isVisible({ timeout: 5_000 }).catch(() => false);
                expect(hasAuto || hasSel).toBe(true);
            });

            test('TC-LAND-02 — New Patient and Existing Patient buttons are visible', async ({ landingPage }) => {
                await expect(landingPage.newPatientBtn).toBeVisible({ timeout: 10_000 });
                await expect(landingPage.existingPatientBtn).toBeVisible({ timeout: 10_000 });
            });

        });

        // ── 2. REASON SELECTION ───────────────────────────────────────────────

        test.describe('Reason selection', () => {

            test('TC-LAND-03 — selecting a reason enables the New Patient button', async ({ landingPage }) => {
                test.slow();
                await landingPage._selectReason(reason);
                await expect(landingPage.newPatientBtn).toBeEnabled({ timeout: 15_000 });
            });

            if (hasGating) {
                test('TC-LAND-04 — New Patient button is visible before reason selection', async ({ landingPage }) => {
                    // Button exists on load — some clients disable it until reason is chosen
                    await expect(landingPage.newPatientBtn).toBeVisible({ timeout: 10_000 });
                });
            }

            test('TC-LAND-05 — Existing Patient button is enabled after reason selection', async ({ landingPage }) => {
                await landingPage._selectReason(reason);
                await expect(landingPage.existingPatientBtn).toBeEnabled({ timeout: 5_000 });
            });

        });

        // ── 3. NAVIGATION ─────────────────────────────────────────────────────

        test.describe('Navigation', () => {

            test('TC-LAND-06 — clicking New Patient after selecting reason navigates away from landing', async ({ landingPage }) => {
                const urlBefore = landingPage.page.url();
                await landingPage._selectReason(reason);
                await landingPage.newPatientBtn.click();
                // Allow time for navigation and any post-click popup to appear
                await landingPage.page.waitForTimeout(2_000);
                // URL must have changed OR a popup appeared (we're no longer on the bare landing)
                const urlAfter = landingPage.page.url();
                const popupVisible = await landingPage.page
                    .locator('[role="dialog"]').isVisible({ timeout: 1_000 }).catch(() => false);
                expect(urlAfter !== urlBefore || popupVisible).toBe(true);
            });

        });

        // ── 4. NEGATIVE ───────────────────────────────────────────────────────

        test.describe('Negative', () => {

            test('TC-LAND-07 — reason dropdown search returns results for the configured reason', async ({ landingPage }) => {
                const hasAuto = await landingPage.reasonAutocomplete
                    .isVisible({ timeout: 3_000 }).catch(() => false);

                if (!hasAuto) return; // MUI Select clients: skip text-search check

                await landingPage.reasonAutocomplete.click();
                await landingPage.reasonAutocomplete.fill(reason.substring(0, 3));
                await expect(
                    landingPage.page.locator('[role="option"]').first()
                ).toBeVisible({ timeout: 10_000 });
                await landingPage.page.keyboard.press('Escape');
            });

            test('TC-LAND-08 — invalid search text shows no matching options', async ({ landingPage }) => {
                const hasAuto = await landingPage.reasonAutocomplete
                    .isVisible({ timeout: 3_000 }).catch(() => false);

                if (!hasAuto) return; // MUI Select clients: skip text-search check

                await landingPage.reasonAutocomplete.click();
                await landingPage.reasonAutocomplete.fill('zzzzinvalidreason9999');
                await expect(
                    landingPage.page.locator('[role="option"]')
                ).toHaveCount(0, { timeout: 5_000 });
                await landingPage.page.keyboard.press('Escape');
            });

        });

        // ── 5. ALL SERVICE TYPES — end-to-end from landing ───────────────────
        // For clients with multiple service options, each service is selected on the
        // landing page → New Patient clicked → findappointment page verified.
        // Tests that each service navigates correctly and shows either providers
        // OR the "no online availability" message.

        if (allServiceTypes.length > 1) {
            test.describe('Service type navigation from landing', () => {

                allServiceTypes.forEach(service => {
                    test(`TC-LAND-SVC — selecting "${service}" and clicking New Patient reaches find appointment`, async ({ landingPage }) => {
                        // Select the service reason on landing page
                        await landingPage._selectReason(service);
                        await landingPage.newPatientBtn.waitFor({ state: 'visible', timeout: 10_000 });
                        await landingPage.newPatientBtn.click();

                        // Wait for findappointment URL
                        await landingPage.page.waitForURL(
                            url => url.toString().includes('findappointment'),
                            { timeout: 20_000 }
                        );

                        // Wait for providers OR no-availability to appear.
                        // "Basic Search" resolves too early (appears before data loads).
                        // Must wait for actual content: "Show More" links or no-availability text.
                        await landingPage.page.waitForFunction(
                            () => document.body.innerText.includes('Show More') ||
                                  /no online availability|no availability|please call/i.test(document.body.innerText) ||
                                  // TNDI-style flat layout: wait for time slot buttons
                                  document.body.innerText.includes('Available Time Slots'),
                            { timeout: 25_000 }
                        ).catch(() => {});

                        // Verify: providers visible OR no-availability message
                        const hasShowMore = await landingPage.page
                            .getByText(/^Show More$/).count() > 0;
                        const hasTimeSlots = await landingPage.page
                            .locator('button').filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i }).count() > 0;
                        const noAvail = /no online availability|no availability|please call/i.test(
                            await landingPage.page.evaluate(() => document.body.innerText)
                        );

                        expect(hasShowMore || hasTimeSlots || noAvail).toBe(true);

                        if (hasShowMore || hasTimeSlots) {
                            console.log(`"${service}": providers/slots visible on findappointment ✓`);
                        } else {
                            console.log(`"${service}": no-availability message shown ✓`);
                        }
                    });
                });

            });
        }

        // ── 6. HEADER PHONE NUMBER ────────────────────────────────────────────
        // Every client shows a phone number in the page header (top-right corner).
        // Confirms the correct client config is loaded.

        if (phoneNumber) {
            test('TC-LAND-12 — header phone number is visible and correct', async ({ landingPage }) => {
                await expect(
                    landingPage.page.getByText(phoneNumber, { exact: false }).first()
                ).toBeVisible({ timeout: 10_000 });
            });
        }

        // ── 7. LOCATION INFO PANEL (URL-based) ───────────────────────────────
        // Confirmed for Clarus and SINY:
        //   Slug URL  (e.g. /minnetonka/landing): left info panel visible with clinic name
        //   /any/ URL (e.g. /any/landing)       : no info panel — just the form

        if (locationName && anyUrl) {
            test.describe('Location info panel', () => {

                test('TC-LAND-09 — slug URL shows the location info panel with clinic name', async ({ landingPage }) => {
                    const infoPanel = landingPage.page.getByText(locationName, { exact: false }).first();
                    await expect(infoPanel).toBeVisible({ timeout: 10_000 });
                });

                test('TC-LAND-10 — /any/ URL hides the location info panel', async ({ landingPage }) => {
                    await landingPage.page.goto(anyUrl, { waitUntil: 'networkidle' });
                    const infoPanel = landingPage.page.getByText(locationName, { exact: false }).first();
                    await expect(infoPanel).not.toBeVisible({ timeout: 5_000 });
                });

                test('TC-LAND-11 — /any/ URL still shows the reason form and patient buttons', async ({ landingPage }) => {
                    await landingPage.page.goto(anyUrl, { waitUntil: 'networkidle' });
                    await expect(landingPage.newPatientBtn).toBeVisible({ timeout: 10_000 });
                    await expect(landingPage.existingPatientBtn).toBeVisible({ timeout: 10_000 });
                });

            });
        }

    });
}
