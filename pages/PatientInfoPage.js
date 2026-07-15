export class PatientInfoPage {
    constructor(page) {
        this.page = page;

        // ── Text inputs ───────────────────────────────────────────────────────
        this.firstName = page.locator('input[name*="firstName"]');
        this.lastName = page.locator('input[name*="lastName"]');
        this.email = page.locator('input[name="email"]');
        this.phone = page.locator('input[name*="phone"], input[type="tel"]').first();
        this.address1 = page.locator('input[name*="address1"], input[placeholder="Address1 *"], input[placeholder*="Address 1"]').first();
        this.address2 = page.locator('input[name*="address2"], input[placeholder="Address2 (Optional)"], input[placeholder*="Address 2"]').first();
        this.city     = page.locator('input[name*="city"],     input[placeholder="City *"]').first();
        // "Home Zip" placeholder confirmed from SINY screenshot; name attr fallback for TNDI/Clarus
        this.zip = page.locator('input[name*="homeZip"], input[name*="zip"], input[placeholder*="Zip"]').first();
        // Date of Birth — MUI DatePicker (type="text", placeholder="MM/DD/YYYY").
        // SINY shows a floating label "Date of Birth *" but input placeholder is still MM/DD/YYYY.
        this.dob = page.locator('input[placeholder="MM/DD/YYYY"]').first();

        // ── Dropdowns (confirmed via DevTools) ────────────────────────────────
        // Gender  → MUI Select <div id="gender" role="combobox"> (NOT an input)
        this.genderTrigger = page.locator('div#gender[role="combobox"]');

        // State   → MUI Autocomplete <input id="state-select-box" role="combobox">
        this.stateInput = page.locator('input#state-select-box');

        // Referral → MUI Autocomplete <input id="referral-select-box" role="combobox">
        this.referralInput = page.locator('input#referral-select-box');

        // ── Conditional & other ───────────────────────────────────────────────
        // ── "Your Appointment" summary panel (left sidebar) ──────────────────
        this.summaryHeading      = page.getByText(/Your Appointment/i).first();
        this.summaryApptTime     = page.getByText(/Appointment Time/i).first();
        this.summaryApptType     = page.getByText(/Appointment Type/i).first();

        this.doctorName = page.locator('input[placeholder="Enter Doctor Name"]');
        this.smsConsent = page.locator('input[type="checkbox"]').first();
        this.submitBtn = page.locator('button:has-text("Book Now")');
    }

    // ── Public API ────────────────────────────────────────────────────────────

    async fillBasicInfo(data) {
        await this.firstName.waitFor({ state: 'visible' });
        await this.firstName.fill(data.firstName);
        await this.lastName.fill(data.lastName);
        await this.email.fill(data.email);

        await this.phone.click();
        await this.phone.clear();
        await this.phone.fill(String(data.phone));

        await this.address1.fill(data.address);
        if (data.address2) await this.address2.fill(data.address2);

        await this.city.fill(data.city);
        await this.zip.fill(String(data.zip));
    }

    async fillDOB(dob) {
        const digits = dob.replace(/\D/g, ''); // e.g. '01151990'
        const isDateInput = await this.dob.evaluate(el => el.type === 'date').catch(() => false);

        if (isDateInput) {
            // Native date picker (e.g. Kronson) — expects YYYY-MM-DD
            const y = digits.slice(4, 8);
            const m = digits.slice(0, 2);
            const d = digits.slice(2, 4);
            await this.dob.fill(`${y}-${m}-${d}`);
        } else {
            // Masked text input (TNDI) — type digits sequentially
            await this.dob.click();
            await this.dob.pressSequentially(digits, { delay: 30 });
        }
    }

    /**
     * Gender is a MUI Select <div role="combobox"> — not an input.
     * Click the div to open the listbox, then click the matching option.
     *
     * @param {'Male'|'Female'|'Other'} value
     */
    async selectGender(value = 'Male') {
        await this.genderTrigger.click();

        const option = this.page
            .locator('[role="option"]')
            .filter({ hasText: value })
            .first();

        await option.waitFor({ state: 'visible' });
        await option.click();

        console.log(`Gender selected: ${value}`);
    }

    /**
     * State is a MUI Autocomplete <input id="state-select-box">.
     * Type to filter, then click the matching option.
     * Options are in "XX-StateName" format e.g. "MI-Michigan".
     *
     * NOTE: waitForResponse removed — no API call fires on open.
     *
     * @param {string} value  e.g. 'MI-Michigan' or just 'Michigan'
     */
    async selectState(value = 'MI-Michigan') {
        const hasAutocomplete = await this.stateInput.isVisible({ timeout: 3_000 }).catch(() => false);

        if (hasAutocomplete) {
            // TNDI — MUI Autocomplete input
            await this.stateInput.click();
            await this.stateInput.clear();
            await this.stateInput.pressSequentially(value, { delay: 20 });
        } else {
            // Kronson — MUI Select dropdown (div trigger, not input)
            const trigger = this.page
                .locator('[class*="MuiFormControl"]')
                .filter({ has: this.page.locator('label:has-text("State")') })
                .locator('[role="combobox"], .MuiSelect-select')
                .first();
            await trigger.waitFor({ state: 'visible' });
            await trigger.click();
        }

        const option = this.page
            .locator('[role="option"]')
            .filter({ hasText: value })
            .first();

        await option.waitFor({ state: 'visible' });
        await option.click();
        console.log(`State selected: ${value}`);
    }

    /**
     * Referral is a MUI Autocomplete <input id="referral-select-box">.
     * Same component as State — type to filter, click option.
     * Options: Doctor, Facebook, Friend/Relative, Google,
     *          Physician Coordinator, WJR, 95.5 WKQI, 106.7 WLLZ
     *
     * NOTE: li[role="option"] was wrong — correct selector is [role="option"].
     *
     * @param {'Doctor'|'Facebook'|'Friend/Relative'|'Google'|'Physician Coordinator'|'WJR'|'95.5 WKQI'|'106.7 WLLZ'} value
     */
    async selectReferral(value) {
        await this.referralInput.click();
        await this.referralInput.clear();
        await this.referralInput.pressSequentially(value, { delay: 20 });

        const option = this.page
            .locator('[role="option"]')
            .filter({ hasText: value })
            .first();

        await option.waitFor({ state: 'visible' });
        await option.click();

        console.log(`Referral selected: ${value}`);
    }

    /** Only visible after selecting 'Doctor' as referral */
    async selectReferralOther(name) {
        await this.doctorName.waitFor({ state: 'visible', timeout: 5_000 });
        await this.doctorName.fill(name);
        console.log(`Doctor Name filled: ${name}`);
    }

    async checkSmsConsent() {
        if (!(await this.smsConsent.isChecked())) await this.smsConsent.check();
        console.log('SMS consent checked');
    }

    async submit() {
        await this.submitBtn.click();
    }

    /**
     * Fill the whole form in one call.
     * @example
     * await patientPage.fillAll({
     *   basicInfo: {
     *     firstName: 'John',  lastName: 'Doe',
     *     email: 'john@example.com', phone: '5551234567',
     *     address: '123 Main St',    city: 'Farmington Hills', zip: '48335'
     *   },
     *   dob:           '01151990',       // MMDDYYYY digits only
     *   gender:        'Male',
     *   state:         'MI-Michigan',
     *   referral:      'Doctor',
     *   referralOther: 'Dr. Smith',      // only when referral === 'Doctor'
     *   smsConsent:    true,
     * });
     */
    async fillAll({ basicInfo, dob, gender, state, referral, referralOther, smsConsent } = {}) {
        if (basicInfo) await this.fillBasicInfo(basicInfo);
        if (dob) await this.fillDOB(dob);
        if (gender) await this.selectGender(gender);
        if (state) await this.selectState(state);
        if (referral) {
            const fieldExists = await this.referralInput.isVisible({ timeout: 2_000 }).catch(() => false);
            if (fieldExists) {
                await this.selectReferral(referral);
                if (referralOther) await this.selectReferralOther(referralOther);
            }
        }
        if (smsConsent) await this.checkSmsConsent();
    }
}







