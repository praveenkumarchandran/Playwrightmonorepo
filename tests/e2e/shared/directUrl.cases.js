/**
 * DIRECT URL ACCESS TESTS
 *
 * Verifies that accessing a deep booking-flow URL without completing prior steps
 * does not crash the app. The app should either:
 *   a) Redirect to the landing page (clean restart), OR
 *   b) Render the requested page (if stateless/token-based)
 *
 * A blank page, unhandled error screen, or infinite spinner is a FAIL.
 *
 * @param {import('@playwright/test').TestType} test
 * @param {Function} expect
 * @param {object}  opts
 * @param {string}  opts.landingUrl   — full landing URL for this client
 * @param {boolean} [opts.hasInsurance=true]  — client has an insurance step
 */
export function runDirectUrlCases(test, expect, opts = {}) {
    const {
        landingUrl,
        hasInsurance = true,
    } = opts;

    // Derive deep URLs by replacing '/landing' with the page slug
    const findApptUrl   = landingUrl.replace('/landing', '/findappointment');
    const insuranceUrl  = landingUrl.replace('/landing', '/insurance');
    const patientUrl    = landingUrl.replace('/landing', '/patientinfo');

    test.describe('Direct URL access — without completing prior steps', () => {

        test('TC-URL-01 — direct access to /findappointment does not show a blank or error page', async ({ page }) => {
            await page.goto(findApptUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
            // Wait for React to mount at least one UI element before counting
            await page.waitForFunction(
                () => document.querySelectorAll('button, input, h1, h2, h3, h4').length > 0,
                { timeout: 20_000 }
            ).catch(() => {});
            const count = await page.locator('button, input, h1, h2, h3, h4').count();
            expect(count).toBeGreaterThan(0);
        });

        test('TC-URL-02 — direct /findappointment access lands on find appointment or redirects to landing', async ({ page }) => {
            await page.goto(findApptUrl, { waitUntil: 'networkidle', timeout: 30_000 });
            const url = page.url();
            const isValid =
                url.includes('findappointment') ||
                url.includes('landing') ||
                url.includes('intake');
            expect(isValid).toBe(true);
        });

        if (hasInsurance) {

            test('TC-URL-03 — direct access to /insurance does not show a blank or error page', async ({ page }) => {
                await page.goto(insuranceUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
                await page.waitForFunction(
                    () => document.querySelectorAll('button, input, h1, h2, h3, h4').length > 0,
                    { timeout: 20_000 }
                ).catch(() => {});
                const count = await page.locator('button, input, h1, h2, h3, h4').count();
                expect(count).toBeGreaterThan(0);
            });

            test('TC-URL-04 — direct /insurance access lands on insurance, find appointment, or landing', async ({ page }) => {
                await page.goto(insuranceUrl, { waitUntil: 'networkidle', timeout: 30_000 });
                const url = page.url();
                const isValid =
                    url.includes('insurance') ||
                    url.includes('findappointment') ||
                    url.includes('landing') ||
                    url.includes('intake');
                expect(isValid).toBe(true);
            });

        }

        test('TC-URL-05 — direct access to /patientinfo does not show a blank or error page', async ({ page }) => {
            await page.goto(patientUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
            await page.waitForFunction(
                () => document.querySelectorAll('button, input, h1, h2, h3, h4').length > 0,
                { timeout: 20_000 }
            ).catch(() => {});
            const count = await page.locator('button, input, h1, h2, h3, h4').count();
            expect(count).toBeGreaterThan(0);
        });

        test('TC-URL-06 — direct /patientinfo access lands on patient info, insurance, find appointment, or landing', async ({ page }) => {
            await page.goto(patientUrl, { waitUntil: 'networkidle', timeout: 30_000 });
            const url = page.url();
            const isValid =
                url.includes('patientinfo') ||
                url.includes('insurance') ||
                url.includes('findappointment') ||
                url.includes('landing') ||
                url.includes('intake');
            expect(isValid).toBe(true);
        });

        test('TC-URL-07 — landing URL always shows the landing page (baseline)', async ({ page }) => {
            await page.goto(landingUrl, { waitUntil: 'networkidle', timeout: 30_000 });
            await expect(
                page.getByText(/new patient/i).first()
            ).toBeVisible({ timeout: 10_000 });
        });

    });
}
