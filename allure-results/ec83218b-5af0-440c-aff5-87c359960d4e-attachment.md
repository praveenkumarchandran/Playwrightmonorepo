# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\Hopemark\newPatient.spec.js >> Conditions checkboxes >> TC-INT-H02 — clicking a condition checks the checkbox
- Location: tests\e2e\shared\intake.cases.js:160:9

# Error details

```
TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('.MuiFormControlLabel-root').filter({ hasText: 'ADHD' }).first() to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e7]:
        - img "logo" [ref=e9]
        - heading "630-912-0025" [level=6] [ref=e12]
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
      - img "provider" [ref=e73]
      - heading "Courtney Potempa" [level=5] [ref=e74]
      - separator [ref=e75]
      - generic [ref=e76]:
        - generic [ref=e77]:
          - heading "Appointment Time" [level=6] [ref=e78]
          - paragraph [ref=e80]: 4:45 PM, Wed Jun 3, 2026
        - generic [ref=e81]:
          - heading "Appointment Type" [level=6] [ref=e82]
          - paragraph [ref=e84]: Psychiatric Evaluation (Virtual)
    - generic [ref=e86]:
      - heading "Intake Questions" [level=5] [ref=e87]
      - generic [ref=e89]:
        - generic: Conditions
        - generic [ref=e90]:
          - combobox "Conditions" [ref=e91]
          - button "Open" [ref=e93] [cursor=pointer]:
            - img [ref=e94]
          - group:
            - generic: Conditions
      - generic [ref=e97]:
        - generic [ref=e98]: How did you hear about us?
        - generic [ref=e99]:
          - combobox "How did you hear about us?" [ref=e100]
          - button "Open" [ref=e102] [cursor=pointer]:
            - img [ref=e103]
          - group:
            - generic: How did you hear about us?
      - button "Continue" [disabled]
```

# Test source

```ts
  1   | export class IntakePage {
  2   |     constructor(page) {
  3   |         this.page = page;
  4   | 
  5   |         // ── TNDI-style intake ─────────────────────────────────────────────────
  6   |         this.symptomsInput = page.locator('input[placeholder="What symptoms are you experiencing?"]');
  7   |         this.noLabels = page.locator('.MuiFormControlLabel-root:has-text("No")');
  8   | 
  9   |         // ── Hopemark-style intake ─────────────────────────────────────────────
  10  |         // Conditions: MUI checkboxes (label text = condition name)
  11  |         this.conditionsGroup = page.locator('[class*="MuiFormGroup"], [role="group"]').first();
  12  |         // "How did you hear about us?" — MUI Select trigger
  13  |         this.hearAboutUsSelect = page.locator('[class*="MuiSelect"], [class*="MuiFormControl"]')
  14  |             .filter({ has: page.locator('label:has-text("hear"), label:has-text("How did")') })
  15  |             .locator('[role="combobox"], .MuiSelect-select')
  16  |             .first();
  17  | 
  18  |         this.continueBtn = page.locator('button:has-text("Continue")');
  19  |         this.spinner = page.locator('span.MuiCircularProgress-root').first();
  20  |     }
  21  | 
  22  |     async waitForLoad() {
  23  |         await this.spinner
  24  |             .waitFor({ state: 'detached', timeout: 20_000 })
  25  |             .catch(() => { });
  26  |         // Wait for either TNDI symptoms input or Hopemark conditions group
  27  |         await Promise.race([
  28  |             this.symptomsInput.waitFor({ state: 'visible', timeout: 15_000 }),
  29  |             this.conditionsGroup.waitFor({ state: 'visible', timeout: 15_000 }),
  30  |         ]).catch(() => { });
  31  |     }
  32  | 
  33  |     async selectSymptom(searchTerm, optionText) {
  34  |         await this.symptomsInput.click();
  35  |         await this.symptomsInput.fill(searchTerm);
  36  | 
  37  |         const option = this.page.locator(`.MuiAutocomplete-option:has-text("${optionText}")`);
  38  |         await option.waitFor({ state: 'visible', timeout: 10_000 });
  39  |         await option.click();
  40  |     }
  41  | 
  42  |     async selectSymptoms() {
  43  |         await this.waitForLoad();
  44  | 
  45  |         await this.selectSymptom('Knee', 'Knee Pain');
  46  | 
  47  |         const neckOption = this.page.locator('.MuiAutocomplete-option:has-text("Neck Pain")');
  48  |         await neckOption.waitFor({ state: 'visible', timeout: 10_000 });
  49  |         await neckOption.click();
  50  |     }
  51  | 
  52  |     async answerNoQuestions() {
  53  |         await this.noLabels.first()
  54  |             .waitFor({ state: 'visible', timeout: 10_000 })
  55  |             .catch(() => { });
  56  | 
  57  |         const count = await this.noLabels.count();
  58  |         for (let i = 0; i < count; i++) {
  59  |             await this.noLabels.nth(i).click();
  60  |         }
  61  |     }
  62  | 
  63  |     /**
  64  |      * Hopemark: check one or more condition checkboxes by label text.
  65  |      * @param {string[]} conditions  e.g. ['ADHD', 'Anxiety']
  66  |      */
  67  |     async selectConditions(conditions = ['ADHD']) {
  68  |         for (const cond of conditions) {
  69  |             const label = this.page
  70  |                 .locator('.MuiFormControlLabel-root')
  71  |                 .filter({ hasText: cond })
  72  |                 .first();
> 73  |             await label.waitFor({ state: 'visible', timeout: 10_000 });
      |                         ^ TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
  74  |             await label.click();
  75  |             console.log(`Condition checked: ${cond}`);
  76  |         }
  77  |     }
  78  | 
  79  |     /**
  80  |      * Hopemark: select a value from the "How did you hear about us?" MUI Select.
  81  |      * @param {string} value  e.g. 'Friends/Family'
  82  |      */
  83  |     async selectHearAboutUs(value) {
  84  |         await this.hearAboutUsSelect.waitFor({ state: 'visible', timeout: 10_000 });
  85  |         await this.hearAboutUsSelect.click();
  86  |         const option = this.page
  87  |             .locator('[role="option"], li[role="option"]')
  88  |             .filter({ hasText: value })
  89  |             .first();
  90  |         await option.waitFor({ state: 'visible', timeout: 10_000 });
  91  |         await option.click();
  92  |         console.log(`Hear about us selected: ${value}`);
  93  |     }
  94  | 
  95  |     async isContinueEnabled() {
  96  |         return this.continueBtn.isEnabled();
  97  |     }
  98  | 
  99  |     async continue() {
  100 |         await this.continueBtn.waitFor({ state: 'visible', timeout: 10_000 });
  101 |         await this.continueBtn.click();
  102 |     }
  103 | }
  104 | 
```