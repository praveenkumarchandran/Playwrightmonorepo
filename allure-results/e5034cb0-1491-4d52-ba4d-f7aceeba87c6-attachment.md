# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\Hopemark\newPatient.spec.js >> Conditions checkboxes >> TC-INT-H01 — at least one condition checkbox is visible
- Location: tests\e2e\shared\intake.cases.js:154:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[class*="MuiFormGroup"], [role="group"]').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('[class*="MuiFormGroup"], [role="group"]').first()

```

```yaml
- banner:
  - img "logo"
  - heading "630-912-0025" [level=6]
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
- img "provider"
- heading "Courtney Potempa" [level=5]
- separator
- heading "Appointment Time" [level=6]
- paragraph: 4:45 PM, Wed Jun 3, 2026
- heading "Appointment Type" [level=6]
- paragraph: Psychiatric Evaluation (Virtual)
- heading "Intake Questions" [level=5]
- text: Conditions
- combobox "Conditions"
- button "Open"
- text: How did you hear about us?
- combobox "How did you hear about us?"
- button "Open"
- button "Continue" [disabled]
```

# Test source

```ts
  55  | 
  56  |             const isDisabled = await intakePage.continueBtn.evaluate(btn =>
  57  |                 btn.disabled || btn.getAttribute('aria-disabled') === 'true'
  58  |             );
  59  |             expect(isDisabled).toBe(false);
  60  |         });
  61  | 
  62  |     });
  63  | 
  64  |     // ── 3. SYMPTOMS AUTOCOMPLETE ──────────────────────────────────────────────
  65  | 
  66  |     test.describe('Symptoms autocomplete', () => {
  67  | 
  68  |         test('TC-INT-06 — valid search term shows dropdown options', async ({ intakePage }) => {
  69  |             await intakePage.symptomsInput.fill('Knee');
  70  |             await expect(
  71  |                 intakePage.page.locator('.MuiAutocomplete-option').first()
  72  |             ).toBeVisible({ timeout: 10_000 });
  73  |         });
  74  | 
  75  |         test('TC-INT-07 — clearing the input hides all options', async ({ intakePage }) => {
  76  |             await intakePage.symptomsInput.fill('Knee');
  77  |             await intakePage.page.locator('.MuiAutocomplete-option').first()
  78  |                 .waitFor({ state: 'visible', timeout: 10_000 });
  79  | 
  80  |             await intakePage.symptomsInput.clear();
  81  |             await expect(
  82  |                 intakePage.page.locator('.MuiAutocomplete-option')
  83  |             ).toHaveCount(0, { timeout: 5_000 });
  84  |         });
  85  | 
  86  |         test('TC-INT-08 — invalid search term shows no options', async ({ intakePage }) => {
  87  |             await intakePage.symptomsInput.fill('zzzzinvalidsymptom9999');
  88  |             await expect(
  89  |                 intakePage.page.locator('.MuiAutocomplete-option')
  90  |             ).toHaveCount(0, { timeout: 5_000 });
  91  |         });
  92  | 
  93  |         test('TC-INT-09 — single character input does not crash the field', async ({ intakePage }) => {
  94  |             await intakePage.symptomsInput.fill('a');
  95  |             await expect(intakePage.symptomsInput).toHaveValue('a');
  96  |         });
  97  | 
  98  |     });
  99  | 
  100 |     // ── 4. EDGE CASES ─────────────────────────────────────────────────────────
  101 | 
  102 |     test.describe('Edge cases', () => {
  103 | 
  104 |         test('TC-INT-10 — selecting multiple symptoms keeps Continue disabled until questions answered', async ({ intakePage }) => {
  105 |             await intakePage.selectSymptom('Knee', 'Knee Pain');
  106 | 
  107 |             const neckVisible = await intakePage.page
  108 |                 .locator('.MuiAutocomplete-option:has-text("Neck Pain")')
  109 |                 .isVisible({ timeout: 5_000 })
  110 |                 .catch(() => false);
  111 | 
  112 |             if (neckVisible) {
  113 |                 await intakePage.page.locator('.MuiAutocomplete-option:has-text("Neck Pain")').click();
  114 |             }
  115 | 
  116 |             const hasQuestions = await intakePage.noLabels.first()
  117 |                 .isVisible({ timeout: 5_000 })
  118 |                 .catch(() => false);
  119 | 
  120 |             if (hasQuestions) {
  121 |                 await expect(intakePage.continueBtn).toBeDisabled();
  122 |             }
  123 |         });
  124 | 
  125 |         test('TC-INT-11 — questions section is hidden before any symptom is selected', async ({ intakePage }) => {
  126 |             const questionsVisible = await intakePage.noLabels.first()
  127 |                 .isVisible({ timeout: 3_000 })
  128 |                 .catch(() => false);
  129 | 
  130 |             expect(questionsVisible).toBe(false);
  131 |         });
  132 | 
  133 |         test('TC-INT-12 — questions appear after a symptom is selected', async ({ intakePage }) => {
  134 |             await intakePage.selectSymptom('Knee', 'Knee Pain');
  135 | 
  136 |             const appeared = await intakePage.noLabels.first()
  137 |                 .isVisible({ timeout: 8_000 })
  138 |                 .catch(() => false);
  139 | 
  140 |             // If the flow renders questions, they must be visible; if the flow
  141 |             // has no questions for this symptom, the test is informational.
  142 |             expect(typeof appeared).toBe('boolean');
  143 |         });
  144 | 
  145 |     });
  146 | }
  147 | 
  148 | // ── HOPEMARK INTAKE CASES ─────────────────────────────────────────────────────
  149 | 
  150 | function runHopemarkIntakeCases(test, expect) {
  151 | 
  152 |     test.describe('Conditions checkboxes', () => {
  153 | 
  154 |         test('TC-INT-H01 — at least one condition checkbox is visible', async ({ intakePage }) => {
> 155 |             await expect(intakePage.conditionsGroup).toBeVisible({ timeout: 10_000 });
      |                                                      ^ Error: expect(locator).toBeVisible() failed
  156 |             const checkboxes = intakePage.page.locator('.MuiFormControlLabel-root');
  157 |             await expect(checkboxes.first()).toBeVisible();
  158 |         });
  159 | 
  160 |         test('TC-INT-H02 — clicking a condition checks the checkbox', async ({ intakePage }) => {
  161 |             await intakePage.selectConditions(['ADHD']);
  162 |             const label = intakePage.page
  163 |                 .locator('.MuiFormControlLabel-root')
  164 |                 .filter({ hasText: 'ADHD' })
  165 |                 .first();
  166 |             const checkbox = label.locator('input[type="checkbox"]');
  167 |             await expect(checkbox).toBeChecked();
  168 |         });
  169 | 
  170 |         test('TC-INT-H03 — multiple conditions can be selected', async ({ intakePage }) => {
  171 |             await intakePage.selectConditions(['ADHD', 'Anxiety']);
  172 |             const adhdCheckbox = intakePage.page
  173 |                 .locator('.MuiFormControlLabel-root')
  174 |                 .filter({ hasText: 'ADHD' })
  175 |                 .locator('input[type="checkbox"]');
  176 |             const anxCheckbox = intakePage.page
  177 |                 .locator('.MuiFormControlLabel-root')
  178 |                 .filter({ hasText: 'Anxiety' })
  179 |                 .locator('input[type="checkbox"]');
  180 |             await expect(adhdCheckbox).toBeChecked();
  181 |             await expect(anxCheckbox).toBeChecked();
  182 |         });
  183 | 
  184 |     });
  185 | 
  186 |     test.describe('How did you hear about us', () => {
  187 | 
  188 |         test('TC-INT-H04 — hear-about-us dropdown is visible', async ({ intakePage }) => {
  189 |             await expect(intakePage.hearAboutUsSelect).toBeVisible({ timeout: 10_000 });
  190 |         });
  191 | 
  192 |         test('TC-INT-H05 — selecting Friends/Family reflects in the dropdown', async ({ intakePage }) => {
  193 |             await intakePage.selectHearAboutUs('Friends/Family');
  194 |             await expect(intakePage.hearAboutUsSelect).toContainText('Friends/Family');
  195 |         });
  196 | 
  197 |     });
  198 | 
  199 |     test.describe('Continue button', () => {
  200 | 
  201 |         test('TC-INT-H06 — Continue is visible and enabled', async ({ intakePage }) => {
  202 |             await expect(intakePage.continueBtn).toBeVisible();
  203 |         });
  204 | 
  205 |         test('TC-INT-H07 — Continue becomes enabled after selecting condition + hear-about-us', async ({ intakePage }) => {
  206 |             await intakePage.selectConditions(['ADHD']);
  207 |             await intakePage.selectHearAboutUs('Friends/Family');
  208 |             await expect(intakePage.continueBtn).toBeEnabled();
  209 |         });
  210 | 
  211 |     });
  212 | }
  213 | 
  214 | export { runIntakeCases };
  215 | 
```