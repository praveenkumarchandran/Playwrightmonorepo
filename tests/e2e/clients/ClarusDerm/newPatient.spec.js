/**
 * Clarus Dermatology — New Patient tests
 * Flow: Landing → SlotFilter → Slot → Insurance → PatientInfo
 *
 * Landing: Visit reason MUI dropdown (Acne / BOTOX / Full Body Skin Exam / Rash)
 *          Slug URL shows location info panel (Clarus Dermatology, 15450 MN-7 #225)
 *
 * Find Appointment: IDENTICAL layout to SINY
 *   Basic Search — Location(Minnetonka▼), Appointment Reason(Acne▼), Provider(Any▼)
 *   Provider Gender checkboxes (Male/Female)
 *   Provider cards with "Show More" links and inline date+time slot buttons
 *   Gray providers (Megan Bell, Sydney Schwitters) → popup "does not offer service at this location"
 *
 * Insurance: Same 5 types as SINY (Self-pay / Medicaid / Medicare / Tricare / Private or Employer Insurance)
 *
 * Stepper: Location(1) → Choose Date & Time(2) → Add Insurance(3) → Add Info(4)
 *
 * NOTE: No intake step.
 */

import { makeNewPatientFixtures, makeExistingPatientFixtures } from '../../../fixtures/newPatient.fixture.js';
import { runLandingCases }         from '../../shared/landing.cases.js';
import { runInsuranceCases }       from '../../shared/insurance.cases.js';
import { runPatientInfoCases }     from '../../shared/patientInfo.cases.js';
import { runStepperCases }         from '../../shared/stepper.cases.js';
import { runFindAppointmentCases } from '../../shared/findAppointment.cases.js';
import { runBrowserBackCases }     from '../../shared/browserBack.cases.js';
import { runPageRefreshCases }     from '../../shared/pageRefresh.cases.js';
import { runDirectUrlCases }       from '../../shared/directUrl.cases.js';
import { runInsurancePageSummaryCases, runPatientPageSummaryCases } from '../../shared/appointmentSummary.cases.js';
import { runExistingPatientCases } from '../../shared/existingPatient.cases.js';
import { CLIENTS }                 from '../../../config/clients.js';

const { test, expect }                   = makeNewPatientFixtures('CLARUS_DERM');
const { test: epTest, expect: epExpect } = makeExistingPatientFixtures('CLARUS_DERM');

// ── Landing ───────────────────────────────────────────────────────────────────
// Confirmed from screenshots:
//   - Visit reason MUI Select dropdown (Acne, BOTOX, Full Body Skin Exam, Rash)
//   - Slug URL (/minnetonka/) shows location info panel with "Clarus Dermatology"
runLandingCases(test, expect, {
    reason:       CLIENTS.CLARUS_DERM.reason,   // 'Acne'
    phoneNumber:  CLIENTS.CLARUS_DERM.phone,    // '877-408-2431'
    locationName: 'Clarus Dermatology',
    anyUrl:       'https://stage.setter.layline.live/clarusdermatology/1/any/landing',
    // All service options from landing page screenshot (Acne, BOTOX, Full Body Skin Exam, Rash)
    // Each is tested: select → New Patient → findappointment → providers OR no-availability
    allServiceTypes: ['Acne', 'BOTOX', 'Full Body Skin Exam', 'Rash'],
});

// ── No intake step for Clarus ─────────────────────────────────────────────────

// ── Find Appointment (identical layout to SINY findappointment) ───────────────
// Confirmed: same Basic Search panel, "Show More" links, gray providers with popup
runFindAppointmentCases(test, expect, {
    expectedServiceType: CLIENTS.CLARUS_DERM.slotFilters.reason,  // 'Acne'
    nextPageAfterSlot:   'insurance',
    // Service variants tested from landing page (TC-LAND-SVC in runLandingCases)
});

// Verify "Your Appointment" panel on insurance page shows what was selected
// Insurance page: shows provider photo + name + Appointment Time + Appointment Type
// Clarus panel shows the service booked (e.g. "Acne") — reason IS the service for Clarus
runInsurancePageSummaryCases(test, expect, {
    expectedAppointmentType: CLIENTS.CLARUS_DERM.reason,  // 'Acne' (reason = service for Clarus)
    hasProviderName:          true,  // Panel shows provider photo + name (Jesse Ochoa etc.)
});

// Patient info page: same panel must persist to Add Info step
runPatientPageSummaryCases(test, expect, {
    expectedAppointmentType: CLIENTS.CLARUS_DERM.reason,  // 'Acne'
    hasProviderName:          true,
});

// ── Insurance ─────────────────────────────────────────────────────────────────
// Confirmed from screenshots:
//   - Same 5 types as SINY: Self-pay / Medicaid / Medicare / Tricare / Private or Employer Insurance
//   - MUI Select dropdown (▼)
//   - No Skip button on Clarus insurance page
//   - Take Picture / Manually Enter Details buttons are admin-configurable.
//     Currently disabled for Clarus → fields appear directly after type selection.
//     If admin enables them later, prepareInsuranceForm() self-heals automatically.
runInsuranceCases(test, expect, {
    insuranceTypes:        ['Medicaid', 'Medicare', 'Tricare', 'Private or Employer Insurance'],
    defaultInsuranceType:  'Private or Employer Insurance',
    hasInsuranceGating:    false,   // Confirmed: Next is NOT disabled before type selection
    hasAutocompleteSearch: false,   // MUI Select (▼), same style as SINY
    hasPlanAutocomplete:   false,   // Plan field is MUI Select too — no text search
    hasSkipButton:         false,   // Confirmed: no Skip button on Clarus insurance page
    hasTakePicture:        false,   // Admin-configured — off for Clarus (fields appear directly)
    // Confirmed from screenshot: Primary Insurance Holder dropdown IS present (Self/Spouse/Other)
    holderOptions:         ['Self', 'Spouse', 'Other'],
    canCompletePrivateInsurance: false,  // Insurance plan field required but can't be auto-filled
    // Clarus shows "Insurance is required." as orange text — same pattern as SINY
    errorSelector: ':text-matches("is required|required", "i")',
});

// ── Patient Info ──────────────────────────────────────────────────────────────
// Confirmed from screenshot (additionaldetails page):
//   Fields: First Name, Last Name, DOB (calendar picker), Gender (▼ MUI Select)
//           Email, Home Zip, Phone, Address1, Address2 (Optional), City, State (MUI Autocomplete)
//   SMS consent checkbox ✅
//   NO referral ("How did you hear") field
runPatientInfoCases(test, expect, {
    hasReferral:   false,  // No referral field on Clarus patient info page
    hasSmsConsent: true,   // SMS consent checkbox confirmed visible
});

// ── Stepper ───────────────────────────────────────────────────────────────────
runStepperCases(test, expect, {
    hasIntake:   false,  // Clarus has no intake step
    hasLocation: true,   // Clarus has Location filter step in stepper
    hasInsurance: true,  // Clarus has Add Insurance step
});

// ── Existing Patient ──────────────────────────────────────────────────────────
const { existingPatient } = CLIENTS.CLARUS_DERM;
runExistingPatientCases(epTest, epExpect, {
    ...existingPatient,
    checkPreFill: true,
});

// ── Browser back button ───────────────────────────────────────────────────────
runBrowserBackCases(test, expect, { hasInsurance: true });

// ── Page refresh mid-flow ─────────────────────────────────────────────────────
runPageRefreshCases(test, expect, { hasInsurance: true });

// ── Direct URL access ─────────────────────────────────────────────────────────
runDirectUrlCases(test, expect, {
    landingUrl:   CLIENTS.CLARUS_DERM.url,
    hasInsurance: true,
});
