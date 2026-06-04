/**
 * Freedman ENT — New Patient tests
 * Flow: Landing → Slot → Intake (optional) → Insurance → PatientInfo
 *
 * Landing: Single visit reason dropdown. Only ONE location (pre-filled from URL slug).
 *          Location panel: "Freedman ENT Downriver", "14600 King Rd, Riverview MI 48193"
 *          Phone: (734) 479-7310.
 *          URL uses /test/1/ path (different from other clients).
 *
 * Find Appointment: TNDI-style flat date+time layout ("Change Filters" panel).
 *   Location: "Freedman ENT Downriver" (pre-filled, only 1 location)
 *   Appointment Reason: "15 MIN OFFICE SURGERY" (and possibly other services)
 *   Date strip + "Available Time Slots" grid — same as TNDI
 *   After selecting a slot: "Selected:" confirmation + Continue button (disabled until clicked)
 *
 * Intake: OPTIONAL free-text textarea "Describe your symptoms or concerns"
 *   Continue button is already ENABLED (intake is not required — same as SINY style)
 *   No symptom checkboxes, no yes/no questions
 *
 * Insurance: Same 5 types as other clients. Next + Skip buttons.
 *   "Your Appointment" left panel shows Location + Location Address + Time + Type (TNDI-style)
 *
 * Patient Info: Standard fields (Address, City, State, Zip, Email, Phone, DOB, Gender)
 *   ONE SMS consent checkbox. No referral field visible.
 *
 * Stepper: Location(1) → Choose Date & Time(2) → Intake Questions(3) → Add Insurance(4) → Add Info(5)
 *
 * NOTE: No intake step in the original spec — CORRECTED: Freedman DOES have intake (optional textarea).
 */

import { makeNewPatientFixtures, makeExistingPatientFixtures } from '../../../fixtures/newPatient.fixture.js';
import { runLandingCases }              from '../../shared/landing.cases.js';
import { runSlotPickerCases }           from '../../shared/slotPicker.cases.js';
import { runIntakeCases }               from '../../shared/intake.cases.js';
import { runInsuranceCases }            from '../../shared/insurance.cases.js';
import { runInsurancePageSummaryCases, runPatientPageSummaryCases } from '../../shared/appointmentSummary.cases.js';
import { runPatientInfoCases }          from '../../shared/patientInfo.cases.js';
import { runStepperCases }              from '../../shared/stepper.cases.js';
import { runExistingPatientCases }      from '../../shared/existingPatient.cases.js';
import { CLIENTS }                      from '../../../config/clients.js';

const { test, expect }                   = makeNewPatientFixtures('FREEDMAN');
const { test: epTest, expect: epExpect } = makeExistingPatientFixtures('FREEDMAN');

// ── Landing ───────────────────────────────────────────────────────────────────
// Only 1 location (pre-filled from URL slug). Panel visible on slug URL.
// TODO: open the Visit reason dropdown and note all available services — add allServiceTypes
runLandingCases(test, expect, {
    reason:       CLIENTS.FREEDMAN.reason,   // '15 MIN OFFICE SURGERY'
    phoneNumber:  CLIENTS.FREEDMAN.phone,    // '(734) 479-7310'
    locationName: 'Freedman ENT Downriver',
    anyUrl:       'https://stage.setter.layline.live/test/1/any/landing',
});

// ── Slot Picker — TNDI-style flat date+time ───────────────────────────────────
// "Change Filters" panel + date strip + "Available Time Slots" grid
// After selecting: "Appointment Type: 15 MIN OFFICE SURGERY | Selected: ..."
// Continue is DISABLED until a slot is clicked — same as TNDI
// After Continue → Intake Questions (step 3)
runSlotPickerCases(test, expect, {
    expectedReason:    CLIENTS.FREEDMAN.reason,   // '15 MIN OFFICE SURGERY'
    nextPageAfterSlot: 'intake',
});

// ── Intake — OPTIONAL free-text textarea ─────────────────────────────────────
// "Describe your symptoms or concerns" textarea — ALREADY ENABLED (no required fields)
// Continue is enabled immediately without filling — same as SINY-style intake
// The intake CAN be submitted blank (continue without filling = skip it effectively)
runIntakeCases(test, expect, {
    intakeType:      'siny',   // free-text textarea, Continue already enabled
    hasClearableSearch: false, // no search autocomplete to test clearing
});

// ── Insurance ─────────────────────────────────────────────────────────────────
// Confirmed: same 5 types, MUI Select (▼), Next + Skip buttons, no Take Picture / Manual Entry
// "Your Appointment" left panel: Location + Location Address + Time + Type (TNDI-style)
const freedmanErrorSelector = '[class*="Mui-error"], [aria-invalid="true"], :text-matches("is required|required", "i")';

runInsuranceCases(test, expect, {
    insuranceTypes:              ['Medicaid', 'Medicare', 'Tricare', 'Private or Employer Insurance'],
    defaultInsuranceType:        'Private or Employer Insurance',
    hasInsuranceGating:          false,   // Next always enabled (insurance type pre-populated)
    hasAutocompleteSearch:       false,   // MUI Select (▼), not typed autocomplete
    hasPlanAutocomplete:         false,   // No plan search field visible
    hasSkipButton:               true,    // Skip button confirmed visible in screenshot
    hasTakePicture:              false,   // No Take Picture button
    canCompletePrivateInsurance: false,   // Insurance plan required — blocks navigation
    errorSelector:               freedmanErrorSelector,
});

// ── Appointment summary — insurance page ──────────────────────────────────────
// TNDI-style panel: Location + Location Address + Appointment Time + Appointment Type
runInsurancePageSummaryCases(test, expect, {
    expectedAppointmentType: CLIENTS.FREEDMAN.reason,  // '15 MIN OFFICE SURGERY'
    expectedLocation:        'Freedman ENT Downriver',
    expectedAddress:         '14600 King Rd',           // partial match
    // No provider photo (clinic-info style panel, not provider-photo style)
});

// ── Appointment summary — patient info page ───────────────────────────────────
// Same TNDI-style panel on Add Info page
runPatientPageSummaryCases(test, expect, {
    expectedAppointmentType: CLIENTS.FREEDMAN.reason,
    expectedLocation:        'Freedman ENT Downriver',
    expectedAddress:         '14600 King Rd',
});

// ── Patient Info ──────────────────────────────────────────────────────────────
// Confirmed: Address, City, State, Home Zip fields. ONE SMS consent checkbox.
// No referral field visible in screenshot.
runPatientInfoCases(test, expect, {
    hasReferral:   false,   // No "How did you hear about us" field visible
    hasSmsConsent: true,    // ONE SMS consent checkbox confirmed
    hasAddress:    true,    // Address1/2, City, State, Zip all present
    hasState:      true,    // State dropdown present
    errorSelector: freedmanErrorSelector,
});

// ── Stepper ───────────────────────────────────────────────────────────────────
// Confirmed from screenshot: Location(1) → Choose Date&Time(2) → Intake(3) → Insurance(4) → Info(5)
runStepperCases(test, expect, {
    hasIntake:    true,    // Intake Questions (step 3) confirmed
    hasLocation:  false,   // Location pre-filled from URL slug — no separate Location step
    hasInsurance: true,    // Add Insurance (step 4) confirmed
});

// ── Existing Patient ──────────────────────────────────────────────────────────
// Credentials: AmirthamJ / S / 05/05/2026 — verify these are valid in staging
const { existingPatient } = CLIENTS.FREEDMAN;
runExistingPatientCases(epTest, epExpect, existingPatient);
