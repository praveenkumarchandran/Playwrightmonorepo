# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\SINY\medical.spec.js >> Primary Insurance Holder >> TC-INS-H08 — switching holder from "Spouse" back to "Self" hides the insured fields again
- Location: tests\e2e\shared\insurance.cases.js:315:17

# Error details

```
TimeoutError: locator.waitFor: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('[role="option"]').filter({ hasText: 'Self' }).first() to be visible

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - banner [ref=e5]:
        - generic [ref=e7]:
          - img [ref=e9]
          - heading [level=6] [ref=e12]: 718-491-5800
      - generic [ref=e16]:
        - generic [ref=e18]:
          - button [ref=e20] [cursor=pointer]:
            - paragraph [ref=e21]: "1"
          - paragraph [ref=e24]: Location
        - generic [ref=e28]:
          - button [ref=e30] [cursor=pointer]:
            - paragraph [ref=e31]: "2"
          - paragraph [ref=e34]: Intake Questions
        - generic [ref=e38]:
          - button [ref=e40] [cursor=pointer]:
            - paragraph [ref=e41]: "3"
          - paragraph [ref=e44]: Choose Date & Time
        - generic [ref=e48]:
          - button [ref=e50] [cursor=pointer]:
            - paragraph [ref=e51]: "4"
          - paragraph [ref=e54]: Add Insurance
        - generic [ref=e58]:
          - button [ref=e60] [cursor=pointer]:
            - paragraph [ref=e61]: "5"
          - paragraph [ref=e64]: Add Info
    - generic [ref=e67]:
      - generic [ref=e69]:
        - heading [level=5] [ref=e70]: Your Appointment
        - img [ref=e73]
        - heading [level=5] [ref=e74]: Alexa McGhee
        - separator [ref=e75]
        - generic [ref=e76]:
          - generic [ref=e77]:
            - heading [level=6] [ref=e78]: Appointment Time
            - paragraph [ref=e80]: 9:30 AM, Thu Jun 11, 2026
          - generic [ref=e81]:
            - heading [level=6] [ref=e82]: Appointment Type
            - paragraph [ref=e84]: Skin Problem
      - generic [ref=e86]:
        - generic [ref=e87]:
          - heading [level=5] [ref=e88]: Insurance Policy
          - heading [level=6] [ref=e89]: If you do not see your insurance plan, please call us for assistance
          - generic [ref=e91]:
            - generic [ref=e92]: Insurance Type
            - generic [ref=e93]:
              - combobox [ref=e94]: Private or Employer Insurance
              - button [ref=e96] [cursor=pointer]:
                - img [ref=e97]
              - group:
                - generic: Insurance Type
          - paragraph [ref=e99]: How would you like to provide your insurance details?
          - generic [ref=e100]:
            - button [ref=e102] [cursor=pointer]:
              - img [ref=e104]
              - text: Take Picture of Card
            - button [ref=e107] [cursor=pointer]:
              - img [ref=e109]
              - text: Manually Enter Details
          - generic [ref=e114]:
            - generic [ref=e117]:
              - generic [ref=e118]: Insurance
              - generic [ref=e119]:
                - combobox [ref=e120]
                - button [ref=e122] [cursor=pointer]:
                  - img [ref=e123]
                - group:
                  - generic: Insurance
            - generic [ref=e126]:
              - generic: Group ID
              - generic [ref=e127]:
                - textbox [ref=e128]:
                  - /placeholder: Group ID
                - group:
                  - generic: Group ID
            - generic [ref=e130]:
              - generic: Member ID
              - generic [ref=e131]:
                - textbox [ref=e132]:
                  - /placeholder: Member ID
                - group:
                  - generic: Member ID
            - generic [ref=e135]:
              - generic [ref=e136]: Primary Insurance Holder
              - generic [ref=e137]:
                - combobox [ref=e138]: Spouse
                - button [ref=e140] [cursor=pointer]:
                  - img [ref=e141]
                - group:
                  - generic: Primary Insurance Holder
            - generic [ref=e144]:
              - generic: Name of Insured FirstName
              - generic [ref=e145]:
                - textbox [ref=e146]:
                  - /placeholder: Name of Insured FirstName
                - group:
                  - generic: Name of Insured FirstName
            - generic [ref=e148]:
              - generic: Name of Insured LastName
              - generic [ref=e149]:
                - textbox [ref=e150]:
                  - /placeholder: Name of Insured LastName
                - group:
                  - generic: Name of Insured LastName
            - generic [ref=e152]:
              - combobox [expanded] [ref=e153] [cursor=pointer]:
                - paragraph [ref=e154]: Gender
              - textbox
              - img
              - group
            - generic [ref=e156]:
              - generic: Date of Birth
              - generic [ref=e157]:
                - textbox [ref=e158]:
                  - /placeholder: MM/DD/YYYY
                - button [ref=e160] [cursor=pointer]:
                  - img [ref=e161]
                - group:
                  - generic: Date of Birth
        - generic [ref=e163]:
          - button [ref=e164] [cursor=pointer]: Next
          - button [ref=e165] [cursor=pointer]: Skip
  - listbox [ref=e168]:
    - option "Male" [active] [ref=e169] [cursor=pointer]
    - option "Female" [ref=e170] [cursor=pointer]: Female
    - option "Other / Prefer not to say" [ref=e171] [cursor=pointer]: Other / Prefer not to say
```

# Test source

```ts
  51  |     async selectInsuranceType(type) {
  52  |         const hasAutocomplete = await this.insuranceInput
  53  |             .isVisible({ timeout: 5_000 })
  54  |             .catch(() => false);
  55  | 
  56  |         if (hasAutocomplete) {
  57  |             // TNDI / Clarus — MUI Autocomplete: type to filter
  58  |             await this.insuranceInput.click();
  59  |             await this.insuranceInput.fill(type);
  60  |             const option = this.page.locator(`.MuiAutocomplete-option:has-text("${type}")`);
  61  |             await option.waitFor({ state: 'visible', timeout: 10_000 });
  62  |             await option.click();
  63  |         } else {
  64  |             // Kronson-style — MUI Select: click trigger, pick from listbox
  65  |             await this.insuranceSelect.waitFor({ state: 'visible', timeout: 10_000 });
  66  |             await this.insuranceSelect.click();
  67  |             const option = this.page
  68  |                 .locator('[role="option"], li[role="option"]')
  69  |                 .filter({ hasText: type })
  70  |                 .first();
  71  |             await option.waitFor({ state: 'visible', timeout: 10_000 });
  72  |             await option.click();
  73  |         }
  74  |     }
  75  | 
  76  |     async selectSelfPay() {
  77  |         await this.selectInsuranceType('Self-pay');
  78  |     }
  79  | 
  80  |     async manualEntry() {
  81  |         await this.manualEntryBtn.waitFor({ state: 'visible', timeout: 10_000 });
  82  |         await this.manualEntryBtn.click();
  83  |     }
  84  | 
  85  |     async selectPlan(value = 'Other') {
  86  |         await this.planInput.waitFor({ state: 'visible', timeout: 10_000 });
  87  |         await this.planInput.fill(value);
  88  |         const option = this.page.locator(`.MuiAutocomplete-option:has-text("${value}")`);
  89  |         await option.waitFor({ state: 'visible', timeout: 10_000 });
  90  |         await option.click();
  91  |     }
  92  | 
  93  |     async fillPlanDetails(name = 'Test Insurance Co.') {
  94  |         await this.planNameInput.waitFor({ state: 'visible', timeout: 10_000 });
  95  |         await this.planNameInput.fill(name);
  96  |     }
  97  | 
  98  |     async fillDOBInsurance(dob) {
  99  |         await this.dob.click();
  100 |         await this.dob.pressSequentially(dob.replace(/\D/g, ''), { delay: 80 });
  101 |     }
  102 | 
  103 |     /**
  104 |      * Select the Primary Insurance Holder value (Self / Spouse / Other).
  105 |      *
  106 |      * MUI Select triggers in SINY use role="button" aria-haspopup="listbox" — NOT role="combobox".
  107 |      * The trigger is identified by its placeholder text "Primary Insurance Holder" so it is
  108 |      * not confused with the Insurance Type or Insurance Plan dropdowns on the same page.
  109 |      *
  110 |      * Autocomplete clients (TNDI/Clarus): holder is an autocomplete combobox input.
  111 |      */
  112 |     async selectPrimaryHolder(value) {
  113 |         const hasAutocomplete = await this.insuranceInput
  114 |             .isVisible({ timeout: 3_000 })
  115 |             .catch(() => false);
  116 | 
  117 |         let trigger;
  118 |         if (hasAutocomplete) {
  119 |             // Autocomplete client (TNDI/Clarus)
  120 |             trigger = this.page.locator('[role="combobox"]')
  121 |                 .filter({ hasText: /Self|Spouse|Other/i })
  122 |                 .first();
  123 |         } else {
  124 |             // MUI Select client (SINY).
  125 |             //
  126 |             // First call  (no holder selected yet):
  127 |             //   Primary Holder is the LAST MUI Select — Gender not yet visible.
  128 |             //   Placeholder "Primary Insurance Holder" is CSS-rendered (not in textContent).
  129 |             //
  130 |             // Second call (e.g. switching Spouse → Self):
  131 |             //   Gender dropdown now appears as the LAST MUI Select, making .last() wrong.
  132 |             //   But the Primary Holder now shows the previously selected value ("Spouse" /
  133 |             //   "Other") as REAL textContent — so we can filter by it reliably.
  134 |             const holderByValue = this.page.locator(
  135 |                 '[class*="MuiSelect-select"], [class*="MuiInputBase-input"][role="combobox"]'
  136 |             ).filter({ hasText: /^(Self|Spouse|Other)$/ }).first();
  137 | 
  138 |             const hasExistingValue = await holderByValue.isVisible({ timeout: 1_000 }).catch(() => false);
  139 | 
  140 |             trigger = hasExistingValue
  141 |                 ? holderByValue   // re-selection — holder already shows a value
  142 |                 : this.page.locator(
  143 |                       '[class*="MuiSelect-select"], [class*="MuiInputBase-input"][role="combobox"]'
  144 |                   ).last();       // first selection — Primary Holder is last (Gender not yet shown)
  145 |         }
  146 | 
  147 |         await trigger.waitFor({ state: 'visible', timeout: 10_000 });
  148 |         await trigger.click();
  149 | 
  150 |         const option = this.page.locator('[role="option"]').filter({ hasText: value }).first();
> 151 |         await option.waitFor({ state: 'visible', timeout: 5_000 });
      |                      ^ TimeoutError: locator.waitFor: Timeout 5000ms exceeded.
  152 |         await option.click();
  153 |         console.log(`Primary Insurance Holder set to: ${value}`);
  154 |     }
  155 | 
  156 |     async selectGenderInsurance(value = 'Male') {
  157 |         await this.genderTrigger.click();
  158 | 
  159 |         const option = this.page
  160 |             .locator('[role="option"]')
  161 |             .filter({ hasText: value })
  162 |             .first();
  163 | 
  164 |         await option.waitFor({ state: 'visible', timeout: 10_000 });
  165 |         await option.click();
  166 |     }
  167 | 
  168 |     /**
  169 |      * Select the insured person's Gender (appears after Spouse/Other holder is selected).
  170 |      * After Spouse/Other is chosen, Gender becomes the LAST MUI Select on the page
  171 |      * (Insurance Type → Insurance Plan → Primary Holder → Gender).
  172 |      * Same selector as selectPrimaryHolder but called AFTER holder is set.
  173 |      */
  174 |     async selectInsuredGender(value = 'Male') {
  175 |         const trigger = this.page.locator(
  176 |             '[class*="MuiSelect-select"], [class*="MuiInputBase-input"][role="combobox"]'
  177 |         ).last();
  178 |         await trigger.waitFor({ state: 'visible', timeout: 10_000 });
  179 |         await trigger.click();
  180 |         const option = this.page.locator('[role="option"]').filter({ hasText: value }).first();
  181 |         await option.waitFor({ state: 'visible', timeout: 5_000 });
  182 |         await option.click();
  183 |         console.log(`Insured gender set to: ${value}`);
  184 |     }
  185 | 
  186 |     /**
  187 |      * Click a stepper step by its visible label text to navigate between form steps.
  188 |      * Works for completed steps only (previous steps are always clickable).
  189 |      * Example: clickStepperStep('Choose Date & Time')
  190 |      */
  191 |     async clickStepperStep(stepLabel) {
  192 |         const step = this.page.getByText(stepLabel, { exact: true }).first();
  193 |         await step.waitFor({ state: 'visible', timeout: 10_000 });
  194 |         await step.click();
  195 |         console.log(`Stepper navigated to: ${stepLabel}`);
  196 |     }
  197 | 
  198 |     async fillInsuranceDetails() {
  199 |         const insuranceInput = this.page.locator('input[aria-autocomplete="list"]').last();
  200 |         await insuranceInput.waitFor({ state: 'visible', timeout: 10_000 });
  201 |         await insuranceInput.fill('Connecticare');
  202 |         const insuranceOption = this.page.locator('.MuiAutocomplete-option').first();
  203 |         await insuranceOption.waitFor({ state: 'visible', timeout: 10_000 });
  204 |         await insuranceOption.click();
  205 | 
  206 |         await this.page.fill('input[name="insurance_group_id"]', '12345678');
  207 |         await this.page.fill('input[name="insurance_member_id"]', '11');
  208 | 
  209 |         await this.page.click('text=Spouse');
  210 |         await this.page.click('.MuiAutocomplete-option:has-text("Spouse")');
  211 | 
  212 |         await this.page.fill('input[name="insurance_person_firstname-input"]', 'eweee');
  213 |         await this.page.fill('input[name="insurance_person_lastname-input"]', 'eeee');
  214 | 
  215 |         await this.page.click('text=Male');
  216 |         await this.page.click('.MuiAutocomplete-option:has-text("Male")');
  217 | 
  218 |         await this.fillDOBInsurance('01011990');
  219 |     }
  220 | 
  221 |     async continue() {
  222 |         await this.nextBtn.waitFor({ state: 'visible', timeout: 10_000 });
  223 |         await this.nextBtn.click();
  224 |     }
  225 | 
  226 |     async completeInsurance(type = 'Self-pay') {
  227 |         await this.selectInsuranceType(type);
  228 | 
  229 |         if (type !== 'Self-pay') {
  230 |             await this.manualEntry();
  231 |             await this.fillInsuranceDetails();
  232 |         }
  233 | 
  234 |         await this.continue();
  235 |     }
  236 | }
  237 | 
```