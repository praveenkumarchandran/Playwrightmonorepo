# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\TNDI\newPatient.spec.js >> Field validation >> TC-INS-06 — Submitting without required fields shows errors
- Location: tests\e2e\shared\insurance.cases.js:138:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[class*="Mui-error"], [aria-invalid="true"]').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[class*="Mui-error"], [aria-invalid="true"]').first()

```

```yaml
- banner:
  - img "logo"
  - heading "586-416-3472" [level=6]
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
- heading "Location" [level=6]
- paragraph: The Nerve and Disc Institute Farmington
- heading "Location Address" [level=6]
- paragraph: 24100 Drake Rd, MI 48335
- heading "Appointment Time" [level=6]
- paragraph: 8:30 AM, Fri Jun 5, 2026
- heading "Appointment Type" [level=6]
- paragraph: Teleconsultation
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
  63  |                 expect(isDisabled).toBe(true);
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
> 143 |             ).toBeVisible({ timeout: 5_000 });
      |               ^ Error: expect(locator).toBeVisible() failed
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
  164 |             await insurancePage.prepareInsuranceForm(defaultInsuranceType);
  165 |             await insurancePage.selectSelfPay();
  166 |             // Verify the manual entry UI (if it was shown) is gone after switching to Self-pay
  167 |             const btnStillVisible = await insurancePage.manualEntryBtn.isVisible({ timeout: 2_000 }).catch(() => false);
  168 |             expect(btnStillVisible).toBe(false);
  169 |             // Next must still be enabled after switching
  170 |             await expect(insurancePage.nextBtn).toBeEnabled();
  171 |         });
  172 | 
  173 |         test('TC-INS-09 — Re-selecting same type works without errors', async ({ insurancePage }) => {
  174 |             await insurancePage.selectSelfPay();
  175 |             await insurancePage.selectSelfPay();
  176 |             await expect(insurancePage.nextBtn).toBeEnabled();
  177 |         });
  178 | 
  179 |     });
  180 | 
  181 |     // ── 5. EDGE CASES (autocomplete clients only) ─────────────────────────────
  182 |     // TC-INS-10/11/12 use the typed-search input (#insurance-select-box) which
  183 |     // is only present for MUI-Autocomplete clients (TNDI, Clarus, SINY, Freedman).
  184 |     // Set hasAutocompleteSearch: false for MUI-Select clients (Kronson) to skip.
  185 | 
  186 |     if (hasAutocompleteSearch) {
  187 |         test.describe('Edge cases', () => {
  188 | 
  189 |             test('TC-INS-10 — Insurance dropdown accepts typed search input', async ({ insurancePage }) => {
  190 |                 await insurancePage.insuranceInput.click();
  191 |                 await insurancePage.insuranceInput.fill('Self');
  192 |                 await expect(
  193 |                     insurancePage.page.locator('.MuiAutocomplete-option').first()
  194 |                 ).toBeVisible({ timeout: 10_000 });
  195 |             });
  196 | 
  197 |             test('TC-INS-11 — Invalid search shows no dropdown options', async ({ insurancePage }) => {
  198 |                 await insurancePage.insuranceInput.click();
  199 |                 await insurancePage.insuranceInput.fill('zzzzinvalidinsurance9999');
  200 |                 await expect(
  201 |                     insurancePage.page.locator('.MuiAutocomplete-option')
  202 |                 ).toHaveCount(0, { timeout: 5_000 });
  203 |             });
  204 | 
  205 |             test('TC-INS-12 — Page loads without any pre-selected insurance', async ({ insurancePage }) => {
  206 |                 const value = await insurancePage.insuranceInput.inputValue();
  207 |                 expect(value).toBe('');
  208 |             });
  209 | 
  210 |         });
  211 |     }
  212 | 
  213 |     // ── 6. INSURANCE TYPE VARIANTS ────────────────────────────────────────────
  214 |     // opts.insuranceTypes: every non-self-pay type available in the dropdown for
  215 |     // this client (e.g. ['Insurance', 'Medicare', 'Medicaid']).
  216 |     // A test is generated for each type verifying it is selectable and reveals
  217 |     // the expected detail UI (manual entry button OR direct fields).
  218 | 
  219 |     const insuranceTypes = opts.insuranceTypes ?? [];
  220 | 
  221 |     if (insuranceTypes.length > 0) {
  222 |         test.describe('Insurance type variants', () => {
  223 | 
  224 |             insuranceTypes.forEach((type, i) => {
  225 |                 const tcNum = `TC-INS-${15 + i}`;
  226 | 
  227 |                 test(`${tcNum} — "${type}" is selectable and insurance detail UI appears`, async ({ insurancePage }) => {
  228 |                     await insurancePage.selectInsuranceType(type);
  229 |                     // Detect dynamically: button flow OR direct fields
  230 |                     const hasBtn = await insurancePage.manualEntryBtn.isVisible({ timeout: 5_000 }).catch(() => false);
  231 |                     if (hasBtn) {
  232 |                         await expect(insurancePage.manualEntryBtn).toBeVisible();
  233 |                     } else {
  234 |                         await expect(insurancePage.nextBtn).toBeEnabled({ timeout: 10_000 });
  235 |                     }
  236 |                 });
  237 | 
  238 |             });
  239 | 
  240 |         });
  241 |     }
  242 | 
  243 |     // ── 7. PRIMARY INSURANCE HOLDER ───────────────────────────────────────────
```