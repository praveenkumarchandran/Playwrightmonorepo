# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\booking\create-appointment.spec.js >> TC01 — fills and submits the full form with all valid data
- Location: tests\e2e\booking\create-appointment.spec.js:92:1

# Error details

```
Error: expect(page).not.toHaveURL(expected) failed

Expected pattern: not /additionaldetails/
Received string: "https://stage.setter.layline.live/thenerveanddiscinstitute/1/thenerveanddiscinstitutefarmington/additionaldetails"
Timeout: 5000ms

Call log:
  - Expect "not toHaveURL" with timeout 5000ms
    13 × unexpected value "https://stage.setter.layline.live/thenerveanddiscinstitute/1/thenerveanddiscinstitutefarmington/additionaldetails"

```

```yaml
- banner:
  - img "logo"
  - heading "586-416-3472" [level=6]
- button "1":
  - paragraph: "1"
- paragraph: Location
- button "2":
  - paragraph: "2"
- paragraph: Choose Date & Time
- button "3":
  - paragraph: "3"
- paragraph: Intake Questions
- button "4":
  - paragraph: "4"
- paragraph: Add Insurance
- button "5":
  - paragraph: "5"
- paragraph: Add Info
- heading "Your Appointment" [level=5]
- heading "Location" [level=6]
- paragraph: The Nerve and Disc Institute Farmington
- heading "Location Address" [level=6]
- paragraph: 24100 Drake Rd, MI 48335
- heading "Appointment Time" [level=6]
- paragraph: 8:30 AM, Mon May 25, 2026
- heading "Appointment Type" [level=6]
- paragraph: Teleconsultation
- text: First Name *
- textbox "First Name *": John
- text: Last Name *
- textbox "Last Name *": Doe
- text: Date of Birth *
- textbox "Date of Birth *":
  - /placeholder: MM/DD/YYYY
  - text: 01/15/1990
- button "Choose date, selected date is Jan 15, 1990"
- combobox "Male"
- text: Email *
- textbox "Email *": johndoe@example.com
- text: Phone *
- spinbutton "Phone *": "5551234567"
- text: Address1 *
- textbox "Address1 *": 123 Main St
- text: Address2 (Optional)
- textbox "Address2 (Optional)"
- text: City *
- textbox "City *": Farmington Hills
- combobox "State *": MI-Michigan
- button "Open"
- text: Home Zip *
- textbox "Home Zip *": "48335"
- text: How Did You Hear About Us? *
- combobox "How Did You Hear About Us? *": Doctor
- button "Open"
- text: Doctor Name *
- textbox "Doctor Name *":
  - /placeholder: Enter Doctor Name
  - text: Dr. Smith
- checkbox [checked]
- paragraph: I give permission for the practice to contact me via SMS or email. I understand that I can opt out at any time.
- button:
  - progressbar:
    - img
```

# Test source

```ts
  12  | //     test.setTimeout(180000);
  13  | 
  14  | //     const login = new LoginPage(page);
  15  | //     const landing = new LandingPage(page);
  16  | //     const slot = new SlotPage(page);
  17  | //     const intake = new IntakePage(page);
  18  | //     const insurance = new InsurancePage(page);
  19  | //     const patient = new PatientInfoPage(page);
  20  | 
  21  | //     // LOGIN
  22  | //     // await login.goto();
  23  | //     // await login.login('bantony@layline.live', 'Deepdive2@2!');
  24  | 
  25  | //     // LANDING
  26  | //     await landing.open('https://stage.setter.layline.live/thenerveanddiscinstitute/1/thenerveanddiscinstitutefarmington/landing');
  27  | //     await landing.startNewPatient();
  28  | 
  29  | //     // SLOT
  30  | //     await slot.clickAnySlot();
  31  | //     await slot.continue();
  32  | 
  33  | //     // INTAKE
  34  | //     await intake.selectSymptoms();
  35  | //     await intake.answerNoQuestions();
  36  | //     await intake.continue();
  37  | 
  38  | //     // INSURANCE
  39  | //     await insurance.selectSelfPay();
  40  | //     await insurance.manualEntry();
  41  | //     await insurance.selectPlan();
  42  | //     await insurance.fillPlanDetails();
  43  | //     await insurance.continue();
  44  | 
  45  | //     // PATIENT INFO
  46  | //     await patient.fillBasicInfo({
  47  | //         firstName: "John",
  48  | //         lastName: "Doe",
  49  | //         email: "johndoe@example.com",
  50  | //         phone: "5551234567",
  51  | //         address: "123 Main St",
  52  | //         city: "Farmington Hills",
  53  | //         zip: "48335"
  54  | //     });
  55  | 
  56  | //     await patient.fillDOB("01/15/1990");
  57  | //     await patient.selectGender("Male");
  58  | //     await patient.selectState("MI");
  59  | //     await patient.selectReferral("Doctor");
  60  | //     await patient.selectReferralOther("Dr. Smith");
  61  | //     await patient.checkSmsConsent();
  62  | 
  63  | //     await patient.submit();
  64  | 
  65  | //     const response = await page.waitForResponse(res =>
  66  | //         res.url().includes('bookAppointment') &&
  67  | //         res.request().method() === 'PUT'
  68  | //     );
  69  | 
  70  | //     expect(response.status()).toBe(201);
  71  | // });
  72  | 
  73  | const VALID_PATIENT = {
  74  |     basicInfo: {
  75  |         firstName: 'John',
  76  |         lastName: 'Doe',
  77  |         email: 'johndoe@example.com',
  78  |         phone: '5551234567',
  79  |         address: '123 Main St',
  80  |         city: 'Farmington Hills',
  81  |         zip: '48335',
  82  |     },
  83  |     dob: '01151990',
  84  |     gender: 'Male',
  85  |     state: 'MI-Michigan',
  86  |     referral: 'Google',
  87  |     smsConsent: true,
  88  | };
  89  | 
  90  | 
  91  | 
  92  | test('TC01 — fills and submits the full form with all valid data', async ({ patientPage, page }) => {
  93  | 
  94  |     // const patientPage = new PatientInfoPage(page);
  95  |     await patientPage.fillAll(VALID_PATIENT);
  96  | 
  97  | 
  98  |     // Assert every field holds the expected value before submitting
  99  |     await expect(patientPage.firstName).toHaveValue(VALID_PATIENT.basicInfo.firstName);
  100 |     await expect(patientPage.lastName).toHaveValue(VALID_PATIENT.basicInfo.lastName);
  101 |     await expect(patientPage.email).toHaveValue(VALID_PATIENT.basicInfo.email);
  102 |     await expect(patientPage.address1).toHaveValue(VALID_PATIENT.basicInfo.address);
  103 |     await expect(patientPage.city).toHaveValue(VALID_PATIENT.basicInfo.city);
  104 |     await expect(patientPage.zip).toHaveValue(String(VALID_PATIENT.basicInfo.zip));
  105 | 
  106 |     await patientPage.selectReferral("Doctor");
  107 |     await patientPage.selectReferralOther("Dr. Smith");
  108 |     await patientPage.checkSmsConsent();
  109 | 
  110 |     await patientPage.submit();
  111 |     // Expect navigation away from the additionaldetails page
> 112 |     await expect(page).not.toHaveURL(/additionaldetails/);
      |                            ^ Error: expect(page).not.toHaveURL(expected) failed
  113 | });
  114 | 
  115 | 
```