# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\booking\create-appointment.spec.js >> TC01 — fills and submits the full form with all valid data
- Location: tests\e2e\booking\create-appointment.spec.js:75:1

# Error details

```
ReferenceError: patient is not defined
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | import { LoginPage } from '../../../pages/LoginPage';
  4  | import { LandingPage } from '../../../pages/LandingPage';
  5  | import { SlotPage } from '../../../pages/SlotPage';
  6  | import { IntakePage } from '../../../pages/IntakePage';
  7  | import { InsurancePage } from '../../../pages/InsurancePage';
  8  | import { PatientInfoPage } from '../../../pages/PatientInfoPage';
  9  | 
  10 | // test('Setter Booking Flow (POM)', async ({ page }) => {
  11 | 
  12 | //     test.setTimeout(180000);
  13 | 
  14 | //     const login = new LoginPage(page);
  15 | //     const landing = new LandingPage(page);
  16 | //     const slot = new SlotPage(page);
  17 | //     const intake = new IntakePage(page);
  18 | //     const insurance = new InsurancePage(page);
  19 | //     const patient = new PatientInfoPage(page);
  20 | 
  21 | //     // LOGIN
  22 | //     // await login.goto();
  23 | //     // await login.login('bantony@layline.live', 'Deepdive2@2!');
  24 | 
  25 | //     // LANDING
  26 | //     await landing.open('https://stage.setter.layline.live/thenerveanddiscinstitute/1/thenerveanddiscinstitutefarmington/landing');
  27 | //     await landing.startNewPatient();
  28 | 
  29 | //     // SLOT
  30 | //     await slot.clickAnySlot();
  31 | //     await slot.continue();
  32 | 
  33 | //     // INTAKE
  34 | //     await intake.selectSymptoms();
  35 | //     await intake.answerNoQuestions();
  36 | //     await intake.continue();
  37 | 
  38 | //     // INSURANCE
  39 | //     await insurance.selectSelfPay();
  40 | //     await insurance.manualEntry();
  41 | //     await insurance.selectPlan();
  42 | //     await insurance.fillPlanDetails();
  43 | //     await insurance.continue();
  44 | 
  45 | //     // PATIENT INFO
  46 | //     await patient.fillBasicInfo({
  47 | //         firstName: "John",
  48 | //         lastName: "Doe",
  49 | //         email: "johndoe@example.com",
  50 | //         phone: "5551234567",
  51 | //         address: "123 Main St",
  52 | //         city: "Farmington Hills",
  53 | //         zip: "48335"
  54 | //     });
  55 | 
  56 | //     await patient.fillDOB("01/15/1990");
  57 | //     await patient.selectGender("Male");
  58 | //     await patient.selectState("MI");
  59 | //     await patient.selectReferral("Doctor");
  60 | //     await patient.selectReferralOther("Dr. Smith");
  61 | //     await patient.checkSmsConsent();
  62 | 
  63 | //     await patient.submit();
  64 | 
  65 | //     const response = await page.waitForResponse(res =>
  66 | //         res.url().includes('bookAppointment') &&
  67 | //         res.request().method() === 'PUT'
  68 | //     );
  69 | 
  70 | //     expect(response.status()).toBe(201);
  71 | // });
  72 | 
  73 | 
  74 | 
  75 | test('TC01 — fills and submits the full form with all valid data', async ({ page }) => {
  76 | 
> 77 |     await patient.open('https://stage.setter.layline.live/thenerveanddiscinstitute/1/thenerveanddiscinstitutefarmington/additionaldetails');
     |     ^ ReferenceError: patient is not defined
  78 |     const patientPage = new PatientInfoPage(page);
  79 | 
  80 |     await patientPage.fillAll(VALID_PATIENT);
  81 | 
  82 |     // Assert every field holds the expected value before submitting
  83 |     await expect(patientPage.firstName).toHaveValue(VALID_PATIENT.basicInfo.firstName);
  84 |     await expect(patientPage.lastName).toHaveValue(VALID_PATIENT.basicInfo.lastName);
  85 |     await expect(patientPage.email).toHaveValue(VALID_PATIENT.basicInfo.email);
  86 |     await expect(patientPage.address1).toHaveValue(VALID_PATIENT.basicInfo.address);
  87 |     await expect(patientPage.city).toHaveValue(VALID_PATIENT.basicInfo.city);
  88 |     await expect(patientPage.zip).toHaveValue(String(VALID_PATIENT.basicInfo.zip));
  89 | 
  90 |     await patientPage.submit();
  91 |     // Expect navigation away from the additionaldetails page
  92 |     await expect(page).not.toHaveURL(/additionaldetails/);
  93 | });
  94 | 
  95 | 
```