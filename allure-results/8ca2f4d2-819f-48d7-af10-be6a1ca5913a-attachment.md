# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\SINY\cosmetic.spec.js >> Full form combinations >> TC-PI-39 — SMS consent unchecked when smsConsent is false
- Location: tests\e2e\shared\patientInfo.cases.js:338:13

# Error details

```
Error: expect(locator).not.toBeChecked() failed

Locator:  locator('input[type="checkbox"]').first()
Expected: not checked
Received: checked
Timeout:  5000ms

Call log:
  - Expect "not toBeChecked" with timeout 5000ms
  - waiting for locator('input[type="checkbox"]').first()
    14 × locator resolved to <input type="checkbox" id="sms-checkbox" name="emailandsms" data-indeterminate="false" data-gtm-form-interact-field-id="12" class="PrivateSwitchBase-input css-1m9pwf3"/>
       - unexpected value "checked"

```

```yaml
- checkbox [checked]
```

# Test source

```ts
  243 | 
  244 |             test('TC-PI-29 — switching from Doctor to Google hides Doctor Name field', async ({ patientPage }) => {
  245 |                 await patientPage.selectReferral('Doctor');
  246 |                 await expect(patientPage.doctorName).toBeVisible({ timeout: 5_000 });
  247 |                 await patientPage.selectReferral('Google');
  248 |                 await expect(patientPage.doctorName).not.toBeVisible({ timeout: 5_000 });
  249 |             });
  250 | 
  251 |         });
  252 |     }
  253 | 
  254 |     // ── 7. SMS CONSENT ────────────────────────────────────────────────────────
  255 | 
  256 |     if (hasSmsConsent) {
  257 |         test.describe('SMS consent checkbox', () => {
  258 | 
  259 |             test('TC-PI-30 — SMS consent is unchecked by default', async ({ patientPage }) => {
  260 |                 await expect(
  261 |                     patientPage.page.locator('input[type="checkbox"]').first()
  262 |                 ).not.toBeChecked();
  263 |             });
  264 | 
  265 |             test('TC-PI-31 — SMS consent can be checked', async ({ patientPage }) => {
  266 |                 await patientPage.checkSmsConsent();
  267 |                 await expect(
  268 |                     patientPage.page.locator('input[type="checkbox"]').first()
  269 |                 ).toBeChecked();
  270 |             });
  271 | 
  272 |             test('TC-PI-32 — SMS consent stays checked when called twice', async ({ patientPage }) => {
  273 |                 await patientPage.checkSmsConsent();
  274 |                 await patientPage.checkSmsConsent();
  275 |                 await expect(
  276 |                     patientPage.page.locator('input[type="checkbox"]').first()
  277 |                 ).toBeChecked();
  278 |             });
  279 | 
  280 |         });
  281 |     }
  282 | 
  283 |     // ── 8. VALIDATION ─────────────────────────────────────────────────────────
  284 | 
  285 |     test.describe('Form validation', () => {
  286 | 
  287 |         test('TC-PI-33 — empty form submit shows required field errors', async ({ patientPage }) => {
  288 |             await patientPage.submit();
  289 |             await expect(
  290 |                 patientPage.page.locator(errorSelector).first()
  291 |             ).toBeVisible({ timeout: 5_000 });
  292 |         });
  293 | 
  294 |         test('TC-PI-34 — partial form (only firstName) still shows errors', async ({ patientPage }) => {
  295 |             await patientPage.firstName.fill('John');
  296 |             await patientPage.submit();
  297 |             await expect(
  298 |                 patientPage.page.locator(errorSelector).first()
  299 |             ).toBeVisible({ timeout: 5_000 });
  300 |         });
  301 | 
  302 |         test('TC-PI-35 — invalid email format shows validation error', async ({ patientPage }) => {
  303 |             await patientPage.fillBasicInfo({ ...VALID_PATIENT.basicInfo, email: 'not-an-email' });
  304 |             await patientPage.submit();
  305 |             await expect(
  306 |                 patientPage.page.locator(errorSelector).first()
  307 |             ).toBeVisible({ timeout: 5_000 });
  308 |         });
  309 | 
  310 |     });
  311 | 
  312 |     // ── 9. FULL FORM COMBINATIONS ─────────────────────────────────────────────
  313 | 
  314 |     test.describe('Full form combinations', () => {
  315 | 
  316 |         test('TC-PI-36 — all basic fields accept valid data together', async ({ patientPage }) => {
  317 |             await patientPage.fillBasicInfo(VALID_PATIENT.basicInfo);
  318 |             await expect(patientPage.firstName).toHaveValue(VALID_PATIENT.basicInfo.firstName);
  319 |             await expect(patientPage.lastName).toHaveValue(VALID_PATIENT.basicInfo.lastName);
  320 |             await expect(patientPage.email).toHaveValue(VALID_PATIENT.basicInfo.email);
  321 |         });
  322 | 
  323 |         test('TC-PI-37 — Female gender with valid basic info', async ({ patientPage }) => {
  324 |             await patientPage.fillBasicInfo(VALID_PATIENT.basicInfo);
  325 |             await patientPage.selectGender('Female');
  326 |             await expect(patientPage.genderTrigger).toContainText('Female');
  327 |         });
  328 | 
  329 |         if (hasReferral) {
  330 |             test('TC-PI-38 — Facebook referral with full basic info', async ({ patientPage }) => {
  331 |                 await patientPage.fillAll({ ...VALID_PATIENT, gender: 'Female', referral: 'Facebook' });
  332 |                 await expect(patientPage.genderTrigger).toContainText('Female');
  333 |                 await expect(patientPage.referralInput).toHaveValue('Facebook');
  334 |             });
  335 |         }
  336 | 
  337 |         if (hasSmsConsent) {
  338 |             test('TC-PI-39 — SMS consent unchecked when smsConsent is false', async ({ patientPage }) => {
  339 |                 // fillAll with smsConsent: false should leave it unchecked
  340 |                 await patientPage.fillAll({ ...VALID_PATIENT, smsConsent: false });
  341 |                 await expect(
  342 |                     patientPage.page.locator('input[type="checkbox"]').first()
> 343 |                 ).not.toBeChecked();
      |                       ^ Error: expect(locator).not.toBeChecked() failed
  344 |             });
  345 |         }
  346 | 
  347 |     });
  348 | }
  349 | 
  350 | export { runPatientInfoCases };
  351 | 
```