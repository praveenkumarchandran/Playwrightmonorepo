# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\Kronson\newPatient.spec.js >> Self-pay selection >> TC-INS-03 — Continue is disabled before any insurance type selected
- Location: tests\e2e\shared\insurance.cases.js:25:9

# Error details

```
Error: locator.evaluate: Target page, context or browser has been closed
Call log:
  - waiting for locator('button:has-text("Next")')

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
  8   | function runInsuranceCases(test, expect) {
  9   | 
  10  |     // ── 1. SELF-PAY ───────────────────────────────────────────────────────────
  11  | 
  12  |     test.describe('Self-pay selection', () => {
  13  | 
  14  |         test('TC-INS-01 — Self-pay option is selectable', async ({ insurancePage }) => {
  15  |             await insurancePage.selectSelfPay();
  16  |             // After selection the page should show the next button
  17  |             await expect(insurancePage.nextBtn).toBeVisible({ timeout: 10_000 });
  18  |         });
  19  | 
  20  |         test('TC-INS-02 — Continue/Next is enabled after Self-pay selected', async ({ insurancePage }) => {
  21  |             await insurancePage.selectSelfPay();
  22  |             await expect(insurancePage.nextBtn).toBeEnabled();
  23  |         });
  24  | 
  25  |         test('TC-INS-03 — Continue is disabled before any insurance type selected', async ({ insurancePage }) => {
  26  |             // Immediately check before touching anything
> 27  |             const isDisabled = await insurancePage.nextBtn.evaluate(btn =>
      |                                                            ^ Error: locator.evaluate: Target page, context or browser has been closed
  28  |                 btn.disabled || btn.getAttribute('aria-disabled') === 'true'
  29  |             );
  30  |             expect(isDisabled).toBe(true);
  31  |         });
  32  | 
  33  |     });
  34  | 
  35  |     // ── 2. MANUAL ENTRY ───────────────────────────────────────────────────────
  36  | 
  37  |     test.describe('Manual entry flow', () => {
  38  | 
  39  |         test('TC-INS-04 — Manually Enter Details button appears after selecting insurance type', async ({ insurancePage }) => {
  40  |             await insurancePage.selectInsuranceType('Insurance');
  41  |             await expect(insurancePage.manualEntryBtn).toBeVisible({ timeout: 10_000 });
  42  |         });
  43  | 
  44  |         test('TC-INS-05 — Clicking manual entry reveals insurance detail fields', async ({ insurancePage }) => {
  45  |             await insurancePage.selectInsuranceType('Insurance');
  46  |             await insurancePage.manualEntry();
  47  |             // The plan autocomplete input should appear
  48  |             await expect(insurancePage.planInput).toBeVisible({ timeout: 10_000 });
  49  |         });
  50  | 
  51  |     });
  52  | 
  53  |     // ── 3. FIELD VALIDATION ───────────────────────────────────────────────────
  54  | 
  55  |     test.describe('Field validation', () => {
  56  | 
  57  |         test('TC-INS-06 — Submitting without required fields shows errors', async ({ insurancePage }) => {
  58  |             await insurancePage.selectInsuranceType('Insurance');
  59  |             await insurancePage.manualEntry();
  60  |             await insurancePage.nextBtn.click();
  61  |             await expect(
  62  |                 insurancePage.page.locator('[class*="Mui-error"]').first()
  63  |             ).toBeVisible({ timeout: 5_000 });
  64  |         });
  65  | 
  66  |         test('TC-INS-07 — Invalid DOB format shows error', async ({ insurancePage }) => {
  67  |             await insurancePage.selectInsuranceType('Insurance');
  68  |             await insurancePage.manualEntry();
  69  |             await insurancePage.fillDOBInsurance('99999999');
  70  |             await insurancePage.nextBtn.click();
  71  |             await expect(
  72  |                 insurancePage.page.locator('[class*="Mui-error"]').first()
  73  |             ).toBeVisible({ timeout: 5_000 });
  74  |         });
  75  | 
  76  |     });
  77  | 
  78  |     // ── 4. SWITCHING TYPES ────────────────────────────────────────────────────
  79  | 
  80  |     test.describe('Switching insurance types', () => {
  81  | 
  82  |         test('TC-INS-08 — Switching from Insurance to Self-pay hides manual fields', async ({ insurancePage }) => {
  83  |             await insurancePage.selectInsuranceType('Insurance');
  84  |             await insurancePage.manualEntry();
  85  | 
  86  |             // Switch to Self-pay
  87  |             await insurancePage.selectSelfPay();
  88  | 
  89  |             // Manual entry fields should be gone
  90  |             await expect(insurancePage.manualEntryBtn).not.toBeVisible({ timeout: 5_000 });
  91  |         });
  92  | 
  93  |         test('TC-INS-09 — Re-selecting same type works without errors', async ({ insurancePage }) => {
  94  |             await insurancePage.selectSelfPay();
  95  |             await insurancePage.selectSelfPay();
  96  |             await expect(insurancePage.nextBtn).toBeEnabled();
  97  |         });
  98  | 
  99  |     });
  100 | 
  101 |     // ── 5. EDGE CASES ─────────────────────────────────────────────────────────
  102 | 
  103 |     test.describe('Edge cases', () => {
  104 | 
  105 |         test('TC-INS-10 — Insurance dropdown accepts typed search input', async ({ insurancePage }) => {
  106 |             await insurancePage.insuranceInput.click();
  107 |             await insurancePage.insuranceInput.fill('Self');
  108 |             await expect(
  109 |                 insurancePage.page.locator('.MuiAutocomplete-option').first()
  110 |             ).toBeVisible({ timeout: 10_000 });
  111 |         });
  112 | 
  113 |         test('TC-INS-11 — Invalid search shows no dropdown options', async ({ insurancePage }) => {
  114 |             await insurancePage.insuranceInput.click();
  115 |             await insurancePage.insuranceInput.fill('zzzzinvalidinsurance9999');
  116 |             await expect(
  117 |                 insurancePage.page.locator('.MuiAutocomplete-option')
  118 |             ).toHaveCount(0, { timeout: 5_000 });
  119 |         });
  120 | 
  121 |         test('TC-INS-12 — Page loads without any pre-selected insurance', async ({ insurancePage }) => {
  122 |             const value = await insurancePage.insuranceInput.inputValue();
  123 |             expect(value).toBe('');
  124 |         });
  125 | 
  126 |     });
  127 | }
```