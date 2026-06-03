/**
 * TNDI — New Patient tests
 * Flow: Landing → Slot → Intake → Insurance → PatientInfo
 *
 * Fixtures available (from makeNewPatientFixtures):
 *   intakePage    — stopped at Intake step
 *   insurancePage — stopped at Insurance step
 *   patientPage   — stopped at PatientInfo (worker-scoped, runs once)
 */

import { makeNewPatientFixtures, makeExistingPatientFixtures } from '../../../fixtures/newPatient.fixture.js';
import { runIntakeCases }          from '../../shared/intake.cases.js';
import { runInsuranceCases }       from '../../shared/insurance.cases.js';
import { runPatientInfoCases }     from '../../shared/patientInfo.cases.js';
import { runStepperCases }         from '../../shared/stepper.cases.js';
import { runExistingPatientCases } from '../../shared/existingPatient.cases.js';
import { CLIENTS }                 from '../../../config/clients.js';

const { test, expect }                   = makeNewPatientFixtures('TNDI');
const { test: epTest, expect: epExpect } = makeExistingPatientFixtures('TNDI');

runIntakeCases(test, expect);
runInsuranceCases(test, expect, {
    insuranceTypes: ['Insurance', 'Medicare', 'Medicaid'],
});
runPatientInfoCases(test, expect);
runStepperCases(test, expect, {
    hasIntake:   true,   // TNDI has Intake Questions step
    hasLocation: false,  // TNDI has no location filter step
});

const { existingPatient } = CLIENTS.TNDI;
runExistingPatientCases(epTest, epExpect, existingPatient);
