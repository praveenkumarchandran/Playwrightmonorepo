# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\Kronson\newPatient.spec.js >> Field validation >> TC-INS-06 — Submitting without required fields shows errors
- Location: tests\e2e\shared\insurance.cases.js:69:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('p:has-text("to proceed"), p:has-text("is required")').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('p:has-text("to proceed"), p:has-text("is required")').first()

```

```yaml
- banner:
  - img "logo"
  - heading "888-214-4110" [level=6]
- button "1":
  - paragraph: "1"
- paragraph: Location
- button "2":
  - paragraph: "2"
- paragraph: Choose Date & Time
- button "3":
  - paragraph: "3"
- paragraph: Add Insurance
- button "4":
  - paragraph: "4"
- paragraph: Add Info
- heading "Your Appointment" [level=5]
- heading "Location" [level=6]
- paragraph: Arcadia
- heading "Location Address" [level=6]
- paragraph: 301 W Huntington Dr Suite 519, CA CA 91007
- heading "Appointment Time" [level=6]
- paragraph: 12:00 PM, Wed Jun 3, 2026
- heading "Appointment Type" [level=6]
- paragraph: Vein Consult
- heading "Insurance Policy" [level=5]
- text: Insurance Type
- combobox "Insurance Type Insurance": Private or Employer Insurance
- button "Open"
- paragraph: How would you like to provide your insurance details?
- button "Take Picture of Card"
- button "Manually Enter Details"
- text: Insurance
- combobox "Insurance"
- button "Open"
- heading "Insurance is required." [level=6]
- text: Group ID
- textbox "Group ID Member ID":
  - /placeholder: Group ID
- text: Member ID
- textbox "Member ID"
- text: Primary Insurance Holder
- combobox "Primary Insurance Holder"
- button "Open"
- button "Next"
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
  10  |  * @param {boolean} [opts.hasInsuranceGating=true]  — Continue/Next is disabled before selecting a type
  11  |  * @param {boolean} [opts.hasInsuranceDOB=false]    — Insurance page has a DOB field
  12  |  * @param {string}  [opts.errorSelector]            — CSS selector for inline validation errors
  13  |  */
  14  | function runInsuranceCases(test, expect, opts = {}) {
  15  |     const {
  16  |         hasInsuranceGating = true,
  17  |         hasInsuranceDOB    = false,
  18  |         errorSelector      = '[class*="Mui-error"], [aria-invalid="true"]',
  19  |     } = opts;
  20  | 
  21  |     // ── 1. SELF-PAY ───────────────────────────────────────────────────────────
  22  | 
  23  |     test.describe('Self-pay selection', () => {
  24  | 
  25  |         test('TC-INS-01 — Self-pay option is selectable', async ({ insurancePage }) => {
  26  |             await insurancePage.selectSelfPay();
  27  |             await expect(insurancePage.nextBtn).toBeVisible({ timeout: 10_000 });
  28  |         });
  29  | 
  30  |         test('TC-INS-02 — Continue/Next is enabled after Self-pay selected', async ({ insurancePage }) => {
  31  |             await insurancePage.selectSelfPay();
  32  |             await expect(insurancePage.nextBtn).toBeEnabled();
  33  |         });
  34  | 
  35  |         if (hasInsuranceGating) {
  36  |             test('TC-INS-03 — Continue is disabled before any insurance type selected', async ({ insurancePage }) => {
  37  |                 await insurancePage.nextBtn.waitFor({ state: 'visible', timeout: 10_000 });
  38  |                 const isDisabled = await insurancePage.nextBtn.evaluate(btn =>
  39  |                     btn.disabled || btn.getAttribute('aria-disabled') === 'true'
  40  |                 );
  41  |                 expect(isDisabled).toBe(true);
  42  |             });
  43  |         }
  44  | 
  45  |     });
  46  | 
  47  |     // ── 2. MANUAL ENTRY ───────────────────────────────────────────────────────
  48  | 
  49  |     test.describe('Manual entry flow', () => {
  50  | 
  51  |         test('TC-INS-04 — Manually Enter Details button appears after selecting insurance type', async ({ insurancePage }) => {
  52  |             await insurancePage.selectInsuranceType('Insurance');
  53  |             await expect(insurancePage.manualEntryBtn).toBeVisible({ timeout: 10_000 });
  54  |         });
  55  | 
  56  |         test('TC-INS-05 — Clicking manual entry reveals insurance detail fields', async ({ insurancePage }) => {
  57  |             await insurancePage.selectInsuranceType('Insurance');
  58  |             await insurancePage.manualEntry();
  59  |             // The plan autocomplete input should appear
  60  |             await expect(insurancePage.planInput).toBeVisible({ timeout: 10_000 });
  61  |         });
  62  | 
  63  |     });
  64  | 
  65  |     // ── 3. FIELD VALIDATION ───────────────────────────────────────────────────
  66  | 
  67  |     test.describe('Field validation', () => {
  68  | 
  69  |         test('TC-INS-06 — Submitting without required fields shows errors', async ({ insurancePage }) => {
  70  |             await insurancePage.selectInsuranceType('Insurance');
  71  |             await insurancePage.manualEntry();
  72  |             await insurancePage.nextBtn.click();
  73  |             await expect(
  74  |                 insurancePage.page.locator(errorSelector).first()
> 75  |             ).toBeVisible({ timeout: 5_000 });
      |               ^ Error: expect(locator).toBeVisible() failed
  76  |         });
  77  | 
  78  |         if (hasInsuranceDOB) {
  79  |             test('TC-INS-07 — Invalid DOB format shows error', async ({ insurancePage }) => {
  80  |                 await insurancePage.selectInsuranceType('Insurance');
  81  |                 await insurancePage.manualEntry();
  82  |                 await insurancePage.fillDOBInsurance('99999999');
  83  |                 await insurancePage.nextBtn.click();
  84  |                 await expect(
  85  |                     insurancePage.page.locator(errorSelector).first()
  86  |                 ).toBeVisible({ timeout: 5_000 });
  87  |             });
  88  |         }
  89  | 
  90  |     });
  91  | 
  92  |     // ── 4. SWITCHING TYPES ────────────────────────────────────────────────────
  93  | 
  94  |     test.describe('Switching insurance types', () => {
  95  | 
  96  |         test('TC-INS-08 — Switching from Insurance to Self-pay hides manual fields', async ({ insurancePage }) => {
  97  |             await insurancePage.selectInsuranceType('Insurance');
  98  |             await insurancePage.manualEntry();
  99  | 
  100 |             // Switch to Self-pay
  101 |             await insurancePage.selectSelfPay();
  102 | 
  103 |             // Manual entry fields should be gone
  104 |             await expect(insurancePage.manualEntryBtn).not.toBeVisible({ timeout: 5_000 });
  105 |         });
  106 | 
  107 |         test('TC-INS-09 — Re-selecting same type works without errors', async ({ insurancePage }) => {
  108 |             await insurancePage.selectSelfPay();
  109 |             await insurancePage.selectSelfPay();
  110 |             await expect(insurancePage.nextBtn).toBeEnabled();
  111 |         });
  112 | 
  113 |     });
  114 | 
  115 |     // ── 5. EDGE CASES ─────────────────────────────────────────────────────────
  116 | 
  117 |     test.describe('Edge cases', () => {
  118 | 
  119 |         test('TC-INS-10 — Insurance dropdown accepts typed search input', async ({ insurancePage }) => {
  120 |             await insurancePage.insuranceInput.click();
  121 |             await insurancePage.insuranceInput.fill('Self');
  122 |             await expect(
  123 |                 insurancePage.page.locator('.MuiAutocomplete-option').first()
  124 |             ).toBeVisible({ timeout: 10_000 });
  125 |         });
  126 | 
  127 |         test('TC-INS-11 — Invalid search shows no dropdown options', async ({ insurancePage }) => {
  128 |             await insurancePage.insuranceInput.click();
  129 |             await insurancePage.insuranceInput.fill('zzzzinvalidinsurance9999');
  130 |             await expect(
  131 |                 insurancePage.page.locator('.MuiAutocomplete-option')
  132 |             ).toHaveCount(0, { timeout: 5_000 });
  133 |         });
  134 | 
  135 |         test('TC-INS-12 — Page loads without any pre-selected insurance', async ({ insurancePage }) => {
  136 |             const value = await insurancePage.insuranceInput.inputValue();
  137 |             expect(value).toBe('');
  138 |         });
  139 | 
  140 |     });
  141 | }
  142 | 
  143 | export { runInsuranceCases };
  144 | 
```