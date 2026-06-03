/**
 * Freedman ENT — New Patient tests
 * Flow: Landing → SlotFilter → Slot → Insurance → PatientInfo (no intake)
 */

import { makeNewPatientFixtures, makeExistingPatientFixtures } from '../../../fixtures/newPatient.fixture.js';
import { runInsuranceCases }       from '../../shared/insurance.cases.js';
import { runPatientInfoCases }     from '../../shared/patientInfo.cases.js';
import { runExistingPatientCases } from '../../shared/existingPatient.cases.js';
import { CLIENTS }                 from '../../../config/clients.js';

const { test, expect }                   = makeNewPatientFixtures('FREEDMAN');
const { test: epTest, expect: epExpect } = makeExistingPatientFixtures('FREEDMAN');

// No runIntakeCases — Freedman has no intake page
runInsuranceCases(test, expect, {
    insuranceTypes: ['Insurance', 'Medicare', 'Medicaid'],
});
runPatientInfoCases(test, expect);

const { existingPatient } = CLIENTS.FREEDMAN;
runExistingPatientCases(epTest, epExpect, existingPatient);
