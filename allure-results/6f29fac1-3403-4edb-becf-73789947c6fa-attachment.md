# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\TNDI\newPatient.spec.js >> Self-pay selection >> TC-INS-03 — Continue is disabled before any insurance type selected
- Location: tests\e2e\shared\insurance.cases.js:58:13

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
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
      - generic [ref=e90]:
        - heading "Insurance Policy" [level=5] [ref=e91]
        - generic [ref=e93]:
          - generic [ref=e94]: Insurance Type
          - generic [ref=e95]:
            - combobox "Insurance Type" [ref=e96]
            - progressbar [ref=e97]:
              - img [ref=e98]
            - button "Open" [ref=e101] [cursor=pointer]:
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
      - button "Next" [ref=e137] [cursor=pointer]
```

# Test source

```ts
  1   | /**
  2   |  * SHARED INSURANCE TEST CASES
  3   |  * Used by all clients that have an insurance step.
  4   |  * Wire into a spec: runInsuranceCases(test, expect)
  5   |  * Requires fixture: insurancePage (from newPatient.fixture.js)
  6   |  */
  7   | 
  8   | /**
  9   |  * @param {object} opts
  10  |  * @param {boolean} [opts.hasInsuranceGating=true]     — Continue/Next is disabled before selecting a type
  11  |  * @param {boolean} [opts.hasInsuranceDOB=false]       — Insurance page has a DOB field
  12  |  * @param {boolean} [opts.hasManualEntryBtn=true]      — false when fields appear directly (Hopemark)
  13  |  * @param {boolean} [opts.hasAutocompleteSearch=true]  — false for MUI-Select clients (SINY, Kronson); gates TC-INS-10/11/12
  14  |  * @param {boolean} [opts.hasSkipButton=false]         — true when a Skip button is present (SINY, Hopemark)
  15  |  * @param {boolean} [opts.hasTakePicture=false]        — true when "Take Picture of Card" button appears (SINY)
  16  |  * @param {string}  [opts.defaultInsuranceType]        — a valid non-self-pay type for this client used in TC-INS-04/05/06/07/08
  17  |  *                                                       TNDI/Clarus default: 'Insurance'
  18  |  *                                                       SINY: 'Private or Employer Insurance'
  19  |  * @param {string[]}[opts.insuranceTypes]              — all non-self-pay types to test individually (TC-INS-15+)
  20  |  * @param {string[]}[opts.holderOptions]              — Primary Insurance Holder options to test (['Self','Spouse','Other'])
  21  |  * @param {string}  [opts.stepBeforeInsurance]         — stepper label of the step just before insurance (e.g. 'Choose Date & Time')
  22  |  *                                                       When set, enables TC-INS-H06 (navigate to that step and back, verify pre-fill)
  23  |  * @param {string}  [opts.intakeStepLabel]             — stepper label of the intake step (e.g. 'Intake Questions')
  24  |  *                                                       When set, enables TC-INS-H07 (navigate to intake and back, verify pre-fill)
  25  |  * @param {string}  [opts.errorSelector]               — CSS selector for inline validation errors
  26  |  */
  27  | function runInsuranceCases(test, expect, opts = {}) {
  28  |     const {
  29  |         hasInsuranceGating          = true,
  30  |         hasInsuranceDOB             = false,
  31  |         hasManualEntryBtn           = true,
  32  |         hasAutocompleteSearch       = true,
  33  |         hasPlanAutocomplete         = true,
  34  |         hasSkipButton               = false,
  35  |         hasTakePicture              = false,
  36  |         canCompletePrivateInsurance = true,
  37  |         defaultInsuranceType        = 'Insurance',
  38  |         stepBeforeInsurance         = null,
  39  |         intakeStepLabel             = null,
  40  |         errorSelector               = '[class*="Mui-error"], [aria-invalid="true"]',
  41  |     } = opts;
  42  | 
  43  |     // ── 1. SELF-PAY ───────────────────────────────────────────────────────────
  44  | 
  45  |     test.describe('Self-pay selection', () => {
  46  | 
  47  |         test('TC-INS-01 — Self-pay option is selectable', async ({ insurancePage }) => {
  48  |             await insurancePage.selectSelfPay();
  49  |             await expect(insurancePage.nextBtn).toBeVisible({ timeout: 10_000 });
  50  |         });
  51  | 
  52  |         test('TC-INS-02 — Continue/Next is enabled after Self-pay selected', async ({ insurancePage }) => {
  53  |             await insurancePage.selectSelfPay();
  54  |             await expect(insurancePage.nextBtn).toBeEnabled();
  55  |         });
  56  | 
  57  |         if (hasInsuranceGating) {
  58  |             test('TC-INS-03 — Continue is disabled before any insurance type selected', async ({ insurancePage }) => {
  59  |                 await insurancePage.nextBtn.waitFor({ state: 'visible', timeout: 10_000 });
  60  |                 const isDisabled = await insurancePage.nextBtn.evaluate(btn =>
  61  |                     btn.disabled || btn.getAttribute('aria-disabled') === 'true'
  62  |                 );
> 63  |                 expect(isDisabled).toBe(true);
      |                                    ^ Error: expect(received).toBe(expected) // Object.is equality
  64  |             });
  65  |         }
  66  | 
  67  |     });
  68  | 
  69  |     // ── 2. MANUAL ENTRY ───────────────────────────────────────────────────────
  70  | 
  71  |     // "Take Picture of Card" and "Manually Enter Details" are admin-configurable.
  72  |     // All tests here detect button presence at runtime — resilient to admin config changes.
  73  | 
  74  |     test.describe('Manual entry flow', () => {
  75  | 
  76  |         test('TC-INS-04 — insurance detail UI is accessible after selecting type', async ({ insurancePage }) => {
  77  |             await insurancePage.selectInsuranceType(defaultInsuranceType);
  78  |             const hasBtn = await insurancePage.manualEntryBtn.isVisible({ timeout: 5_000 }).catch(() => false);
  79  |             if (hasBtn) {
  80  |                 // Admin has enabled the button choice flow
  81  |                 await expect(insurancePage.manualEntryBtn).toBeVisible();
  82  |             } else {
  83  |                 // Admin has disabled buttons — detail fields appear directly
  84  |                 await expect(insurancePage.nextBtn).toBeEnabled({ timeout: 10_000 });
  85  |             }
  86  |         });
  87  | 
  88  |         test('TC-INS-04b — Take Picture of Card appears when admin enables the button flow', async ({ insurancePage }) => {
  89  |             await insurancePage.selectInsuranceType(defaultInsuranceType);
  90  |             const hasManualBtn = await insurancePage.manualEntryBtn.isVisible({ timeout: 5_000 }).catch(() => false);
  91  |             if (!hasManualBtn) {
  92  |                 console.log('Take Picture / Manually Enter buttons absent — admin config off');
  93  |                 return; // skip gracefully when admin disabled
  94  |             }
  95  |             await expect(insurancePage.takePictureBtn).toBeVisible({ timeout: 5_000 });
  96  |         });
  97  | 
  98  |         test('TC-INS-05 — insurance detail fields are visible after entering manual mode', async ({ insurancePage }) => {
  99  |             // prepareInsuranceForm clicks "Manually Enter Details" if present, no-op if admin disabled it
  100 |             await insurancePage.prepareInsuranceForm(defaultInsuranceType);
  101 |             const planVisible = await insurancePage.planInput.isVisible({ timeout: 5_000 }).catch(() => false);
  102 |             const groupIdVisible = await insurancePage.groupIdInput.isVisible({ timeout: 5_000 }).catch(() => false);
  103 |             expect(planVisible || groupIdVisible).toBe(true);
  104 |         });
  105 | 
  106 |         test('TC-INS-05b — Group ID and Member ID text inputs are fillable', async ({ insurancePage }) => {
  107 |             await insurancePage.prepareInsuranceForm(defaultInsuranceType);
  108 |             await insurancePage.groupIdInput.waitFor({ state: 'visible', timeout: 10_000 });
  109 |             await insurancePage.groupIdInput.fill('GRP123');
  110 |             await insurancePage.memberIdInput.fill('MBR456');
  111 |             await expect(insurancePage.groupIdInput).toHaveValue('GRP123');
  112 |             await expect(insurancePage.memberIdInput).toHaveValue('MBR456');
  113 |         });
  114 | 
  115 |         if (hasPlanAutocomplete) {
  116 |             test('TC-INS-05c — Insurance plan search returns results', async ({ insurancePage }) => {
  117 |                 await insurancePage.prepareInsuranceForm(defaultInsuranceType);
  118 |                 await insurancePage.planInput.waitFor({ state: 'visible', timeout: 10_000 });
  119 |                 await insurancePage.planInput.fill('Blue');
  120 |                 await expect(
  121 |                     insurancePage.page.locator('.MuiAutocomplete-option, [role="option"]').first()
  122 |                 ).toBeVisible({ timeout: 10_000 });
  123 |             });
  124 | 
  125 |             test('TC-INS-05d — Selecting "Other" as insurance plan reveals the plan name field', async ({ insurancePage }) => {
  126 |                 await insurancePage.prepareInsuranceForm(defaultInsuranceType);
  127 |                 await insurancePage.selectPlan('Other');
  128 |                 await expect(insurancePage.planNameInput).toBeVisible({ timeout: 10_000 });
  129 |             });
  130 |         }
  131 | 
  132 |     });
  133 | 
  134 |     // ── 3. FIELD VALIDATION ───────────────────────────────────────────────────
  135 | 
  136 |     test.describe('Field validation', () => {
  137 | 
  138 |         test('TC-INS-06 — Submitting without required fields shows errors', async ({ insurancePage }) => {
  139 |             await insurancePage.prepareInsuranceForm(defaultInsuranceType);
  140 |             await insurancePage.nextBtn.click();
  141 |             await expect(
  142 |                 insurancePage.page.locator(errorSelector).first()
  143 |             ).toBeVisible({ timeout: 5_000 });
  144 |         });
  145 | 
  146 |         if (hasInsuranceDOB) {
  147 |             test('TC-INS-07 — Invalid DOB format shows error', async ({ insurancePage }) => {
  148 |                 await insurancePage.prepareInsuranceForm(defaultInsuranceType);
  149 |                 await insurancePage.fillDOBInsurance('99999999');
  150 |                 await insurancePage.nextBtn.click();
  151 |                 await expect(
  152 |                     insurancePage.page.locator(errorSelector).first()
  153 |                 ).toBeVisible({ timeout: 5_000 });
  154 |             });
  155 |         }
  156 | 
  157 |     });
  158 | 
  159 |     // ── 4. SWITCHING TYPES ────────────────────────────────────────────────────
  160 | 
  161 |     test.describe('Switching insurance types', () => {
  162 | 
  163 |         test('TC-INS-08 — Switching from a non-self-pay type to Self-pay hides manual fields', async ({ insurancePage }) => {
```