/**
 * Kronson Vein Institute — New Patient tests
 * Flow: Landing → SlotFilter → Choose Date & Time → Add Insurance → Add Info
 *
 * NOTE: No intake step (confirmed from UI stepper).
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

const { test, expect }                   = makeNewPatientFixtures('KRONSON');
const { test: epTest, expect: epExpect } = makeExistingPatientFixtures('KRONSON');

// No runIntakeCases — Kronson has no intake page
// Kronson error messages are inline red text (tag unknown — not <p>).
// :text-matches() finds leaf text nodes regardless of element tag.
const kronsonErrorSelector = ':text-matches("to proceed|is required", "i")';

runInsuranceCases(test, expect, {
    hasInsuranceGating:    false,  // Kronson's Next button is enabled before selection
    hasInsuranceDOB:       false,  // Kronson insurance page has no DOB field
    hasAutocompleteSearch: false,  // Kronson uses MUI Select for insurance type, not autocomplete
    insuranceTypes:        ['Insurance', 'Medicare', 'Medicaid'],
    errorSelector:         kronsonErrorSelector,
});
runPatientInfoCases(test, expect, {
    hasReferral:   false,               // Kronson has no referral / "How did you hear" field
    errorSelector: kronsonErrorSelector,
});
runStepperCases(test, expect, {
    hasIntake:   false,  // Kronson has no intake step
    hasLocation: false,  // Kronson filters are pre-filled from URL, no Location stepper step
});

const { existingPatient } = CLIENTS.KRONSON;
runExistingPatientCases(epTest, epExpect, existingPatient);
