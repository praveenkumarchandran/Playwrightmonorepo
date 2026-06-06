/**
 * Hopemark Health — New Patient tests
 * Flow: Landing → SlotFilter → Slot → Intake → Insurance → PatientInfo
 *
 * Landing: Two reasons: "Psychiatric Evaluation (In-Office)" and "(Virtual)".
 *          In-Office shows no-availability. Must use Virtual for booking flow.
 *          Location panel: "Hopemark Health Millennium Park", "8 S Michigan Ave #1505, Chicago, IL 60603"
 *          Phone: 630-912-0025. Multiple locations in the dropdown (Downtown, Oak Brook, etc.)
 *
 * Find Appointment: SINY/Clarus-style layout (Basic Search + provider cards + Show More).
 *   Only 2 filter dropdowns: Location(Downtown▼) + Appointment Reason(Virtual▼).
 *   NO Provider dropdown (hasProviderDropdown: false).
 *   Gender checkboxes. Multiple locations in dropdown — some may trigger no-availability.
 *   In-Office reason → no online availability. Virtual → Courtney Potempa with slots.
 *
 * Intake: Conditions multi-select (ADHD, Anxiety, Bipolar, Depression, OCD…)
 *          + "How did you hear about us?" dropdown (NOT on patient info page — it's here).
 *
 * Insurance: Same 5 types. No Take Picture / Manually Enter Details buttons (fields direct).
 *   Next + Skip buttons visible. MUI Select.
 *
 * Patient Info: Address fields, ONE SMS consent checkbox. No referral (it's in intake).
 *
 * Stepper: Location(1) → Choose Date & Time(2) → Intake Questions(3) → Add Insurance(4) → Add Info(5)
 */

import { makeNewPatientFixtures, makeExistingPatientFixtures } from '../../../fixtures/newPatient.fixture.js';
import { runLandingCases }              from '../../shared/landing.cases.js';
import { runFindAppointmentCases }      from '../../shared/findAppointment.cases.js';
import { runIntakeCases }               from '../../shared/intake.cases.js';
import { runInsuranceCases }            from '../../shared/insurance.cases.js';
import { runInsurancePageSummaryCases, runPatientPageSummaryCases } from '../../shared/appointmentSummary.cases.js';
import { runPatientInfoCases }          from '../../shared/patientInfo.cases.js';
import { runStepperCases }              from '../../shared/stepper.cases.js';
import { runBrowserBackCases }          from '../../shared/browserBack.cases.js';
import { runPageRefreshCases }          from '../../shared/pageRefresh.cases.js';
import { runDirectUrlCases }            from '../../shared/directUrl.cases.js';
import { runExistingPatientCases }      from '../../shared/existingPatient.cases.js';
import { CLIENTS }                      from '../../../config/clients.js';

const { test, expect }                   = makeNewPatientFixtures('HOPEMARK');
const { test: epTest, expect: epExpect } = makeExistingPatientFixtures('HOPEMARK');

// ── Landing ───────────────────────────────────────────────────────────────────
// Two reasons: In-Office (no availability) + Virtual (has providers).
// Booking flow always uses Virtual. Landing panel shows clinic name + address.
runLandingCases(test, expect, {
    reason:       CLIENTS.HOPEMARK.reason,   // 'Psychiatric Evaluation (Virtual)' — Virtual has slots
    phoneNumber:  CLIENTS.HOPEMARK.phone,    // '630-912-0025'
    locationName: 'Hopemark Health Millennium Park',
    anyUrl:       'https://stage.setter.layline.live/hopemarkhealth/1/any/landing',
    // In-Office → no-availability message. Virtual → providers shown.
    allServiceTypes: ['Psychiatric Evaluation (In-Office)', 'Psychiatric Evaluation (Virtual)'],
});

// ── Find Appointment ──────────────────────────────────────────────────────────
// SINY/Clarus-style layout BUT only 2 filter dropdowns (Location + Reason, no Provider).
// In-Office reason → no-availability error. Virtual → Courtney Potempa with slots.
// Multiple locations in dropdown → some trigger no-availability (gray location tests).
runFindAppointmentCases(test, expect, {
    expectedServiceType:  CLIENTS.HOPEMARK.reason,   // 'Psychiatric Evaluation (Virtual)'
    nextPageAfterSlot:    'intake',
    hasProviderDropdown:  false,
    // Service variants tested from landing page (TC-LAND-SVC in runLandingCases)
});

// ── Intake ────────────────────────────────────────────────────────────────────
// Hopemark intake: Conditions multi-select (ADHD, Anxiety, Bipolar, Depression, OCD…)
// + "How did you hear about us?" dropdown (Friends/Family, Google, Insurance Website…)
runIntakeCases(test, expect, { intakeType: 'hopemark' });

// ── Insurance ─────────────────────────────────────────────────────────────────
// Confirmed: same 5 types, MUI Select, no Manual Entry / Take Picture buttons.
// Next + Skip buttons both visible.
const hopemarkErrorSelector = ':text-matches("to proceed|is required", "i")';

runInsuranceCases(test, expect, {
    insuranceTypes:        ['Medicaid', 'Medicare', 'Tricare', 'Private or Employer Insurance'],
    defaultInsuranceType:  'Private or Employer Insurance',
    hasInsuranceGating:    false,   // Insurance type is shown, Next always enabled
    hasManualEntryBtn:     false,   // Fields appear directly (no button choice)
    hasSkipButton:         true,    // Skip button confirmed visible in screenshot
    hasAutocompleteSearch: false,   // MUI Select, not typed autocomplete
    hasPlanAutocomplete:   false,   // File upload / direct field — no plan search
    hasTakePicture:        false,   // No Take Picture button
    canCompletePrivateInsurance: false,
    errorSelector: hopemarkErrorSelector,
});

// ── Appointment summary — insurance page ──────────────────────────────────────
// Panel: Courtney Potempa photo + name + Appointment Time + "Psychiatric Evaluation (Virtual)"
runInsurancePageSummaryCases(test, expect, {
    expectedAppointmentType: CLIENTS.HOPEMARK.reason,  // 'Psychiatric Evaluation (Virtual)'
    hasProviderName:          true,   // Panel shows provider photo + name
});

// ── Appointment summary — patient info page ───────────────────────────────────
runPatientPageSummaryCases(test, expect, {
    expectedAppointmentType: CLIENTS.HOPEMARK.reason,
    hasProviderName:          true,
});

// ── Patient Info ──────────────────────────────────────────────────────────────
// HAS address/state fields, ONE SMS consent checkbox.
// NO referral field — "How did you hear" is on the intake page, not here.
runPatientInfoCases(test, expect, {
    hasReferral:   false,   // Referral is in intake ("How did you hear about us?")
    hasSmsConsent: true,    // ONE SMS consent checkbox visible
    hasAddress:    true,    // Address1/2, City, State, Zip all present
    hasState:      true,    // State dropdown present
    errorSelector: hopemarkErrorSelector,
});

// ── Stepper ───────────────────────────────────────────────────────────────────
runStepperCases(test, expect, {
    hasIntake:       true,    // Intake Questions (step 3)
    hasLocation:     true,    // Location filter step (step 1)
    hasInsurance:    true,    // Add Insurance step (step 4)
    intakeCondition: 'ADHD',  // condition chip selected during flow setup
});

// ── Existing Patient — DISABLED ───────────────────────────────────────────────
// Placeholder credentials in clients.js don't match a real Hopemark patient.
// Update CLIENTS.HOPEMARK.existingPatient with real credentials before enabling.
// runExistingPatientCases(epTest, epExpect, CLIENTS.HOPEMARK.existingPatient);

// ── Browser back button ───────────────────────────────────────────────────────
runBrowserBackCases(test, expect, { hasInsurance: true });

// ── Page refresh mid-flow ─────────────────────────────────────────────────────
runPageRefreshCases(test, expect, { hasInsurance: true });

// ── Direct URL access ─────────────────────────────────────────────────────────
runDirectUrlCases(test, expect, {
    landingUrl:   CLIENTS.HOPEMARK.url,
    hasInsurance: true,
});
