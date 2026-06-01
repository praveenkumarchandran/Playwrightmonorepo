# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\booking\create-appointment.spec.js >> Date of Birth >> TC11 — fills DOB for an elderly patient
- Location: tests\e2e\booking\shared\patientInfo.cases.js:105:9

# Error details

```
Test timeout of 30000ms exceeded while setting up "patientPage".
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#insurance-select-box')
    - locator resolved to <input value="" type="text" role="combobox" autocomplete="off" spellcheck="false" aria-invalid="false" aria-expanded="false" autocapitalize="none" placeholder="Insurance" aria-autocomplete="list" id="insurance-select-box" class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall MuiInputBase-inputAdornedEnd MuiAutocomplete-input MuiAutocomplete-inputFocused css-gzuv0n"/>

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - banner [ref=e5]:
        - generic [ref=e7]:
          - img "logo" [ref=e9]
          - heading "586-416-3472" [level=6] [ref=e12]
      - generic [ref=e16]:
        - generic [ref=e18]:
          - button "1" [ref=e20] [cursor=pointer]:
            - paragraph [ref=e21]: "1"
          - paragraph [ref=e24]: Location
        - generic [ref=e28]:
          - button "2" [ref=e30] [cursor=pointer]:
            - paragraph [ref=e31]: "2"
          - paragraph [ref=e34]: Choose Date & Time
        - generic [ref=e38]:
          - button "3" [ref=e40] [cursor=pointer]:
            - paragraph [ref=e41]: "3"
          - paragraph [ref=e44]: Intake Questions
        - generic [ref=e48]:
          - button "4" [ref=e50] [cursor=pointer]:
            - paragraph [ref=e51]: "4"
          - paragraph [ref=e54]: Add Insurance
        - generic [ref=e58]:
          - button "5" [ref=e60] [cursor=pointer]:
            - paragraph [ref=e61]: "5"
          - paragraph [ref=e64]: Add Info
    - generic [ref=e67]:
      - generic [ref=e69]:
        - heading "Your Appointment" [level=5] [ref=e70]
        - generic [ref=e71]:
          - generic [ref=e72]:
            - heading "Location" [level=6] [ref=e73]
            - paragraph [ref=e75]: The Nerve and Disc Institute Farmington
          - generic [ref=e76]:
            - heading "Location Address" [level=6] [ref=e77]
            - paragraph [ref=e79]: 24100 Drake Rd, MI 48335
          - generic [ref=e80]:
            - heading "Appointment Time" [level=6] [ref=e81]
            - paragraph [ref=e83]: 8:30 AM, Fri May 29, 2026
          - generic [ref=e84]:
            - heading "Appointment Type" [level=6] [ref=e85]
            - paragraph [ref=e87]: Teleconsultation
      - generic [ref=e89]:
        - generic [ref=e90]:
          - heading "Insurance Policy" [level=5] [ref=e91]
          - generic [ref=e93]:
            - generic [ref=e94]: Insurance Type
            - generic [ref=e95]:
              - combobox "Insurance Type" [active] [ref=e96]
              - progressbar [ref=e97]:
                - img [ref=e98]
              - button "Close" [ref=e101] [cursor=pointer]:
                - img [ref=e102]
              - group:
                - generic: Insurance Type
          - paragraph [ref=e104]: How would you like to provide your insurance details?
          - generic [ref=e105]:
            - button "Take Picture of Card" [ref=e107] [cursor=pointer]:
              - img [ref=e109]
              - text: Take Picture of Card
            - button "Manually Enter Details" [ref=e112] [cursor=pointer]:
              - img [ref=e114]
              - text: Manually Enter Details
          - generic [ref=e119]:
            - generic [ref=e120]:
              - paragraph [ref=e121]: Front of Insurance card
              - generic [ref=e123] [cursor=pointer]:
                - img [ref=e124]
                - paragraph [ref=e126]: Select file to upload
                - paragraph [ref=e127]: Or drag and drop it here
            - generic [ref=e128]:
              - paragraph [ref=e129]: Back of Insurance card
              - generic [ref=e131] [cursor=pointer]:
                - img [ref=e132]
                - paragraph [ref=e134]: Select file to upload
                - paragraph [ref=e135]: Or drag and drop it here
        - button "Next" [ref=e137] [cursor=pointer]: Next
  - generic [ref=e139]: Loading…
```

# Test source

```ts
  1   | // export class InsurancePage {
  2   | //     constructor(page) {
  3   | //         this.page = page;
  4   | //     }
  5   | 
  6   | //     async selectSelfPay() {
  7   | //         await this.page.click('#insurance-select-box');
  8   | //         await this.page.fill('#insurance-select-box', 'Self');
  9   | //         await this.page.click('.MuiAutocomplete-option:has-text("Self-pay")');
  10  | //     }
  11  | 
  12  | //     async manualEntry() {
  13  | //         await this.page.click('button:has-text("Manually Enter Details")');
  14  | //     }
  15  | 
  16  | //     async selectPlan() {
  17  | //         const input = this.page.locator('input[aria-autocomplete="list"]').last();
  18  | //         await input.fill('Other');
  19  | //         await this.page.click('.MuiAutocomplete-option:has-text("Other")');
  20  | //     }
  21  | 
  22  | //     async fillPlanDetails() {
  23  | //         await this.page.fill('input[placeholder="Other Insurance Plan"]', 'Test Insurance Co.');
  24  | //     }
  25  | 
  26  | //     async continue() {
  27  | //         await this.page.click('button:has-text("Next")');
  28  | //     }
  29  | // }
  30  | 
  31  | 
  32  | 
  33  | 
  34  | export class InsurancePage {
  35  |     constructor(page) {
  36  |         this.page = page;
  37  |     }
  38  | 
  39  |     async selectInsuranceType(type) {
  40  |         await this.page.click('#insurance-select-box');
> 41  |         await this.page.fill('#insurance-select-box', type);
      |                         ^ Error: page.fill: Test timeout of 30000ms exceeded.
  42  |         await this.page.click(`.MuiAutocomplete-option:has-text("${type}")`);
  43  |     }
  44  | 
  45  |     async manualEntry() {
  46  |         await this.page.click('button:has-text("Manually Enter Details")');
  47  |     }
  48  | 
  49  |     async fillDOBInsurance(dob) {
  50  |         // Masked input — type digits one by one, fill() doesn't work
  51  |         await this.dob.click();
  52  |         await this.dob.pressSequentially(dob.replace(/\D/g, ''), { delay: 80 });
  53  |     }
  54  | 
  55  |     async selectGenderInsurance(value = 'Male') {
  56  |         await this.genderTrigger.click();
  57  | 
  58  |         const option = this.page
  59  |             .locator('[role="option"]')
  60  |             .filter({ hasText: value })
  61  |             .first();
  62  | 
  63  |         await option.waitFor({ state: 'visible', timeout: 10_000 });
  64  |         await option.click();
  65  | 
  66  |         console.log(`Gender selected: ${value}`);
  67  |     }
  68  | 
  69  |     async fillInsuranceDropdowns() {
  70  |         const option = this.page.locator('[role="option"]').filter({ hasText: insuranceType }).first();
  71  |         await option.waitFor({ state: 'visible', timeout: 10_000 });
  72  |         await option.click();
  73  |         console.log(`Reason selected: ${reasonType}`);
  74  |     }
  75  | 
  76  |     async fillInsuranceDetails() {
  77  |         // Insurance dropdown
  78  |         const insuranceInput = this.page
  79  |             .locator('input[aria-autocomplete="list"]')
  80  |             .last();
  81  | 
  82  |         await insuranceInput.fill('Connecticare');
  83  |         await this.page.click('.MuiAutocomplete-option');
  84  | 
  85  |         // Group ID
  86  |         await this.page.fill('input[name="insurance_group_id"]', '12345678');
  87  | 
  88  |         // Member ID
  89  |         await this.page.fill('input[name="insurance_member_id"]', '11');
  90  | 
  91  |         // Primary Insurance Holder
  92  |         await this.page.click('text=Spouse');
  93  |         await this.page.click('.MuiAutocomplete-option:has-text("Spouse")');
  94  | 
  95  |         // First Name
  96  |         await this.page.fill(
  97  |             'input[name="insurance_person_firstname-input"]',
  98  |             'eweee'
  99  |         );
  100 | 
  101 |         // Last Name
  102 |         await this.page.fill(
  103 |             'input[name="insurance_person_lastname-input"]',
  104 |             'eeee'
  105 |         );
  106 | 
  107 |         // Gender
  108 |         await this.page.click('text=Male');
  109 |         await this.page.click('.MuiAutocomplete-option:has-text("Male")');
  110 | 
  111 |         // DOB
  112 |         await this.fillDOB('01011990');
  113 |     }
  114 | 
  115 |     async continue() {
  116 |         await this.page.click('button:has-text("Next")');
  117 |     }
  118 | 
  119 |     async completeInsurance(type = 'Self-pay') {
  120 |         await this.selectInsuranceType(type);
  121 | 
  122 |         // Skip all fields for Self-pay
  123 |         if (type !== 'Self-pay') {
  124 |             await this.manualEntry();
  125 |             await this.fillInsuranceDetails();
  126 |         }
  127 | 
  128 |         await this.continue();
  129 |     }
  130 | }
```