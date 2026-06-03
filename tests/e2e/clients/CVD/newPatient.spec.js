/**
 * CVD — New Patient tests
 * Flow: Landing → SlotFilter → Slot → Insurance → PatientInfo (no intake)
 *
 * TODO: Fill in CVD URL and slot filter values in tests/config/clients.js first.
 */

import { makeNewPatientFixtures } from '../../../fixtures/newPatient.fixture.js';
import { runInsuranceCases }      from '../../shared/insurance.cases.js';
import { runPatientInfoCases }    from '../../shared/patientInfo.cases.js';

const { test, expect } = makeNewPatientFixtures('CVD');

// No runIntakeCases — CVD has no intake page
runInsuranceCases(test, expect, {
    insuranceTypes: ['Insurance', 'Medicare', 'Medicaid'],
});
runPatientInfoCases(test, expect);
