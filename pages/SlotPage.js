// export class SlotPage {
//     constructor(page) {
//         this.page = page;
//     }

//  async clickAnySlot() {
//     const slot = this.page.locator('button:has-text("AM"), button:has-text("PM")').first();

//     await slot.waitFor({ state: 'visible' });
//     await slot.click();

//     console.log("Clicked first available slot");
// }

//     async continue() {
//         await this.page.click('button:has-text("Continue")');
//     }
// }


export class SlotPage {
    constructor(page) {
        this.page = page;

        // ── Filters (Clarus only) ─────────────────────────────────────────────
        this.locationInput = page.locator('input#appointment_location-select-box');
        this.appointmentReason = page.locator('input#appointment_servicetype-select-box');
        this.providerInput = page.locator('input#provider-select-box');

        // ── TNDI — date strip + time buttons ──────────────────────────────────
        this.tndiDateBtn = page.locator('button.MuiButton-outlined')
            .filter({ hasText: /Mon|Tue|Wed|Thu|Fri|Sat|Sun/ }).first();
        this.tndiTimeBtn = page.locator('button.MuiButton-outlined')
            .filter({ hasText: /AM|PM/ }).first();

        // ── Clarus — recentslot- id buttons ───────────────────────────────────
        this.clarusSlot = page.locator('[id^="recentslot-"]').first();

        this.continueBtn = page.locator('button:has-text("Continue"), button:has-text("Next")').first();
    }

    async #selectOption(input, value) {
        await input.click();
        await input.clear();
        await input.pressSequentially(value, { delay: 50 });

        const option = this.page
            .locator('[role="option"]')
            .filter({ hasText: value })
            .first();

        await option.waitFor({ state: 'visible', timeout: 10_000 });
        await option.click();
        console.log(`✅ Selected: ${value}`);
    }

    async selectLocation(value) {
        await this.#selectOption(this.locationInput, value);
    }

    async selectAppointmentReason(value) {
        await this.#selectOption(this.appointmentReason, value);
    }

    async selectProvider(value) {
        await this.#selectOption(this.providerInput, value);
    }

    /**
     * Auto-detects TNDI vs Clarus:
     * Clarus → clicks first recentslot- button
     * TNDI   → clicks first available date then first time slot
     */
    async clickAnySlot() {
        // waitFor() actually waits for the API response; isVisible() is immediate and races.
        const isClarusSlot = await this.clarusSlot
            .waitFor({ state: 'visible', timeout: 15_000 })
            .then(() => true)
            .catch(() => false);

        if (isClarusSlot) {
            await this.clarusSlot.click();
            console.log(`Clarus slot clicked`);
        } else {
            // TNDI — click date first then time
            await this.tndiDateBtn.waitFor({ state: 'visible', timeout: 10_000 });
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