export class IntakePage {
    constructor(page) {
        this.page = page;

        this.symptomsInput = page.locator('input[placeholder="What symptoms are you experiencing?"]');
        this.noLabels = page.locator('.MuiFormControlLabel-root:has-text("No")');
        this.continueBtn = page.locator('button:has-text("Continue")');
        this.spinner = page.locator('span.MuiCircularProgress-root').first();
    }

    async waitForLoad() {
        await this.spinner
            .waitFor({ state: 'detached', timeout: 20_000 })
            .catch(() => { });
        await this.symptomsInput.waitFor({ state: 'visible', timeout: 10_000 });
    }

    async selectSymptom(searchTerm, optionText) {
        await this.symptomsInput.click();
        await this.symptomsInput.fill(searchTerm);

        const option = this.page.locator(`.MuiAutocomplete-option:has-text("${optionText}")`);
        await option.waitFor({ state: 'visible', timeout: 10_000 });
        await option.click();
    }

    async selectSymptoms() {
        await this.waitForLoad();

        await this.selectSymptom('Knee', 'Knee Pain');

        const neckOption = this.page.locator('.MuiAutocomplete-option:has-text("Neck Pain")');
        await neckOption.waitFor({ state: 'visible', timeout: 10_000 });
        await neckOption.click();
    }

    async answerNoQuestions() {
        await this.noLabels.first()
            .waitFor({ state: 'visible', timeout: 10_000 })
            .catch(() => { });

        const count = await this.noLabels.count();
        for (let i = 0; i < count; i++) {
            await this.noLabels.nth(i).click();
        }
    }

    async isContinueEnabled() {
        return this.continueBtn.isEnabled();
    }

    async continue() {
        await this.continueBtn.waitFor({ state: 'visible', timeout: 10_000 });
        await this.continueBtn.click();
    }
}
