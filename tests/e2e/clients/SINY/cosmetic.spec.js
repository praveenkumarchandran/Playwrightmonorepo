/**
 * SINY Dermatology — Cosmetic — New Patient tests
 * Flow: Landing → Intake → Slot → PatientInfo  (NO insurance step)
 *
 * Landing: Reason="Cosmetic Procedure" → Service Type sub-dropdown → New Patient
 *          → "Consultation Required" popup → click "Schedule Procedure" → Intake
 *
 * Stepper: Location(1) → Intake Questions(2) → Choose Date & Time(3) → Add Info(4)
 *
 * NOTE: "Cosmetic Consultation" is an alternative path — same intake destination,
 *       different popup ("Consultation Fee Notice" → Continue). Not tested here.
 */

import { makeNewPatientFixtures, makeExistingPatientFixtures } from '../../../fixtures/newPatient.fixture.js';
import { runIntakeCases }            from '../../shared/intake.cases.js';
import { runPatientInfoCases }       from '../../shared/patientInfo.cases.js';
import { runStepperCases }           from '../../shared/stepper.cases.js';
import { runSINYLandingCases }       from '../../shared/sinyLanding.cases.js';
import { runExistingPatientCases }   from '../../shared/existingPatient.cases.js';
import { runFindAppointmentCases }   from '../../shared/findAppointment.cases.js';
import { CLIENTS }                   from '../../../config/clients.js';

const { test, expect }                   = makeNewPatientFixtures('SINY_COSMETIC');
const { test: epTest, expect: epExpect } = makeExistingPatientFixtures('SINY_COSMETIC');

runSINYLandingCases(test, expect, {
    reason:       'Cosmetic Procedure',
    popupService: 'Sclerotherapy',
    locationName: 'SINY Dermatology',  // text visible in the info panel on slug URL
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
    nextPageAfterSlot: 'patientInfo',  // Cosmetic has no insurance step → goes straight to Add Info
});

const { existingPatient } = CLIENTS.SINY_COSMETIC;
runExistingPatientCases(epTest, epExpect, existingPatient);
