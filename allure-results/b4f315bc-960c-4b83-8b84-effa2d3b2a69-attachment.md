# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\booking\create-appointment.spec.js >> SMS consent checkbox >> TC24 — clicking MUI span checks the box
- Location: tests\e2e\booking\shared\patientInfo.cases.js:210:9

# Error details

```
Error: expect(locator).toBeChecked() failed

Locator: locator('input[type="checkbox"]').first()
Expected: checked
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeChecked" with timeout 5000ms
  - waiting for locator('input[type="checkbox"]').first()

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
          - paragraph [ref=e83]: 8:30 AM, Fri May 29, 2026
        - generic [ref=e84]:
          - heading "Appointment Type" [level=6] [ref=e85]
          - paragraph [ref=e87]: Teleconsultation
    - generic [ref=e89]:
      - generic [ref=e90]:
        - generic [ref=e91]:
          - generic [ref=e93]:
            - generic: First Name *
            - generic [ref=e94]:
              - textbox "First Name *" [ref=e95]
              - group:
                - generic: First Name *
          - generic [ref=e97]:
            - generic: Last Name *
            - generic [ref=e98]:
              - textbox "Last Name *" [ref=e99]
              - group:
                - generic: Last Name *
          - generic [ref=e101]:
            - generic: Date of Birth *
            - generic [ref=e102]:
              - textbox "Date of Birth *" [ref=e103]:
                - /placeholder: MM/DD/YYYY
              - button "Choose date" [ref=e105] [cursor=pointer]:
                - img [ref=e106]
              - group:
                - generic: Date of Birth *
          - generic [ref=e109]:
            - combobox "Gender *" [ref=e110] [cursor=pointer]:
              - paragraph [ref=e111]: Gender *
            - textbox
            - img
            - group
          - generic [ref=e113]:
            - generic: Email *
            - generic [ref=e114]:
              - textbox "Email *" [ref=e115]
              - group:
                - generic: Email *
          - generic [ref=e117]:
            - generic: Phone *
            - generic [ref=e118]:
              - spinbutton "Phone *" [ref=e119]
              - group:
                - generic: Phone *
        - generic [ref=e120]:
          - generic [ref=e122]:
            - generic: Address1 *
            - generic [ref=e123]:
              - textbox "Address1 *" [ref=e124]
              - group:
                - generic: Address1 *
          - generic [ref=e126]:
            - generic: Address2 (Optional)
            - generic [ref=e127]:
              - textbox "Address2 (Optional)" [ref=e128]
              - group:
                - generic: Address2 (Optional)
          - generic [ref=e130]:
            - generic: City *
            - generic [ref=e131]:
              - textbox "City *" [ref=e132]
              - group:
                - generic: City *
          - generic [ref=e136]:
            - combobox "State *" [ref=e137]
            - button "Open" [ref=e139] [cursor=pointer]:
              - img [ref=e140]
            - group
          - generic [ref=e143]:
            - generic: Home Zip *
            - generic [ref=e144]:
              - textbox "Home Zip *" [ref=e145]
              - group:
                - generic: Home Zip *
          - generic [ref=e148]:
            - generic: How Did You Hear About Us? *
            - generic [ref=e149]:
              - combobox "How Did You Hear About Us? *" [ref=e150]
              - button "Open" [ref=e152] [cursor=pointer]:
                - img [ref=e153]
              - group:
                - generic: How Did You Hear About Us? *
      - generic [ref=e155]:
        - generic [ref=e156] [cursor=pointer]:
          - checkbox [checked] [active] [ref=e157]
          - img [ref=e158]
        - paragraph [ref=e160]: I give permission for the practice to contact me via SMS or email. I understand that I can opt out at any time.
      - button "Book Now" [ref=e162] [cursor=pointer]
```

# Test source

```ts
  112 |     // ── 4. GENDER ─────────────────────────────────────────────────────────────
  113 | 
  114 |     // test.describe('Gender dropdown', () => {
  115 | 
  116 |     //     test('TC12 — selects Male', async ({ patientPage }) => {
  117 |     //         await patientPage.selectGender('Male');
  118 |     //         await expect(patientPage.genderTrigger).toContainText('Male');
  119 |     //     });
  120 | 
  121 |     //     test('TC13 — selects Female', async ({ patientPage }) => {
  122 |     //         await patientPage.selectGender('Female');
  123 |     //         await expect(patientPage.genderTrigger).toContainText('Female');
  124 |     //     });
  125 | 
  126 |     //     test('TC14 — selects Other', async ({ patientPage }) => {
  127 |     //         await patientPage.selectGender('Other');
  128 |     //         await expect(patientPage.genderTrigger).toContainText('Other');
  129 |     //     });
  130 | 
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
  204 |     test.describe('SMS consent checkbox', () => {
  205 | 
  206 |         test('TC23 — unchecked by default', async ({ patientPage, page }) => {
  207 |             await expect(page.locator('input[type="checkbox"]').first()).not.toBeChecked();
  208 |         });
  209 | 
  210 |         test('TC24 — clicking MUI span checks the box', async ({ patientPage, page }) => {
  211 |             await patientPage.checkSmsConsent();
> 212 |             await expect(page.locator('input[type="checkbox"]').first()).toBeChecked();
      |                                                                          ^ Error: expect(locator).toBeChecked() failed
  213 |         });
  214 | 
  215 |         test('TC25 — calling twice stays checked', async ({ patientPage, page }) => {
  216 |             await patientPage.checkSmsConsent();
  217 |             await patientPage.checkSmsConsent();
  218 |             await expect(page.locator('input[type="checkbox"]').first()).toBeChecked();
  219 |         });
  220 | 
  221 |     });
  222 | 
  223 |     // // ── 8. VALIDATION ─────────────────────────────────────────────────────────
  224 | 
  225 |     // test.describe('Form validation', () => {
  226 | 
  227 |     //     test('TC26 — empty form shows required errors', async ({ patientPage }) => {
  228 |     //         await patientPage.submit();
  229 |     //         await expect(
  230 |     //             patientPage.page.locator('[class*="Mui-error"]').first()
  231 |     //         ).toBeVisible({ timeout: 5_000 });
  232 |     //     });
  233 | 
  234 |     //     test('TC27 — partial form still shows errors', async ({ patientPage }) => {
  235 |     //         await patientPage.firstName.fill('John');
  236 |     //         await patientPage.submit();
  237 |     //         await expect(
  238 |     //             patientPage.page.locator('[class*="Mui-error"]').first()
  239 |     //         ).toBeVisible({ timeout: 5_000 });
  240 |     //     });
  241 | 
  242 |     //     test('TC28 — invalid email shows validation error', async ({ patientPage }) => {
  243 |     //         await patientPage.fillBasicInfo({ ...VALID_PATIENT.basicInfo, email: 'not-an-email' });
  244 |     //         await patientPage.submit();
  245 |     //         await expect(
  246 |     //             patientPage.page.locator('[class*="Mui-error"]').first()
  247 |     //         ).toBeVisible({ timeout: 5_000 });
  248 |     //     });
  249 | 
  250 |     //     test('TC29 — Book Now button is visible and enabled', async ({ patientPage }) => {
  251 |     //         await expect(patientPage.submitBtn).toBeVisible();
  252 |     //         await expect(patientPage.submitBtn).toBeEnabled();
  253 |     //     });
  254 | 
  255 |     // });
  256 | 
  257 |     // // ── 9. FULL FORM VARIATIONS ───────────────────────────────────────────────
  258 | 
  259 |     // test.describe('Full form variations', () => {
  260 | 
  261 |     //     test('TC30 — Female gender + Facebook referral', async ({ patientPage }) => {
  262 |     //         await patientPage.fillAll({ ...VALID_PATIENT, gender: 'Female', referral: 'Facebook' });
  263 |     //         await expect(patientPage.genderTrigger).toContainText('Female');
  264 |     //         await expect(patientPage.referralInput).toHaveValue('Facebook');
  265 |     //     });
  266 | 
  267 |     //     test('TC31 — Doctor referral fills Doctor Name', async ({ patientPage }) => {
  268 |     //         await patientPage.fillAll({ ...VALID_PATIENT, referral: 'Doctor', referralOther: 'Dr. Johnson' });
  269 |     //         await expect(patientPage.referralInput).toHaveValue('Doctor');
  270 |     //         await expect(patientPage.doctorName).toHaveValue('Dr. Johnson');
  271 |     //     });
  272 | 
  273 |     //     test('TC32 — smsConsent false stays unchecked', async ({ patientPage, page }) => {
  274 |     //         await patientPage.fillAll({ ...VALID_PATIENT, smsConsent: false });
  275 |     //         await expect(page.locator('input[type="checkbox"]').first()).not.toBeChecked();
  276 |     //     });
  277 | 
  278 |     //     test('TC33 — Friend/Relative referral', async ({ patientPage }) => {
  279 |     //         await patientPage.fillAll({ ...VALID_PATIENT, referral: 'Friend/Relative' });
  280 |     //         await expect(patientPage.referralInput).toHaveValue('Friend/Relative');
  281 |     //     });
  282 | 
  283 |     // });
  284 | }
  285 | 
  286 | export { runPatientInfoCases };
```