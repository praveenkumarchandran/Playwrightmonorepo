# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\SINY\medical.spec.js >> Form validation >> TC-PI-35 — invalid email format shows validation error
- Location: tests\e2e\shared\patientInfo.cases.js:302:9

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
  - heading "718-491-5800" [level=6]
- button "1":
  - paragraph: "1"
- paragraph: Location
- button "2":
  - paragraph: "2"
- paragraph: Intake Questions
- button "3":
  - paragraph: "3"
- paragraph: Choose Date & Time
- button "4":
  - paragraph: "4"
- paragraph: Add Insurance
- button "5":
  - paragraph: "5"
- paragraph: Add Info
- heading "Your Appointment" [level=5]
- img "provider"
- heading "Alexa McGhee" [level=5]
- separator
- heading "Appointment Time" [level=6]
- paragraph: 9:30 AM, Thu Jun 11, 2026
- heading "Appointment Type" [level=6]
- paragraph: Skin Problem
- text: First Name *
- textbox "First Name *": John
- text: Last Name *
- textbox "Last Name *": Doe
- text: Date of Birth *
- textbox "Date of Birth *":
  - /placeholder: MM/DD/YYYY
- button "Choose date"
- heading "*Please enter patient Date of Birth to proceed" [level=6]
- combobox "Gender *":
  - paragraph: Gender *
- heading "*Please enter patient Gender to proceed" [level=6]
- text: Email *
- textbox "Email *": not-an-email
- heading "*Invalid email" [level=6]
- text: Phone *
- spinbutton "Phone *": "5551234567"
- text: Address1 *
- textbox "Address1 *": 123 Main St
- text: Address2 (Optional)
- textbox "Address2 (Optional)"
- text: City *
- textbox "City *": Farmington Hills
- combobox "State *"
- button "Open"
- heading "*State selection is required" [level=6]
- text: Home Zip *
- textbox "Home Zip *": "48335"
- checkbox
- paragraph: I give permission for the practice to contact me via SMS or email. I understand that I can opt out at any time.
- heading "Please check the box to consent to receiving digital communications about your appointment." [level=6]
- button "Book Now"
```

# Test source

```ts
  207 |                 ).toHaveCount(0, { timeout: 5_000 });
  208 |             });
  209 | 
  210 |         });
  211 |     }
  212 | 
  213 |     // ── 6. REFERRAL ───────────────────────────────────────────────────────────
  214 | 
  215 |     if (hasReferral) {
  216 |         test.describe('How did you hear about us', () => {
  217 | 
  218 |             test('TC-PI-24 — Google referral is selectable', async ({ patientPage }) => {
  219 |                 await patientPage.selectReferral('Google');
  220 |                 await expect(patientPage.referralInput).toHaveValue('Google');
  221 |             });
  222 | 
  223 |             test('TC-PI-25 — Facebook referral is selectable', async ({ patientPage }) => {
  224 |                 await patientPage.selectReferral('Facebook');
  225 |                 await expect(patientPage.referralInput).toHaveValue('Facebook');
  226 |             });
  227 | 
  228 |             test('TC-PI-26 — Friend/Relative referral is selectable', async ({ patientPage }) => {
  229 |                 await patientPage.selectReferral('Friend/Relative');
  230 |                 await expect(patientPage.referralInput).toHaveValue('Friend/Relative');
  231 |             });
  232 | 
  233 |             test('TC-PI-27 — selecting Doctor shows Doctor Name field', async ({ patientPage }) => {
  234 |                 await patientPage.selectReferral('Doctor');
  235 |                 await expect(patientPage.doctorName).toBeVisible({ timeout: 5_000 });
  236 |             });
  237 | 
  238 |             test('TC-PI-28 — Doctor Name field accepts input', async ({ patientPage }) => {
  239 |                 await patientPage.selectReferral('Doctor');
  240 |                 await patientPage.selectReferralOther('Dr. Smith');
  241 |                 await expect(patientPage.doctorName).toHaveValue('Dr. Smith');
  242 |             });
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
> 307 |             ).toBeVisible({ timeout: 5_000 });
      |               ^ Error: expect(locator).toBeVisible() failed
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
  343 |                 ).not.toBeChecked();
  344 |             });
  345 |         }
  346 | 
  347 |     });
  348 | }
  349 | 
  350 | export { runPatientInfoCases };
  351 | 
```