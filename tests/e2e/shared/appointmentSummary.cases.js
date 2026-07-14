/**
 * SHARED APPOINTMENT SUMMARY PANEL TEST CASES
 *
 * The "Your Appointment" panel appears on the left of intake, insurance, and patient info pages.
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

// ── Intake page variant ───────────────────────────────────────────────────────
// Verifies the "Your Appointment" panel is fully populated on the INTAKE page
// (step 3 in TNDI: Location → Choose Date & Time → Intake Questions → ...).
// Uses intakePage fixture — page stopped at intake, form not yet submitted.

export function runIntakePageSummaryCases(test, expect, opts = {}) {
    const {
        expectedAppointmentType = null,
        expectedLocation        = null,
        expectedAddress         = null,
    } = opts;

    test.describe('Appointment summary panel — intake page', () => {

        // WHY: The "Your Appointment" panel must be present on the intake page.
        // If missing → the panel component failed to render or was accidentally removed.
        // The patient needs to see their booking details while filling the intake form.
        test('TC-APPT-INT-01 — "Your Appointment" heading is visible on intake page', async ({ intakePage }) => {
            await expect(
                intakePage.page.getByText(/Your Appointment/i).first(),
                '"Your Appointment" panel heading not found on intake page — ' +
                'the summary panel failed to render. Patient cannot see their booking details.'
            ).toBeVisible({ timeout: 10_000 });
        });

        // WHY: The "Appointment Time" label must appear in the left panel on the intake page.
        // If missing → the time section was dropped from the panel, meaning the patient
        // cannot confirm WHEN their appointment is while answering intake questions.
        test('TC-APPT-INT-02 — "Appointment Time" label is visible on intake page', async ({ intakePage }) => {
            await expect(
                intakePage.page.getByText(/Appointment Time/i).first(),
                '"Appointment Time" label missing from intake page summary panel — ' +
                'the patient cannot see their scheduled time while filling the intake form.'
            ).toBeVisible({ timeout: 10_000 });
        });

        // WHY: The "Appointment Type" label must appear in the left panel on the intake page.
        // If missing → the appointment type section was removed from the panel UI.
        test('TC-APPT-INT-03 — "Appointment Type" label is visible on intake page', async ({ intakePage }) => {
            await expect(
                intakePage.page.getByText(/Appointment Type/i).first(),
                '"Appointment Type" label missing from intake page summary panel — ' +
                'the appointment type section was removed or failed to render.'
            ).toBeVisible({ timeout: 10_000 });
        });

        // WHY: The Appointment Type VALUE must NOT be empty on the intake page.
        // If empty → the app failed to carry the selected service type into the intake step.
        // The patient and admin cannot confirm what type of appointment is being booked.
        // BUG: Currently failing — value is "" when it should show the appointment type
        // (e.g. "Teleconsultation"). Fix: ensure the appointment type is passed to the
        // intake page panel from the slot selection step.
        test('TC-APPT-INT-03b — Appointment Type value is filled (not empty) on intake page', async ({ intakePage }) => {
            const panelText = await intakePage.page.locator('text=/Your Appointment/i')
                .locator('..').locator('..').innerText().catch(() => '');
            const lines = panelText.split('\n').map(l => l.trim()).filter(Boolean);
            const apptTypeIdx = lines.findIndex(l => /Appointment Type/i.test(l));
            const valueAfterLabel = lines[apptTypeIdx + 1] ?? '';
            console.log(`  Appointment Type value on intake page: "${valueAfterLabel}"`);
            expect(
                valueAfterLabel.length,
                `Appointment Type value is EMPTY on intake page. ` +
                `Expected a value (e.g. "Teleconsultation") but got "". ` +
                `Root cause: the appointment type selected on the slot page is not being ` +
                `passed through to the intake page summary panel.`
            ).toBeGreaterThan(0);
        });

        // WHY: The Appointment Time value must show a real time (e.g. "9:15 AM").
        // If missing → the selected time was not carried through to the intake page panel.
        // The patient cannot confirm their appointment time while filling intake questions.
        test('TC-APPT-INT-04 — Appointment Time value shows a real time (AM/PM)', async ({ intakePage }) => {
            await expect(
                intakePage.page.getByText(/\d{1,2}:\d{2}\s*(AM|PM)/i).first(),
                'No valid time (AM/PM format) found on intake page summary panel — ' +
                'the appointment time selected during slot picking was not carried through.'
            ).toBeVisible({ timeout: 10_000 });
        });

        if (expectedAppointmentType) {
            // WHY: When the app is fixed, the appointment type value must match the expected service.
            // If wrong → the appointment type shown is different from what the patient selected.
            test(`TC-APPT-INT-05 — Appointment Type shows "${expectedAppointmentType}"`, async ({ intakePage }) => {
                await expect(
                    intakePage.page.getByText(expectedAppointmentType, { exact: false }).first(),
                    `Expected Appointment Type to show "${expectedAppointmentType}" but it is not visible. ` +
                    `The wrong service type may be displayed in the intake page summary panel.`
                ).toBeVisible({ timeout: 10_000 });
            });
        }

        if (expectedLocation) {
            // WHY: The "Location" label must appear in the panel.
            // If missing → the location section was removed from the intake page panel UI.
            test('TC-APPT-INT-06 — "Location" label is visible on intake page', async ({ intakePage }) => {
                await expect(
                    intakePage.page.getByText('Location', { exact: true }).first(),
                    '"Location" label missing from intake page summary panel — ' +
                    'the location section failed to render. Patient cannot confirm their clinic.'
                ).toBeVisible({ timeout: 10_000 });
            });

            // WHY: The Location value must show the correct clinic name.
            // If wrong → the patient is seeing a different location than they selected.
            test(`TC-APPT-INT-07 — Location value shows "${expectedLocation}"`, async ({ intakePage }) => {
                await expect(
                    intakePage.page.getByText(expectedLocation, { exact: false }).first(),
                    `Expected Location to show "${expectedLocation}" but it is not visible. ` +
                    `The clinic name may have changed or the wrong location is being displayed.`
                ).toBeVisible({ timeout: 10_000 });
            });
        }

        if (expectedAddress) {
            // WHY: The "Location Address" label must appear in the panel.
            // If missing → the address section was removed from the intake page panel UI.
            test('TC-APPT-INT-08 — "Location Address" label is visible on intake page', async ({ intakePage }) => {
                await expect(
                    intakePage.page.getByText(/Location Address/i).first(),
                    '"Location Address" label missing from intake page summary panel — ' +
                    'the address section failed to render.'
                ).toBeVisible({ timeout: 10_000 });
            });

            // WHY: The address value must match the clinic address.
            // If wrong → patient may travel to the wrong location.
            test(`TC-APPT-INT-09 — Location Address value shows "${expectedAddress}"`, async ({ intakePage }) => {
                await expect(
                    intakePage.page.getByText(expectedAddress, { exact: false }).first(),
                    `Expected address "${expectedAddress}" not found on intake page summary panel. ` +
                    `The clinic address may have changed or the wrong location data is being displayed. ` +
                    `A wrong address here means the patient could travel to the wrong clinic.`
                ).toBeVisible({ timeout: 10_000 });
            });
        }

    });
}
