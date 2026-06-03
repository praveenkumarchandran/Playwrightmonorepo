# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\Kronson\newPatient.spec.js >> Field validation >> TC-INS-07 — Invalid DOB format shows error
- Location: tests\e2e\shared\insurance.cases.js:66:9

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for locator('input[placeholder="MM/DD/YYYY"]')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e7]:
        - img "logo" [ref=e9]
        - heading "888-214-4110" [level=6] [ref=e12]
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
      - generic [ref=e61]:
        - generic [ref=e62]:
          - heading "Location" [level=6] [ref=e63]
          - paragraph [ref=e65]: Arcadia
        - generic [ref=e66]:
          - heading "Location Address" [level=6] [ref=e67]
          - paragraph [ref=e69]: 301 W Huntington Dr Suite 519, CA CA 91007
        - generic [ref=e70]:
          - heading "Appointment Time" [level=6] [ref=e71]
          - paragraph [ref=e73]: 12:00 PM, Wed Jun 3, 2026
        - generic [ref=e74]:
          - heading "Appointment Type" [level=6] [ref=e75]
          - paragraph [ref=e77]: Vein Consult
    - generic [ref=e79]:
      - generic [ref=e80]:
        - heading "Insurance Policy" [level=5] [ref=e81]
        - generic [ref=e83]:
          - generic [ref=e84]: Insurance Type
          - generic [ref=e85]:
            - combobox "Insurance Type Insurance" [ref=e86]: Private or Employer Insurance
            - button "Open" [ref=e88] [cursor=pointer]:
              - img [ref=e89]
            - group:
              - generic: Insurance Type
        - paragraph [ref=e91]: How would you like to provide your insurance details?
        - generic [ref=e92]:
          - button "Take Picture of Card" [ref=e94] [cursor=pointer]:
            - img [ref=e96]
            - text: Take Picture of Card
          - button "Manually Enter Details" [active] [ref=e99] [cursor=pointer]:
            - img [ref=e101]
            - text: Manually Enter Details
        - generic [ref=e106]:
          - generic [ref=e109]:
            - generic [ref=e110]: Insurance
            - generic [ref=e111]:
              - combobox "Insurance" [ref=e112]
              - button "Open" [ref=e114] [cursor=pointer]:
                - img [ref=e115]
              - group:
                - generic: Insurance
          - generic [ref=e118]:
            - generic: Group ID
            - generic [ref=e119]:
              - textbox "Group ID Member ID" [ref=e120]:
                - /placeholder: Group ID
              - group:
                - generic: Group ID
          - generic [ref=e122]:
            - generic: Member ID
            - generic [ref=e123]:
              - textbox "Member ID" [ref=e124]
              - group:
                - generic: Member ID
          - generic [ref=e127]:
            - generic [ref=e128]: Primary Insurance Holder
            - generic [ref=e129]:
              - combobox "Primary Insurance Holder" [ref=e130]
              - button "Open" [ref=e132] [cursor=pointer]:
                - img [ref=e133]
              - group:
                - generic: Primary Insurance Holder
      - button "Next" [ref=e136] [cursor=pointer]
```

# Test source

```ts
  1   | export class InsurancePage {
  2   |     constructor(page) {
  3   |         this.page = page;
  4   | 
  5   |         // MUI Autocomplete (TNDI/Clarus) — typed search input
  6   |         this.insuranceInput = page.locator('#insurance-select-box');
  7   | 
  8   |         // MUI Select (Kronson-style) — click div trigger, pick from listbox
  9   |         this.insuranceSelect = page.locator(
  10  |             '[class*="MuiSelect-select"], [class*="MuiInputBase-input"][role="combobox"]'
  11  |         ).first();
  12  | 
  13  |         this.planInput = page.locator('input[aria-autocomplete="list"]').last();
  14  |         this.planNameInput = page.locator('input[placeholder="Other Insurance Plan"]');
  15  |         this.dob = page.locator('input[placeholder="MM/DD/YYYY"]');
  16  |         this.genderTrigger = page.locator('div#gender[role="combobox"]');
  17  |         this.manualEntryBtn = page.locator('button:has-text("Manually Enter Details")');
  18  |         this.nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
  19  |     }
  20  | 
  21  |     async selectInsuranceType(type) {
  22  |         const hasAutocomplete = await this.insuranceInput
  23  |             .isVisible({ timeout: 5_000 })
  24  |             .catch(() => false);
  25  | 
  26  |         if (hasAutocomplete) {
  27  |             // TNDI / Clarus — MUI Autocomplete: type to filter
  28  |             await this.insuranceInput.click();
  29  |             await this.insuranceInput.fill(type);
  30  |             const option = this.page.locator(`.MuiAutocomplete-option:has-text("${type}")`);
  31  |             await option.waitFor({ state: 'visible', timeout: 10_000 });
  32  |             await option.click();
  33  |         } else {
  34  |             // Kronson-style — MUI Select: click trigger, pick from listbox
  35  |             await this.insuranceSelect.waitFor({ state: 'visible', timeout: 10_000 });
  36  |             await this.insuranceSelect.click();
  37  |             const option = this.page
  38  |                 .locator('[role="option"], li[role="option"]')
  39  |                 .filter({ hasText: type })
  40  |                 .first();
  41  |             await option.waitFor({ state: 'visible', timeout: 10_000 });
  42  |             await option.click();
  43  |         }
  44  |     }
  45  | 
  46  |     async selectSelfPay() {
  47  |         await this.selectInsuranceType('Self-pay');
  48  |     }
  49  | 
  50  |     async manualEntry() {
  51  |         await this.manualEntryBtn.waitFor({ state: 'visible', timeout: 10_000 });
  52  |         await this.manualEntryBtn.click();
  53  |     }
  54  | 
  55  |     async selectPlan(value = 'Other') {
  56  |         await this.planInput.waitFor({ state: 'visible', timeout: 10_000 });
  57  |         await this.planInput.fill(value);
  58  |         const option = this.page.locator(`.MuiAutocomplete-option:has-text("${value}")`);
  59  |         await option.waitFor({ state: 'visible', timeout: 10_000 });
  60  |         await option.click();
  61  |     }
  62  | 
  63  |     async fillPlanDetails(name = 'Test Insurance Co.') {
  64  |         await this.planNameInput.waitFor({ state: 'visible', timeout: 10_000 });
  65  |         await this.planNameInput.fill(name);
  66  |     }
  67  | 
  68  |     async fillDOBInsurance(dob) {
> 69  |         await this.dob.click();
      |                        ^ Error: locator.click: Test timeout of 120000ms exceeded.
  70  |         await this.dob.pressSequentially(dob.replace(/\D/g, ''), { delay: 80 });
  71  |     }
  72  | 
  73  |     async selectGenderInsurance(value = 'Male') {
  74  |         await this.genderTrigger.click();
  75  | 
  76  |         const option = this.page
  77  |             .locator('[role="option"]')
  78  |             .filter({ hasText: value })
  79  |             .first();
  80  | 
  81  |         await option.waitFor({ state: 'visible', timeout: 10_000 });
  82  |         await option.click();
  83  |     }
  84  | 
  85  |     async fillInsuranceDetails() {
  86  |         const insuranceInput = this.page.locator('input[aria-autocomplete="list"]').last();
  87  |         await insuranceInput.waitFor({ state: 'visible', timeout: 10_000 });
  88  |         await insuranceInput.fill('Connecticare');
  89  |         const insuranceOption = this.page.locator('.MuiAutocomplete-option').first();
  90  |         await insuranceOption.waitFor({ state: 'visible', timeout: 10_000 });
  91  |         await insuranceOption.click();
  92  | 
  93  |         await this.page.fill('input[name="insurance_group_id"]', '12345678');
  94  |         await this.page.fill('input[name="insurance_member_id"]', '11');
  95  | 
  96  |         await this.page.click('text=Spouse');
  97  |         await this.page.click('.MuiAutocomplete-option:has-text("Spouse")');
  98  | 
  99  |         await this.page.fill('input[name="insurance_person_firstname-input"]', 'eweee');
  100 |         await this.page.fill('input[name="insurance_person_lastname-input"]', 'eeee');
  101 | 
  102 |         await this.page.click('text=Male');
  103 |         await this.page.click('.MuiAutocomplete-option:has-text("Male")');
  104 | 
  105 |         await this.fillDOBInsurance('01011990');
  106 |     }
  107 | 
  108 |     async continue() {
  109 |         await this.nextBtn.waitFor({ state: 'visible', timeout: 10_000 });
  110 |         await this.nextBtn.click();
  111 |     }
  112 | 
  113 |     async completeInsurance(type = 'Self-pay') {
  114 |         await this.selectInsuranceType(type);
  115 | 
  116 |         if (type !== 'Self-pay') {
  117 |             await this.manualEntry();
  118 |             await this.fillInsuranceDetails();
  119 |         }
  120 | 
  121 |         await this.continue();
  122 |     }
  123 | }
  124 | 
```