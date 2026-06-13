export class InsurancePage {
    constructor(page) {
        this.page = page;

        // MUI Autocomplete (TNDI/Clarus) — typed search input
        this.insuranceInput = page.locator('#insurance-select-box');

        // MUI Select (Kronson-style) — click div trigger, pick from listbox
        this.insuranceSelect = page.locator(
            '[class*="MuiSelect-select"], [class*="MuiInputBase-input"][role="combobox"]'
        ).first();

        // Plan search — MUI Autocomplete for TNDI/Clarus; MUI Select (▼) for SINY
        this.planInput = page.locator('input[aria-autocomplete="list"]').last();
        this.planNameInput = page.locator('input[placeholder="Other Insurance Plan"]');

        // Group ID / Member ID — plain text inputs present after Manually Enter Details
        // placeholder confirmed from SINY screenshots; name attr fallback for TNDI/Clarus
        this.groupIdInput  = page.locator('input[placeholder="Group ID"],  input[name*="group_id"]').first();
        this.memberIdInput = page.locator('input[placeholder="Member ID"], input[name*="member_id"]').first();

        this.dob = page.locator('input[placeholder="MM/DD/YYYY"]');
        this.genderTrigger = page.locator('div#gender[role="combobox"]');

        // ── "Your Appointment" summary panel ──────────────────────────────────
        // Visible on insurance + patient info pages — shows provider name, time, type
        // confirming the slot selected on the find appointment page carried through.
        // Regex matching handles heading elements whose textContent includes child node text
        this.summaryHeading      = page.getByText(/Your Appointment/i).first();
        this.summaryApptTime     = page.getByText(/Appointment Time/i).first();
        this.summaryApptType     = page.getByText(/Appointment Type/i).first();

        // "How would you like to provide your insurance details?" — two side-by-side buttons
        this.takePictureBtn = page.locator('button:has-text("Take Picture of Card")');
        this.manualEntryBtn = page.locator('button:has-text("Manually Enter Details")');

        // ── Primary Insurance Holder section ──────────────────────────────────
        // Appears after clicking Manually Enter Details.
        // Holder options: Self | Spouse | Other
        // When Spouse or Other is selected, extra insured fields appear.
        //
        // Placeholder-based selectors confirmed from screenshot — fall back to name attr
        // for clients (TNDI/Clarus) that may use different placeholder text.
        this.insuredFirstName = page.locator(
            'input[placeholder="Name of Insured FirstName"], input[name*="firstname" i]'
        ).first();
        this.insuredLastName = page.locator(
            'input[placeholder="Name of Insured LastName"], input[name*="lastname" i]'
        ).first();
        // Insured DOB — MUI DatePicker (type="text", placeholder="MM/DD/YYYY").
        // NOT type="date" and NOT placeholder="Date of Birth" — those don't exist in the DOM.
        // The calendar icon (📅) button is the most visible indicator; use .last() since
        // this field appears only after Spouse/Other is selected and is the last date input.
        this.insuredDOB = page.locator('input[placeholder="MM/DD/YYYY"]').last();

        this.nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
    }

    async selectInsuranceType(type) {
        const hasAutocomplete = await this.insuranceInput
            .isVisible({ timeout: 10_000 })
            .catch(() => false);

        if (hasAutocomplete) {
            // TNDI / Clarus — MUI Autocomplete: type to filter
            await this.insuranceInput.click();
            await this.insuranceInput.fill(type);
            const option = this.page.locator(`.MuiAutocomplete-option:has-text("${type}")`);
            await option.waitFor({ state: 'visible', timeout: 20_000 });
            await option.click();
        } else {
            // Kronson-style — MUI Select: click trigger, pick from listbox
            await this.insuranceSelect.waitFor({ state: 'visible', timeout: 20_000 });
            await this.insuranceSelect.click();
            const option = this.page
                .locator('[role="option"], li[role="option"]')
                .filter({ hasText: type })
                .first();
            await option.waitFor({ state: 'visible', timeout: 20_000 });
            await option.click();
        }
    }

    async selectSelfPay() {
        await this.selectInsuranceType('Self-pay');
    }

    /**
     * Click "Manually Enter Details" if it is visible (admin-configurable button).
     * Self-healing: if admin has disabled the button choice UI, this is a no-op
     * and the detail fields will already be visible directly.
     * Returns true if the button was clicked, false if fields appeared without it.
     */
    async manualEntry() {
        const isVisible = await this.manualEntryBtn.isVisible({ timeout: 3_000 }).catch(() => false);
        if (isVisible) {
            await this.manualEntryBtn.click();
            console.log('Manually Enter Details clicked');
            return true;
        }
        console.log('Manually Enter Details button absent — fields appear directly (admin config)');
        return false;
    }

    /**
     * Select an insurance type AND handle the button/direct-fields difference dynamically.
     * Replaces the pattern: selectInsuranceType(type) + if(hasManualEntryBtn) manualEntry()
     * Works regardless of admin config (button present or not).
     */
    async prepareInsuranceForm(type) {
        await this.selectInsuranceType(type);
        await this.manualEntry(); // self-healing — no-op if button absent
    }

    async selectPlan(value = 'Other') {
        await this.planInput.waitFor({ state: 'visible', timeout: 20_000 });
        await this.planInput.fill(value);
        const option = this.page.locator(`.MuiAutocomplete-option:has-text("${value}")`);
        await option.waitFor({ state: 'visible', timeout: 20_000 });
        await option.click();
    }

    async fillPlanDetails(name = 'Test Insurance Co.') {
        await this.planNameInput.waitFor({ state: 'visible', timeout: 20_000 });
        await this.planNameInput.fill(name);
    }

    async fillDOBInsurance(dob) {
        await this.dob.click();
        await this.dob.pressSequentially(dob.replace(/\D/g, ''), { delay: 30 });
    }

    /**
     * Select the Primary Insurance Holder value (Self / Spouse / Other).
     *
     * MUI Select triggers in SINY use role="button" aria-haspopup="listbox" — NOT role="combobox".
     * The trigger is identified by its placeholder text "Primary Insurance Holder" so it is
     * not confused with the Insurance Type or Insurance Plan dropdowns on the same page.
     *
     * Autocomplete clients (TNDI/Clarus): holder is an autocomplete combobox input.
     */
    async selectPrimaryHolder(value) {
        const hasAutocomplete = await this.insuranceInput
            .isVisible({ timeout: 3_000 })
            .catch(() => false);

        let trigger;
        if (hasAutocomplete) {
            // Autocomplete client (TNDI/Clarus)
            trigger = this.page.locator('[role="combobox"]')
                .filter({ hasText: /Self|Spouse|Other/i })
                .first();
        } else {
            // MUI Select client (SINY).
            // After Manually Enter Details, MUI Selects on the page are:
            //   [0] Insurance Type  [1] Insurance Plan  [2] Primary Holder  [3] Gender*
            // * Gender (index 3) only appears AFTER Spouse/Other is selected.
            //
            // Strategy: count the triggers.
            //   count == 3  → first selection, Gender not yet visible → Primary Holder is .last()
            //   count >= 4  → re-selection, Gender visible → Primary Holder is .nth(2)
            const allTriggers = this.page.locator(
                '[class*="MuiSelect-select"], [class*="MuiInputBase-input"][role="combobox"]'
            );
            const count = await allTriggers.count();
            trigger = count >= 4
                ? allTriggers.nth(2)   // Gender visible — Primary Holder is 3rd (index 2)
                : allTriggers.last();  // Gender not yet shown — Primary Holder is last
        }

        await trigger.waitFor({ state: 'visible', timeout: 20_000 });
        await trigger.click();

        const option = this.page.locator('[role="option"]').filter({ hasText: value }).first();
        await option.waitFor({ state: 'visible', timeout: 10_000 });
        await option.click();
        console.log(`Primary Insurance Holder set to: ${value}`);
    }

    async selectGenderInsurance(value = 'Male') {
        await this.genderTrigger.click();

        const option = this.page
            .locator('[role="option"]')
            .filter({ hasText: value })
            .first();

        await option.waitFor({ state: 'visible', timeout: 20_000 });
        await option.click();
    }

    /**
     * Select the insured person's Gender (appears after Spouse/Other holder is selected).
     * After Spouse/Other is chosen, Gender becomes the LAST MUI Select on the page
     * (Insurance Type → Insurance Plan → Primary Holder → Gender).
     * Same selector as selectPrimaryHolder but called AFTER holder is set.
     */
    async selectInsuredGender(value = 'Male') {
        const trigger = this.page.locator(
            '[class*="MuiSelect-select"], [class*="MuiInputBase-input"][role="combobox"]'
        ).last();
        await trigger.waitFor({ state: 'visible', timeout: 20_000 });
        await trigger.click();
        const option = this.page.locator('[role="option"]').filter({ hasText: value }).first();
        await option.waitFor({ state: 'visible', timeout: 10_000 });
        await option.click();
        console.log(`Insured gender set to: ${value}`);
    }

    /**
     * Click a stepper step by its visible label text to navigate between form steps.
     * Works for completed steps only (previous steps are always clickable).
     * Example: clickStepperStep('Choose Date & Time')
     */
    async clickStepperStep(stepLabel) {
        const step = this.page.getByText(stepLabel, { exact: true }).first();
        await step.waitFor({ state: 'visible', timeout: 20_000 });
        await step.click();
        console.log(`Stepper navigated to: ${stepLabel}`);
    }

    async fillInsuranceDetails() {
        const insuranceInput = this.page.locator('input[aria-autocomplete="list"]').last();
        await insuranceInput.waitFor({ state: 'visible', timeout: 20_000 });
        await insuranceInput.fill('Connecticare');
        const insuranceOption = this.page.locator('.MuiAutocomplete-option').first();
        await insuranceOption.waitFor({ state: 'visible', timeout: 20_000 });
        await insuranceOption.click();

        await this.page.fill('input[name="insurance_group_id"]', '12345678');
        await this.page.fill('input[name="insurance_member_id"]', '11');

        await this.page.click('text=Spouse');
        await this.page.click('.MuiAutocomplete-option:has-text("Spouse")');

        await this.page.fill('input[name="insurance_person_firstname-input"]', 'eweee');
        await this.page.fill('input[name="insurance_person_lastname-input"]', 'eeee');

        await this.page.click('text=Male');
        await this.page.click('.MuiAutocomplete-option:has-text("Male")');

        await this.fillDOBInsurance('01011990');
    }

    async continue() {
        await this.nextBtn.waitFor({ state: 'visible', timeout: 20_000 });
        await this.nextBtn.click();
    }

    async completeInsurance(type = 'Self-pay') {
        await this.selectInsuranceType(type);

        if (type !== 'Self-pay') {
            await this.manualEntry();
            await this.fillInsuranceDetails();
        }

        await this.continue();
    }
}
