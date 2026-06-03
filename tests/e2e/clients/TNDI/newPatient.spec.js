/**
 * TNDI — The Nerve and Disc Institute — New Patient tests
 * Flow: Landing → Slot → Intake → Insurance → PatientInfo
 *
 * Landing: Only one reason: "Teleconsultation". No sub-service dropdown.
 *          Slug URL (/thenerveanddiscinstitutefarmington/) shows location info panel.
 *          Phone: 586-416-3472
 *
 * Find Appointment: Flat date-strip + time-slot layout (NOT provider-card layout).
 *   "Change Filters" panel — Location + Appointment Reason (no Provider, no Gender).
 *   Date strip → "Available Time Slots" → "Selected: ..." bar → Continue.
 *   After Continue → Intake Questions (step 3)
 *
 * Insurance: Same 5 types as SINY. MUI Autocomplete (#insurance-select-box).
 *   File upload areas built into form. Next NOT gated. Plan field NOT a typed search.
 *
 * Patient Info: Has referral ("How Did You Hear About Us?"), SMS consent.
 *              NO Address / City / State / Zip fields.
 *
 * Existing Patient: DISABLED — TNDI shows popup "Existing patients are not able to
 *   schedule online at this time." Scheduler-side limitation, re-enable when fixed.
 *
 * Stepper: Location(1) → Choose Date & Time(2) → Intake Questions(3) → Add Insurance(4) → Add Info(5)
 */

import { makeNewPatientFixtures } from '../../../fixtures/newPatient.fixture.js';
import { runLandingCases }              from '../../shared/landing.cases.js';
import { runSlotPickerCases }           from '../../shared/slotPicker.cases.js';
import { runIntakeCases }               from '../../shared/intake.cases.js';
import { runInsuranceCases }            from '../../shared/insurance.cases.js';
import { runPatientInfoCases }          from '../../shared/patientInfo.cases.js';
import { runStepperCases }              from '../../shared/stepper.cases.js';
import { runInsurancePageSummaryCases, runPatientPageSummaryCases } from '../../shared/appointmentSummary.cases.js';
import { CLIENTS }                      from '../../../config/clients.js';

const { test, expect } = makeNewPatientFixtures('TNDI');

// ── Landing ───────────────────────────────────────────────────────────────────
runLandingCases(test, expect, {
    reason:       CLIENTS.TNDI.reason,   // 'Teleconsultation'
    phoneNumber:  CLIENTS.TNDI.phone,    // '586-416-3472'
    locationName: 'The Nerve and Disc Institute',
    anyUrl:       'https://stage.setter.layline.live/thenerveanddiscinstitute/1/any/landing',
});

// ── Slot Picker — flat date+time layout ──────────────────────────────────────
// "Change Filters" → date strip → "Available Time Slots" → Continue → Intake Questions
runSlotPickerCases(test, expect, {
    expectedReason:    CLIENTS.TNDI.reason,   // 'Teleconsultation'
    nextPageAfterSlot: 'intake',
});

// ── Intake ────────────────────────────────────────────────────────────────────
// TNDI shows ALL symptom checkboxes always (clearing input doesn't hide the list).
runIntakeCases(test, expect, { hasClearableSearch: false });

// ── Insurance ─────────────────────────────────────────────────────────────────
// Confirmed: same 5 types, MUI Autocomplete, Next NOT gated, no plan search, no Skip.
runInsuranceCases(test, expect, {
    insuranceTypes:              ['Medicaid', 'Medicare', 'Tricare', 'Private or Employer Insurance'],
    defaultInsuranceType:        'Private or Employer Insurance',
    hasInsuranceGating:          false,   // Next always enabled before type selection
    hasAutocompleteSearch:       true,    // #insurance-select-box autocomplete
    hasPlanAutocomplete:         false,   // Plan is file-upload based, not typed search
    hasSkipButton:               false,   // No Skip button
    hasTakePicture:              false,   // File upload built into form
    canCompletePrivateInsurance: false,   // Plan field required — blocks navigation
    errorSelector:               ':text-matches("is required|required", "i")',
});

// ── Appointment summary — insurance page (after slot selection) ───────────────
// Verifies the left panel shows: Location, Address, Appointment Time, Appointment Type
runInsurancePageSummaryCases(test, expect, {
    expectedAppointmentType: CLIENTS.TNDI.reason,        // 'Teleconsultation'
    expectedLocation:        'The Nerve and Disc Institute Farmington',
    expectedAddress:         '24100 Drake Rd',           // partial match for address
});

// ── Appointment summary — patient info page ────────────────────────────────────
// Same panel must be present on the Add Info page (step 5) confirming all chosen values
runPatientPageSummaryCases(test, expect, {
    expectedAppointmentType: CLIENTS.TNDI.reason,        // 'Teleconsultation'
    expectedLocation:        'The Nerve and Disc Institute Farmington',
    expectedAddress:         '24100 Drake Rd',
});

// ── Patient Info ──────────────────────────────────────────────────────────────
// HAS referral (Doctor/Facebook/Google/etc.), HAS SMS consent, NO address fields.
runPatientInfoCases(test, expect, {
    hasReferral:   true,
    hasSmsConsent: true,
    hasAddress:    false,  // No Address/City/Zip on TNDI patient info
    hasState:      false,  // No State field
});

// ── Stepper ───────────────────────────────────────────────────────────────────
runStepperCases(test, expect, {
    hasIntake:    true,
    hasLocation:  false,  // Pre-filled from URL slug, no Location stepper step
    hasInsurance: true,
});

// ── Existing Patient — DISABLED ───────────────────────────────────────────────
// TNDI shows popup: "Existing patients are not able to schedule online at this time.
// Please call our office to schedule your appointment."
// Scheduler-side limitation — re-enable runExistingPatientCases when fixed.
