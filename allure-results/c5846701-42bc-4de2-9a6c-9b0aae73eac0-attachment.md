# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\booking\create-appointment.spec.js >> Form validation >> TC26 — empty form shows required errors
- Location: tests\e2e\booking\shared\patientInfo.cases.js:227:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[class*="Mui-error"]').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[class*="Mui-error"]').first()

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
- paragraph: 8:30 AM, Fri May 29, 2026
- heading "Appointment Type" [level=6]
- paragraph: Teleconsultation
- text: First Name *
- textbox "First Name *"
- heading "*Please enter patient First Name to proceed" [level=6]
- text: Last Name *
- textbox "Last Name *"
- heading "*Please enter patient Last Name to proceed" [level=6]
- text: Date of Birth *
- textbox "Date of Birth *":
  - /placeholder: MM/DD/YYYY
- button "Choose date"
- heading "*Please enter patient Date of Birth to proceed" [level=6]
- combobox "Gender *":
  - paragraph: Gender *
- heading "*Please enter patient Gender to proceed" [level=6]
- text: Email *
- textbox "Email *"
- heading "*Email is required" [level=6]
- text: Phone *
- spinbutton "Phone *"
- heading "*Phone number is required" [level=6]
- text: Address1 *
- textbox "Address1 *"
- heading "*Street Address is required" [level=6]
- text: Address2 (Optional)
- textbox "Address2 (Optional)"
- text: City *
- textbox "City *"
- heading "*City is required" [level=6]
- combobox "State *"
- button "Open"
- heading "*State selection is required" [level=6]
- text: Home Zip *
- textbox "Home Zip *"
- heading "*Home Zip is required" [level=6]
- text: How Did You Hear About Us? *
- combobox "How Did You Hear About Us? *"
- button "Open"
- checkbox
- paragraph: I give permission for the practice to contact me via SMS or email. I understand that I can opt out at any time.
- heading "Please check the box to consent to receiving digital communications about your appointment." [level=6]
- button "Book Now"
```

# Test source

```ts
  131 |     //     test('TC15 — dropdown closes after selection', async ({ patientPage }) => {
  132 |     //         await patientPage.selectGender('Male');
  133 |     //         await expect(patientPage.genderTrigger).toHaveAttribute('aria-expanded', 'false');
  134 |     //     });
  135 | 
  136 |     // });
  137 | 
  138 |     // // ── 5. STATE ──────────────────────────────────────────────────────────────
  139 | 
  140 |     // test.describe('State dropdown', () => {
  141 | 
  142 |     // test('TC16 — selects MI-Michigan', async ({ patientPage }) => {
  143 |     //     await patientPage.selectState('MI-Michigan');
  144 |     //     await expect(patientPage.stateInput).toHaveValue('MI-Michigan');
  145 |     // });
  146 | 
  147 |     // test('TC17 — selects CA-California', async ({ patientPage }) => {
  148 |     //     await patientPage.selectState('CA-California');
  149 |     //     await expect(patientPage.stateInput).toHaveValue('CA-California');
  150 |     // });
  151 | 
  152 |     // test('TC18 — selects TX-Texas', async ({ patientPage }) => {
  153 |     //     await patientPage.selectState('TX-Texas');
  154 |     //     await expect(patientPage.stateInput).toHaveValue('TX-Texas');
  155 |     // });
  156 | 
  157 |     //     test('TC19 — filters options by typed text', async ({ patientPage }) => {
  158 |     //         await patientPage.stateInput.click();
  159 |     //         await patientPage.stateInput.clear();
  160 |     //         await patientPage.stateInput.pressSequentially('Mich', { delay: 50 });
  161 |     //         await expect(
  162 |     //             patientPage.page.locator('[role="option"]').filter({ hasText: 'MI-Michigan' }).first()
  163 |     //         ).toBeVisible();
  164 |     //     });
  165 | 
  166 |     // });
  167 | 
  168 |     // // ── 6. REFERRAL ───────────────────────────────────────────────────────────
  169 | 
  170 |     // test.describe('How Did You Hear About Us', () => {
  171 | 
  172 |     //     const referralOptions = [
  173 |     //         'Facebook', 'Friend/Relative', 'Google',
  174 |     //         'Physician Coordinator', 'WJR', '95.5 WKQI', '106.7 WLLZ',
  175 |     //     ];
  176 | 
  177 |     //     for (const option of referralOptions) {
  178 |     //         test(`TC — selects "${option}"`, async ({ patientPage }) => {
  179 |     //             await patientPage.selectReferral(option);
  180 |     //             await expect(patientPage.referralInput).toHaveValue(option);
  181 |     //         });
  182 |     //     }
  183 | 
  184 |     //     test('TC20 — selecting Doctor shows Doctor Name field', async ({ patientPage }) => {
  185 |     //         await patientPage.selectReferral('Doctor');
  186 |     //         await expect(patientPage.doctorName).toBeVisible();
  187 |     //     });
  188 | 
  189 |     //     test('TC21 — selecting non-Doctor hides Doctor Name field', async ({ patientPage }) => {
  190 |     //         await patientPage.selectReferral('Google');
  191 |     //         await expect(patientPage.doctorName).not.toBeVisible();
  192 |     //     });
  193 | 
  194 |     //     test('TC22 — Doctor Name field accepts text', async ({ patientPage }) => {
  195 |     //         await patientPage.selectReferral('Doctor');
  196 |     //         await patientPage.selectReferralOther('Dr. Smith');
  197 |     //         await expect(patientPage.doctorName).toHaveValue('Dr. Smith');
  198 |     //     });
  199 | 
  200 |     // });
  201 | 
  202 |     // // ── 7. SMS CONSENT ────────────────────────────────────────────────────────
  203 | 
  204 |     // test.describe('SMS consent checkbox', () => {
  205 | 
  206 |     //     test('TC23 — unchecked by default', async ({ patientPage }) => {
  207 |     //         await expect(patientPage.smsConsent).not.toBeChecked();
  208 |     //     });
  209 | 
  210 |     //     test('TC24 — clicking MUI span checks the box', async ({ patientPage }) => {
  211 |     //         await patientPage.checkSmsConsent();
  212 |     //         await expect(patientPage.smsConsent).toBeChecked();
  213 |     //     });
  214 | 
  215 |     //     test('TC25 — calling twice stays checked', async ({ patientPage }) => {
  216 |     //         await patientPage.checkSmsConsent();
  217 |     //         await patientPage.checkSmsConsent();
  218 |     //         await expect(patientPage.smsConsent).toBeChecked();
  219 |     //     });
  220 | 
  221 |     // });
  222 | 
  223 |     // // ── 8. VALIDATION ─────────────────────────────────────────────────────────
  224 | 
  225 |     test.describe('Form validation', () => {
  226 | 
  227 |         test('TC26 — empty form shows required errors', async ({ patientPage }) => {
  228 |             await patientPage.submit();
  229 |             await expect(
  230 |                 patientPage.page.locator('[class*="Mui-error"]').first()
> 231 |             ).toBeVisible({ timeout: 5_000 });
      |               ^ Error: expect(locator).toBeVisible() failed
  232 |         });
  233 | 
  234 |         test('TC27 — partial form still shows errors', async ({ patientPage }) => {
  235 |             await patientPage.firstName.fill('John');
  236 |             await patientPage.submit();
  237 |             await expect(
  238 |                 patientPage.page.locator('[class*="Mui-error"]').first()
  239 |             ).toBeVisible({ timeout: 5_000 });
  240 |         });
  241 | 
  242 |         test('TC28 — invalid email shows validation error', async ({ patientPage }) => {
  243 |             await patientPage.fillBasicInfo({ ...VALID_PATIENT.basicInfo, email: 'not-an-email' });
  244 |             await patientPage.submit();
  245 |             await expect(
  246 |                 patientPage.page.locator('[class*="Mui-error"]').first()
  247 |             ).toBeVisible({ timeout: 5_000 });
  248 |         });
  249 | 
  250 |         test('TC29 — Book Now button is visible and enabled', async ({ patientPage }) => {
  251 |             await expect(patientPage.submitBtn).toBeVisible();
  252 |             await expect(patientPage.submitBtn).toBeEnabled();
  253 |         });
  254 | 
  255 |     });
  256 | 
  257 |     // ── 9. FULL FORM VARIATIONS ───────────────────────────────────────────────
  258 | 
  259 |     test.describe('Full form variations', () => {
  260 | 
  261 |         test('TC30 — Female gender + Facebook referral', async ({ patientPage }) => {
  262 |             await patientPage.fillAll({ ...VALID_PATIENT, gender: 'Female', referral: 'Facebook' });
  263 |             await expect(patientPage.genderTrigger).toContainText('Female');
  264 |             await expect(patientPage.referralInput).toHaveValue('Facebook');
  265 |         });
  266 | 
  267 |         test('TC31 — Doctor referral fills Doctor Name', async ({ patientPage }) => {
  268 |             await patientPage.fillAll({ ...VALID_PATIENT, referral: 'Doctor', referralOther: 'Dr. Johnson' });
  269 |             await expect(patientPage.referralInput).toHaveValue('Doctor');
  270 |             await expect(patientPage.doctorName).toHaveValue('Dr. Johnson');
  271 |         });
  272 | 
  273 |         test('TC32 — smsConsent false stays unchecked', async ({ patientPage, page }) => {
  274 |             await patientPage.fillAll({ ...VALID_PATIENT, smsConsent: false });
  275 |             await expect(page.locator('input[type="checkbox"]').first()).not.toBeChecked();
  276 |         });
  277 | 
  278 |         test('TC33 — Friend/Relative referral', async ({ patientPage }) => {
  279 |             await patientPage.fillAll({ ...VALID_PATIENT, referral: 'Friend/Relative' });
  280 |             await expect(patientPage.referralInput).toHaveValue('Friend/Relative');
  281 |         });
  282 | 
  283 |     });
  284 | }
  285 | 
  286 | export { runPatientInfoCases };
```