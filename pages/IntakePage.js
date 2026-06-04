export class IntakePage {
    constructor(page) {
        this.page = page;

        // ── TNDI-style intake ─────────────────────────────────────────────────
        this.symptomsInput = page.locator('input[placeholder="What symptoms are you experiencing?"]');
        this.noLabels = page.locator('.MuiFormControlLabel-root:has-text("No")');

        // ── Hopemark-style intake ─────────────────────────────────────────────
        // Conditions: MUI Autocomplete container — stable after chip selection
        this.conditionsSelect = page.locator('.MuiAutocomplete-root').first();
        // "How did you hear about us?" — MUI Autocomplete with stable ID
        this.hearAboutUsSelect = page.locator('input#refferal-select-box');

        // ── SINY-style intake ─────────────────────────────────────────────────
        // Single optional free-text textarea; Continue is always enabled.
        // Broad selector covers both HTML placeholder attr and MUI label-as-placeholder.
        this.sinyTextarea = page.locator('textarea:not([aria-hidden="true"])').first();

        this.continueBtn = page.locator('button:has-text("Continue")');
        this.spinner = page.locator('span.MuiCircularProgress-root').first();
    }

    async waitForLoad() {
        // Wait for MUI spinner to detach (TNDI/SINY style)
        await this.spinner
            .waitFor({ state: 'detached', timeout: 20_000 })
            .catch(() => { });

        // Also wait for "Loading..." text to disappear — Hopemark shows a plain text
        // loading indicator that's separate from the MUI spinner
        await this.page.waitForFunction(
            () => !document.body.innerText.includes('Loading...'),
            { timeout: 15_000 }
        ).catch(() => { });

        // Wait for TNDI symptoms input, Hopemark conditions, or SINY textarea
        await Promise.race([
            this.symptomsInput.waitFor({ state: 'visible', timeout: 15_000 }),
            this.conditionsSelect.locator('input').first().waitFor({ state: 'visible', timeout: 15_000 }),
            this.sinyTextarea.waitFor({ state: 'visible', timeout: 15_000 }),
        ]).catch(() => { });
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

    /**
     * Hopemark: Conditions is a read-only MUI Autocomplete — click to open popup, pick items.
     * @param {string[]} conditions  e.g. ['ADHD', 'Anxiety']
     */
    async selectConditions(conditions = ['ADHD']) {
        const input = this.conditionsSelect.locator('input').first();
        await input.waitFor({ state: 'visible', timeout: 10_000 });
        await input.click();

        for (const cond of conditions) {
            const option = this.page
                .locator('[role="option"]')
                .filter({ hasText: cond })
                .first();
            await option.waitFor({ state: 'visible', timeout: 10_000 });
            await option.click();
            console.log(`Condition selected: ${cond}`);
        }

        await this.page.keyboard.press('Escape');
    }

    /**
     * Hopemark: "How did you hear about us?" is a MUI Autocomplete — type to filter and pick.
     * @param {string} value  e.g. 'Friends/Family'
     */
    async selectHearAboutUs(value) {
        await this.hearAboutUsSelect.waitFor({ state: 'visible', timeout: 10_000 });
        await this.hearAboutUsSelect.click();
        await this.hearAboutUsSelect.pressSequentially(value, { delay: 20 });

        const option = this.page
            .locator('[role="option"]')
            .filter({ hasText: value })
            .first();
        await option.waitFor({ state: 'visible', timeout: 10_000 });
        await option.click();
        console.log(`Hear about us selected: ${value}`);
    }

    // SINY: fill the optional free-text textarea (pass empty string to leave blank)
    async fillSINYTextarea(text = '') {
        await this.sinyTextarea.waitFor({ state: 'visible', timeout: 10_000 });
        if (text) await this.sinyTextarea.fill(text);
    }

    async isContinueEnabled() {
        return this.continueBtn.isEnabled();
    }

    async continue() {
        await this.continueBtn.waitFor({ state: 'visible', timeout: 10_000 });
        await this.continueBtn.click();
    }
}
