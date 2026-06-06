/**
 * BROWSER BACK BUTTON MID-FLOW TESTS
 *
 * Verifies that pressing browser back during the booking flow navigates
 * to the correct previous page without crashing the session.
 *
 * @param {object} opts
 * @param {boolean} [opts.hasInsurance=true]  — client has an insurance step
 */
export function runBrowserBackCases(test, expect, opts = {}) {
    const { hasInsurance = true } = opts;

    test.describe('Browser back button — mid-flow', () => {

        // ── From insurance page ────────────────────────────────────────────────
        if (hasInsurance) {

            test('TC-BACK-01 — browser back from insurance navigates away from insurance', async ({ insurancePage }) => {
                const urlBefore = insurancePage.page.url();
                await insurancePage.page.goBack();
                await insurancePage.page.waitForLoadState('networkidle', { timeout: 20_000 });
                expect(insurancePage.page.url()).not.toBe(urlBefore);
            });

            test('TC-BACK-02 — page after back from insurance has visible content (not blank)', async ({ insurancePage }) => {
                await insurancePage.page.goBack();
                await insurancePage.page.waitForLoadState('networkidle', { timeout: 20_000 });
                const count = await insurancePage.page.locator('button, input, h1, h2, h3, h4').count();
                expect(count).toBeGreaterThan(0);
            });

            test('TC-BACK-03 — browser forward after back returns to insurance page', async ({ insurancePage }) => {
                await insurancePage.page.goBack();
                await insurancePage.page.waitForLoadState('networkidle', { timeout: 20_000 });
                await insurancePage.page.goForward();
                await insurancePage.page.waitForLoadState('networkidle', { timeout: 20_000 });
                expect(insurancePage.page.url()).toContain('insurance');
            });

        }

        // ── From patient info page ─────────────────────────────────────────────

        test('TC-BACK-04 — browser back from patient info navigates away from patient info', async ({ patientInfoPage }) => {
            const urlBefore = patientInfoPage.page.url();
            await patientInfoPage.page.goBack();
            await patientInfoPage.page.waitForLoadState('networkidle', { timeout: 20_000 });
            expect(patientInfoPage.page.url()).not.toBe(urlBefore);
        });

        test('TC-BACK-05 — page after back from patient info has visible content (not blank)', async ({ patientInfoPage }) => {
            await patientInfoPage.page.goBack();
            await patientInfoPage.page.waitForLoadState('networkidle', { timeout: 20_000 });
            const count = await patientInfoPage.page.locator('button, input, h1, h2, h3, h4').count();
            expect(count).toBeGreaterThan(0);
        });

        test('TC-BACK-06 — browser forward after back from patient info returns to patient info', async ({ patientInfoPage }) => {
            await patientInfoPage.page.goBack();
            await patientInfoPage.page.waitForLoadState('networkidle', { timeout: 20_000 });
            await patientInfoPage.page.goForward();
            await patientInfoPage.page.waitForLoadState('networkidle', { timeout: 20_000 });
            // Patient info page must show the first name input
            await expect(patientInfoPage.firstName).toBeVisible({ timeout: 10_000 });
        });

    });
}
