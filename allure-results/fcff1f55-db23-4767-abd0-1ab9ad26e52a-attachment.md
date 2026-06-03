# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\TNDI\newPatient.spec.js >> Navigation >> TC-INS-13b — completing private insurance with Self as holder navigates to patient info
- Location: tests\e2e\shared\insurance.cases.js:360:13

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[name*="firstName"]').first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('input[name*="firstName"]').first()

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
  - text: GRP123
- text: Member ID
- textbox "Member ID": MBR456
- text: Primary Insurance Holder
- combobox "Primary Insurance Holder"
- button "Open"
- button "Next"
```

# Test source

```ts
  271 |             const dependentOptions = holderOptions.filter(o => o !== 'Self');
  272 |             for (const holder of dependentOptions) {
  273 |                 test(`TC-INS-H0${holderOptions.indexOf(holder) + 2} — selecting "${holder}" reveals insured name, last name, and DOB fields`, async ({ insurancePage }) => {
  274 |                     await insurancePage.prepareInsuranceForm(defaultInsuranceType);
  275 |                     await insurancePage.selectPrimaryHolder(holder);
  276 |                     await expect(insurancePage.insuredFirstName).toBeVisible({ timeout: 5_000 });
  277 |                     await expect(insurancePage.insuredLastName).toBeVisible({ timeout: 5_000 });
  278 |                     await expect(insurancePage.insuredDOB).toBeVisible({ timeout: 5_000 });
  279 |                 });
  280 |             }
  281 | 
  282 |             // ── Edge: toggle holder back to Self ────────────────────────────
  283 |             if (holderOptions.includes('Self') && dependentOptions.length > 0) {
  284 |                 test(`TC-INS-H08 — switching holder from "${dependentOptions[0]}" back to "Self" hides the insured fields again`, async ({ insurancePage }) => {
  285 |                     await insurancePage.prepareInsuranceForm(defaultInsuranceType);
  286 |                     await insurancePage.selectPrimaryHolder(dependentOptions[0]);
  287 |                     await expect(insurancePage.insuredFirstName).toBeVisible({ timeout: 5_000 });
  288 |                     await insurancePage.selectPrimaryHolder('Self');
  289 |                     await expect(insurancePage.insuredFirstName).not.toBeVisible({ timeout: 5_000 });
  290 |                 });
  291 |             }
  292 | 
  293 |             // ── Fill & persistence tests ─────────────────────────────────────
  294 |             const dependentHolder = holderOptions.find(o => o !== 'Self') ?? holderOptions[0];
  295 |             const TEST_FNAME = 'InsuredTest';
  296 |             const TEST_LNAME = 'PersonTest';
  297 | 
  298 |             test(`TC-INS-H05 — insured fields accept input after selecting "${dependentHolder}"`, async ({ insurancePage }) => {
  299 |                 await insurancePage.prepareInsuranceForm(defaultInsuranceType);
  300 |                 await insurancePage.selectPrimaryHolder(dependentHolder);
  301 |                 await insurancePage.insuredFirstName.fill(TEST_FNAME);
  302 |                 await insurancePage.insuredLastName.fill(TEST_LNAME);
  303 |                 await insurancePage.selectInsuredGender('Male');
  304 |                 await insurancePage.insuredDOB.click();
  305 |                 await insurancePage.insuredDOB.pressSequentially('01011990', { delay: 30 });
  306 |                 await expect(insurancePage.insuredFirstName).toHaveValue(TEST_FNAME);
  307 |                 await expect(insurancePage.insuredLastName).toHaveValue(TEST_LNAME);
  308 |             });
  309 | 
  310 |             if (stepBeforeInsurance) {
  311 |                 test(`TC-INS-H06 — navigating to "${stepBeforeInsurance}" via stepper and back preserves insured field values`, async ({ insurancePage }) => {
  312 |                     await insurancePage.prepareInsuranceForm(defaultInsuranceType);
  313 |                     await insurancePage.selectPrimaryHolder(dependentHolder);
  314 |                     await insurancePage.insuredFirstName.fill(TEST_FNAME);
  315 |                     await insurancePage.insuredLastName.fill(TEST_LNAME);
  316 |                     await insurancePage.clickStepperStep(stepBeforeInsurance);
  317 |                     await insurancePage.page.waitForLoadState('networkidle', { timeout: 20_000 });
  318 |                     await insurancePage.clickStepperStep('Add Insurance');
  319 |                     await insurancePage.page.waitForLoadState('networkidle', { timeout: 20_000 });
  320 |                     await expect(insurancePage.insuredFirstName).toBeVisible({ timeout: 10_000 });
  321 |                     await expect(insurancePage.insuredFirstName).toHaveValue(TEST_FNAME);
  322 |                     await expect(insurancePage.insuredLastName).toHaveValue(TEST_LNAME);
  323 |                 });
  324 |             }
  325 | 
  326 |             if (intakeStepLabel && stepBeforeInsurance) {
  327 |                 test(`TC-INS-H07 — navigating Insurance → "${intakeStepLabel}" → "${stepBeforeInsurance}" → "Add Insurance" preserves insured field values`, async ({ insurancePage }) => {
  328 |                     await insurancePage.prepareInsuranceForm(defaultInsuranceType);
  329 |                     await insurancePage.selectPrimaryHolder(dependentHolder);
  330 |                     await insurancePage.insuredFirstName.fill(TEST_FNAME);
  331 |                     await insurancePage.insuredLastName.fill(TEST_LNAME);
  332 |                     await insurancePage.clickStepperStep(intakeStepLabel);
  333 |                     await insurancePage.page.waitForLoadState('networkidle', { timeout: 20_000 });
  334 |                     await insurancePage.clickStepperStep(stepBeforeInsurance);
  335 |                     await insurancePage.page.waitForLoadState('networkidle', { timeout: 20_000 });
  336 |                     await insurancePage.clickStepperStep('Add Insurance');
  337 |                     await insurancePage.page.waitForLoadState('networkidle', { timeout: 20_000 });
  338 |                     await expect(insurancePage.insuredFirstName).toBeVisible({ timeout: 10_000 });
  339 |                     await expect(insurancePage.insuredFirstName).toHaveValue(TEST_FNAME);
  340 |                     await expect(insurancePage.insuredLastName).toHaveValue(TEST_LNAME);
  341 |                 });
  342 |             }
  343 | 
  344 |         });
  345 |     }
  346 | 
  347 |     // ── 8. NAVIGATION ────────────────────────────────────────────────────────
  348 | 
  349 |     test.describe('Navigation', () => {
  350 | 
  351 |         test('TC-INS-13 — completing Self-pay and clicking Continue navigates to the patient info page', async ({ insurancePage }) => {
  352 |             await insurancePage.selectSelfPay();
  353 |             await insurancePage.continue();
  354 |             await expect(
  355 |                 insurancePage.page.locator('input[name*="firstName"]').first()
  356 |             ).toBeVisible({ timeout: 15_000 });
  357 |         });
  358 | 
  359 |         if (canCompletePrivateInsurance) {
  360 |             test('TC-INS-13b — completing private insurance with Self as holder navigates to patient info', async ({ insurancePage }) => {
  361 |                 await insurancePage.prepareInsuranceForm(defaultInsuranceType);
  362 |                 await insurancePage.groupIdInput.waitFor({ state: 'visible', timeout: 10_000 });
  363 |                 await insurancePage.groupIdInput.fill('GRP123');
  364 |                 await insurancePage.memberIdInput.fill('MBR456');
  365 |                 if ((opts.holderOptions ?? []).includes('Self')) {
  366 |                     await insurancePage.selectPrimaryHolder('Self');
  367 |                 }
  368 |                 await insurancePage.continue();
  369 |                 await expect(
  370 |                     insurancePage.page.locator('input[name*="firstName"]').first()
> 371 |                 ).toBeVisible({ timeout: 15_000 });
      |                   ^ Error: expect(locator).toBeVisible() failed
  372 |             });
  373 |         }
  374 | 
  375 |         if (hasSkipButton) {
  376 |             test('TC-INS-14 — Skip button bypasses insurance and navigates to the patient info page', async ({ insurancePage }) => {
  377 |                 const skipBtn = insurancePage.page
  378 |                     .locator('button:has-text("Skip")')
  379 |                     .first();
  380 |                 await expect(skipBtn).toBeVisible({ timeout: 10_000 });
  381 |                 await skipBtn.click();
  382 |                 await expect(
  383 |                     insurancePage.page.locator('input[name*="firstName"]').first()
  384 |                 ).toBeVisible({ timeout: 15_000 });
  385 |             });
  386 |         }
  387 | 
  388 |     });
  389 | }
  390 | 
  391 | export { runInsuranceCases };
  392 | 
```