# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\Kronson\newPatient.spec.js >> Full form variations >> TC32 — smsConsent false stays unchecked
- Location: tests\e2e\shared\patientInfo.cases.js:297:13

# Error details

```
Error: expect(locator).not.toBeChecked() failed

Locator: locator('input[type="checkbox"]').first()
Expected: not checked
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "not toBeChecked" with timeout 5000ms
  - waiting for locator('input[type="checkbox"]').first()

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e7]:
        - img "logo" [ref=e9]
        - heading "888-214-4110" [level=6] [ref=e12]
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
        - paragraph [ref=e44]: Add Insurance
      - generic [ref=e48]:
        - button "4" [ref=e50] [cursor=pointer]:
          - paragraph [ref=e51]: "4"
        - paragraph [ref=e54]: Add Info
  - generic [ref=e57]:
    - generic [ref=e59]:
      - heading "Your Appointment" [level=5] [ref=e60]
      - generic [ref=e61]:
        - generic [ref=e62]:
          - heading "Location" [level=6] [ref=e63]
          - paragraph [ref=e65]: Arcadia
        - generic [ref=e66]:
          - heading "Location Address" [level=6] [ref=e67]
          - paragraph [ref=e69]: 301 W Huntington Dr Suite 519, CA CA 91007
        - generic [ref=e70]:
          - heading "Appointment Time" [level=6] [ref=e71]
          - paragraph [ref=e73]: 12:00 PM, Wed Jun 3, 2026
        - generic [ref=e74]:
          - heading "Appointment Type" [level=6] [ref=e75]
          - paragraph [ref=e77]: Vein Consult
    - generic [ref=e79]:
      - generic [ref=e80]:
        - generic [ref=e81]:
          - generic [ref=e83]:
            - generic [ref=e84]: First Name *
            - generic [ref=e85]:
              - textbox "First Name *" [ref=e86]: John
              - group:
                - generic: First Name *
          - generic [ref=e88]:
            - generic [ref=e89]: Last Name *
            - generic [ref=e90]:
              - textbox "Last Name *" [ref=e91]: Doe
              - group:
                - generic: Last Name *
          - generic [ref=e93]:
            - generic [ref=e94]: Date of Birth *
            - generic [ref=e95]:
              - textbox "Date of Birth *" [ref=e96]:
                - /placeholder: MM/DD/YYYY
                - text: 01/15/1990
              - button "Choose date, selected date is Jan 15, 1990" [ref=e98] [cursor=pointer]:
                - img [ref=e99]
              - group:
                - generic: Date of Birth *
          - generic [ref=e102]:
            - combobox "Male" [ref=e103] [cursor=pointer]
            - textbox: Male
            - img
            - group
          - generic [ref=e105]:
            - generic [ref=e106]: Email *
            - generic [ref=e107]:
              - textbox "Email *" [ref=e108]: johndoe@example.com
              - group:
                - generic: Email *
          - generic [ref=e110]:
            - generic [ref=e111]: Phone *
            - generic [ref=e112]:
              - spinbutton "Phone *" [ref=e113]: "5551234567"
              - group:
                - generic: Phone *
        - generic [ref=e114]:
          - generic [ref=e116]:
            - generic [ref=e117]: Address1 *
            - generic [ref=e118]:
              - textbox "Address1 *" [ref=e119]: 123 Main St
              - group:
                - generic: Address1 *
          - generic [ref=e121]:
            - generic: Address2 (Optional)
            - generic [ref=e122]:
              - textbox "Address2 (Optional)" [ref=e123]
              - group:
                - generic: Address2 (Optional)
          - generic [ref=e125]:
            - generic [ref=e126]: City *
            - generic [ref=e127]:
              - textbox "City *" [ref=e128]: Farmington Hills
              - group:
                - generic: City *
          - generic [ref=e132]:
            - combobox "State *" [active] [ref=e133]: MI-Michigan
            - button "Open" [ref=e135] [cursor=pointer]:
              - img [ref=e136]
            - group
          - generic [ref=e139]:
            - generic [ref=e140]: Home Zip *
            - generic [ref=e141]:
              - textbox "Home Zip *" [ref=e142]: "48335"
              - group:
                - generic: Home Zip *
      - generic [ref=e143]:
        - generic [ref=e144] [cursor=pointer]:
          - checkbox [ref=e145]
          - img [ref=e146]
        - paragraph [ref=e148]: I consent to receive marketing text messages from Kronson Medical Corporation DBA Kronson Vein Institute at the phone number provided. Frequency may vary. Message & data rates may apply. Call 626-254-2287 for assistance, reply STOP to opt out.
      - generic [ref=e149]:
        - generic [ref=e150] [cursor=pointer]:
          - checkbox [ref=e151]
          - img [ref=e152]
        - paragraph [ref=e154]: I consent to receive non-marketing text messages from Kronson Medical Corporation DBA Kronson Vein Institute about my appointment reminders, scheduling confirmations, and post-appointment follow-ups, etc. Frequency may vary. Message & data rates may apply. Call 626-254-2287 for assistance, reply STOP to opt out.
      - paragraph [ref=e156]:
        - link "Privacy Policy" [ref=e157] [cursor=pointer]:
          - /url: https://www.kronsonveininstitute.com/privacy-policy/
        - text: "|"
        - link "Terms and Conditions" [ref=e158] [cursor=pointer]:
          - /url: https://www.kronsonveininstitute.com/terms-and-conditions/
      - button "Book Now" [ref=e160] [cursor=pointer]
```

# Test source

```ts
  199 | 
  200 |     //     test('TC21 — selecting non-Doctor hides Doctor Name field', async ({ patientPage }) => {
  201 |     //         await patientPage.selectReferral('Google');
  202 |     //         await expect(patientPage.doctorName).not.toBeVisible();
  203 |     //     });
  204 | 
  205 |     //     test('TC22 — Doctor Name field accepts text', async ({ patientPage }) => {
  206 |     //         await patientPage.selectReferral('Doctor');
  207 |     //         await patientPage.selectReferralOther('Dr. Smith');
  208 |     //         await expect(patientPage.doctorName).toHaveValue('Dr. Smith');
  209 |     //     });
  210 | 
  211 |     // });
  212 | 
  213 |     // // ── 7. SMS CONSENT ────────────────────────────────────────────────────────
  214 | 
  215 |     // test.describe('SMS consent checkbox', () => {
  216 | 
  217 |     //     test('TC23 — unchecked by default', async ({ patientPage }) => {
  218 |     //         await expect(patientPage.smsConsent).not.toBeChecked();
  219 |     //     });
  220 | 
  221 |     //     test('TC24 — clicking MUI span checks the box', async ({ patientPage }) => {
  222 |     //         await patientPage.checkSmsConsent();
  223 |     //         await expect(patientPage.smsConsent).toBeChecked();
  224 |     //     });
  225 | 
  226 |     //     test('TC25 — calling twice stays checked', async ({ patientPage }) => {
  227 |     //         await patientPage.checkSmsConsent();
  228 |     //         await patientPage.checkSmsConsent();
  229 |     //         await expect(patientPage.smsConsent).toBeChecked();
  230 |     //     });
  231 | 
  232 |     // });
  233 | 
  234 |     // // ── 8. VALIDATION ─────────────────────────────────────────────────────────
  235 | 
  236 |     test.describe('Form validation', () => {
  237 | 
  238 |         test('TC26 — empty form shows required errors', async ({ patientPage }) => {
  239 |             await patientPage.submit();
  240 |             await expect(
  241 |                 patientPage.page.locator(errorSelector).first()
  242 |             ).toBeVisible({ timeout: 5_000 });
  243 |         });
  244 | 
  245 |         test('TC27 — partial form still shows errors', async ({ patientPage }) => {
  246 |             await patientPage.firstName.fill('John');
  247 |             await patientPage.submit();
  248 |             await expect(
  249 |                 patientPage.page.locator(errorSelector).first()
  250 |             ).toBeVisible({ timeout: 5_000 });
  251 |         });
  252 | 
  253 |         test('TC28 — invalid email shows validation error', async ({ patientPage }) => {
  254 |             await patientPage.fillBasicInfo({ ...VALID_PATIENT.basicInfo, email: 'not-an-email' });
  255 |             await patientPage.submit();
  256 |             await expect(
  257 |                 patientPage.page.locator(errorSelector).first()
  258 |             ).toBeVisible({ timeout: 5_000 });
  259 |         });
  260 | 
  261 |         test('TC29 — Book Now button is visible and enabled', async ({ patientPage }) => {
  262 |             await expect(patientPage.submitBtn).toBeVisible();
  263 |             await expect(patientPage.submitBtn).toBeEnabled();
  264 |         });
  265 | 
  266 |     });
  267 | 
  268 |     // ── 9. FULL FORM VARIATIONS ───────────────────────────────────────────────
  269 | 
  270 |     test.describe('Full form variations', () => {
  271 | 
  272 |         test('TC30 — Female gender selection', async ({ patientPage }) => {
  273 |             await patientPage.selectGender('Female');
  274 |             await expect(patientPage.genderTrigger).toContainText('Female');
  275 |         });
  276 | 
  277 |         if (hasReferral) {
  278 |             test('TC30b — Female gender + Facebook referral', async ({ patientPage }) => {
  279 |                 await patientPage.fillAll({ ...VALID_PATIENT, gender: 'Female', referral: 'Facebook' });
  280 |                 await expect(patientPage.genderTrigger).toContainText('Female');
  281 |                 await expect(patientPage.referralInput).toHaveValue('Facebook');
  282 |             });
  283 | 
  284 |             test('TC31 — Doctor referral fills Doctor Name', async ({ patientPage }) => {
  285 |                 await patientPage.fillAll({ ...VALID_PATIENT, referral: 'Doctor', referralOther: 'Dr. Johnson' });
  286 |                 await expect(patientPage.referralInput).toHaveValue('Doctor');
  287 |                 await expect(patientPage.doctorName).toHaveValue('Dr. Johnson');
  288 |             });
  289 | 
  290 |             test('TC33 — Friend/Relative referral', async ({ patientPage }) => {
  291 |                 await patientPage.fillAll({ ...VALID_PATIENT, referral: 'Friend/Relative' });
  292 |                 await expect(patientPage.referralInput).toHaveValue('Friend/Relative');
  293 |             });
  294 |         }
  295 | 
  296 |         if (hasSmsConsent) {
  297 |             test('TC32 — smsConsent false stays unchecked', async ({ patientPage, page }) => {
  298 |                 await patientPage.fillAll({ ...VALID_PATIENT, smsConsent: false });
> 299 |                 await expect(page.locator('input[type="checkbox"]').first()).not.toBeChecked();
      |                                                                                  ^ Error: expect(locator).not.toBeChecked() failed
  300 |             });
  301 |         }
  302 | 
  303 |     });
  304 | }
  305 | 
  306 | export { runPatientInfoCases };
```