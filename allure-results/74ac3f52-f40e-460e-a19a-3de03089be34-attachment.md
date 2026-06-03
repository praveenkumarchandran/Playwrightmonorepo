# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\SINY\cosmetic.spec.js >> Existing Patient — identity search >> New Patient button — from identity page >> TC-NP-07 — New Patient button click from error state navigates to find appointment
- Location: tests\e2e\shared\existingPatient.cases.js:188:13

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=/no matching|not found/i')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=/no matching|not found/i')

```

```yaml
- banner:
  - img "logo"
  - heading "718-491-5800" [level=6]
- heading "Please enter your details:" [level=3]
- text: Sorry we didn’t find any matching patients. Please check your entries or call the office to schedule. First Name
- textbox "First Name": InvalidXYZ999
- text: Last Name
- textbox "Last Name": InvalidXYZ999
- text: Date of Birth
- textbox "Date of Birth":
  - /placeholder: MM/DD/YYYY
  - text: 01/08/1987
- button "Choose date, selected date is Jan 8, 1987"
- button "Find Appointment"
- button "New Patient"
- heading "Powered by" [level=6]
- img "MUlogo"
```

# Test source

```ts
  93  |                 await expect(existingPatientPage.validationError.first()).toBeVisible({ timeout: 5_000 });
  94  |             });
  95  | 
  96  |             test('TC-EP-12 — submitting with only DOB shows validation errors', async ({ existingPatientPage }) => {
  97  |                 await existingPatientPage.dobInput.click();
  98  |                 await existingPatientPage.dobInput.fill(dob);
  99  |                 await existingPatientPage.findBtn.click();
  100 |                 await expect(existingPatientPage.validationError.first()).toBeVisible({ timeout: 5_000 });
  101 |             });
  102 | 
  103 |         });
  104 | 
  105 |         // ── Edge cases ────────────────────────────────────────────────────────
  106 | 
  107 |         test.describe('Edge cases', () => {
  108 | 
  109 |             test('TC-EP-13 — clearing a field after input resets its value', async ({ existingPatientPage }) => {
  110 |                 await existingPatientPage.firstNameInput.fill(firstName);
  111 |                 await existingPatientPage.firstNameInput.clear();
  112 |                 await expect(existingPatientPage.firstNameInput).toHaveValue('');
  113 |             });
  114 | 
  115 |             test('TC-EP-14 — invalid patient credentials show error or no-results state', async ({ existingPatientPage }) => {
  116 |                 await existingPatientPage.search('InvalidXYZ999', 'InvalidXYZ999', dob);
  117 |                 // App shows "Sorry we didn't find any matching patients" OR keeps form visible
  118 |                 const errorMsg = existingPatientPage.page.locator(
  119 |                     'text=/no matching|not found|no result|could not find|to proceed/i'
  120 |                 );
  121 |                 const errorVisible = await errorMsg.isVisible({ timeout: 10_000 }).catch(() => false);
  122 |                 const formStillVisible = await existingPatientPage.firstNameInput.isVisible().catch(() => false);
  123 |                 expect(errorVisible || formStillVisible).toBe(true);
  124 |             });
  125 | 
  126 |             test('TC-EP-15 — special characters in name fields are accepted', async ({ existingPatientPage }) => {
  127 |                 await existingPatientPage.firstNameInput.fill("O'Brien-Smith");
  128 |                 await expect(existingPatientPage.firstNameInput).toHaveValue("O'Brien-Smith");
  129 |             });
  130 | 
  131 |         });
  132 | 
  133 |         // ── New Patient button (on identity page) ─────────────────────────────
  134 |         // The "New Patient" button is NOT present on initial load.
  135 |         // It appears only after a failed patient search (wrong credentials).
  136 |         // Clicking it redirects to /findappointment (slot selection page).
  137 | 
  138 |         test.describe('New Patient button — from identity page', () => {
  139 | 
  140 |             // ── Positive ──────────────────────────────────────────────────────
  141 | 
  142 |             test('TC-NP-01 — New Patient button appears after a failed search', async ({ existingPatientPage }) => {
  143 |                 await existingPatientPage.search('InvalidXYZ999', 'InvalidXYZ999', dob);
  144 |                 await expect(existingPatientPage.newPatientBtn).toBeVisible({ timeout: 10_000 });
  145 |             });
  146 | 
  147 |             test('TC-NP-02 — clicking New Patient after failed search redirects to find appointment page', async ({ existingPatientPage }) => {
  148 |                 await existingPatientPage.search('InvalidXYZ999', 'InvalidXYZ999', dob);
  149 |                 await existingPatientPage.newPatientBtn.waitFor({ state: 'visible', timeout: 10_000 });
  150 |                 await existingPatientPage.newPatientBtn.click();
  151 |                 await existingPatientPage.page.waitForLoadState('networkidle', { timeout: 20_000 });
  152 |                 await expect(existingPatientPage.firstNameInput).not.toBeVisible({ timeout: 15_000 });
  153 |                 expect(existingPatientPage.page.url()).toContain('/findappointment');
  154 |             });
  155 | 
  156 |             test('TC-NP-03 — New Patient button is enabled after it appears', async ({ existingPatientPage }) => {
  157 |                 await existingPatientPage.search('InvalidXYZ999', 'InvalidXYZ999', dob);
  158 |                 await existingPatientPage.newPatientBtn.waitFor({ state: 'visible', timeout: 10_000 });
  159 |                 await expect(existingPatientPage.newPatientBtn).toBeEnabled();
  160 |             });
  161 | 
  162 |             // ── Negative ──────────────────────────────────────────────────────
  163 | 
  164 |             test('TC-NP-04 — New Patient button is NOT visible on initial load before any search', async ({ existingPatientPage }) => {
  165 |                 // Button must be absent until a failed search is submitted
  166 |                 await expect(existingPatientPage.newPatientBtn).not.toBeVisible({ timeout: 3_000 });
  167 |             });
  168 | 
  169 |             test('TC-NP-05 — New Patient button stays visible after re-filling all fields following a failed search', async ({ existingPatientPage }) => {
  170 |                 await existingPatientPage.search('InvalidXYZ999', 'InvalidXYZ999', dob);
  171 |                 await existingPatientPage.newPatientBtn.waitFor({ state: 'visible', timeout: 10_000 });
  172 |                 // Re-fill fields — button should remain available
  173 |                 await existingPatientPage.fill(firstName, lastName, dob);
  174 |                 await expect(existingPatientPage.newPatientBtn).toBeVisible();
  175 |                 await expect(existingPatientPage.newPatientBtn).toBeEnabled();
  176 |             });
  177 | 
  178 |             // ── Edge cases ────────────────────────────────────────────────────
  179 | 
  180 |             test('TC-NP-06 — New Patient button stays visible after a second failed search', async ({ existingPatientPage }) => {
  181 |                 await existingPatientPage.search('InvalidXYZ999', 'InvalidXYZ999', dob);
  182 |                 await existingPatientPage.newPatientBtn.waitFor({ state: 'visible', timeout: 10_000 });
  183 |                 // Search again with different bad credentials
  184 |                 await existingPatientPage.search('AnotherBad999', 'AnotherBad999', dob);
  185 |                 await expect(existingPatientPage.newPatientBtn).toBeVisible({ timeout: 10_000 });
  186 |             });
  187 | 
  188 |             test('TC-NP-07 — New Patient button click from error state navigates to find appointment', async ({ existingPatientPage }) => {
  189 |                 await existingPatientPage.search('InvalidXYZ999', 'InvalidXYZ999', dob);
  190 |                 await existingPatientPage.newPatientBtn.waitFor({ state: 'visible', timeout: 10_000 });
  191 |                 // Verify error is shown, then switch to new patient
  192 |                 const errorMsg = existingPatientPage.page.locator('text=/no matching|not found/i');
> 193 |                 await expect(errorMsg).toBeVisible({ timeout: 5_000 });
      |                                        ^ Error: expect(locator).toBeVisible() failed
  194 |                 await existingPatientPage.newPatientBtn.click();
  195 |                 await existingPatientPage.page.waitForLoadState('networkidle', { timeout: 20_000 });
  196 |                 await expect(existingPatientPage.firstNameInput).not.toBeVisible({ timeout: 15_000 });
  197 |                 expect(existingPatientPage.page.url()).toContain('/findappointment');
  198 |             });
  199 | 
  200 |         });
  201 |     });
  202 | }
  203 | 
```