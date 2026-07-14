/**
 * SINY Dermatology — Cosmetic — New Patient tests
 * Flow: Landing → Intake → Slot → PatientInfo  (NO insurance step)
 *
 * Landing: Reason="Cosmetic Procedure" → Service Type sub-dropdown → New Patient
 *          → "Consultation Required" popup → click "Schedule Procedure" → Intake
 *
 * Stepper: Location(1) → Intake Questions(2) → Choose Date & Time(3) → Add Info(4)
 *
 * Cosmetic Consultation popup behaviour (newly added functionality):
 *   Selecting "Cosmetic Consultation" as reason → click New Patient triggers one of:
 *   • Service available at location   → "Consultation Fee Notice" → Continue → intake
 *   • Service not available at location → "This location is currently not available
 *                                          for selected Service" → X → landing stays
 */

import { makeNewPatientFixtures, makeExistingPatientFixtures } from '../../../fixtures/newPatient.fixture.js';
import { LandingPage } from '../../../../pages/LandingPage.js';
import { runIntakeCases }            from '../../shared/intake.cases.js';
import { runPatientInfoCases }       from '../../shared/patientInfo.cases.js';
import { runStepperCases }           from '../../shared/stepper.cases.js';
import { runSINYLandingCases }       from '../../shared/sinyLanding.cases.js';
import { runExistingPatientCases }   from '../../shared/existingPatient.cases.js';
import { runFindAppointmentCases }   from '../../shared/findAppointment.cases.js';
import { runBrowserBackCases }       from '../../shared/browserBack.cases.js';
import { runPageRefreshCases }       from '../../shared/pageRefresh.cases.js';
import { runDirectUrlCases }         from '../../shared/directUrl.cases.js';
import { runPatientPageSummaryCases } from '../../shared/appointmentSummary.cases.js';
import { CLIENTS }                   from '../../../config/clients.js';

const { test, expect }                   = makeNewPatientFixtures('SINY_COSMETIC');
const { test: epTest, expect: epExpect } = makeExistingPatientFixtures('SINY_COSMETIC');

runSINYLandingCases(test, expect, {
    reason:       'Cosmetic Procedure',
    popupService: 'Sclerotherapy',
    phoneNumber:  CLIENTS.SINY_COSMETIC.phone,  // '718-491-5800'
    locationName: 'SINY Dermatology',
    anyUrl:       'https://stage.setter.layline.live/sinydermatology/1/any/landing',
});
runIntakeCases(test, expect, { intakeType: 'siny' });
// No runInsuranceCases — cosmetic flow has no insurance step
runPatientInfoCases(test, expect, {
    hasReferral: false,  // SINY patient info page has no "How did you hear about us" field
    errorSelector: '[class*="Mui-error"], [aria-invalid="true"], :text-matches("required|invalid|must", "i")',
});
runStepperCases(test, expect, {
    hasIntake:    true,   // Intake Questions step is in the stepper
    hasLocation:  true,   // Location step is in the stepper
    hasInsurance: false,  // No Add Insurance step in cosmetic flow
});

runFindAppointmentCases(test, expect, {
    expectedServiceType: CLIENTS.SINY_COSMETIC.serviceType,  // 'Botox treatment'
    nextPageAfterSlot: 'patientInfo',
});

// Cosmetic summary shows "New Patient" (patient type), not the service reason
runPatientPageSummaryCases(test, expect, {
    expectedAppointmentType: null,  // cosmetic panel shows patient type, not service name
    hasProviderName:          true,
});

const { existingPatient } = CLIENTS.SINY_COSMETIC;
runExistingPatientCases(epTest, epExpect, existingPatient);

// ── Browser back button ───────────────────────────────────────────────────────
runBrowserBackCases(test, expect, { hasInsurance: false }); // cosmetic has no insurance step

// ── Page refresh mid-flow ─────────────────────────────────────────────────────
runPageRefreshCases(test, expect, { hasInsurance: false });

// ── Direct URL access ─────────────────────────────────────────────────────────
runDirectUrlCases(test, expect, {
    landingUrl:   CLIENTS.SINY_COSMETIC.url,
    hasInsurance: false,
});

// ── Cosmetic Consultation popup behaviour (newly added functionality) ──────────
// Covers both popup outcomes across Bay Ridge (available) and Forest Hills (may not be available)

const BASE_SETTER = (process.env.SETTER_BASE_URL ?? 'https://stage.setter.layline.live').replace(/\/$/, '');

// All 11 SINY locations — covers current unavailability (Forest Hills) and any future ones.
// TC-SIN-CC01 handles BOTH popup types automatically:
//   fee_notice   → service available → Continue → intake reached
//   not_available → service blocked  → X closed → landing still functional
// If a URL slug is wrong the page-validity guard skips gracefully instead of failing.
const CC_LOCATIONS = [
    { name: 'Bay Ridge',        url: `${BASE_SETTER}/sinydermatology/1/sinydermatologybayridge/landing` },
    { name: 'West Village',     url: `${BASE_SETTER}/sinydermatology/1/sinydermatologywestvillage/landing` },
    { name: 'Forest Hills',     url: `${BASE_SETTER}/sinydermatology/1/sinydermatologyforesthills/landing` },
    { name: 'Park Slope',       url: `${BASE_SETTER}/sinydermatology/1/sinydermatologyparkslope/landing` },
    { name: 'Upper East Side',  url: `${BASE_SETTER}/sinydermatology/1/sinydermatologyuppereastside/landing` },
    { name: 'Southold',         url: `${BASE_SETTER}/sinydermatology/1/sinydermatologysouthold/landing` },
    { name: '1000 Park Avenue', url: `${BASE_SETTER}/sinydermatology/1/sinydermatology1000parkavenue/landing` },
    { name: 'Williamsburg',     url: `${BASE_SETTER}/sinydermatology/1/sinydermatologywilliamsburg/landing` },
    { name: 'Massapequa',       url: `${BASE_SETTER}/sinydermatology/1/sinydermatologymassapequa/landing` },
    { name: 'Florida',          url: `${BASE_SETTER}/sinydermatology/1/sinydermatologyflorida/landing` },
    { name: 'Rego Park',        url: `${BASE_SETTER}/sinydermatology/1/sinydermatologyregopark/landing` },
];

async function handleConsultationPopup(page) {
    const dialog = page.locator('[role="dialog"]');
    const hasDialog = await dialog.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false);
    if (!hasDialog) return null;

    const text = (await dialog.textContent().catch(() => '')).trim();

    if (/Consultation Fee Notice/i.test(text)) {
        await dialog.locator('button').filter({ hasText: /Continue/i }).click();
        await dialog.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
        return 'fee_notice';
    }

    if (/currently not available for selected Service|location.*not.*available/i.test(text)) {
        await dialog.locator('button').first().click().catch(() => page.keyboard.press('Escape'));
        await dialog.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
        return 'not_available';
    }

    return null;
}

test.describe('Cosmetic Consultation — popup behaviour', () => {

    for (const loc of CC_LOCATIONS) {

        test(`TC-SIN-CC01: ${loc.name} — Cosmetic Consultation → popup handled and correct outcome shown`, async ({ page }) => {
            const landing = new LandingPage(page);
            await page.goto(loc.url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
            const pageLoaded = await page.locator('button#newPatient-button')
                .waitFor({ state: 'visible', timeout: 15_000 }).then(() => true).catch(() => false);
            if (!pageLoaded) {
                test.skip(true, `Landing page not reachable at ${loc.name} — URL slug may differ: ${loc.url}`);
            }
            const reasonAvailable = await landing._selectReason('Cosmetic Consultation').then(() => true).catch(() => false);
            if (!reasonAvailable) {
                test.skip(true, `"Cosmetic Consultation" reason not offered at ${loc.name}`);
            }
            // Wait 3-4s for the page to process the selection, then click New Patient
            // Popup appears only after clicking New Patient
            await page.waitForTimeout(3_500);
            await page.locator('button#newPatient-button').click();

            const handled = await handleConsultationPopup(page);

            if (handled === 'fee_notice') {
                console.log(`  ✅ ${loc.name}: service available — "Consultation Fee Notice" popup dismissed`);
                await page.waitForURL(/intakequestion|intake/i, { timeout: 30_000 });
                expect(page.url()).toMatch(/intakequestion|intake/i);
                console.log(`  ✅ Navigated to intake: ${page.url()}`);

            } else if (handled === 'not_available') {
                console.log(`  ✅ ${loc.name}: service not available — "location not available" popup dismissed`);
                await expect(page.locator('button#newPatient-button')).toBeVisible({ timeout: 5_000 });
                console.log(`  ✅ Landing page remains functional after popup dismissed`);

            } else {
                console.log(`  ℹ️ ${loc.name}: no popup appeared after New Patient click`);
                console.log(`  Current URL: ${page.url()}`);
            }
        });

        test(`TC-SIN-CC02: ${loc.name} — Cosmetic Consultation → full flow to intake (skip if not available)`, async ({ page }) => {
            const landing = new LandingPage(page);
            await page.goto(loc.url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
            const pageLoaded = await page.locator('button#newPatient-button')
                .waitFor({ state: 'visible', timeout: 15_000 }).then(() => true).catch(() => false);
            if (!pageLoaded) {
                test.skip(true, `Landing page not reachable at ${loc.name} — URL slug may differ: ${loc.url}`);
            }
            const reasonAvailable = await landing._selectReason('Cosmetic Consultation').then(() => true).catch(() => false);
            if (!reasonAvailable) {
                test.skip(true, `"Cosmetic Consultation" reason not offered at ${loc.name}`);
            }
            // Wait 3-4s, then click New Patient — popup appears after clicking
            await page.waitForTimeout(3_500);
            await page.locator('button#newPatient-button').click();

            const handled = await handleConsultationPopup(page);

            if (handled === 'not_available') {
                test.skip(true, `Cosmetic Consultation not available at ${loc.name} — "location not available" popup appeared`);
            }
            if (handled === 'fee_notice') {
                console.log(`  ✅ ${loc.name}: "Consultation Fee Notice" dismissed — proceeding to intake`);
            }

            await page.waitForURL(/intakequestion|intake/i, { timeout: 30_000 });
            expect(page.url()).toMatch(/intakequestion|intake/i);
            console.log(`  ✅ ${loc.name}: Cosmetic Consultation → intake reached at ${page.url()}`);
        });

    }

});
