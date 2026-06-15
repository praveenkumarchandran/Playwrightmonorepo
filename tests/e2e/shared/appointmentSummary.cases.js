/**
 * SHARED APPOINTMENT SUMMARY PANEL TEST CASES
 *
 * The "Your Appointment" panel appears on the left of insurance and patient info pages.
 * It confirms all the values selected earlier carried through correctly:
 *
 *   Your Appointment
 *   Location          → clinic name  (e.g. "The Nerve and Disc Institute Farmington")
 *   Location Address  → address      (e.g. "24100 Drake Rd, MI 48335")
 *   Appointment Time  → time value   (e.g. "3:30 PM, Mon Jun 8, 2026")
 *   Appointment Type  → service type (e.g. "Teleconsultation")
 *
 * Two named exports — Playwright requires static object destructuring per test().
 *   runInsurancePageSummaryCases  → uses insurancePage fixture (clients WITH insurance)
 *   runPatientPageSummaryCases    → uses patientPage fixture   (clients WITHOUT insurance)
 *
 * @param {object} opts
 * @param {string} [opts.expectedAppointmentType]  — service type text (e.g. 'Acne', 'Teleconsultation')
 *                                                   Use serviceType (not reason) for SINY/Clarus —
 *                                                   panel shows the actual service booked
 * @param {string} [opts.expectedLocation]         — clinic/location name (TNDI-style panels)
 * @param {string} [opts.expectedAddress]          — location address (TNDI-style panels)
 * @param {boolean} [opts.hasProviderName=false]   — true when panel shows provider photo + name
 *                                                   (SINY/Clarus) — verifies a non-empty name visible
 */

// ── Insurance page variant ────────────────────────────────────────────────────

export function runInsurancePageSummaryCases(test, expect, opts = {}) {
    const {
        expectedAppointmentType = null,
        expectedLocation        = null,
        expectedAddress         = null,
        hasProviderName         = false,
    } = opts;

    test.describe('Appointment summary panel — insurance page', () => {

        test('TC-APPT-01 — "Your Appointment" heading is visible', async ({ insurancePage }) => {
            await expect(insurancePage.summaryHeading).toBeVisible({ timeout: 10_000 });
        });

        test('TC-APPT-02 — "Appointment Time" label is visible', async ({ insurancePage }) => {
            await expect(insurancePage.summaryApptTime).toBeVisible({ timeout: 10_000 });
        });

        test('TC-APPT-03 — "Appointment Type" label is visible', async ({ insurancePage }) => {
            await expect(insurancePage.summaryApptType).toBeVisible({ timeout: 10_000 });
        });

        test('TC-APPT-04 — Appointment Time value shows a real time (AM/PM)', async ({ insurancePage }) => {
            await expect(insurancePage.summaryApptTime).toBeVisible({ timeout: 10_000 });
            await expect(
                insurancePage.page.getByText(/\d{1,2}:\d{2}\s*(AM|PM)/i).first()
            ).toBeVisible({ timeout: 10_000 });
        });

        if (expectedAppointmentType) {
            test(`TC-APPT-05 — Appointment Type shows "${expectedAppointmentType}"`, async ({ insurancePage }) => {
                await expect(
                    insurancePage.page.getByText(expectedAppointmentType, { exact: false }).first()
                ).toBeVisible({ timeout: 10_000 });
            });
        }

        // Provider name test — for SINY/Clarus style panels that show provider photo + name
        if (hasProviderName) {
            test('TC-APPT-PN-01 — Provider name is visible in the "Your Appointment" panel', async ({ insurancePage }) => {
                // Provider name appears between the photo and "Appointment Time" label.
                // It's a heading element (h1-h6) that is NOT one of the known panel labels.
                const providerName = insurancePage.page
                    .locator('h1, h2, h3, h4, h5, h6, p')
                    .filter({ hasNotText: /^(Your Appointment|Appointment Time|Appointment Type|Location|Location Address|Insurance Policy|Powered by)/ })
                    .filter({ hasText: /^[A-Z]/ })  // starts with capital letter
                    .first();
                await expect(providerName).toBeVisible({ timeout: 10_000 });
                const name = await providerName.textContent();
                expect(name?.trim().length).toBeGreaterThan(2);
                console.log(`Provider name confirmed: "${name?.trim()}"`);
            });
        }

        // Location and Address tests only run when the client shows clinic info in the panel.
        // TNDI-style: shows Location + Location Address (clinic-based panel)
        // SINY/Clarus-style: shows provider photo + name instead (no Location label)

        if (expectedLocation) {
            test('TC-APPT-06 — "Location" label is visible in the summary panel', async ({ insurancePage }) => {
                await expect(
                    insurancePage.page.getByText('Location', { exact: true }).first()
                ).toBeVisible({ timeout: 10_000 });
            });

            test(`TC-APPT-07 — Location value shows "${expectedLocation}"`, async ({ insurancePage }) => {
                await expect(
                    insurancePage.page.getByText(expectedLocation, { exact: false }).first()
                ).toBeVisible({ timeout: 10_000 });
            });
        }

        if (expectedAddress) {
            test('TC-APPT-08 — "Location Address" label is visible in the summary panel', async ({ insurancePage }) => {
                await expect(
                    insurancePage.page.getByText(/Location Address/i).first()
                ).toBeVisible({ timeout: 10_000 });
            });

            test(`TC-APPT-09 — Location Address value shows "${expectedAddress}"`, async ({ insurancePage }) => {
                await expect(
                    insurancePage.page.getByText(expectedAddress, { exact: false }).first()
                ).toBeVisible({ timeout: 10_000 });
            });
        }

    });
}

// ── Patient info page variant ─────────────────────────────────────────────────

export function runPatientPageSummaryCases(test, expect, opts = {}) {
    const {
        expectedAppointmentType = null,
        expectedLocation        = null,
        expectedAddress         = null,
        hasProviderName         = false,
    } = opts;

    test.describe('Appointment summary panel — patient info page', () => {

        test.beforeEach(async ({ patientPage }, testInfo) => {
            if (!patientPage) testInfo.skip(true, 'No slots available — patient info not reachable');
        });

        test('TC-APPT-PI-01 — "Your Appointment" heading is visible', async ({ patientPage }) => {
            await expect(patientPage.summaryHeading).toBeVisible({ timeout: 10_000 });
        });

        test('TC-APPT-PI-02 — "Appointment Time" label is visible', async ({ patientPage }) => {
            await expect(patientPage.summaryApptTime).toBeVisible({ timeout: 10_000 });
        });

        test('TC-APPT-PI-03 — "Appointment Type" label is visible', async ({ patientPage }) => {
            await expect(patientPage.summaryApptType).toBeVisible({ timeout: 10_000 });
        });

        test('TC-APPT-PI-04 — Appointment Time value shows a real time (AM/PM)', async ({ patientPage }) => {
            await expect(patientPage.summaryApptTime).toBeVisible({ timeout: 10_000 });
            await expect(
                patientPage.page.getByText(/\d{1,2}:\d{2}\s*(AM|PM)/i).first()
            ).toBeVisible({ timeout: 10_000 });
        });

        if (expectedAppointmentType) {
            test(`TC-APPT-PI-05 — Appointment Type shows "${expectedAppointmentType}"`, async ({ patientPage }) => {
                await expect(
                    patientPage.page.getByText(expectedAppointmentType, { exact: false }).first()
                ).toBeVisible({ timeout: 10_000 });
            });
        }

        if (hasProviderName) {
            test('TC-APPT-PI-PN-01 — Provider name is visible in the "Your Appointment" panel', async ({ patientPage }) => {
                const providerName = patientPage.page
                    .locator('h1, h2, h3, h4, h5, h6, p')
                    .filter({ hasNotText: /^(Your Appointment|Appointment Time|Appointment Type|Location|Location Address|Powered by)/ })
                    .filter({ hasText: /^[A-Z]/ })
                    .first();
                await expect(providerName).toBeVisible({ timeout: 10_000 });
                const name = await providerName.textContent();
                expect(name?.trim().length).toBeGreaterThan(2);
                console.log(`Provider name confirmed: "${name?.trim()}"`);
            });
        }

        if (expectedLocation) {
            test('TC-APPT-PI-06 — "Location" label is visible in the summary panel', async ({ patientPage }) => {
                await expect(
                    patientPage.page.getByText('Location', { exact: true }).first()
                ).toBeVisible({ timeout: 10_000 });
            });

            test(`TC-APPT-PI-07 — Location value shows "${expectedLocation}"`, async ({ patientPage }) => {
                await expect(
                    patientPage.page.getByText(expectedLocation, { exact: false }).first()
                ).toBeVisible({ timeout: 10_000 });
            });
        }

        if (expectedAddress) {
            test('TC-APPT-PI-08 — "Location Address" label is visible in the summary panel', async ({ patientPage }) => {
                await expect(
                    patientPage.page.getByText(/Location Address/i).first()
                ).toBeVisible({ timeout: 10_000 });
            });

            test(`TC-APPT-PI-09 — Location Address value shows "${expectedAddress}"`, async ({ patientPage }) => {
                await expect(
                    patientPage.page.getByText(expectedAddress, { exact: false }).first()
                ).toBeVisible({ timeout: 10_000 });
            });
        }

    });
}
