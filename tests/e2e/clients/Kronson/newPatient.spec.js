/**
 * Kronson Vein Institute — New Patient tests
 * Flow: Landing → Choose Date & Time → Add Insurance → Add Info
 *
 * IMPORTANT: Kronson Arcadia location has NO online availability in staging.
 * Tests that require a completed booking (insurancePage/patientPage fixtures)
 * CANNOT run — clickAnySlot('tndi') times out with no date buttons.
 *
 * What runs:
 *   ✅ Landing tests    — work without slots
 *   ✅ Find Appointment — TC-FA-NA tests verify the no-availability message
 *   ✅ Existing Patient — starts from landing, no slot needed
 *
 * What is DISABLED (requires slots):
 *   ❌ runInsuranceCases            — insurancePage fixture needs slot pick
 *   ❌ runPatientInfoCases          — patientPage fixture needs slot pick
 *   ❌ runAppointmentSummaryCases   — uses insurancePage/patientPage fixtures
 *   ❌ runStepperCases              — stepperPage fixture needs slot pick
 *
 * TODO: Enable the disabled suites once Kronson Arcadia has online slots configured.
 *
 * Stepper: Location(1) → Choose Date & Time(2) → Add Insurance(3) → Add Info(4)
 */

import { makeNewPatientFixtures, makeExistingPatientFixtures } from '../../../fixtures/newPatient.fixture.js';
import { runLandingCases }         from '../../shared/landing.cases.js';
import { runFindAppointmentCases } from '../../shared/findAppointment.cases.js';
import { runExistingPatientCases } from '../../shared/existingPatient.cases.js';
import { CLIENTS }                 from '../../../config/clients.js';

const { test, expect }                   = makeNewPatientFixtures('KRONSON');
const { test: epTest, expect: epExpect } = makeExistingPatientFixtures('KRONSON');

// ── Landing ───────────────────────────────────────────────────────────────────
runLandingCases(test, expect, {
    reason:       CLIENTS.KRONSON.reason,   // 'Vein Consult'
    phoneNumber:  CLIENTS.KRONSON.phone,    // '626-254-2287'
    locationName: 'Kronson Vein Institute',
    anyUrl:       'https://stage.setter.layline.live/kronsonveininstitute/1/any/landing',
});

// ── Find Appointment ──────────────────────────────────────────────────────────
// Arcadia has no online availability → TC-FA-NA-01/02/03 verify the error message.
// All slot interaction tests (TC-FA-04 through TC-FA-17) skip gracefully when no slots.
runFindAppointmentCases(test, expect, {
    expectedServiceType:  CLIENTS.KRONSON.reason,   // 'Vein Consult'
    nextPageAfterSlot:    'insurance',
    hasProviderDropdown:  false,
});

// ── Insurance, PatientInfo, Stepper, AppointmentSummary — DISABLED ────────────
// All require the booking flow to complete (slotPick → insurance/patientInfo).
// Kronson Arcadia has no online slots → fixtures timeout at clickAnySlot().
// Re-enable these once Kronson has available slots in staging:
//
// const kronsonErrorSelector = ':text-matches("to proceed|is required", "i")';
// runInsuranceCases(test, expect, { ... });
// runInsurancePageSummaryCases(test, expect, { ... });
// runPatientPageSummaryCases(test, expect, { ... });
// runPatientInfoCases(test, expect, { ... });
// runStepperCases(test, expect, { ... });

// ── Existing Patient ──────────────────────────────────────────────────────────
const { existingPatient } = CLIENTS.KRONSON;
runExistingPatientCases(epTest, epExpect, existingPatient);
