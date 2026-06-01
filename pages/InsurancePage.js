export class InsurancePage {
    constructor(page) {
        this.page = page;

        this.insuranceInput = page.locator('#insurance-select-box');
        this.planInput = page.locator('input[aria-autocomplete="list"]').last();
        this.planNameInput = page.locator('input[placeholder="Other Insurance Plan"]');
        this.dob = page.locator('input[placeholder="MM/DD/YYYY"]');
        this.genderTrigger = page.locator('div#gender[role="combobox"]');
        this.manualEntryBtn = page.locator('button:has-text("Manually Enter Details")');
        this.nextBtn = page.locator('button:has-text("Next")');
    }

    async selectInsuranceType(type) {
        await this.insuranceInput.waitFor({ state: 'visible', timeout: 10_000 });
        await this.insuranceInput.click();
        await this.insuranceInput.fill(type);
        const option = this.page.locator(`.MuiAutocomplete-option:has-text("${type}")`);
        await option.waitFor({ state: 'visible', timeout: 10_000 });
        await option.click();
    }

    async selectSelfPay() {
        await this.selectInsuranceType('Self-pay');
    }

    async manualEntry() {
        await this.manualEntryBtn.waitFor({ state: 'visible', timeout: 10_000 });
        await this.manualEntryBtn.click();
    }

    async selectPlan(value = 'Other') {
        await this.planInput.waitFor({ state: 'visible', timeout: 10_000 });
        await this.planInput.fill(value);
        const option = this.page.locator(`.MuiAutocomplete-option:has-text("${value}")`);
        await option.waitFor({ state: 'visible', timeout: 10_000 });
        await option.click();
    }

    async fillPlanDetails(name = 'Test Insurance Co.') {
        await this.planNameInput.waitFor({ state: 'visible', timeout: 10_000 });
        await this.planNameInput.fill(name);
    }

    async fillDOBInsurance(dob) {
        await this.dob.click();
        await this.dob.pressSequentially(dob.replace(/\D/g, ''), { delay: 80 });
    }

    async selectGenderInsurance(value = 'Male') {
        await this.genderTrigger.click();

        const option = this.page
            .locator('[role="option"]')
            .filter({ hasText: value })
            .first();

        await option.waitFor({ state: 'visible', timeout: 10_000 });
        await option.click();
    }

    async fillInsuranceDetails() {
        const insuranceInput = this.page.locator('input[aria-autocomplete="list"]').last();
        await insuranceInput.waitFor({ state: 'visible', timeout: 10_000 });
        await insuranceInput.fill('Connecticare');
        const insuranceOption = this.page.locator('.MuiAutocomplete-option').first();
        await insuranceOption.waitFor({ state: 'visible', timeout: 10_000 });
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
        await this.nextBtn.waitFor({ state: 'visible', timeout: 10_000 });
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
