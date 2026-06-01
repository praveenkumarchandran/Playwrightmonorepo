export class LandingPage {
    constructor(page) {
        this.page = page;
        this.newPatientBtn = page.locator('button#newPatient-button');
        this.reasonDropdown = page.locator('input#serviceType-select-box');
    }

    async open(url) {
        await this.page.goto(url, { waitUntil: 'networkidle' });
    }

    async startNewPatient(reasonType) {
        // Reason must be selected BEFORE clicking New Patient
        await this.reasonDropdown.waitFor({ state: 'visible', timeout: 10_000 });
        await this.reasonDropdown.click();
        await this.reasonDropdown.pressSequentially(reasonType, { delay: 50 });
        const option = this.page.locator('[role="option"]').filter({ hasText: reasonType }).first();
        await option.waitFor({ state: 'visible', timeout: 10_000 });
        await option.click();
        console.log(`Reason selected: ${reasonType}`);

        await this.newPatientBtn.waitFor({ state: 'visible', timeout: 10_000 });
        await this.newPatientBtn.click();

        await this.page.waitForLoadState('networkidle', { timeout: 30_000 });
    }
}