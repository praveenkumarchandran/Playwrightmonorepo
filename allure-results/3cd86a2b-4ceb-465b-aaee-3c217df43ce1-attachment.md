# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\booking\ClarusDerm\clarus-appointment.spec.js >> Setter Booking Flow for ClarusDerm
- Location: tests\e2e\booking\ClarusDerm\clarus-appointment.spec.js:9:1

# Error details

```
TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Manually Enter Details")') to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e7]:
        - img "logo" [ref=e9]
        - heading "877-408-2431" [level=6] [ref=e12]
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
        - paragraph [ref=e44]: Add Insurance
      - generic [ref=e48]:
        - button "4" [ref=e50] [cursor=pointer]:
          - paragraph [ref=e51]: "4"
        - paragraph [ref=e54]: Add Info
  - generic [ref=e57]:
    - generic [ref=e59]:
      - heading "Your Appointment" [level=5] [ref=e60]
      - generic [ref=e62]: p
      - heading "Jesse Ochoa" [level=5] [ref=e63]
      - separator [ref=e64]
      - generic [ref=e65]:
        - generic [ref=e66]:
          - heading "Appointment Time" [level=6] [ref=e67]
          - paragraph [ref=e69]: 9:00 AM, Thu Jul 23, 2026
        - generic [ref=e70]:
          - heading "Appointment Type" [level=6] [ref=e71]
          - paragraph [ref=e73]: Acne
    - generic [ref=e75]:
      - generic [ref=e76]:
        - heading "Insurance Policy" [level=5] [ref=e77]
        - generic [ref=e79]:
          - generic [ref=e80]: Insurance Type
          - generic [ref=e81]:
            - combobox "Insurance Type" [active] [ref=e82]: Self-pay
            - button "Open" [ref=e84] [cursor=pointer]:
              - img [ref=e85]
            - group:
              - generic: Insurance Type
      - button "Next" [ref=e88] [cursor=pointer]
```

# Test source

```ts
  1   | export class InsurancePage {
  2   |     constructor(page) {
  3   |         this.page = page;
  4   | 
  5   |         this.insuranceInput = page.locator('#insurance-select-box');
  6   |         this.planInput = page.locator('input[aria-autocomplete="list"]').last();
  7   |         this.planNameInput = page.locator('input[placeholder="Other Insurance Plan"]');
  8   |         this.dob = page.locator('input[placeholder="MM/DD/YYYY"]');
  9   |         this.genderTrigger = page.locator('div#gender[role="combobox"]');
  10  |         this.manualEntryBtn = page.locator('button:has-text("Manually Enter Details")');
  11  |         this.nextBtn = page.locator('button:has-text("Next")');
  12  |     }
  13  | 
  14  |     async selectInsuranceType(type) {
  15  |         await this.insuranceInput.waitFor({ state: 'visible', timeout: 10_000 });
  16  |         await this.insuranceInput.click();
  17  |         await this.insuranceInput.fill(type);
  18  |         const option = this.page.locator(`.MuiAutocomplete-option:has-text("${type}")`);
  19  |         await option.waitFor({ state: 'visible', timeout: 10_000 });
  20  |         await option.click();
  21  |     }
  22  | 
  23  |     async selectSelfPay() {
  24  |         await this.selectInsuranceType('Self-pay');
  25  |     }
  26  | 
  27  |     async manualEntry() {
> 28  |         await this.manualEntryBtn.waitFor({ state: 'visible', timeout: 10_000 });
      |                                   ^ TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
  29  |         await this.manualEntryBtn.click();
  30  |     }
  31  | 
  32  |     async selectPlan(value = 'Other') {
  33  |         await this.planInput.waitFor({ state: 'visible', timeout: 10_000 });
  34  |         await this.planInput.fill(value);
  35  |         const option = this.page.locator(`.MuiAutocomplete-option:has-text("${value}")`);
  36  |         await option.waitFor({ state: 'visible', timeout: 10_000 });
  37  |         await option.click();
  38  |     }
  39  | 
  40  |     async fillPlanDetails(name = 'Test Insurance Co.') {
  41  |         await this.planNameInput.waitFor({ state: 'visible', timeout: 10_000 });
  42  |         await this.planNameInput.fill(name);
  43  |     }
  44  | 
  45  |     async fillDOBInsurance(dob) {
  46  |         await this.dob.click();
  47  |         await this.dob.pressSequentially(dob.replace(/\D/g, ''), { delay: 80 });
  48  |     }
  49  | 
  50  |     async selectGenderInsurance(value = 'Male') {
  51  |         await this.genderTrigger.click();
  52  | 
  53  |         const option = this.page
  54  |             .locator('[role="option"]')
  55  |             .filter({ hasText: value })
  56  |             .first();
  57  | 
  58  |         await option.waitFor({ state: 'visible', timeout: 10_000 });
  59  |         await option.click();
  60  |     }
  61  | 
  62  |     async fillInsuranceDetails() {
  63  |         const insuranceInput = this.page.locator('input[aria-autocomplete="list"]').last();
  64  |         await insuranceInput.waitFor({ state: 'visible', timeout: 10_000 });
  65  |         await insuranceInput.fill('Connecticare');
  66  |         const insuranceOption = this.page.locator('.MuiAutocomplete-option').first();
  67  |         await insuranceOption.waitFor({ state: 'visible', timeout: 10_000 });
  68  |         await insuranceOption.click();
  69  | 
  70  |         await this.page.fill('input[name="insurance_group_id"]', '12345678');
  71  |         await this.page.fill('input[name="insurance_member_id"]', '11');
  72  | 
  73  |         await this.page.click('text=Spouse');
  74  |         await this.page.click('.MuiAutocomplete-option:has-text("Spouse")');
  75  | 
  76  |         await this.page.fill('input[name="insurance_person_firstname-input"]', 'eweee');
  77  |         await this.page.fill('input[name="insurance_person_lastname-input"]', 'eeee');
  78  | 
  79  |         await this.page.click('text=Male');
  80  |         await this.page.click('.MuiAutocomplete-option:has-text("Male")');
  81  | 
  82  |         await this.fillDOBInsurance('01011990');
  83  |     }
  84  | 
  85  |     async continue() {
  86  |         await this.nextBtn.waitFor({ state: 'visible', timeout: 10_000 });
  87  |         await this.nextBtn.click();
  88  |     }
  89  | 
  90  |     async completeInsurance(type = 'Self-pay') {
  91  |         await this.selectInsuranceType(type);
  92  | 
  93  |         if (type !== 'Self-pay') {
  94  |             await this.manualEntry();
  95  |             await this.fillInsuranceDetails();
  96  |         }
  97  | 
  98  |         await this.continue();
  99  |     }
  100 | }
  101 | 
```