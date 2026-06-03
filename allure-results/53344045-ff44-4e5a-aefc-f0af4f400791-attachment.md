# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\TNDI\newPatient.spec.js >> Symptoms autocomplete >> TC-INT-07 — clearing the input hides all options
- Location: tests\e2e\shared\intake.cases.js:80:9

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.MuiAutocomplete-option')
Expected: 0
Received: 7
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('.MuiAutocomplete-option')
    14 × locator resolved to 7 elements
       - unexpected value "7"

```

# Page snapshot

```yaml
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
          - paragraph [ref=e83]: 8:30 AM, Fri Jun 5, 2026
        - generic [ref=e84]:
          - heading "Appointment Type" [level=6] [ref=e85]
          - paragraph [ref=e87]: Teleconsultation
    - generic [ref=e89]:
      - heading "Intake Questions" [level=5] [ref=e90]
      - generic [ref=e91]:
        - paragraph [ref=e92]: What symptoms are you experiencing?
        - generic [ref=e93]:
          - generic [ref=e94]:
            - generic [ref=e95]: What symptoms are you experiencing?
            - generic [ref=e96]:
              - combobox "What symptoms are you experiencing?" [expanded] [active] [ref=e97]
              - button "Close" [ref=e99] [cursor=pointer]:
                - img [ref=e100]
              - group:
                - generic: What symptoms are you experiencing?
          - listbox "What symptoms are you experiencing?" [ref=e102]:
            - option "Lower Back Pain" [ref=e103] [cursor=pointer]:
              - generic [ref=e104]:
                - checkbox [ref=e105]
                - img [ref=e106]
              - text: Lower Back Pain
            - option "Neck Pain" [ref=e108] [cursor=pointer]:
              - generic [ref=e109]:
                - checkbox [ref=e110]
                - img [ref=e111]
              - text: Neck Pain
            - option "Knee Pain" [ref=e113] [cursor=pointer]:
              - generic [ref=e114]:
                - checkbox [ref=e115]
                - img [ref=e116]
              - text: Knee Pain
            - option "Nerve Pain" [ref=e118] [cursor=pointer]:
              - generic [ref=e119]:
                - checkbox [ref=e120]
                - img [ref=e121]
              - text: Nerve Pain
            - option "Pain in Legs/Arms/Feet" [ref=e123] [cursor=pointer]:
              - generic [ref=e124]:
                - checkbox [ref=e125]
                - img [ref=e126]
              - text: Pain in Legs/Arms/Feet
            - option "Numbness/Tingling" [ref=e128] [cursor=pointer]:
              - generic [ref=e129]:
                - checkbox [ref=e130]
                - img [ref=e131]
              - text: Numbness/Tingling
            - option "Other" [ref=e133] [cursor=pointer]:
              - generic [ref=e134]:
                - checkbox [ref=e135]
                - img [ref=e136]
              - text: Other
      - generic [ref=e138]:
        - paragraph [ref=e139]: Have you had surgery for this condition previously?
        - radiogroup [ref=e140]:
          - generic [ref=e141] [cursor=pointer]:
            - generic [ref=e142]:
              - radio "Yes" [ref=e143]
              - img [ref=e145]
            - generic [ref=e147]: "Yes"
          - generic [ref=e148] [cursor=pointer]:
            - generic [ref=e149]:
              - radio "No" [ref=e150]
              - img [ref=e152]
            - generic [ref=e154]: "No"
      - generic [ref=e155]:
        - paragraph [ref=e156]: Have you had an MRI for this condition within the last 3 years?
        - radiogroup [ref=e157]:
          - generic [ref=e158] [cursor=pointer]:
            - generic [ref=e159]:
              - radio "Yes" [ref=e160]
              - img [ref=e162]
            - generic [ref=e164]: "Yes"
          - generic [ref=e165] [cursor=pointer]:
            - generic [ref=e166]:
              - radio "No" [ref=e167]
              - img [ref=e169]
            - generic [ref=e171]: "No"
      - generic [ref=e172]:
        - paragraph [ref=e173]: Have you had a CT scan for this condition within the last 3 years?
        - radiogroup [ref=e174]:
          - generic [ref=e175] [cursor=pointer]:
            - generic [ref=e176]:
              - radio "Yes" [ref=e177]
              - img [ref=e179]
            - generic [ref=e181]: "Yes"
          - generic [ref=e182] [cursor=pointer]:
            - generic [ref=e183]:
              - radio "No" [ref=e184]
              - img [ref=e186]
            - generic [ref=e188]: "No"
      - generic [ref=e189]:
        - paragraph [ref=e190]: Have you had an X-ray for this condition within the last year?
        - radiogroup [ref=e191]:
          - generic [ref=e192] [cursor=pointer]:
            - generic [ref=e193]:
              - radio "Yes" [ref=e194]
              - img [ref=e196]
            - generic [ref=e198]: "Yes"
          - generic [ref=e199] [cursor=pointer]:
            - generic [ref=e200]:
              - radio "No" [ref=e201]
              - img [ref=e203]
            - generic [ref=e205]: "No"
      - generic [ref=e206]:
        - button "Continue" [disabled]
```

# Test source

```ts
  1   | /**
  2   |  * @param {object} opts
  3   |  * @param {'tndi'|'hopemark'|'siny'} [opts.intakeType='tndi']
  4   |  */
  5   | function runIntakeCases(test, expect, opts = {}) {
  6   |     const { intakeType = 'tndi' } = opts;
  7   | 
  8   |     if (intakeType === 'hopemark') {
  9   |         runHopemarkIntakeCases(test, expect);
  10  |         return;
  11  |     }
  12  | 
  13  |     if (intakeType === 'siny') {
  14  |         runSINYIntakeCases(test, expect);
  15  |         return;
  16  |     }
  17  | 
  18  |     // ── 1. CONTINUE BUTTON GATING ─────────────────────────────────────────────
  19  | 
  20  |     test.describe('Continue button gating', () => {
  21  | 
  22  |         test('TC-INT-01 — Continue is disabled before any symptom is selected', async ({ intakePage }) => {
  23  |             await expect(intakePage.continueBtn).toBeDisabled();
  24  |         });
  25  | 
  26  |         test('TC-INT-02 — Continue remains disabled after symptom selected but questions unanswered', async ({ intakePage }) => {
  27  |             await intakePage.selectSymptom('Knee', 'Knee Pain');
  28  | 
  29  |             const hasQuestions = await intakePage.noLabels.first()
  30  |                 .isVisible({ timeout: 5_000 })
  31  |                 .catch(() => false);
  32  | 
  33  |             if (hasQuestions) {
  34  |                 await expect(intakePage.continueBtn).toBeDisabled();
  35  |             }
  36  |         });
  37  | 
  38  |         test('TC-INT-03 — Continue enables only after symptoms and all questions answered', async ({ intakePage }) => {
  39  |             await intakePage.selectSymptoms();
  40  |             await intakePage.answerNoQuestions();
  41  |             await expect(intakePage.continueBtn).toBeEnabled();
  42  |         });
  43  | 
  44  |     });
  45  | 
  46  |     // ── 2. UI-SIDE (DOM) ASSERTIONS ───────────────────────────────────────────
  47  | 
  48  |     test.describe('UI-side disabled state', () => {
  49  | 
  50  |         test('TC-INT-04 — button has disabled attribute before any input', async ({ intakePage }) => {
  51  |             const isDisabled = await intakePage.continueBtn.evaluate(btn =>
  52  |                 btn.disabled || btn.getAttribute('aria-disabled') === 'true'
  53  |             );
  54  |             expect(isDisabled).toBe(true);
  55  |         });
  56  | 
  57  |         test('TC-INT-05 — button loses disabled attribute after full form completion', async ({ intakePage }) => {
  58  |             await intakePage.selectSymptoms();
  59  |             await intakePage.answerNoQuestions();
  60  | 
  61  |             const isDisabled = await intakePage.continueBtn.evaluate(btn =>
  62  |                 btn.disabled || btn.getAttribute('aria-disabled') === 'true'
  63  |             );
  64  |             expect(isDisabled).toBe(false);
  65  |         });
  66  | 
  67  |     });
  68  | 
  69  |     // ── 3. SYMPTOMS AUTOCOMPLETE ──────────────────────────────────────────────
  70  | 
  71  |     test.describe('Symptoms autocomplete', () => {
  72  | 
  73  |         test('TC-INT-06 — valid search term shows dropdown options', async ({ intakePage }) => {
  74  |             await intakePage.symptomsInput.fill('Knee');
  75  |             await expect(
  76  |                 intakePage.page.locator('.MuiAutocomplete-option').first()
  77  |             ).toBeVisible({ timeout: 10_000 });
  78  |         });
  79  | 
  80  |         test('TC-INT-07 — clearing the input hides all options', async ({ intakePage }) => {
  81  |             await intakePage.symptomsInput.fill('Knee');
  82  |             await intakePage.page.locator('.MuiAutocomplete-option').first()
  83  |                 .waitFor({ state: 'visible', timeout: 10_000 });
  84  | 
  85  |             await intakePage.symptomsInput.clear();
  86  |             await expect(
  87  |                 intakePage.page.locator('.MuiAutocomplete-option')
> 88  |             ).toHaveCount(0, { timeout: 5_000 });
      |               ^ Error: expect(locator).toHaveCount(expected) failed
  89  |         });
  90  | 
  91  |         test('TC-INT-08 — invalid search term shows no options', async ({ intakePage }) => {
  92  |             await intakePage.symptomsInput.fill('zzzzinvalidsymptom9999');
  93  |             await expect(
  94  |                 intakePage.page.locator('.MuiAutocomplete-option')
  95  |             ).toHaveCount(0, { timeout: 5_000 });
  96  |         });
  97  | 
  98  |         test('TC-INT-09 — single character input does not crash the field', async ({ intakePage }) => {
  99  |             await intakePage.symptomsInput.fill('a');
  100 |             await expect(intakePage.symptomsInput).toHaveValue('a');
  101 |         });
  102 | 
  103 |     });
  104 | 
  105 |     // ── 4. EDGE CASES ─────────────────────────────────────────────────────────
  106 | 
  107 |     test.describe('Edge cases', () => {
  108 | 
  109 |         test('TC-INT-10 — selecting multiple symptoms keeps Continue disabled until questions answered', async ({ intakePage }) => {
  110 |             await intakePage.selectSymptom('Knee', 'Knee Pain');
  111 | 
  112 |             const neckVisible = await intakePage.page
  113 |                 .locator('.MuiAutocomplete-option:has-text("Neck Pain")')
  114 |                 .isVisible({ timeout: 5_000 })
  115 |                 .catch(() => false);
  116 | 
  117 |             if (neckVisible) {
  118 |                 await intakePage.page.locator('.MuiAutocomplete-option:has-text("Neck Pain")').click();
  119 |             }
  120 | 
  121 |             const hasQuestions = await intakePage.noLabels.first()
  122 |                 .isVisible({ timeout: 5_000 })
  123 |                 .catch(() => false);
  124 | 
  125 |             if (hasQuestions) {
  126 |                 await expect(intakePage.continueBtn).toBeDisabled();
  127 |             }
  128 |         });
  129 | 
  130 |         test('TC-INT-11 — questions section is hidden before any symptom is selected', async ({ intakePage }) => {
  131 |             const questionsVisible = await intakePage.noLabels.first()
  132 |                 .isVisible({ timeout: 3_000 })
  133 |                 .catch(() => false);
  134 | 
  135 |             expect(questionsVisible).toBe(false);
  136 |         });
  137 | 
  138 |         test('TC-INT-12 — questions appear after a symptom is selected', async ({ intakePage }) => {
  139 |             await intakePage.selectSymptom('Knee', 'Knee Pain');
  140 | 
  141 |             const appeared = await intakePage.noLabels.first()
  142 |                 .isVisible({ timeout: 8_000 })
  143 |                 .catch(() => false);
  144 | 
  145 |             // If the flow renders questions, they must be visible; if the flow
  146 |             // has no questions for this symptom, the test is informational.
  147 |             expect(typeof appeared).toBe('boolean');
  148 |         });
  149 | 
  150 |     });
  151 | }
  152 | 
  153 | // ── HOPEMARK INTAKE CASES ─────────────────────────────────────────────────────
  154 | 
  155 | function runHopemarkIntakeCases(test, expect) {
  156 | 
  157 |     test.describe('Conditions dropdown', () => {
  158 | 
  159 |         test('TC-INT-H01 — Conditions dropdown is visible', async ({ intakePage }) => {
  160 |             await expect(intakePage.conditionsSelect).toBeVisible({ timeout: 10_000 });
  161 |         });
  162 | 
  163 |         test('TC-INT-H02 — opening Conditions dropdown shows options', async ({ intakePage }) => {
  164 |             await intakePage.conditionsSelect.waitFor({ state: 'visible', timeout: 10_000 });
  165 |             await intakePage.conditionsSelect.click();
  166 |             await expect(
  167 |                 intakePage.page.locator('[role="option"], li[role="option"]').first()
  168 |             ).toBeVisible({ timeout: 10_000 });
  169 |             await intakePage.page.keyboard.press('Escape');
  170 |         });
  171 | 
  172 |         test('TC-INT-H03 — selecting multiple conditions keeps dropdown usable', async ({ intakePage }) => {
  173 |             await intakePage.selectConditions(['ADHD']);
  174 |             // Dropdown is still on the page and interactive after selection
  175 |             await expect(intakePage.conditionsSelect).toBeVisible();
  176 |         });
  177 | 
  178 |     });
  179 | 
  180 |     test.describe('How did you hear about us', () => {
  181 | 
  182 |         test('TC-INT-H04 — hear-about-us dropdown is visible', async ({ intakePage }) => {
  183 |             await expect(intakePage.hearAboutUsSelect).toBeVisible({ timeout: 10_000 });
  184 |         });
  185 | 
  186 |         test('TC-INT-H05 — selecting Friends/Family populates the field', async ({ intakePage }) => {
  187 |             await intakePage.selectHearAboutUs('Friends/Family');
  188 |             await expect(intakePage.hearAboutUsSelect).toHaveValue('Friends/Family');
```