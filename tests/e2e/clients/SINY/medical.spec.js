/**
 * SINY Dermatology — Medical — New Patient tests
 * Flow: Landing → Intake → Slot → Insurance → PatientInfo
 *
 * Landing: Reason="Skin Problem" → Service Type sub-dropdown (e.g. "Acne")
 *          → Location pre-filled from URL slug → New Patient → Intake
 *
 * NOTE: Intake comes BEFORE slot date/time pick (unique to SINY).
 * Stepper: Location(1) → Intake Questions(2) → Choose Date & Time(3) → Add Insurance(4) → Add Info(5)
 */

import { makeNewPatientFixtures, makeExistingPatientFixtures } from '../../../fixtures/newPatient.fixture.js';
import { runIntakeCases }            from '../../shared/intake.cases.js';
import { runInsuranceCases }         from '../../shared/insurance.cases.js';
import { runPatientInfoCases }       from '../../shared/patientInfo.cases.js';
import { runStepperCases }           from '../../shared/stepper.cases.js';
import { runSINYLandingCases }       from '../../shared/sinyLanding.cases.js';
import { runExistingPatientCases }   from '../../shared/existingPatient.cases.js';
import { runFindAppointmentCases }   from '../../shared/findAppointment.cases.js';
import { runBrowserBackCases }       from '../../shared/browserBack.cases.js';
import { runPageRefreshCases }       from '../../shared/pageRefresh.cases.js';
import { runDirectUrlCases }         from '../../shared/directUrl.cases.js';
import { runInsurancePageSummaryCases, runPatientPageSummaryCases } from '../../shared/appointmentSummary.cases.js';
import { CLIENTS }                   from '../../../config/clients.js';

const { test, expect }                   = makeNewPatientFixtures('SINY_MEDICAL');
const { test: epTest, expect: epExpect } = makeExistingPatientFixtures('SINY_MEDICAL');

runSINYLandingCases(test, expect, {
    reason:       'Skin Problem',
    phoneNumber:  CLIENTS.SINY_MEDICAL.phone,  // '718-491-5800'
    locationName: 'SINY Dermatology',
    anyUrl:       'https://stage.setter.layline.live/sinydermatology/1/any/landing',
});
runIntakeCases(test, expect, { intakeType: 'siny' });
runInsuranceCases(test, expect, {
    // Confirmed from screenshots — MUI Select with these exact 4 non-self-pay types:
    insuranceTypes:        ['Medicaid', 'Medicare', 'Tricare', 'Private or Employer Insurance'],
    defaultInsuranceType:  'Private or Employer Insurance',
    hasInsuranceGating:    false,   // SINY pre-selects "Insurance" — Next is never disabled
    hasAutocompleteSearch: false,   // MUI Select for insurance type, not a typed autocomplete input
    hasPlanAutocomplete:   false,   // MUI Select for plan field too (▼ dropdown, not text search)
    hasSkipButton:         true,    // Skip button confirmed visible in screenshots
    hasTakePicture:        true,    // "Take Picture of Card" button confirmed visible
    holderOptions:         ['Self', 'Spouse', 'Other'],
    stepBeforeInsurance:   'Choose Date & Time',
    intakeStepLabel:       'Intake Questions',
    // SINY shows errors as plain text ("Insurance is required."), not Mui-error class
    errorSelector:         ':text-matches("is required|required|invalid", "i")',
    // TC-INS-13b skipped: SINY's Insurance plan dropdown is a required MUI Select that
    // needs a specific company selected — can't be completed with generic Group ID/Member ID only
    canCompletePrivateInsurance: false,
});
runPatientInfoCases(test, expect, {
    hasReferral: false,  // SINY patient info page has no "How did you hear about us" field
    // SINY patient info uses floating labels; error class may differ from TNDI/Clarus
    errorSelector: '[class*="Mui-error"], [aria-invalid="true"], :text-matches("required|invalid|must", "i")',
});
runStepperCases(test, expect, {
    hasIntake:    true,   // Intake Questions step is in the stepper
    hasLocation:  true,   // Location step is in the stepper
    hasInsurance: true,   // Add Insurance step present in medical flow
});

runFindAppointmentCases(test, expect, {
    expectedServiceType: CLIENTS.SINY_MEDICAL.serviceType,  // 'Acne'
    nextPageAfterSlot: 'insurance',
});

// Verify "Your Appointment" panel on insurance page shows correct data
// Insurance page: shows provider photo + name + Appointment Time + Appointment Type
// Panel shows the actual service booked (e.g. "Acne") NOT the main reason ("Skin Problem")
// Confirmed from screenshot: panel shows "Skin Problem" (the reason), NOT "Acne" (sub-service)
runInsurancePageSummaryCases(test, expect, {
    expectedAppointmentType: CLIENTS.SINY_MEDICAL.reason,  // 'Skin Problem' — what the panel actually shows
    hasProviderName:          true,
});

runPatientPageSummaryCases(test, expect, {
    expectedAppointmentType: CLIENTS.SINY_MEDICAL.reason,  // 'Skin Problem'
    hasProviderName:          true,
});

const { existingPatient } = CLIENTS.SINY_MEDICAL;
runExistingPatientCases(epTest, epExpect, {
    ...existingPatient,
    checkPreFill: true,
});

// ── Browser back button ───────────────────────────────────────────────────────
runBrowserBackCases(test, expect, { hasInsurance: true });

// ── Page refresh mid-flow ─────────────────────────────────────────────────────
runPageRefreshCases(test, expect, { hasInsurance: true });

// ── Direct URL access ─────────────────────────────────────────────────────────
runDirectUrlCases(test, expect, {
    landingUrl:   CLIENTS.SINY_MEDICAL.url,
    hasInsurance: true,
});
