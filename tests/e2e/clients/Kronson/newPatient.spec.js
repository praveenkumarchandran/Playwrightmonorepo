/**
 * Kronson Vein Institute — New Patient tests
 * Flow: Landing → Choose Date & Time → Add Insurance → Add Info
 *
 * Landing: Only one reason "Vein Consult". Slug URL (/arcadia/) shows location panel.
 *          Phone: 626-254-2287
 *
 * Find Appointment: SINY/Clarus-style layout (Basic Search + provider cards + Show More)
 *   BUT only 2 filter dropdowns: Location(Arcadia▼) + Appointment Reason(Vein Consult▼)
 *   NO Provider dropdown. Gender checkboxes present. One provider: Jeffrey Kronson.
 *   Slot buttons show "Mon Jun 8 / 12:00 PM" format (date+time inline).
 *
 * Insurance: Same 5 types as SINY/TNDI. File upload built in.
 *   "Your Appointment" left panel: Jeffrey Kronson photo + name + time + "Vein Consult"
 *
 * Patient Info: First Name, Last Name, DOB, Gender, Email, Address, City, State, Zip, Phone.
 *   TWO SMS consent checkboxes (marketing + non-marketing). No referral field.
 *
 * NOTE: No intake step.
 * Stepper: Location(1) → Choose Date & Time(2) → Add Insurance(3) → Add Info(4)
 */

import { makeNewPatientFixtures, makeExistingPatientFixtures } from '../../../fixtures/newPatient.fixture.js';
import { runLandingCases }              from '../../shared/landing.cases.js';
import { runFindAppointmentCases }      from '../../shared/findAppointment.cases.js';
import { runInsuranceCases }            from '../../shared/insurance.cases.js';
import { runInsurancePageSummaryCases, runPatientPageSummaryCases } from '../../shared/appointmentSummary.cases.js';
import { runPatientInfoCases }          from '../../shared/patientInfo.cases.js';
import { runStepperCases }              from '../../shared/stepper.cases.js';
import { runExistingPatientCases }      from '../../shared/existingPatient.cases.js';
import { CLIENTS }                      from '../../../config/clients.js';

const { test, expect }                   = makeNewPatientFixtures('KRONSON');
const { test: epTest, expect: epExpect } = makeExistingPatientFixtures('KRONSON');

// ── Landing ───────────────────────────────────────────────────────────────────
// Only one reason: Vein Consult. Left panel shows Kronson Vein Institute + address.
runLandingCases(test, expect, {
    reason:       CLIENTS.KRONSON.reason,   // 'Vein Consult'
    phoneNumber:  CLIENTS.KRONSON.phone,    // '626-254-2287'
    locationName: 'Kronson Vein Institute',
    anyUrl:       'https://stage.setter.layline.live/kronsonveininstitute/1/any/landing',
});

// ── Find Appointment — SINY/Clarus layout with only 2 filter dropdowns ────────
// Basic Search: Location(Arcadia) + Appointment Reason(Vein Consult) + Gender checkboxes
// NO Provider dropdown (hasProviderDropdown: false). Provider cards + Show More present.
// Gray option tests pass gracefully (no gray locations/providers for Kronson Vein Consult).
runFindAppointmentCases(test, expect, {
    expectedServiceType:  CLIENTS.KRONSON.reason,   // 'Vein Consult'
    nextPageAfterSlot:    'insurance',
    hasProviderDropdown:  false,   // Kronson has only Location + Reason filters, no Provider filter
});

// ── Insurance ─────────────────────────────────────────────────────────────────
// Confirmed: same 5 types, MUI Select, file upload built in, no Skip button.
// Kronson error messages use ":text-matches" selector (inline red text, no <p> tag).
const kronsonErrorSelector = ':text-matches("to proceed|is required", "i")';

runInsuranceCases(test, expect, {
    insuranceTypes:              ['Medicaid', 'Medicare', 'Tricare', 'Private or Employer Insurance'],
    defaultInsuranceType:        'Private or Employer Insurance',
    hasInsuranceGating:          false,   // Next is always enabled
    hasAutocompleteSearch:       false,   // MUI Select, not autocomplete
    hasPlanAutocomplete:         false,   // File upload based, not typed plan search
    hasSkipButton:               false,   // No Skip button visible
    hasTakePicture:              false,   // File upload built into form
    canCompletePrivateInsurance: false,   // Insurance plan required field blocks navigation
    errorSelector:               kronsonErrorSelector,
});

// ── Appointment summary — insurance page ──────────────────────────────────────
// Shows: provider photo + Jeffrey Kronson + Appointment Time + Appointment Type: Vein Consult
runInsurancePageSummaryCases(test, expect, {
    expectedAppointmentType: CLIENTS.KRONSON.reason,  // 'Vein Consult'
    hasProviderName:          true,   // Panel shows provider photo + name (Jeffrey Kronson)
});

// ── Appointment summary — patient info page ───────────────────────────────────
runPatientPageSummaryCases(test, expect, {
    expectedAppointmentType: CLIENTS.KRONSON.reason,  // 'Vein Consult'
    hasProviderName:          true,
});

// ── Patient Info ──────────────────────────────────────────────────────────────
// HAS address fields (Address1/2, City, State, Zip). NO referral field.
// TWO SMS consent checkboxes — first one (marketing) is checked by hasSmsConsent tests.
runPatientInfoCases(test, expect, {
    hasReferral:   false,   // No "How did you hear about us" field
    hasSmsConsent: true,    // TWO SMS consent checkboxes — tests use .first()
    hasAddress:    true,    // Address1, Address2, City, State, Zip all present
    hasState:      true,    // State dropdown present
    errorSelector: kronsonErrorSelector,
});

// ── Stepper ───────────────────────────────────────────────────────────────────
runStepperCases(test, expect, {
    hasIntake:    false,   // No intake step for Kronson
    hasLocation:  false,   // Location pre-filled from URL slug, no separate Location step
    hasInsurance: true,    // Add Insurance step present
});

// ── Existing Patient ──────────────────────────────────────────────────────────
const { existingPatient } = CLIENTS.KRONSON;
runExistingPatientCases(epTest, epExpect, existingPatient);
