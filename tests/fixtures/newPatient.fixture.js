/**
 * NEW PATIENT FIXTURE FACTORY
 *
 * Call makeNewPatientFixtures(clientKey) with a key from clients.js to get
 * a `test` object that has these fixtures pre-wired for that client:
 *
 *   intakePage    — test-scoped  — page stopped at Intake (ready for intake tests)
 *   insurancePage — test-scoped  — page stopped at Insurance (ready for insurance tests)
 *   slotPage      — test-scoped  — page stopped at slotPick (ready for slot tests)
 *   patientPage   — worker-scoped — full flow run once per worker, shared across tests
 *   stepperPage   — test-scoped  — full flow completed, returns raw page for stepper interaction
 *
 * Usage in a spec file:
 *   import { makeNewPatientFixtures } from '../../../fixtures/newPatient.fixture.js';
 *   const { test, expect } = makeNewPatientFixtures('TNDI');
 *   // then use test('...', async ({ intakePage }) => { ... })
 */

import { test as base, expect } from '@playwright/test';
import { CLIENTS } from '../config/clients.js';
import { runFlow } from '../flows/bookingFlow.js';
import { LandingPage }            from '../../pages/LandingPage.js';
import { PatientInfoPage }        from '../../pages/PatientInfoPage.js';
import { ExistingPatientPage }    from '../../pages/ExistingPatientPage.js';
import { FindAppointmentPage }    from '../../pages/FindAppointmentPage.js';

/**
 * @param {keyof typeof CLIENTS} clientKey
 * @returns {{ test: import('@playwright/test').TestType, expect: typeof expect }}
 */
export function makeNewPatientFixtures(clientKey) {
    const client = CLIENTS[clientKey];

    if (!client) {
        throw new Error(`Unknown client key: "${clientKey}". Check tests/config/clients.js`);
    }

    const flow = client.newPatientFlow;

    const test = base.extend({

        // ── landingPage — navigates to the client URL, returns LandingPage object ──
        // Used for tests that interact only with the landing page (e.g. gray-service flow).
        landingPage: async ({ page }, use) => {
            const landing = new LandingPage(page);
            await landing.open(client.url);  // open() now includes the content-ready wait
            await use(landing);
        },

        // ── intakePage — arrives AT the intake page without filling it ───────
        // Runs all steps before intake; platform auto-navigates to intake.
        intakePage: async ({ page }, use, testInfo) => {
            if (!flow.includes('intake')) {
                throw new Error(`Client "${clientKey}" has no intake step.`);
            }
            const intakeIdx = flow.indexOf('intake');
            const preIntakeFlow = flow.slice(0, intakeIdx);
            let pgs;
            try {
                pgs = await runFlow(page, client, preIntakeFlow, preIntakeFlow.at(-1));
            } catch (e) {
                if (e.message.startsWith('NO_SLOTS_AVAILABLE') || e.message.startsWith('CLIENT_NOT_CONFIGURED')) {
                    console.log(`[${clientKey}] No available slots in staging — intake tests will be skipped`);
                    testInfo.skip(true, `[${clientKey}] No available slots in staging — intake tests skipped`);
                    return;
                }
                throw new Error(`[${clientKey}] intakePage fixture failed.\n  Flow: ${preIntakeFlow.join(' → ')}\n  ${e.message}`);
            }
            await page.waitForLoadState('networkidle', { timeout: 30_000 });
            await use(pgs.intake);
        },

        // ── insurancePage — stops AT the insurance page, before filling it ──────
        // Runs all steps up to (but NOT including) insurance, then waits for the
        // platform to auto-navigate to the insurance page.
        // BUG FIXED: previously called runFlow twice, which re-ran landing → re-booked slot.
        insurancePage: async ({ page }, use, testInfo) => {
            if (!flow.includes('insurance')) {
                throw new Error(`Client "${clientKey}" has no insurance step.`);
            }
            const insuranceIdx = flow.indexOf('insurance');
            const preInsuranceFlow = flow.slice(0, insuranceIdx);
            let pgs;
            try {
                pgs = await runFlow(page, client, preInsuranceFlow, preInsuranceFlow.at(-1));
            } catch (e) {
                if (e.message.startsWith('NO_SLOTS_AVAILABLE') || e.message.startsWith('CLIENT_NOT_CONFIGURED')) {
                    testInfo.skip(true, `[${clientKey}] No available slots in staging — insurance page tests skipped`);
                    return;
                }
                throw new Error(`[${clientKey}] insurancePage fixture failed.\n  Flow: ${preInsuranceFlow.join(' → ')}\n  ${e.message}`);
            }

            // Platform auto-navigates to insurance after completing prior steps.
            await page.waitForLoadState('networkidle', { timeout: 30_000 });
            await use(pgs.insurance);
        },

        // ── findAppointmentPage — stops AT the /findappointment page, before picking a slot ─
        // Runs all steps before slotPick (e.g. landing + intake for SINY).
        // The platform auto-navigates to /findappointment after the prior steps complete.
        findAppointmentPage: async ({ page }, use) => {
            if (!flow.includes('slotPick')) {
                throw new Error(`Client "${clientKey}" has no slotPick step.`);
            }
            const preSlotFlow = flow.slice(0, flow.indexOf('slotPick'));
            const pgs = await runFlow(page, client, preSlotFlow, preSlotFlow.at(-1));
            await page.waitForLoadState('networkidle', { timeout: 30_000 });
            const findPage = new FindAppointmentPage(page);
            await findPage.waitForLoad();
            await use(findPage);
        },

        // ── slotPage — stops at slotPick step ─────────────────────────────────
        slotPage: async ({ page }, use) => {
            if (!flow.includes('slotPick')) {
                throw new Error(`Client "${clientKey}" has no slotPick step.`);
            }
            const preSlotFlow = flow.slice(0, flow.indexOf('slotPick') + 1);
            const pgs = await runFlow(page, client, preSlotFlow, 'slotPick');
            await use(pgs.slot);
        },

        // ── patientPage — worker-scoped, full flow runs once per worker ────────
        // All tests in the same worker share this page — no re-running the flow.
        patientPage: [async ({ browser }, use, testInfo) => {
            const context = await browser.newContext();
            const page = await context.newPage();
            let pgs;
            try {
                pgs = await runFlow(page, client, flow, 'patientInfo');
            } catch (e) {
                await context.close();
                if (e.message.startsWith('NO_SLOTS_AVAILABLE') || e.message.startsWith('CLIENT_NOT_CONFIGURED')) {
                    console.log(`[${clientKey}] No available slots in staging — patient info tests will be skipped`);
                    // testInfo.skip may not be available in worker-scoped fixtures on retry
                    if (typeof testInfo?.skip === 'function') {
                        testInfo.skip(true, `[${clientKey}] No available slots in staging — patient info tests skipped`);
                    }
                    return;
                }
                throw new Error(`[${clientKey}] patientPage fixture failed.\n  Flow: ${flow.join(' → ')}\n  ${e.message}`);
            }
            await use(pgs.patient);
            await context.close();
        }, { scope: 'worker' }],

        // ── patientInfoPage — test-scoped, fresh browser context per test ────
        // Use for tests that SUBMIT the form or need a clean empty state.
        // Unlike patientPage (worker-scoped), previous tests cannot pollute
        // form fields — each test gets its own browser context.
        // Uses { browser } (not { page }) so MUI component detection matches
        // the worker-scoped fixture's behaviour exactly.
        patientInfoPage: async ({ browser }, use, testInfo) => {
            const context = await browser.newContext();
            const page    = await context.newPage();
            try {
                await runFlow(page, client, flow, 'patientInfo');
            } catch (e) {
                await context.close();
                if (e.message.startsWith('NO_SLOTS_AVAILABLE') || e.message.startsWith('CLIENT_NOT_CONFIGURED')) {
                    testInfo.skip(true, `[${clientKey}] No available slots in staging — patient info tests skipped`);
                    return;
                }
                throw new Error(`[${clientKey}] patientInfoPage fixture failed.\n  Flow: ${flow.join(' → ')}\n  ${e.message}`);
            }
            await use(new PatientInfoPage(page));
            await context.close();
        },

        // ── stepperPage — test-scoped, full flow + raw page for stepper tests ──
        // Each stepper test gets its own independent browser context so
        // back-navigation in one test doesn't affect the next.
        stepperPage: async ({ page }, use, testInfo) => {
            try {
                await runFlow(page, client, flow, 'patientInfo');
            } catch (e) {
                if (e.message.startsWith('NO_SLOTS_AVAILABLE') || e.message.startsWith('CLIENT_NOT_CONFIGURED')) {
                    testInfo.skip(true, `[${clientKey}] No available slots in staging — stepper tests skipped`);
                    return;
                }
                throw new Error(`[${clientKey}] stepperPage fixture failed.\n  Flow: ${flow.join(' → ')}\n  ${e.message}`);
            }
            await use(page);
        },

    });

    return { test, expect };
}

/**
 * Fixture factory for existing-patient flows.
 *
 * Provides:
 *   existingPatientPage — test-scoped — landed on the identity search form,
 *                         fields not yet filled. Ready for input/validation tests.
 *
 * @param {keyof typeof CLIENTS} clientKey
 */
export function makeExistingPatientFixtures(clientKey) {
    const client = CLIENTS[clientKey];

    if (!client) {
        throw new Error(`Unknown client key: "${clientKey}". Check tests/config/clients.js`);
    }
    if (!client.existingPatientFlow) {
        throw new Error(`Client "${clientKey}" has no existingPatientFlow configured.`);
    }

    const test = base.extend({

        // Navigate to landing → select reason (same as new patient) → click Existing Patient
        existingPatientPage: async ({ page }, use) => {
            const landing = new LandingPage(page);
            await landing.open(client.url);  // open() includes the content-ready wait
            await landing.startExistingPatient(client.reason, {
                serviceType:        client.serviceType        ?? null,
                landingPopupAction: client.landingPopupAction ?? null,
            });
            const existing = new ExistingPatientPage(page);
            await existing.waitForLoad();
            await use(existing);
        },

    });

    return { test, expect };
}
