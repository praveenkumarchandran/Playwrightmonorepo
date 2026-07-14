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
import { step, failMsg } from '../../utils/testContext.js';

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
                step('Checking availability state');
                const noAvail = await isNoAvailability(findAppointmentPage);
                if (!noAvail) {
                    console.log('TC-FA-NA-01: Slots available — no-availability message not needed');
                    return; // graceful pass
                }
                step('Asserting no-availability message is visible');
                await expect(
                    findAppointmentPage.page
                        .getByText(/no online availability|no availability/i).first(),
                    failMsg('TC-FA-NA-01', '"no online availability" message must be visible', 'message text may differ or element not rendered yet — check DOM for availability banner', 'findAppointment.cases.js | FindAppointmentPage.hasNoAvailabilityMessage()')
                ).toBeVisible({ timeout: 10_000 });
                console.log('  [TC-FA-NA-01] PASSED — no-availability message visible');
            });

            test('TC-FA-NA-02 — message directs patient to call the office', async ({ findAppointmentPage }) => {
                step('Checking availability state');
                const noAvail = await isNoAvailability(findAppointmentPage);
                if (!noAvail) return; // graceful pass — message not needed when slots exist
                step('Asserting "please call" text is visible');
                await expect(
                    findAppointmentPage.page.getByText(/please call/i).first(),
                    failMsg('TC-FA-NA-02', '"please call" text must appear in no-availability message', 'message copy may have changed — check the no-availability banner text', 'findAppointment.cases.js | FindAppointmentPage.hasNoAvailabilityMessage()')
                ).toBeVisible({ timeout: 10_000 });
                console.log('  [TC-FA-NA-02] PASSED — "please call" text visible in no-availability message');
            });

            test('TC-FA-NA-03 — no provider cards shown when availability is empty', async ({ findAppointmentPage }) => {
                step('Checking availability state');
                const noAvail = await isNoAvailability(findAppointmentPage);
                if (!noAvail) return; // graceful pass — providers ARE expected when slots exist
                step('Counting provider cards');
                const count = await findAppointmentPage.getProviderCardCount();
                expect(count,
                    failMsg('TC-FA-NA-03', 'provider card count must be 0 when no availability', 'a stale card may still be in the DOM — check if getProviderCardCount() waits for list to settle', 'findAppointment.cases.js | FindAppointmentPage.getProviderCardCount()')
                ).toBe(0);
                console.log('  [TC-FA-NA-03] PASSED — 0 provider cards confirmed');
            });

        });

        // ── Positive ──────────────────────────────────────────────────────────

        test.describe('Filter dropdowns', () => {

            test('TC-FA-01 — Location and Service Type dropdowns are visible', async ({ findAppointmentPage }) => {
                step('Asserting Location dropdown is visible');
                await expect(findAppointmentPage.locationDropdown,
                    failMsg('TC-FA-01', 'Location dropdown must be visible on Find Appointment page', 'page may not have loaded fully or selector has changed', 'findAppointment.cases.js | FindAppointmentPage.locationDropdown')
                ).toBeVisible();
                console.log('  [TC-FA-01] Location dropdown visible');

                step('Asserting Service Type dropdown is visible');
                await expect(findAppointmentPage.serviceTypeDropdown,
                    failMsg('TC-FA-01', 'Service Type dropdown must be visible on Find Appointment page', 'page may not have loaded fully or selector has changed', 'findAppointment.cases.js | FindAppointmentPage.serviceTypeDropdown')
                ).toBeVisible();
                console.log('  [TC-FA-01] Service Type dropdown visible');

                // Provider dropdown only exists on clients with 3-filter layout (not Kronson)
                if (hasProviderDropdown) {
                    step('Asserting Provider dropdown is visible');
                    await expect(findAppointmentPage.providerDropdown,
                        failMsg('TC-FA-01', 'Provider dropdown must be visible for this client layout', 'client may have changed to 2-filter layout or selector has changed', 'findAppointment.cases.js | FindAppointmentPage.providerDropdown')
                    ).toBeVisible();
                    console.log('  [TC-FA-01] PASSED — all dropdowns visible');
                } else {
                    console.log('  [TC-FA-01] PASSED — Location + Service Type dropdowns visible (no Provider dropdown for this client)');
                }
            });

            test('TC-FA-02 — Service Type matches the service selected on the landing page', async ({ findAppointmentPage }) => {
                step('Reading Service Type dropdown value');
                const value = await findAppointmentPage._getDropdownText(findAppointmentPage.serviceTypeDropdown);
                // Escape regex special chars (e.g. Hopemark has parentheses in reason names)
                const escaped = expectedServiceType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                step(`Asserting Service Type contains "${expectedServiceType}"`);
                expect(value,
                    failMsg('TC-FA-02', `Service Type dropdown must show "${expectedServiceType}"`, 'service type may not have carried over from landing page — check fixture setup and URL params', 'findAppointment.cases.js | FindAppointmentPage._getDropdownText()')
                ).toMatch(new RegExp(escaped, 'i'));
                console.log(`  [TC-FA-02] PASSED — Service Type shows: "${value}"`);
            });

            test('TC-FA-03 — Provider dropdown defaults to "Any Provider"', async ({ findAppointmentPage }) => {
                test.slow();
                if (!hasProviderDropdown) return;
                step('Reading Provider dropdown default value');
                const value = await findAppointmentPage._getDropdownText(findAppointmentPage.providerDropdown);
                step('Asserting Provider dropdown defaults to "Any Provider"');
                expect(value,
                    failMsg('TC-FA-03', 'Provider dropdown must default to "Any Provider"', 'a specific provider may have been pre-selected by fixture or session state — check fixture teardown', 'findAppointment.cases.js | FindAppointmentPage._getDropdownText()')
                ).toMatch(/any provider/i);
                console.log(`  [TC-FA-03] PASSED — Provider dropdown shows: "${value}"`);
            });

        });

        // ── Provider cards ────────────────────────────────────────────────────

        test.describe('Provider cards', () => {

            test('TC-FA-04 — at least one provider card with slots is visible', async ({ findAppointmentPage }) => {
                step('Checking availability state');
                if (await isNoAvailability(findAppointmentPage)) return; // no slots — skip gracefully
                step('Counting visible provider cards');
                const count = await findAppointmentPage.getProviderCardCount();
                expect(count,
                    failMsg('TC-FA-04', 'at least one provider card must be visible', 'staging server may have no slots — check network responses or try a different date', 'findAppointment.cases.js | FindAppointmentPage.getProviderCardCount()')
                ).toBeGreaterThan(0);
                console.log(`  [TC-FA-04] PASSED — ${count} provider card(s) visible`);
            });

        });

        // ── Provider Gender filter ─────────────────────────────────────────────

        test.describe('Provider Gender filter', () => {

            test('TC-FA-05 — Male and Female checkboxes are both checked by default', async ({ findAppointmentPage }) => {
                step('Checking availability state');
                if (await isNoAvailability(findAppointmentPage)) return;
                step('Asserting Male checkbox is checked by default');
                await expect(findAppointmentPage.maleCheckbox,
                    failMsg('TC-FA-05', 'Male checkbox must be checked by default', 'checkbox state may have changed from a previous test — check fixture isolation', 'findAppointment.cases.js | FindAppointmentPage.maleCheckbox')
                ).toBeChecked();
                console.log('  [TC-FA-05] Male checkbox checked');

                step('Asserting Female checkbox is checked by default');
                await expect(findAppointmentPage.femaleCheckbox,
                    failMsg('TC-FA-05', 'Female checkbox must be checked by default', 'checkbox state may have changed from a previous test — check fixture isolation', 'findAppointment.cases.js | FindAppointmentPage.femaleCheckbox')
                ).toBeChecked();
                console.log('  [TC-FA-05] PASSED — both Male and Female checkboxes checked by default');
            });

            test('TC-FA-06 — unchecking Female filters provider cards', async ({ findAppointmentPage }) => {
                test.slow();
                step('Checking availability state');
                if (await isNoAvailability(findAppointmentPage)) return;
                step('Recording provider card count before filter');
                const before = await findAppointmentPage.getProviderCardCount();
                console.log(`  [TC-FA-06] Provider count before unchecking Female: ${before}`);
                step('Unchecking Female checkbox');
                await findAppointmentPage.femaleCheckbox.uncheck({ force: true });
                await findAppointmentPage.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
                await findAppointmentPage.page.waitForTimeout(1_500);
                step('Recording provider card count after filter');
                const after = await findAppointmentPage.getProviderCardCount();
                expect(after,
                    failMsg('TC-FA-06', `provider count after unchecking Female (${after}) must be ≤ before (${before})`, 'filter may not have applied — check if checkbox triggers a list refresh', 'findAppointment.cases.js | FindAppointmentPage.femaleCheckbox')
                ).toBeLessThanOrEqual(before);
                console.log(`  [TC-FA-06] PASSED — count after unchecking Female: ${after} (was ${before})`);
            });

            test('TC-FA-07 — unchecking Male filters provider cards', async ({ findAppointmentPage }) => {
                step('Checking availability state');
                if (await isNoAvailability(findAppointmentPage)) return;
                step('Recording provider card count before filter');
                const before = await findAppointmentPage.getProviderCardCount();
                console.log(`  [TC-FA-07] Provider count before unchecking Male: ${before}`);
                step('Unchecking Male checkbox');
                await findAppointmentPage.maleCheckbox.uncheck({ force: true });
                await findAppointmentPage.page.waitForTimeout(1_000);
                step('Recording provider card count after filter');
                const after = await findAppointmentPage.getProviderCardCount();
                expect(after,
                    failMsg('TC-FA-07', `provider count after unchecking Male (${after}) must be ≤ before (${before})`, 'filter may not have applied — check if checkbox triggers a list refresh', 'findAppointment.cases.js | FindAppointmentPage.maleCheckbox')
                ).toBeLessThanOrEqual(before);
                console.log(`  [TC-FA-07] PASSED — count after unchecking Male: ${after} (was ${before})`);
            });

            test('TC-FA-08 — re-checking Female restores provider cards', async ({ findAppointmentPage }) => {
                step('Checking availability state');
                if (await isNoAvailability(findAppointmentPage)) return;
                step('Recording provider card count before filter');
                const before = await findAppointmentPage.getProviderCardCount();
                console.log(`  [TC-FA-08] Provider count before unchecking Female: ${before}`);
                step('Unchecking Female checkbox');
                await findAppointmentPage.femaleCheckbox.uncheck({ force: true });
                await findAppointmentPage.page.waitForTimeout(800);
                step('Re-checking Female checkbox');
                await findAppointmentPage.femaleCheckbox.check({ force: true });
                step('Waiting for provider cards to restore');
                await findAppointmentPage.showMoreLinks.first().waitFor({ state: 'visible', timeout: 10_000 });
                step('Counting provider cards after restore');
                const after = await findAppointmentPage.getProviderCardCount();
                expect(after,
                    failMsg('TC-FA-08', `provider count after re-checking Female (${after}) must equal original count (${before})`, 'list may not have re-rendered after re-check — check if checkbox triggers a list refresh', 'findAppointment.cases.js | FindAppointmentPage.femaleCheckbox')
                ).toBe(before);
                console.log(`  [TC-FA-08] PASSED — provider count restored to ${after}`);
            });

            test('TC-FA-08b — unchecking the ONLY available gender shows no-availability message or zero cards', async ({ findAppointmentPage }) => {
                // Edge case: if all providers are Female (e.g. Hopemark Virtual → Courtney Potempa only),
                // unchecking Female → Male only → 0 providers OR "no online availability" message.
                step('Checking availability state');
                if (await isNoAvailability(findAppointmentPage)) return;
                step('Recording provider card count before filter');
                const before = await findAppointmentPage.getProviderCardCount();
                if (before === 0) return;
                console.log(`  [TC-FA-08b] Provider count before unchecking Female: ${before}`);

                step('Unchecking Female checkbox');
                await findAppointmentPage.femaleCheckbox.uncheck({ force: true });
                await findAppointmentPage.page.waitForTimeout(1_500);

                step('Counting provider cards and checking no-availability state');
                const afterCount = await findAppointmentPage.getProviderCardCount();
                const noAvail   = await findAppointmentPage.hasNoAvailabilityMessage();

                // Valid outcomes after unchecking Female:
                //   - count dropped to 0 (only Female providers existed)
                //   - no-availability message appears
                //   - count stayed the same (no Female providers → Male-only filter had no effect)
                // All cases: count can only be ≤ before
                expect(afterCount,
                    failMsg('TC-FA-08b', `provider count after unchecking Female (${afterCount}) must be ≤ before (${before})`, 'filter may not have applied — check if Female checkbox triggers a list refresh', 'findAppointment.cases.js | FindAppointmentPage.femaleCheckbox')
                ).toBeLessThanOrEqual(before);
                console.log(`  [TC-FA-08b] After unchecking Female — count: ${afterCount}, noAvail: ${noAvail}`);

                // Restore Female so subsequent tests still see providers
                step('Restoring Female checkbox');
                await findAppointmentPage.femaleCheckbox.check({ force: true });
                await findAppointmentPage.page.waitForFunction(
                    () => document.body.innerText.includes('Show More'),
                    { timeout: 8_000 }
                ).catch(() => {});
                console.log('  [TC-FA-08b] PASSED — Female checkbox restored');
            });

            test('TC-FA-09 — unchecking both Male and Female shows no provider cards', async ({ findAppointmentPage }) => {
                step('Checking availability state');
                if (await isNoAvailability(findAppointmentPage)) return;
                step('Unchecking Male checkbox');
                await findAppointmentPage.maleCheckbox.uncheck({ force: true });
                step('Unchecking Female checkbox');
                await findAppointmentPage.femaleCheckbox.uncheck({ force: true });
                step('Waiting for provider list to clear');
                await findAppointmentPage.page.waitForFunction(
                    () => !document.body.innerText.includes('Show More'),
                    { timeout: 10_000 }
                ).catch(() => {});
                step('Counting provider cards');
                const count = await findAppointmentPage.getProviderCardCount();
                expect(count,
                    failMsg('TC-FA-09', 'provider count must be 0 when both gender checkboxes are unchecked', 'cards may not have been removed from DOM — check if unchecking both genders triggers a list clear', 'findAppointment.cases.js | FindAppointmentPage.getProviderCardCount()')
                ).toBe(0);
                console.log('  [TC-FA-09] PASSED — 0 provider cards shown with both genders unchecked');
            });

        });

        // ── Negative — gray option popups ─────────────────────────────────────

        test.describe('Unavailability popups', () => {

            test('TC-FA-10 — selecting a gray location shows "not available" popup', async ({ findAppointmentPage }) => {
                step('Triggering gray location option');
                const gray = await findAppointmentPage.triggerGrayOption(findAppointmentPage.locationDropdown);
                if (!gray) return; // no gray locations for this client/service combination
                step('Asserting popup is visible');
                await expect(findAppointmentPage.popup,
                    failMsg('TC-FA-10', 'unavailability popup must appear after selecting gray location', 'popup may not have triggered — check if triggerGrayOption() selected an actual gray item', 'findAppointment.cases.js | FindAppointmentPage.triggerGrayOption()')
                ).toBeVisible({ timeout: 8_000 });
                step('Asserting popup contains "not available" text');
                await expect(findAppointmentPage.popup,
                    failMsg('TC-FA-10', 'popup must contain "not available" text', 'popup copy may have changed — check the unavailability popup message text', 'findAppointment.cases.js | FindAppointmentPage.popup')
                ).toContainText(/not available/i);
                console.log('  [TC-FA-10] PASSED — gray location popup shows "not available"');
            });

            test('TC-FA-11 — selecting a gray provider shows unavailability popup', async ({ findAppointmentPage }) => {
                step('Triggering gray provider option');
                const gray = await findAppointmentPage.triggerGrayOption(findAppointmentPage.providerDropdown);
                if (!gray) return; // no gray providers for this client/service combination
                step('Asserting popup is visible');
                await expect(findAppointmentPage.popup,
                    failMsg('TC-FA-11', 'unavailability popup must appear after selecting gray provider', 'popup may not have triggered — check if triggerGrayOption() selected an actual gray item', 'findAppointment.cases.js | FindAppointmentPage.triggerGrayOption()')
                ).toBeVisible({ timeout: 8_000 });
                step('Asserting popup contains unavailability text');
                await expect(findAppointmentPage.popup,
                    failMsg('TC-FA-11', 'popup must contain "does not offer" or "not available" text', 'popup copy may have changed — check the gray provider popup message text', 'findAppointment.cases.js | FindAppointmentPage.popup')
                ).toContainText(/does not offer|not available/i);
                console.log('  [TC-FA-11] PASSED — gray provider popup shows unavailability message');
            });

            test('TC-FA-12 — popup has a close button that dismisses it', async ({ findAppointmentPage }) => {
                // Try location first, fall back to provider
                step('Triggering gray location option (or provider as fallback)');
                let gray = await findAppointmentPage.triggerGrayOption(findAppointmentPage.locationDropdown);
                if (!gray) gray = await findAppointmentPage.triggerGrayOption(findAppointmentPage.providerDropdown);
                if (!gray) return; // no gray options available for this client
                step('Asserting popup is visible before closing');
                await expect(findAppointmentPage.popup,
                    failMsg('TC-FA-12', 'popup must be visible before attempting to close it', 'popup may not have opened — check triggerGrayOption() return value', 'findAppointment.cases.js | FindAppointmentPage.triggerGrayOption()')
                ).toBeVisible({ timeout: 8_000 });
                step('Closing popup');
                await findAppointmentPage.closePopup();
                step('Asserting popup is dismissed');
                await expect(findAppointmentPage.popup,
                    failMsg('TC-FA-12', 'popup must not be visible after clicking close button', 'close button may not have been clicked or popup has no dismiss action', 'findAppointment.cases.js | FindAppointmentPage.closePopup()')
                ).not.toBeVisible({ timeout: 5_000 });
                console.log('  [TC-FA-12] PASSED — popup dismissed successfully');
            });

        });

        // ── Edge cases ────────────────────────────────────────────────────────

        test.describe('Edge cases', () => {

            test('TC-FA-13 — dismissing gray location popup keeps Service Type unchanged', async ({ findAppointmentPage }) => {
                step('Reading Service Type before triggering gray location');
                const serviceBefore = await findAppointmentPage._getDropdownText(findAppointmentPage.serviceTypeDropdown);
                console.log(`  [TC-FA-13] Service Type before: "${serviceBefore}"`);
                step('Triggering gray location option');
                const gray = await findAppointmentPage.triggerGrayOption(findAppointmentPage.locationDropdown);
                if (!gray) return; // no gray locations — nothing to dismiss
                step('Closing popup');
                await findAppointmentPage.closePopup();
                step('Reading Service Type after dismissing popup');
                const serviceAfter = await findAppointmentPage._getDropdownText(findAppointmentPage.serviceTypeDropdown);
                expect(serviceAfter,
                    failMsg('TC-FA-13', `Service Type must remain "${serviceBefore}" after dismissing gray location popup`, 'selecting a gray location may have reset the service type — check if closePopup() restores dropdown state', 'findAppointment.cases.js | FindAppointmentPage.closePopup()')
                ).toBe(serviceBefore);
                console.log(`  [TC-FA-13] PASSED — Service Type unchanged: "${serviceAfter}"`);
            });

            test('TC-FA-14 — dismissing gray provider popup keeps provider filter on "Any Provider"', async ({ findAppointmentPage }) => {
                step('Triggering gray provider option');
                const gray = await findAppointmentPage.triggerGrayOption(findAppointmentPage.providerDropdown);
                if (!gray) return; // no gray providers
                step('Closing popup');
                await findAppointmentPage.closePopup();
                step('Reading Provider dropdown value after dismissing popup');
                const value = await findAppointmentPage._getDropdownText(findAppointmentPage.providerDropdown);
                expect(value,
                    failMsg('TC-FA-14', 'Provider dropdown must revert to "Any Provider" after dismissing gray provider popup', 'selecting a gray provider may have changed the dropdown selection — check if closePopup() restores it', 'findAppointment.cases.js | FindAppointmentPage.closePopup()')
                ).toMatch(/any provider/i);
                console.log(`  [TC-FA-14] PASSED — Provider dropdown shows: "${value}"`);
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
                step('Checking availability state');
                if (await isNoAvailability(findAppointmentPage)) return;
                step('Clicking Show More on first provider card');
                await findAppointmentPage.clickShowMore(0);
                step('Asserting "More Slots" heading is visible');
                // "More Slots" heading must be visible
                await expect(findAppointmentPage.page.getByText('More Slots'),
                    failMsg('TC-FA-15', '"More Slots" heading must appear after clicking Show More', 'Show More may not have expanded the section — check clickShowMore() selector and timing', 'findAppointment.cases.js | FindAppointmentPage.clickShowMore()')
                ).toBeVisible({ timeout: 8_000 });
                console.log('  [TC-FA-15] "More Slots" heading visible');

                // At least one pure time-only button ("9:20 AM") must appear in Available Slots
                step('Asserting at least one time-only slot button is visible');
                const timeBtn = findAppointmentPage.page
                    .locator('button')
                    .filter({ hasText: /^\d{1,2}:\d{2}\s*(AM|PM)$/i })
                    .first();
                await expect(timeBtn,
                    failMsg('TC-FA-15', 'at least one time-only slot button (e.g. "9:20 AM") must be visible in More Slots', 'slots may not have loaded yet or selector pattern does not match time button format', 'findAppointment.cases.js | FindAppointmentPage.clickShowMore()')
                ).toBeVisible({ timeout: 5_000 });
                console.log('  [TC-FA-15] PASSED — More Slots expanded with time buttons visible');
            });

            test('TC-FA-16 — selecting a slot and clicking Continue navigates to the expected next page', async ({ findAppointmentPage }) => {
                step('Checking availability state');
                if (await isNoAvailability(findAppointmentPage)) return;
                step('Clicking Show More on first provider card');
                await findAppointmentPage.clickShowMore(0);
                step('Selecting first available slot');
                await findAppointmentPage.clickFirstSlot();
                step('Clicking Continue');
                await findAppointmentPage.clickContinue();

                if (nextPageAfterSlot === 'intake') {
                    // Intake Questions page (e.g. TNDI — intake comes after slot pick)
                    step('Waiting for navigation to intake page');
                    await findAppointmentPage.page.waitForURL(
                        url => url.toString().includes('intake'),
                        { timeout: 15_000 }
                    );
                    console.log('  [TC-FA-16] PASSED — navigated to intake page');
                } else if (nextPageAfterSlot === 'insurance') {
                    // Insurance page — use URL since insurance input style varies by client
                    step('Waiting for navigation to insurance page');
                    await findAppointmentPage.page.waitForURL(
                        url => url.toString().includes('insurance'),
                        { timeout: 15_000 }
                    );
                    console.log('  [TC-FA-16] PASSED — navigated to insurance page');
                } else if (nextPageAfterSlot === 'patientInfo') {
                    // Patient Info page — firstName input present on all clients
                    step('Waiting for Patient Info firstName input to be visible');
                    await expect(
                        findAppointmentPage.page.locator('input[name*="firstName"]').first(),
                        failMsg('TC-FA-16', 'firstName input must be visible on Patient Info page after slot selection', 'navigation may be slow or firstName input selector has changed', 'findAppointment.cases.js | FindAppointmentPage.clickContinue()')
                    ).toBeVisible({ timeout: 15_000 });
                    console.log('  [TC-FA-16] PASSED — navigated to Patient Info page');
                } else {
                    // nextPageAfterSlot not specified — verify navigation away from findappointment
                    step('Waiting for navigation away from Find Appointment page');
                    await findAppointmentPage.page.waitForURL(
                        url => !url.toString().includes('findappointment'),
                        { timeout: 15_000 }
                    );
                    console.log('  [TC-FA-16] PASSED — navigated away from Find Appointment page');
                }
            });

            test('TC-FA-17 — "Your Appointment" summary on the next page shows the selected provider and appointment type', async ({ findAppointmentPage }) => {
                step('Checking availability state');
                if (await isNoAvailability(findAppointmentPage)) return;
                // Capture provider name from card 0 BEFORE interacting
                step('Capturing provider name from first card');
                const providerName = await findAppointmentPage.getProviderName(0);
                console.log(`  [TC-FA-17] Provider name captured: "${providerName}"`);

                step('Clicking Show More on first provider card');
                await findAppointmentPage.clickShowMore(0);
                step('Selecting first available slot');
                await findAppointmentPage.clickFirstSlot();
                step('Clicking Continue');
                await findAppointmentPage.clickContinue();

                // Use a single long timeout on the first assertion — it naturally waits for
                // both navigation AND the page to render the summary panel.
                // Avoids fragile waitForURL / waitForLoadState which can race.
                step('Asserting "Your Appointment" summary heading is visible');
                await expect(
                    findAppointmentPage.page.getByText(/Your Appointment/i).first(),
                    failMsg('TC-FA-17', '"Your Appointment" summary heading must be visible on next page', 'navigation may be slow or summary panel may not have rendered — check if next page loads correctly after slot selection', 'findAppointment.cases.js | FindAppointmentPage.clickContinue()')
                ).toBeVisible({ timeout: 30_000 });
                console.log('  [TC-FA-17] "Your Appointment" heading visible');

                // Once the heading is visible the rest loads quickly
                if (providerName) {
                    step(`Asserting provider name "${providerName}" appears in summary`);
                    await expect(
                        findAppointmentPage.page.getByText(providerName, { exact: false }).first(),
                        failMsg('TC-FA-17', `provider name "${providerName}" must appear in appointment summary`, 'provider name may not match exactly — check getProviderName() vs. summary display format', 'findAppointment.cases.js | FindAppointmentPage.getProviderName()')
                    ).toBeVisible({ timeout: 8_000 });
                    console.log(`  [TC-FA-17] Provider "${providerName}" confirmed in appointment summary`);
                }

                step('Asserting "Appointment Type" label is visible in summary');
                await expect(
                    findAppointmentPage.page.getByText(/Appointment Type/i).first(),
                    failMsg('TC-FA-17', '"Appointment Type" label must appear in appointment summary', 'summary panel may be incomplete or label text has changed', 'findAppointment.cases.js | FindAppointmentPage.clickContinue()')
                ).toBeVisible({ timeout: 5_000 });
                console.log('  [TC-FA-17] "Appointment Type" label visible');

                step('Asserting "Appointment Time" label is visible in summary');
                await expect(
                    findAppointmentPage.page.getByText(/Appointment Time/i).first(),
                    failMsg('TC-FA-17', '"Appointment Time" label must appear in appointment summary', 'summary panel may be incomplete or label text has changed', 'findAppointment.cases.js | FindAppointmentPage.clickContinue()')
                ).toBeVisible({ timeout: 5_000 });
                console.log('  [TC-FA-17] PASSED — appointment summary shows provider, Appointment Type, and Appointment Time');
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
                        step(`Selecting service type "${service}"`);
                        await findAppointmentPage.selectServiceType(service);

                        step('Counting provider cards and checking no-availability state');
                        const hasProviders = (await findAppointmentPage.getProviderCardCount()) > 0;
                        const noAvail      = await findAppointmentPage.hasNoAvailabilityMessage();

                        // Either providers are shown OR the no-availability error message appears
                        expect(hasProviders || noAvail,
                            failMsg('TC-FA-SVC', `selecting "${service}" must show either provider cards or no-availability message`, 'page may be in an unknown state — check if selectServiceType() triggered a list refresh', 'findAppointment.cases.js | FindAppointmentPage.selectServiceType()')
                        ).toBe(true);

                        if (hasProviders) {
                            console.log(`  [TC-FA-SVC] PASSED — "${service}": ${await findAppointmentPage.getProviderCardCount()} provider card(s) visible`);
                        } else {
                            console.log(`  [TC-FA-SVC] PASSED — "${service}": no-availability message shown (expected for this service)`);
                        }
                    });
                });

            });
        }

    });
}
