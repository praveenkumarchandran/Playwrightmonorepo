# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\SINY\medical.spec.js >> Primary Insurance Holder >> TC-INS-H02 — selecting "Self" as holder hides the insured name / DOB fields
- Location: tests\e2e\shared\insurance.cases.js:234:17

# Error details

```
TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('[aria-haspopup="listbox"]').filter({ hasText: /Primary Insurance Holder|Self|Spouse|Other/i }).first() to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e7]:
        - img "logo" [ref=e9]
        - heading "718-491-5800" [level=6] [ref=e12]
    - generic [ref=e16]:
      - generic [ref=e18]:
        - button "1" [ref=e20] [cursor=pointer]:
          - paragraph [ref=e21]: "1"
        - paragraph [ref=e24]: Location
      - generic [ref=e28]:
        - button "2" [ref=e30] [cursor=pointer]:
          - paragraph [ref=e31]: "2"
        - paragraph [ref=e34]: Intake Questions
      - generic [ref=e38]:
        - button "3" [ref=e40] [cursor=pointer]:
          - paragraph [ref=e41]: "3"
        - paragraph [ref=e44]: Choose Date & Time
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
      - img "provider" [ref=e73]
      - heading "Alexa McGhee" [level=5] [ref=e74]
      - separator [ref=e75]
      - generic [ref=e76]:
        - generic [ref=e77]:
          - heading "Appointment Time" [level=6] [ref=e78]
          - paragraph [ref=e80]: 9:10 AM, Thu Jun 11, 2026
        - generic [ref=e81]:
          - heading "Appointment Type" [level=6] [ref=e82]
          - paragraph [ref=e84]: Skin Problem
    - generic [ref=e86]:
      - generic [ref=e87]:
        - heading "Insurance Policy" [level=5] [ref=e88]
        - heading "If you do not see your insurance plan, please call us for assistance" [level=6] [ref=e89]
        - generic [ref=e91]:
          - generic [ref=e92]: Insurance Type
          - generic [ref=e93]:
            - combobox "Insurance Type Insurance" [ref=e94]: Private or Employer Insurance
            - button "Open" [ref=e96] [cursor=pointer]:
              - img [ref=e97]
            - group:
              - generic: Insurance Type
        - paragraph [ref=e99]: How would you like to provide your insurance details?
        - generic [ref=e100]:
          - button "Take Picture of Card" [ref=e102] [cursor=pointer]:
            - img [ref=e104]
            - text: Take Picture of Card
          - button "Manually Enter Details" [active] [ref=e107] [cursor=pointer]:
            - img [ref=e109]
            - text: Manually Enter Details
        - generic [ref=e114]:
          - generic [ref=e117]:
            - generic [ref=e118]: Insurance
            - generic [ref=e119]:
              - combobox "Insurance" [ref=e120]
              - button "Open" [ref=e122] [cursor=pointer]:
                - img [ref=e123]
              - group:
                - generic: Insurance
          - generic [ref=e126]:
            - generic: Group ID
            - generic [ref=e127]:
              - textbox "Group ID Member ID" [ref=e128]:
                - /placeholder: Group ID
              - group:
                - generic: Group ID
          - generic [ref=e130]:
            - generic: Member ID
            - generic [ref=e131]:
              - textbox "Member ID" [ref=e132]
              - group:
                - generic: Member ID
          - generic [ref=e135]:
            - generic [ref=e136]: Primary Insurance Holder
            - generic [ref=e137]:
              - combobox "Primary Insurance Holder" [ref=e138]
              - button "Open" [ref=e140] [cursor=pointer]:
                - img [ref=e141]
              - group:
                - generic: Primary Insurance Holder
      - generic [ref=e143]:
        - button "Next" [ref=e144] [cursor=pointer]
        - button "Skip" [ref=e145] [cursor=pointer]: Skip
```

# Test source

```ts
  16  |         this.genderTrigger = page.locator('div#gender[role="combobox"]');
  17  | 
  18  |         // "How would you like to provide your insurance details?" — two side-by-side buttons
  19  |         this.takePictureBtn = page.locator('button:has-text("Take Picture of Card")');
  20  |         this.manualEntryBtn = page.locator('button:has-text("Manually Enter Details")');
  21  | 
  22  |         // ── Primary Insurance Holder section ──────────────────────────────────
  23  |         // Appears after clicking Manually Enter Details.
  24  |         // Holder options: Self | Spouse | Other
  25  |         // When Spouse or Other is selected, extra insured fields appear.
  26  |         //
  27  |         // field name attrs confirmed from fillInsuranceDetails() — reliable across UI styles
  28  |         this.insuredFirstName = page.locator('input[name="insurance_person_firstname-input"]');
  29  |         this.insuredLastName  = page.locator('input[name="insurance_person_lastname-input"]');
  30  |         // Insured DOB — calendar date picker (type="date") that appears for Spouse/Other
  31  |         this.insuredDOB = page.locator('input[placeholder="Date of Birth"], input[type="date"]').first();
  32  | 
  33  |         this.nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
  34  |     }
  35  | 
  36  |     async selectInsuranceType(type) {
  37  |         const hasAutocomplete = await this.insuranceInput
  38  |             .isVisible({ timeout: 5_000 })
  39  |             .catch(() => false);
  40  | 
  41  |         if (hasAutocomplete) {
  42  |             // TNDI / Clarus — MUI Autocomplete: type to filter
  43  |             await this.insuranceInput.click();
  44  |             await this.insuranceInput.fill(type);
  45  |             const option = this.page.locator(`.MuiAutocomplete-option:has-text("${type}")`);
  46  |             await option.waitFor({ state: 'visible', timeout: 10_000 });
  47  |             await option.click();
  48  |         } else {
  49  |             // Kronson-style — MUI Select: click trigger, pick from listbox
  50  |             await this.insuranceSelect.waitFor({ state: 'visible', timeout: 10_000 });
  51  |             await this.insuranceSelect.click();
  52  |             const option = this.page
  53  |                 .locator('[role="option"], li[role="option"]')
  54  |                 .filter({ hasText: type })
  55  |                 .first();
  56  |             await option.waitFor({ state: 'visible', timeout: 10_000 });
  57  |             await option.click();
  58  |         }
  59  |     }
  60  | 
  61  |     async selectSelfPay() {
  62  |         await this.selectInsuranceType('Self-pay');
  63  |     }
  64  | 
  65  |     async manualEntry() {
  66  |         await this.manualEntryBtn.waitFor({ state: 'visible', timeout: 10_000 });
  67  |         await this.manualEntryBtn.click();
  68  |     }
  69  | 
  70  |     async selectPlan(value = 'Other') {
  71  |         await this.planInput.waitFor({ state: 'visible', timeout: 10_000 });
  72  |         await this.planInput.fill(value);
  73  |         const option = this.page.locator(`.MuiAutocomplete-option:has-text("${value}")`);
  74  |         await option.waitFor({ state: 'visible', timeout: 10_000 });
  75  |         await option.click();
  76  |     }
  77  | 
  78  |     async fillPlanDetails(name = 'Test Insurance Co.') {
  79  |         await this.planNameInput.waitFor({ state: 'visible', timeout: 10_000 });
  80  |         await this.planNameInput.fill(name);
  81  |     }
  82  | 
  83  |     async fillDOBInsurance(dob) {
  84  |         await this.dob.click();
  85  |         await this.dob.pressSequentially(dob.replace(/\D/g, ''), { delay: 80 });
  86  |     }
  87  | 
  88  |     /**
  89  |      * Select the Primary Insurance Holder value (Self / Spouse / Other).
  90  |      *
  91  |      * MUI Select triggers in SINY use role="button" aria-haspopup="listbox" — NOT role="combobox".
  92  |      * The trigger is identified by its placeholder text "Primary Insurance Holder" so it is
  93  |      * not confused with the Insurance Type or Insurance Plan dropdowns on the same page.
  94  |      *
  95  |      * Autocomplete clients (TNDI/Clarus): holder is an autocomplete combobox input.
  96  |      */
  97  |     async selectPrimaryHolder(value) {
  98  |         const hasAutocomplete = await this.insuranceInput
  99  |             .isVisible({ timeout: 3_000 })
  100 |             .catch(() => false);
  101 | 
  102 |         let trigger;
  103 |         if (hasAutocomplete) {
  104 |             // Autocomplete client (TNDI/Clarus)
  105 |             trigger = this.page.locator('[role="combobox"]')
  106 |                 .filter({ hasText: /Self|Spouse|Other/i })
  107 |                 .first();
  108 |         } else {
  109 |             // MUI Select client (SINY) — trigger uses aria-haspopup="listbox", not role="combobox".
  110 |             // Filter by placeholder text to distinguish from the Insurance Type / Plan dropdowns.
  111 |             trigger = this.page.locator('[aria-haspopup="listbox"]')
  112 |                 .filter({ hasText: /Primary Insurance Holder|Self|Spouse|Other/i })
  113 |                 .first();
  114 |         }
  115 | 
> 116 |         await trigger.waitFor({ state: 'visible', timeout: 10_000 });
      |                       ^ TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
  117 |         await trigger.click();
  118 | 
  119 |         const option = this.page.locator('[role="option"]').filter({ hasText: value }).first();
  120 |         await option.waitFor({ state: 'visible', timeout: 5_000 });
  121 |         await option.click();
  122 |         console.log(`Primary Insurance Holder set to: ${value}`);
  123 |     }
  124 | 
  125 |     async selectGenderInsurance(value = 'Male') {
  126 |         await this.genderTrigger.click();
  127 | 
  128 |         const option = this.page
  129 |             .locator('[role="option"]')
  130 |             .filter({ hasText: value })
  131 |             .first();
  132 | 
  133 |         await option.waitFor({ state: 'visible', timeout: 10_000 });
  134 |         await option.click();
  135 |     }
  136 | 
  137 |     async fillInsuranceDetails() {
  138 |         const insuranceInput = this.page.locator('input[aria-autocomplete="list"]').last();
  139 |         await insuranceInput.waitFor({ state: 'visible', timeout: 10_000 });
  140 |         await insuranceInput.fill('Connecticare');
  141 |         const insuranceOption = this.page.locator('.MuiAutocomplete-option').first();
  142 |         await insuranceOption.waitFor({ state: 'visible', timeout: 10_000 });
  143 |         await insuranceOption.click();
  144 | 
  145 |         await this.page.fill('input[name="insurance_group_id"]', '12345678');
  146 |         await this.page.fill('input[name="insurance_member_id"]', '11');
  147 | 
  148 |         await this.page.click('text=Spouse');
  149 |         await this.page.click('.MuiAutocomplete-option:has-text("Spouse")');
  150 | 
  151 |         await this.page.fill('input[name="insurance_person_firstname-input"]', 'eweee');
  152 |         await this.page.fill('input[name="insurance_person_lastname-input"]', 'eeee');
  153 | 
  154 |         await this.page.click('text=Male');
  155 |         await this.page.click('.MuiAutocomplete-option:has-text("Male")');
  156 | 
  157 |         await this.fillDOBInsurance('01011990');
  158 |     }
  159 | 
  160 |     async continue() {
  161 |         await this.nextBtn.waitFor({ state: 'visible', timeout: 10_000 });
  162 |         await this.nextBtn.click();
  163 |     }
  164 | 
  165 |     async completeInsurance(type = 'Self-pay') {
  166 |         await this.selectInsuranceType(type);
  167 | 
  168 |         if (type !== 'Self-pay') {
  169 |             await this.manualEntry();
  170 |             await this.fillInsuranceDetails();
  171 |         }
  172 | 
  173 |         await this.continue();
  174 |     }
  175 | }
  176 | 
```