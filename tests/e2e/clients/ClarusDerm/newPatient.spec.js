/**
 * Clarus Dermatology — New Patient tests
 * Flow: Landing → SlotFilter → Slot → Insurance → PatientInfo
 *
 * NOTE: No intake step — runIntakeCases is intentionally excluded.
 *
 * Fixtures available:
 *   insurancePage — stopped at Insurance step
 *   patientPage   — stopped at PatientInfo (worker-scoped, runs once)
 */

import { makeNewPatientFixtures, makeExistingPatientFixtures } from '../../../fixtures/newPatient.fixture.js';
import { runInsuranceCases }       from '../../shared/insurance.cases.js';
import { runPatientInfoCases }     from '../../shared/patientInfo.cases.js';
import { runStepperCases }         from '../../shared/stepper.cases.js';
import { runExistingPatientCases } from '../../shared/existingPatient.cases.js';
import { CLIENTS }                 from '../../../config/clients.js';

const { test, expect }                   = makeNewPatientFixtures('CLARUS_DERM');
const { test: epTest, expect: epExpect } = makeExistingPatientFixtures('CLARUS_DERM');

// No runIntakeCases — Clarus has no intake page
runInsuranceCases(test, expect, {
    insuranceTypes: ['Insurance', 'Medicare', 'Medicaid'],
});
runPatientInfoCases(test, expect);
runStepperCases(test, expect, {
    hasIntake:   false,  // Clarus has no intake step
    hasLocation: true,   // Clarus has Location filter step
});

const { existingPatient } = CLIENTS.CLARUS_DERM;
runExistingPatientCases(epTest, epExpect, existingPatient);
