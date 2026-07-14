import { step, failMsg } from '../../utils/testContext.js';

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
                test.slow();

                step('Checking for either an MUI Autocomplete or MUI Select reason field on the landing page');
                const autocomplete = landingPage.reasonAutocomplete;
                const select       = landingPage.reasonSelect;
                const hasAuto = await autocomplete.isVisible({ timeout: 10_000 }).catch(() => false);
                const hasSel  = await select.isVisible({ timeout: 10_000 }).catch(() => false);

                step('Verifying that at least one reason input variant is visible');
                expect(hasAuto || hasSel,
                    failMsg('TC-LAND-01',
                        'At least one reason input (Autocomplete or Select) must be visible on the landing page.',
                        'Neither reasonAutocomplete nor reasonSelect is visible. The landing page may have failed to load, the client config may point to the wrong URL, or both locators in LandingPage.js are stale after a recent UI change.',
                        'landing.cases.js | LandingPage.reasonAutocomplete / LandingPage.reasonSelect'
                    )
                ).toBe(true);
            });

            test('TC-LAND-02 — New Patient and Existing Patient buttons are visible', async ({ landingPage }) => {
                step('Checking that the New Patient button is rendered on the landing page');
                await expect(landingPage.newPatientBtn,
                    failMsg('TC-LAND-02',
                        'New Patient button must be visible on the landing page.',
                        'The newPatientBtn locator in LandingPage.js may be stale (text or role changed), or the landing page did not finish loading. Check the button text and the locator definition.',
                        'landing.cases.js | LandingPage.newPatientBtn — visibility'
                    )
                ).toBeVisible({ timeout: 10_000 });

                step('Checking that the Existing Patient button is rendered on the landing page');
                await expect(landingPage.existingPatientBtn,
                    failMsg('TC-LAND-02',
                        'Existing Patient button must be visible on the landing page.',
                        'The existingPatientBtn locator in LandingPage.js may be stale (text or role changed), or the Existing Patient flow was removed for this client. Check the button text and the locator definition.',
                        'landing.cases.js | LandingPage.existingPatientBtn — visibility'
                    )
                ).toBeVisible({ timeout: 10_000 });
            });

        });

        // ── 2. REASON SELECTION ───────────────────────────────────────────────

        test.describe('Reason selection', () => {

            test('TC-LAND-03 — selecting a reason enables the New Patient button', async ({ landingPage }) => {
                test.slow();

                step(`Selecting reason "${reason}" from the landing page reason dropdown`);
                await landingPage._selectReason(reason);

                step('Verifying the New Patient button is enabled after a reason is selected');
                await expect(landingPage.newPatientBtn,
                    failMsg('TC-LAND-03',
                        `New Patient button must be enabled after selecting reason "${reason}".`,
                        '_selectReason() may have failed silently, leaving no reason selected and keeping the button disabled. Check that the reason option text matches exactly, and verify _selectReason() in LandingPage.js handles both Autocomplete and Select variants.',
                        'landing.cases.js | LandingPage._selectReason() → LandingPage.newPatientBtn enabled'
                    )
                ).toBeEnabled({ timeout: 15_000 });
            });

            if (hasGating) {
                test('TC-LAND-04 — New Patient button is visible before reason selection', async ({ landingPage }) => {
                    step('Checking that the New Patient button is visible before any reason is selected');
                    // Button exists on load — some clients disable it until reason is chosen
                    await expect(landingPage.newPatientBtn,
                        failMsg('TC-LAND-04',
                            'New Patient button must be visible on page load before any reason is selected.',
                            'The newPatientBtn locator in LandingPage.js may be stale or the button is conditionally rendered only after a reason is chosen (which would be a regression). Check whether the button is in the DOM on load.',
                            'landing.cases.js | LandingPage.newPatientBtn — visible on initial load'
                        )
                    ).toBeVisible({ timeout: 10_000 });
                });
            }

            test('TC-LAND-05 — Existing Patient button is enabled after reason selection', async ({ landingPage }) => {
                test.slow();

                step(`Selecting reason "${reason}" from the landing page reason dropdown`);
                await landingPage._selectReason(reason);

                step('Verifying the Existing Patient button is enabled after a reason is selected');
                await expect(landingPage.existingPatientBtn,
                    failMsg('TC-LAND-05',
                        `Existing Patient button must be enabled after selecting reason "${reason}".`,
                        '_selectReason() may have failed silently, leaving no reason selected. Check that the reason text matches exactly and verify _selectReason() in LandingPage.js. Also confirm the existingPatientBtn locator is not stale.',
                        'landing.cases.js | LandingPage._selectReason() → LandingPage.existingPatientBtn enabled'
                    )
                ).toBeEnabled({ timeout: 15_000 });
            });

        });

        // ── 3. NAVIGATION ─────────────────────────────────────────────────────

        test.describe('Navigation', () => {

            test('TC-LAND-06 — clicking New Patient after selecting reason navigates away from landing', async ({ landingPage }) => {
                test.slow();

                step('Recording the landing page URL before any interaction');
                const urlBefore = landingPage.page.url();

                step(`Selecting reason "${reason}" from the landing page reason dropdown`);
                await landingPage._selectReason(reason);

                step('Clicking the New Patient button to initiate navigation');
                await landingPage.newPatientBtn.click();

                step('Waiting for URL change or a dialog to confirm navigation started');
                // Wait for navigation OR a popup — whichever comes first
                await Promise.race([
                    landingPage.page.waitForURL(url => url.toString() !== urlBefore, { timeout: 15_000 }),
                    landingPage.page.locator('[role="dialog"]').waitFor({ state: 'visible', timeout: 15_000 }),
                ]).catch(() => {});

                const urlAfter = landingPage.page.url();
                const popupVisible = await landingPage.page
                    .locator('[role="dialog"]').isVisible({ timeout: 2_000 }).catch(() => false);

                step('Verifying the URL changed or a dialog appeared — confirming navigation away from landing');
                expect(urlAfter !== urlBefore || popupVisible,
                    failMsg('TC-LAND-06',
                        'Clicking New Patient after selecting a reason must navigate away from the landing page or open a dialog.',
                        'The New Patient button click may not be triggering navigation. Possible causes: the button was still disabled when clicked, a network error blocked the transition, or _selectReason() did not register. Check LandingPage._selectReason() and the New Patient button handler.',
                        'landing.cases.js | LandingPage.newPatientBtn.click() — URL change or dialog'
                    )
                ).toBe(true);
            });

        });

        // ── 4. NEGATIVE ───────────────────────────────────────────────────────

        test.describe('Negative', () => {

            test('TC-LAND-07 — reason dropdown search returns results for the configured reason', async ({ landingPage }) => {
                step('Checking whether the landing page uses an Autocomplete (text-search) reason input');
                const hasAuto = await landingPage.reasonAutocomplete
                    .isVisible({ timeout: 3_000 }).catch(() => false);

                if (!hasAuto) return; // MUI Select clients: skip text-search check

                step(`Clicking the reason autocomplete and typing the first 3 characters of "${reason}"`);
                await landingPage.reasonAutocomplete.click();
                await landingPage.reasonAutocomplete.fill(reason.substring(0, 3));

                step('Verifying at least one option appears in the autocomplete dropdown');
                await expect(
                    landingPage.page.locator('[role="option"]').first(),
                    failMsg('TC-LAND-07',
                        `Typing the first 3 characters of "${reason}" in the reason autocomplete must produce at least one option.`,
                        'The autocomplete filter may not be performing a substring match, the reason data may not have loaded, or the option role changed. Check the MUI Autocomplete filterOptions and the reason data source in LandingPage.js.',
                        'landing.cases.js | LandingPage.reasonAutocomplete — options visible after typing'
                    )
                ).toBeVisible({ timeout: 10_000 });

                step('Pressing Escape to close the autocomplete dropdown');
                await landingPage.page.keyboard.press('Escape');
            });

            test('TC-LAND-08 — invalid search text shows no matching options', async ({ landingPage }) => {
                step('Checking whether the landing page uses an Autocomplete (text-search) reason input');
                const hasAuto = await landingPage.reasonAutocomplete
                    .isVisible({ timeout: 3_000 }).catch(() => false);

                if (!hasAuto) return; // MUI Select clients: skip text-search check

                step('Clicking the reason autocomplete and typing a nonsense string to expect zero results');
                await landingPage.reasonAutocomplete.click();
                await landingPage.reasonAutocomplete.fill('zzzzinvalidreason9999');

                step('Verifying no options are shown for the nonsense search string');
                await expect(
                    landingPage.page.locator('[role="option"]'),
                    failMsg('TC-LAND-08',
                        'Typing "zzzzinvalidreason9999" in the reason autocomplete must produce zero matching options.',
                        'The autocomplete may be showing a static fallback list instead of filtering, or the "No options" state is not reflected via [role="option"] elements. Check the MUI Autocomplete noOptionsText configuration and the filterOptions implementation.',
                        'landing.cases.js | LandingPage.reasonAutocomplete — zero options for invalid input'
                    )
                ).toHaveCount(0, { timeout: 5_000 });

                step('Pressing Escape to close the autocomplete dropdown');
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
                        step(`Selecting service reason "${service}" from the landing page reason dropdown`);
                        // Select the service reason on landing page
                        await landingPage._selectReason(service);

                        step('Waiting for the New Patient button to be visible after reason selection');
                        await landingPage.newPatientBtn.waitFor({ state: 'visible', timeout: 10_000 });

                        step('Clicking the New Patient button to navigate to the find appointment page');
                        await landingPage.newPatientBtn.click();

                        step('Waiting for the URL to include "findappointment"');
                        // Wait for findappointment URL
                        await landingPage.page.waitForURL(
                            url => url.toString().includes('findappointment'),
                            { timeout: 20_000 }
                        );

                        step('Waiting for provider cards, time slots, or a no-availability message to load');
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

                        step('Checking page content for provider cards, time slots, or no-availability message');
                        // Verify: providers visible OR no-availability message
                        const hasShowMore = await landingPage.page
                            .getByText(/^Show More$/).count() > 0;
                        const hasTimeSlots = await landingPage.page
                            .locator('button').filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i }).count() > 0;
                        const noAvail = /no online availability|no availability|please call/i.test(
                            await landingPage.page.evaluate(() => document.body.innerText)
                        );

                        step('Verifying find appointment page shows providers, time slots, or a no-availability message');
                        expect(hasShowMore || hasTimeSlots || noAvail,
                            failMsg('TC-LAND-SVC',
                                `After selecting "${service}" and clicking New Patient, the find appointment page must show providers, time slots, or a no-availability message.`,
                                `The findappointment page loaded but none of the expected content appeared. Possible causes: provider data fetch failed, the "Show More" / time-slot selectors changed, or the no-availability text wording changed. Check the findappointment page for "${service}" in the browser and compare against the content checks in landing.cases.js.`,
                                `landing.cases.js | TC-LAND-SVC "${service}" — findappointment content check`
                            )
                        ).toBe(true);

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
                step(`Checking that the configured phone number "${phoneNumber}" is visible in the page header`);
                await expect(
                    landingPage.page.getByText(phoneNumber, { exact: false }).first(),
                    failMsg('TC-LAND-12',
                        `Phone number "${phoneNumber}" must be visible in the page header.`,
                        'The displayed phone number does not match the configured value. Either the wrong client config is loaded (check the baseURL / widget config), the header component changed its rendering, or the phoneNumber option passed to runLandingCases() is outdated.',
                        'landing.cases.js | TC-LAND-12 — header phone number text'
                    )
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
                    step(`Checking that the location info panel shows the clinic name "${locationName}" on the slug URL`);
                    const infoPanel = landingPage.page.getByText(locationName, { exact: false }).first();

                    await expect(infoPanel,
                        failMsg('TC-LAND-09',
                            `Location info panel must display "${locationName}" when accessed via the slug URL.`,
                            'The info panel may not be rendering on the slug URL, or the locationName text is not present in the panel. Check that the correct slug URL is loaded in the landingPage fixture and verify the panel component renders clinic name data from the server.',
                            'landing.cases.js | TC-LAND-09 — location info panel on slug URL'
                        )
                    ).toBeVisible({ timeout: 10_000 });
                });

                test('TC-LAND-10 — /any/ URL hides the location info panel', async ({ landingPage }) => {
                    step(`Navigating to the /any/ URL variant: ${anyUrl}`);
                    await landingPage.page.goto(anyUrl, { waitUntil: 'networkidle' });

                    step(`Verifying the location info panel with "${locationName}" is NOT visible on the /any/ URL`);
                    const infoPanel = landingPage.page.getByText(locationName, { exact: false }).first();

                    await expect(infoPanel,
                        failMsg('TC-LAND-10',
                            `Location info panel must NOT be visible on the /any/ URL — it should only appear on slug URLs.`,
                            `The info panel is showing "${locationName}" on the /any/ URL, which means the location-specific panel is not being hidden when no slug is present. Check the conditional rendering logic in the landing page component that decides whether to show the info panel.`,
                            'landing.cases.js | TC-LAND-10 — info panel hidden on /any/ URL'
                        )
                    ).not.toBeVisible({ timeout: 5_000 });
                });

                test('TC-LAND-11 — /any/ URL still shows the reason form and patient buttons', async ({ landingPage }) => {
                    step(`Navigating to the /any/ URL variant: ${anyUrl}`);
                    await landingPage.page.goto(anyUrl, { waitUntil: 'networkidle' });

                    step('Verifying the New Patient button is visible on the /any/ URL');
                    await expect(landingPage.newPatientBtn,
                        failMsg('TC-LAND-11',
                            'New Patient button must be visible on the /any/ URL.',
                            'The landing page form may not be rendering on the /any/ URL, or the newPatientBtn locator is stale. Check that the /any/ route is configured correctly and renders the standard booking form.',
                            'landing.cases.js | TC-LAND-11 — newPatientBtn visible on /any/ URL'
                        )
                    ).toBeVisible({ timeout: 10_000 });

                    step('Verifying the Existing Patient button is visible on the /any/ URL');
                    await expect(landingPage.existingPatientBtn,
                        failMsg('TC-LAND-11',
                            'Existing Patient button must be visible on the /any/ URL.',
                            'The existingPatientBtn locator may be stale, or the Existing Patient flow is not available on the /any/ route. Check the route configuration and the existingPatientBtn locator in LandingPage.js.',
                            'landing.cases.js | TC-LAND-11 — existingPatientBtn visible on /any/ URL'
                        )
                    ).toBeVisible({ timeout: 10_000 });
                });

            });
        }

    });
}
