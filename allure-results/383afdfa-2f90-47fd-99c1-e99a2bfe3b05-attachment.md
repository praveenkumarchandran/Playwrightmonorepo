# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\booking\create-appointment.spec.js >> State dropdown >> TC19 — filters options by typed text
- Location: tests\e2e\booking\shared\patientInfo.cases.js:157:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[role="option"]').filter({ hasText: 'Michigan' }).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[role="option"]').filter({ hasText: 'Michigan' }).first()

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
              - combobox "State *" [active] [ref=e137]: TX-TexasMich
              - button "Close" [ref=e139] [cursor=pointer]:
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
            - checkbox [ref=e157]
            - img [ref=e158]
          - paragraph [ref=e160]: I give permission for the practice to contact me via SMS or email. I understand that I can opt out at any time.
        - button "Book Now" [ref=e162] [cursor=pointer]
  - generic [ref=e163]: No options
```

# Test source

```ts
  62  |     //     });
  63  | 
  64  |     //     test('TC05 — email accepts valid format', async ({ patientPage }) => {
  65  |     //         await patientPage.fillBasicInfo(VALID_PATIENT.basicInfo);
  66  |     //         await expect(patientPage.email).toHaveValue('johndoe@example.com');
  67  |     //     });
  68  | 
  69  |     //     test('TC06 — phone accepts 10-digit number', async ({ patientPage }) => {
  70  |     //         await patientPage.fillBasicInfo(VALID_PATIENT.basicInfo);
  71  |     //         await expect(patientPage.phone).toHaveValue('5551234567');
  72  |     //     });
  73  | 
  74  |     //     test('TC07 — zip accepts 5-digit value', async ({ patientPage }) => {
  75  |     //         await patientPage.fillBasicInfo(VALID_PATIENT.basicInfo);
  76  |     //         await expect(patientPage.zip).toHaveValue('48335');
  77  |     //     });
  78  | 
  79  |     //     test('TC08 — name fields accept hyphenated and apostrophe names', async ({ patientPage }) => {
  80  |     //         await patientPage.fillBasicInfo({
  81  |     //             ...VALID_PATIENT.basicInfo,
  82  |     //             firstName: 'Mary-Jane',
  83  |     //             lastName: "O'Brien",
  84  |     //         });
  85  |     //         await expect(patientPage.firstName).toHaveValue('Mary-Jane');
  86  |     //         await expect(patientPage.lastName).toHaveValue("O'Brien");
  87  |     //     });
  88  | 
  89  |     // });
  90  | 
  91  |     // ── 3. DATE OF BIRTH ──────────────────────────────────────────────────────
  92  | 
  93  |     // test.describe('Date of Birth', () => {
  94  | 
  95  |     //     test('TC09 — fills DOB in MM/DD/YYYY format', async ({ patientPage }) => {
  96  |     //         await patientPage.fillDOB('01151990');
  97  |     //         await expect(patientPage.dob).toHaveValue('01/15/1990');
  98  |     //     });
  99  | 
  100 |     //     test('TC10 — fills DOB for a minor', async ({ patientPage }) => {
  101 |     //         await patientPage.fillDOB('06202010');
  102 |     //         await expect(patientPage.dob).toHaveValue('06/20/2010');
  103 |     //     });
  104 | 
  105 |     //     test('TC11 — fills DOB for an elderly patient', async ({ patientPage }) => {
  106 |     //         await patientPage.fillDOB('03011935');
  107 |     //         await expect(patientPage.dob).toHaveValue('03/01/1935');
  108 |     //     });
  109 | 
  110 |     // });
  111 | 
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
  140 |     test.describe('State dropdown', () => {
  141 | 
  142 |         test('TC16 — selects MI-Michigan', async ({ patientPage }) => {
  143 |             await patientPage.selectState('MI-Michigan');
  144 |             await expect(patientPage.stateInput).toHaveValue('MI-Michigan');
  145 |         });
  146 | 
  147 |         test('TC17 — selects CA-California', async ({ patientPage }) => {
  148 |             await patientPage.selectState('CA-California');
  149 |             await expect(patientPage.stateInput).toHaveValue('CA-California');
  150 |         });
  151 | 
  152 |         test('TC18 — selects TX-Texas', async ({ patientPage }) => {
  153 |             await patientPage.selectState('TX-Texas');
  154 |             await expect(patientPage.stateInput).toHaveValue('TX-Texas');
  155 |         });
  156 | 
  157 |         test('TC19 — filters options by typed text', async ({ patientPage, page }) => {
  158 |             await patientPage.stateInput.click();
  159 |             await patientPage.stateInput.pressSequentially('Mich', { delay: 50 });
  160 |             await expect(
  161 |                 page.locator('[role="option"]').filter({ hasText: 'Michigan' }).first()
> 162 |             ).toBeVisible();
      |               ^ Error: expect(locator).toBeVisible() failed
  163 |         });
  164 | 
  165 |     });
  166 | 
  167 |     // // ── 6. REFERRAL ───────────────────────────────────────────────────────────
  168 | 
  169 |     // test.describe('How Did You Hear About Us', () => {
  170 | 
  171 |     //     const referralOptions = [
  172 |     //         'Facebook', 'Friend/Relative', 'Google',
  173 |     //         'Physician Coordinator', 'WJR', '95.5 WKQI', '106.7 WLLZ',
  174 |     //     ];
  175 | 
  176 |     //     for (const option of referralOptions) {
  177 |     //         test(`TC — selects "${option}"`, async ({ patientPage }) => {
  178 |     //             await patientPage.selectReferral(option);
  179 |     //             await expect(patientPage.referralInput).toHaveValue(option);
  180 |     //         });
  181 |     //     }
  182 | 
  183 |     //     test('TC20 — selecting Doctor shows Doctor Name field', async ({ patientPage }) => {
  184 |     //         await patientPage.selectReferral('Doctor');
  185 |     //         await expect(patientPage.doctorName).toBeVisible();
  186 |     //     });
  187 | 
  188 |     //     test('TC21 — selecting non-Doctor hides Doctor Name field', async ({ patientPage }) => {
  189 |     //         await patientPage.selectReferral('Google');
  190 |     //         await expect(patientPage.doctorName).not.toBeVisible();
  191 |     //     });
  192 | 
  193 |     //     test('TC22 — Doctor Name field accepts text', async ({ patientPage }) => {
  194 |     //         await patientPage.selectReferral('Doctor');
  195 |     //         await patientPage.selectReferralOther('Dr. Smith');
  196 |     //         await expect(patientPage.doctorName).toHaveValue('Dr. Smith');
  197 |     //     });
  198 | 
  199 |     // });
  200 | 
  201 |     // // ── 7. SMS CONSENT ────────────────────────────────────────────────────────
  202 | 
  203 |     // test.describe('SMS consent checkbox', () => {
  204 | 
  205 |     //     test('TC23 — unchecked by default', async ({ patientPage, page }) => {
  206 |     //         await expect(page.locator('input[type="checkbox"]').first()).not.toBeChecked();
  207 |     //     });
  208 | 
  209 |     //     test('TC24 — clicking MUI span checks the box', async ({ patientPage, page }) => {
  210 |     //         await patientPage.checkSmsConsent();
  211 |     //         await expect(page.locator('input[type="checkbox"]').first()).toBeChecked();
  212 |     //     });
  213 | 
  214 |     //     test('TC25 — calling twice stays checked', async ({ patientPage, page }) => {
  215 |     //         await patientPage.checkSmsConsent();
  216 |     //         await patientPage.checkSmsConsent();
  217 |     //         await expect(page.locator('input[type="checkbox"]').first()).toBeChecked();
  218 |     //     });
  219 | 
  220 |     // });
  221 | 
  222 |     // // ── 8. VALIDATION ─────────────────────────────────────────────────────────
  223 | 
  224 |     // test.describe('Form validation', () => {
  225 | 
  226 |     //     test('TC26 — empty form shows required errors', async ({ patientPage }) => {
  227 |     //         await patientPage.submit();
  228 |     //         await expect(
  229 |     //             patientPage.page.locator('[class*="Mui-error"]').first()
  230 |     //         ).toBeVisible({ timeout: 5_000 });
  231 |     //     });
  232 | 
  233 |     //     test('TC27 — partial form still shows errors', async ({ patientPage }) => {
  234 |     //         await patientPage.firstName.fill('John');
  235 |     //         await patientPage.submit();
  236 |     //         await expect(
  237 |     //             patientPage.page.locator('[class*="Mui-error"]').first()
  238 |     //         ).toBeVisible({ timeout: 5_000 });
  239 |     //     });
  240 | 
  241 |     //     test('TC28 — invalid email shows validation error', async ({ patientPage }) => {
  242 |     //         await patientPage.fillBasicInfo({ ...VALID_PATIENT.basicInfo, email: 'not-an-email' });
  243 |     //         await patientPage.submit();
  244 |     //         await expect(
  245 |     //             patientPage.page.locator('[class*="Mui-error"]').first()
  246 |     //         ).toBeVisible({ timeout: 5_000 });
  247 |     //     });
  248 | 
  249 |     //     test('TC29 — Book Now button is visible and enabled', async ({ patientPage }) => {
  250 |     //         await expect(patientPage.submitBtn).toBeVisible();
  251 |     //         await expect(patientPage.submitBtn).toBeEnabled();
  252 |     //     });
  253 | 
  254 |     // });
  255 | 
  256 |     // // ── 9. FULL FORM VARIATIONS ───────────────────────────────────────────────
  257 | 
  258 |     // test.describe('Full form variations', () => {
  259 | 
  260 |     //     test('TC30 — Female gender + Facebook referral', async ({ patientPage }) => {
  261 |     //         await patientPage.fillAll({ ...VALID_PATIENT, gender: 'Female', referral: 'Facebook' });
  262 |     //         await expect(patientPage.genderTrigger).toContainText('Female');
```