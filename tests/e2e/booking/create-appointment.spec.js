import { test, expect } from '../../fixtures/booking.fixture';

import { LoginPage } from '../../../pages/LoginPage';
import { LandingPage } from '../../../pages/LandingPage';
import { SlotPage } from '../../../pages/SlotPage';
import { IntakePage } from '../../../pages/IntakePage';
import { InsurancePage } from '../../../pages/InsurancePage';
import { PatientInfoPage } from '../../../pages/PatientInfoPage';
import { runPatientInfoCases } from './shared/patientInfo.cases';
import { runIntakeCases } from './shared/intake.cases';

// test('Setter Booking Flow (POM)', async ({ page }) => {

//     test.setTimeout(180000);

//     const login = new LoginPage(page);
//     const landing = new LandingPage(page);
//     const slot = new SlotPage(page);
//     const intake = new IntakePage(page);
//     const insurance = new InsurancePage(page);
//     const patient = new PatientInfoPage(page);

//     // LOGIN
//     // await login.goto();
//     // await login.login('bantony@layline.live', 'Deepdive2@2!');

//     // LANDING
//     await landing.open('https://stage.setter.layline.live/thenerveanddiscinstitute/1/thenerveanddiscinstitutefarmington/landing');
//     await landing.startNewPatient();

//     // SLOT
//     await slot.clickAnySlot();
//     await slot.continue();

//     // INTAKE
//     await intake.selectSymptoms();
//     await intake.answerNoQuestions();
//     await intake.continue();

//     // INSURANCE
//     await insurance.selectSelfPay();
//     await insurance.manualEntry();
//     await insurance.selectPlan();
//     await insurance.fillPlanDetails();
//     await insurance.continue();

//     // PATIENT INFO
//     await patient.fillBasicInfo({
//         firstName: "John",
//         lastName: "Doe",
//         email: "johndoe@example.com",
//         phone: "5551234567",
//         address: "123 Main St",
//         city: "Farmington Hills",
//         zip: "48335"
//     });

//     await patient.fillDOB("01/15/1990");
//     await patient.selectGender("Male");
//     await patient.selectState("MI");
//     await patient.selectReferral("Doctor");
//     await patient.selectReferralOther("Dr. Smith");
//     await patient.checkSmsConsent();

//     await patient.submit();

//     const response = await page.waitForResponse(res =>
//         res.url().includes('bookAppointment') &&
//         res.request().method() === 'PUT'
//     );

//     expect(response.status()).toBe(201);
// });

// const VALID_PATIENT = {
//     basicInfo: {
//         firstName: 'John',
//         lastName: 'Doe',
//         email: 'johndoe@example.com',
//         phone: '5551234567',
//         address: '123 Main St',
//         city: 'Farmington Hills',
//         zip: '48335',
//     },
//     dob: '01151990',
//     gender: 'Male',
//     state: 'MI-Michigan',
//     referral: 'Google',
//     smsConsent: true,
// };



// test('TC01 — fills and submits the full form with all valid data', async ({ patientPage, page }) => {

//     await patientPage.fillAll(VALID_PATIENT);

//     await expect(patientPage.firstName).toHaveValue(VALID_PATIENT.basicInfo.firstName);
//     await expect(patientPage.lastName).toHaveValue(VALID_PATIENT.basicInfo.lastName);
//     await expect(patientPage.email).toHaveValue(VALID_PATIENT.basicInfo.email);
//     await expect(patientPage.address1).toHaveValue(VALID_PATIENT.basicInfo.address);
//     await expect(patientPage.city).toHaveValue(VALID_PATIENT.basicInfo.city);
//     await expect(patientPage.zip).toHaveValue(String(VALID_PATIENT.basicInfo.zip));

//     await patientPage.selectReferral("Doctor");
//     await patientPage.selectReferralOther("Dr. Smith");
//     await patientPage.checkSmsConsent();

//     // await patientPage.submit();

//     await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => { });
//     console.log('URL after booking:', page.url());

//     // await expect(page).not.toHaveURL(/thankyou/);
// });

// runPatientInfoCases(test, expect);
runIntakeCases(test, expect);