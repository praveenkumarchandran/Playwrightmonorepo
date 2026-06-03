/**
 * Hopemark Health — New Patient tests
 * Flow: Landing → SlotFilter → Slot → Intake → Insurance → PatientInfo
 *
 * Intake UI: Conditions checkboxes + "How did you hear" dropdown (no symptoms autocomplete)
 * PatientInfo: no referral / "How did you hear" field (separate from intake)
 * Insurance: Self-pay pre-selected, Skip button present
 */

import { makeNewPatientFixtures, makeExistingPatientFixtures } from '../../../fixtures/newPatient.fixture.js';
import { runIntakeCases }          from '../../shared/intake.cases.js';
import { runInsuranceCases }       from '../../shared/insurance.cases.js';
import { runPatientInfoCases }     from '../../shared/patientInfo.cases.js';
import { runStepperCases }         from '../../shared/stepper.cases.js';
import { runExistingPatientCases } from '../../shared/existingPatient.cases.js';
import { CLIENTS }                 from '../../../config/clients.js';

const { test, expect }                   = makeNewPatientFixtures('HOPEMARK');
const { test: epTest, expect: epExpect } = makeExistingPatientFixtures('HOPEMARK');

const hopemarkErrorSelector = ':text-matches("to proceed|is required", "i")';

runIntakeCases(test, expect, { intakeType: 'hopemark' });
runInsuranceCases(test, expect, {
    hasInsuranceGating:    false,  // "Insurance" type is default-visible, Next is always enabled
    hasManualEntryBtn:     false,  // Fields appear directly after selecting insurance type
    hasSkipButton:         true,   // Hopemark has a Skip button that bypasses insurance
    hasAutocompleteSearch: false,  // Hopemark uses MUI Select, not a typed autocomplete input
    insuranceTypes:        ['Insurance', 'Medicare', 'Medicaid'],
    errorSelector: hopemarkErrorSelector,
});
runPatientInfoCases(test, expect, {
    hasReferral:   false,
    errorSelector: hopemarkErrorSelector,
});
runStepperCases(test, expect, {
    hasIntake:       true,    // Hopemark has Intake Questions step
    hasLocation:     true,    // Hopemark has Location filter step
    intakeCondition: 'ADHD',  // condition chip selected during flow
});

const { existingPatient } = CLIENTS.HOPEMARK;
runExistingPatientCases(epTest, epExpect, existingPatient);
