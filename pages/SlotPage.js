

export class SlotPage {
    constructor(page) {
        this.page = page;

        // ── Filters — MUI Autocomplete (Clarus: input with typed search) ──────
        this.locationAutocomplete = page.locator('input#appointment_location-select-box');
        this.reasonAutocomplete = page.locator('input#appointment_servicetype-select-box');
        this.providerAutocomplete = page.locator('input#provider-select-box');

        // ── Filters — MUI Select (Kronson: click div, pick from listbox) ──────
        // These are <div role="combobox"> dropdowns, not text inputs.
        this.locationSelect = page.locator('[data-testid="location-select"], #location-select, [aria-label*="ocation"]').first();
        this.reasonSelect = page.locator('[data-testid="reason-select"],  #reason-select,  [aria-label*="eason"]').first();

        // ── TNDI / Kronson — date strip + time buttons ────────────────────────
        this.tndiDateBtn = page.locator('button.MuiButton-outlined, button.MuiButtonBase-root')
            .filter({ hasText: /Mon|Tue|Wed|Thu|Fri|Sat|Sun/ }).first();
        this.tndiTimeBtn = page.locator('button.MuiButton-outlined, button.MuiButtonBase-root')
            .filter({ hasText: /AM|PM|\d+:\d+\s*(AM|PM)/ }).first();

        // ── Clarus — recentslot- id buttons ───────────────────────────────────
        this.clarusSlot = page.locator('[id^="recentslot-"]').first();

        this.continueBtn = page.locator('button:has-text("Continue"), button:has-text("Next")').first();
    }

    // MUI Autocomplete: click input, type, pick from dropdown list
    async #selectAutocomplete(input, value) {
        await input.waitFor({ state: 'visible', timeout: 10_000 });
        await input.click();
        await input.clear();
        await input.pressSequentially(value, { delay: 20 });

        const option = this.page
            .locator('[role="option"]')
            .filter({ hasText: value })
            .first();

        await option.waitFor({ state: 'visible', timeout: 10_000 });
        await option.click();
        console.log(`✅ Selected (autocomplete): ${value}`);
    }

    // MUI Select: click the div trigger, pick from listbox
    async #selectDropdown(trigger, value) {
        await trigger.waitFor({ state: 'visible', timeout: 10_000 });
        await trigger.click();

        const option = this.page
            .locator('[role="option"], li[role="option"]')
            .filter({ hasText: value })
            .first();

        await option.waitFor({ state: 'visible', timeout: 10_000 });
        await option.click();
        console.log(`✅ Selected (dropdown): ${value}`);
    }

    // Auto-detects which filter style is present (autocomplete input vs select div)
    async selectLocation(value) {
        const hasAutocomplete = await this.locationAutocomplete
            .isVisible({ timeout: 3_000 })
            .catch(() => false);

        if (hasAutocomplete) {
            await this.#selectAutocomplete(this.locationAutocomplete, value);
        } else {
            // MUI Select style — find by label text "Location"
            const trigger = this.page.locator('[class*="MuiSelect"], [class*="MuiFormControl"]')
                .filter({ has: this.page.locator('label:has-text("Location"), [class*="MuiInputLabel"]:has-text("Location")') })
                .locator('[role="combobox"], .MuiSelect-select')
                .first();
            await this.#selectDropdown(trigger, value);
        }
    }

    async selectAppointmentReason(value) {
        const hasAutocomplete = await this.reasonAutocomplete
            .isVisible({ timeout: 3_000 })
            .catch(() => false);

        if (hasAutocomplete) {
            await this.#selectAutocomplete(this.reasonAutocomplete, value);
        } else {
            const trigger = this.page.locator('[class*="MuiSelect"], [class*="MuiFormControl"]')
                .filter({ has: this.page.locator('label:has-text("Appointment Reason"), label:has-text("Reason")') })
                .locator('[role="combobox"], .MuiSelect-select')
                .first();
            await this.#selectDropdown(trigger, value);
        }
    }

    async selectProvider(value) {
        await this.#selectAutocomplete(this.providerAutocomplete, value);
    }

    /**
     * Click the first available slot.
     *
     * @param {'tndi'|'clarus'|'datetime'|undefined} slotType
     *   Pass from client config to skip auto-detection and save ~15 s per test.
     *   'datetime' = Hopemark-style combined "Wed Jun 3 4:45 PM" buttons.
     *   Omit (or pass undefined) only when the type is genuinely unknown.
     */
    async clickAnySlot(slotType) {
        const noAvailLocator = this.page
            .locator(':text-matches("no online availability|no availability|please call", "i")')
            .first();

        if (slotType === 'datetime') {
            // Hopemark: combined date+time buttons like "Wed Jun 4 4:45 PM"
            const datetimeBtn = this.page.locator('button')
                .filter({ hasText: /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b.*\d+:\d+\s*(AM|PM)/ })
                .first();
            const result = await Promise.race([
                datetimeBtn.waitFor({ state: 'visible', timeout: 15_000 }).then(() => 'slot'),
                noAvailLocator.waitFor({ state: 'visible', timeout: 15_000 }).then(() => 'noavail'),
            ]).catch(() => 'noavail');
            if (result === 'noavail') {
                throw new Error('NO_SLOTS_AVAILABLE: No datetime slots available in staging');
            }
            await datetimeBtn.click();
            console.log(`Datetime slot clicked`);
            return;
        }

        const isClarus = slotType === 'clarus'
            ? true
            : slotType === 'tndi'
                ? false
                // Auto-detect fallback — only used when slotType is not set in config
                : await this.clarusSlot
                    .waitFor({ state: 'visible', timeout: 5_000 })
                    .then(() => true)
                    .catch(() => false);

        if (isClarus) {
            // Click "Show More" first if visible — slots may be collapsed behind it
            const showMoreBtn = this.page.locator('button').filter({ hasText: /show more/i }).first();
            const showMoreVisible = await showMoreBtn.isVisible({ timeout: 5_000 }).catch(() => false);
            if (showMoreVisible) {
                await showMoreBtn.click();
                console.log('Clicked Show More to reveal slots');
            }

            // Wait for either a slot OR a no-availability message — whichever comes first
            const result = await Promise.race([
                this.clarusSlot.waitFor({ state: 'visible', timeout: 20_000 }).then(() => 'slot'),
                noAvailLocator.waitFor({ state: 'visible', timeout: 20_000 }).then(() => 'noavail'),
            ]).catch(() => 'noavail');

            if (result === 'noavail') {
                throw new Error('NO_SLOTS_AVAILABLE: Clarus has no online slots in staging');
            }

            await this.clarusSlot.click();
            console.log(`Clarus slot clicked`);
        } else {
            // TNDI / Kronson / Freedman: date strip + time slot buttons
            const result = await Promise.race([
                this.tndiDateBtn.waitFor({ state: 'visible', timeout: 15_000 }).then(() => 'slot'),
                noAvailLocator.waitFor({ state: 'visible', timeout: 15_000 }).then(() => 'noavail'),
            ]).catch(() => 'noavail');

            if (result === 'noavail') {
                throw new Error('NO_SLOTS_AVAILABLE: No date/time slots available in staging');
            }

            await this.tndiDateBtn.click();
            console.log(`TNDI date clicked`);

            await this.tndiTimeBtn.waitFor({ state: 'visible', timeout: 10_000 });
            await this.tndiTimeBtn.click();
            console.log(`TNDI time clicked`);
        }
    }

    async clickSlotByProvider(providerName) {
        const accordion = this.page
            .locator('[role="button"]')
            .filter({ hasText: providerName })
            .first();

        const isExpanded = await accordion.getAttribute('aria-expanded').catch(() => null);
        if (isExpanded === 'false' || isExpanded === null) {
            await accordion.click();
        }

        const slot = this.page
            .locator('[id^="recentslot-"]')
            .filter({ hasText: new RegExp(providerName, 'i') })
            .first();

        await slot.waitFor({ state: 'visible', timeout: 10_000 });
        await slot.click();
        console.log(`Slot clicked for provider: ${providerName}`);
    }

    async continue() {
        await this.continueBtn.waitFor({ state: 'visible', timeout: 10_000 });
        await this.continueBtn.click();
    }
}