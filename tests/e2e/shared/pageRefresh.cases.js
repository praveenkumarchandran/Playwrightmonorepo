/**
 * PAGE REFRESH MID-FLOW TESTS
 *
 * Verifies that refreshing the browser mid-booking does not crash the app.
 * The app may either stay on the current page (session persists) or redirect
 * to landing (session reset) — both are acceptable. A blank page or JS error is not.
 *
 * @param {object} opts
 * @param {boolean} [opts.hasInsurance=true]  — client has an insurance step
 */
export function runPageRefreshCases(test, expect, opts = {}) {
    const { hasInsurance = true } = opts;

    test.describe('Page refresh mid-flow', () => {

        // ── Insurance page ─────────────────────────────────────────────────────
        if (hasInsurance) {

            test('TC-REF-01 — refresh on insurance page does not crash the app', async ({ insurancePage }) => {
                test.slow();
                await insurancePage.page.reload({ waitUntil: 'networkidle' });
                const count = await insurancePage.page.locator('button, input, h1, h2, h3').count();
                expect(count).toBeGreaterThan(0);
            });

            test('TC-REF-02 — after refresh on insurance page, app shows form or landing (no broken state)', async ({ insurancePage }) => {
                await insurancePage.page.reload({ waitUntil: 'networkidle' });
                const url = insurancePage.page.url();
                // Either stayed on insurance/findappointment OR redirected to landing — both OK
                const isOnExpectedPage =
                    url.includes('insurance') ||
                    url.includes('findappointment') ||
                    url.includes('landing') ||
                    url.includes('intake');
                expect(isOnExpectedPage).toBe(true);
            });

        }

        // ── Patient info page ──────────────────────────────────────────────────

        test('TC-REF-03 — refresh on patient info page does not crash the app', async ({ patientInfoPage }) => {
            await patientInfoPage.page.reload({ waitUntil: 'networkidle' });
            const count = await patientInfoPage.page.locator('button, input, h1, h2, h3').count();
            expect(count).toBeGreaterThan(0);
        });

        test('TC-REF-04 — after refresh on patient info, page has interactive content (not blank or error)', async ({ patientInfoPage }) => {
            await patientInfoPage.page.reload({ waitUntil: 'networkidle' });
            // URL path varies by client (/additionaldetails, /addinfo, /patientinfo…)
            // Just verify the page has interactive content — not a blank or error screen
            const count = await patientInfoPage.page.locator('button, input, h1, h2, h3').count();
            expect(count).toBeGreaterThan(0);
        });

        test('TC-REF-05 — patient info page reloaded once is still navigable (no JS crash)', async ({ patientInfoPage }) => {
            await patientInfoPage.page.reload({ waitUntil: 'networkidle' });
            // Check no uncaught JS error by verifying at least one interactive element exists
            const hasInteractiveElement = await patientInfoPage.page
                .locator('button:not([disabled]), input, a[href]')
                .first()
                .isVisible({ timeout: 10_000 })
                .catch(() => false);
            expect(hasInteractiveElement).toBe(true);
        });

    });
}
