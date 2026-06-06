/**
 * Center for Vein Disease — New Patient tests
 * Flow: Landing → SlotFilter → Slot → Intake → Insurance → PatientInfo
 *
 * Landing: MUI Select dropdown — ANY 15, Consult, Varithena Test, VGS - Unilateral
 *          Location panel: "Center for Vein Disease: Mehru Sonde, MD DABVLM"
 *                          "5454 Wisconsin Ave Ste 1665, Chevy Chase, MD 20815"
 *          Phone: 301-220-8346 (top-right header)
 *          New Patient + Existing Patient buttons appear after reason selected.
 *
 * Find Appointment: Clarus-style (provider cards + Basic Search + Show More)
 *   Filters: Location (Main Office▼) + Appointment Reason (Consult▼) — NO Provider dropdown
 *   Dr. Sonde: has slots (Mon Jun 8: 9:30 AM, 10:30 AM, 1:30 PM + Show More)
 *   Ultrasound: gray provider — "no online availability. Please call our office."
 *   Consult → Dr. Sonde slots | Varithena Test / VGS - Unilateral → no-availability
 *   Popup: "This service cannot be booked online. Please call our office to schedule."
 *
 * Intake: Optional free-text textarea "Describe your symptoms or concerns"
 *   Continue button already enabled — same as SINY/Freedman style
 *
 * Insurance: Next + Skip buttons, default pre-selected "Insurance" type
 *   Your Appointment panel: Dr. Sonde photo + name + time + type
 *
 * Stepper: Location(1) → Choose Date & Time(2) → Intake Questions(3) → Add Insurance(4) → Add Info(5)
 */

import { makeNewPatientFixtures, makeExistingPatientFixtures } from '../../../fixtures/newPatient.fixture.js';
import { runLandingCases }              from '../../shared/landing.cases.js';
import { runFindAppointmentCases }      from '../../shared/findAppointment.cases.js';
import { runIntakeCases }               from '../../shared/intake.cases.js';
import { runInsuranceCases }            from '../../shared/insurance.cases.js';
import { runPatientInfoCases }          from '../../shared/patientInfo.cases.js';
import { runStepperCases }              from '../../shared/stepper.cases.js';
import { runInsurancePageSummaryCases, runPatientPageSummaryCases } from '../../shared/appointmentSummary.cases.js';
import { runBrowserBackCases }          from '../../shared/browserBack.cases.js';
import { runPageRefreshCases }          from '../../shared/pageRefresh.cases.js';
import { runDirectUrlCases }            from '../../shared/directUrl.cases.js';
import { CLIENTS }                      from '../../../config/clients.js';

const { test, expect } = makeNewPatientFixtures('CVD');

// ── Landing ───────────────────────────────────────────────────────────────────
// MUI Select dropdown. Reasons: ANY 15, Consult, Varithena Test, VGS - Unilateral
// Only Consult has Dr. Sonde slots — other reasons show no-availability.
runLandingCases(test, expect, {
    reason:       CLIENTS.CVD.reason,    // 'Consult'
    phoneNumber:  CLIENTS.CVD.phone,     // '301-220-8346'
    locationName: 'Center for Vein Disease',
    anyUrl:       'https://stage.setter.layline.live/centerforveindisease/1/any/landing',
    // Consult → slots visible | Varithena Test / VGS - Unilateral → no-availability message
    allServiceTypes: ['Consult', 'Varithena Test', 'VGS - Unilateral'],
});

// ── Find Appointment ──────────────────────────────────────────────────────────
// Clarus-style provider cards. No Provider dropdown — only Location + Reason filters.
// Dr. Sonde has real slots. Ultrasound is a gray provider (no-availability inline).
// After clicking a slot → Intake Questions (step 3)
runFindAppointmentCases(test, expect, {
    expectedServiceType:  CLIENTS.CVD.reason,   // 'Consult'
    nextPageAfterSlot:    'intake',
    hasProviderDropdown:  false,                 // Only Location + Reason filters shown
});

// ── Intake ────────────────────────────────────────────────────────────────────
// Optional free-text textarea. Continue already enabled — same as SINY/Freedman.
runIntakeCases(test, expect, {
    intakeType:         'siny',   // optional free-text textarea
    hasClearableSearch: false,    // no search autocomplete to test
});

// ── Insurance ─────────────────────────────────────────────────────────────────
// Insurance Type dropdown pre-loads "Insurance". Next + Skip both visible.
// Your Appointment panel: Dr. Sonde photo + name + time + type
const cvdErrorSelector = ':text-matches("is required|required", "i")';

runInsuranceCases(test, expect, {
    insuranceTypes:              ['Insurance', 'Medicare', 'Medicaid'],
    defaultInsuranceType:        'Insurance',
    hasInsuranceGating:          false,
    hasAutocompleteSearch:       false,   // MUI Select (▼)
    hasPlanAutocomplete:         false,
    hasSkipButton:               true,    // Skip button confirmed visible
    hasTakePicture:              false,
    canCompletePrivateInsurance: false,
    errorSelector:               cvdErrorSelector,
});

// ── Appointment summary — insurance page ──────────────────────────────────────
// Panel: Dr. Sonde photo + name + Appointment Time + Appointment Type: Consult
runInsurancePageSummaryCases(test, expect, {
    expectedAppointmentType: CLIENTS.CVD.reason,   // 'Consult'
    hasProviderName:          true,                 // Dr. Sonde photo + name shown
});

// ── Appointment summary — patient info page ───────────────────────────────────
runPatientPageSummaryCases(test, expect, {
    expectedAppointmentType: CLIENTS.CVD.reason,
    hasProviderName:          true,
});

// ── Patient Info ──────────────────────────────────────────────────────────────
runPatientInfoCases(test, expect, {
    hasReferral:   false,
    hasSmsConsent: true,
    errorSelector: cvdErrorSelector,
});

// ── Stepper ───────────────────────────────────────────────────────────────────
// 5 steps confirmed: Location → Choose Date & Time → Intake Questions → Add Insurance → Add Info
runStepperCases(test, expect, {
    hasIntake:    true,    // Intake Questions (step 3)
    hasLocation:  true,    // Location filter (step 1)
    hasInsurance: true,    // Add Insurance (step 4)
});

// ── Existing Patient — DISABLED ───────────────────────────────────────────────
// TODO: get real CVD existing patient credentials before enabling.
// const { existingPatient } = CLIENTS.CVD;
// runExistingPatientCases(epTest, epExpect, existingPatient);

// ── Browser back button ───────────────────────────────────────────────────────
runBrowserBackCases(test, expect, { hasInsurance: true });

// ── Page refresh mid-flow ─────────────────────────────────────────────────────
runPageRefreshCases(test, expect, { hasInsurance: true });

// ── Direct URL access ─────────────────────────────────────────────────────────
runDirectUrlCases(test, expect, {
    landingUrl:   CLIENTS.CVD.url,
    hasInsurance: true,
});
