export class FindAppointmentPage {
    constructor(page) {
        this.page = page;

        // ── Basic Search — MUI Autocomplete inputs ────────────────────────────
        // role="combobox" is on the INPUT element (not a wrapper div).
        // DOM order is guaranteed: Location(0) → Service Type(1) → Provider(2).
        this.locationDropdown    = page.locator('input[role="combobox"]').nth(0);
        this.serviceTypeDropdown = page.locator('input[role="combobox"]').nth(1);
        this.providerDropdown    = page.locator('input[role="combobox"]').nth(2);

        // ── Provider Gender checkboxes ─────────────────────────────────────────
        // MUI Checkbox uses PrivateSwitchBase-input (opacity:0, position:absolute).
        // These are hidden inputs — use nth() by DOM order (Male=0, Female=1).
        // Interactions require { force: true } because the input is not visible.
        this.maleCheckbox   = page.locator('input[type="checkbox"]').nth(0);
        this.femaleCheckbox = page.locator('input[type="checkbox"]').nth(1);

        // ── Provider cards ─────────────────────────────────────────────────────
        // "Show More" may be a <button> or <span> styled as a link (not always <a>).
        // getByText matches any element whose full visible text is "Show More".
        this.showMoreLinks = page.getByText(/^Show More$/);

        // ── Unavailability popup ───────────────────────────────────────────────
        this.popup         = page.locator('[role="dialog"]');
        this.popupCloseBtn = this.popup
            .locator('button[aria-label="close"], button[aria-label="Close"], .MuiIconButton-root')
            .first();
    }

    async waitForLoad() {
        // 1. Wait for filter inputs to appear
        await this.locationDropdown.waitFor({ state: 'visible', timeout: 15_000 });
        // 2. Provider data loads async — wait until provider dropdown has a value
        await this.page.waitForFunction(() => {
            const inputs = document.querySelectorAll('input[role="combobox"]');
            return inputs.length >= 3 && inputs[2]?.value?.trim() !== '';
        }, { timeout: 20_000 });
        // 3. Provider cards render after data loads — wait for "Show More" text to appear
        await this.page.waitForFunction(
            () => document.body.innerText.includes('Show More'),
            { timeout: 20_000 }
        );
    }

    // Read the selected value from a MUI Autocomplete input.
    async _getDropdownText(dropdown) {
        return (await dropdown.inputValue()).trim();
    }

    // Returns text of first gray/unavailable option in the open listbox.
    async _findGrayOptionText() {
        const listbox = this.page.locator('[role="listbox"]');
        await listbox.waitFor({ state: 'visible', timeout: 10_000 });
        return listbox.evaluate(lb => {
            for (const el of lb.querySelectorAll('[role="option"]')) {
                const { color, opacity } = window.getComputedStyle(el);
                if (parseFloat(opacity) < 0.8) return el.textContent?.trim() ?? null;
                const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
                if (!m) continue;
                const [r, g, b, a] = [+m[1], +m[2], +m[3], +(m[4] ?? '1')];
                if (a < 0.6 || (r > 80 && g > 80 && b > 80 && Math.abs(r - g) < 50 && Math.abs(g - b) < 50)) {
                    return el.textContent?.trim() ?? null;
                }
            }
            return null;
        });
    }

    // Open a dropdown and force-click a gray option to trigger the popup.
    // Returns the selected option text, or null if no gray option exists.
    async triggerGrayOption(dropdown) {
        await dropdown.waitFor({ state: 'visible', timeout: 10_000 });
        await dropdown.click();
        const text = await this._findGrayOptionText();
        if (!text) {
            await this.page.keyboard.press('Escape');
            return null; // caller should skip the test if null
        }
        const option = this.page.locator('[role="option"]').filter({ hasText: text }).first();
        await option.click({ force: true });
        console.log(`Gray option selected: ${text}`);
        return text;
    }

    async closePopup() {
        await this.popupCloseBtn.waitFor({ state: 'visible', timeout: 5_000 });
        await this.popupCloseBtn.click();
        console.log('Unavailability popup closed');
    }

    // Provider card count via "Show More" text elements (one per card).
    async getProviderCardCount() {
        return this.showMoreLinks.count();
    }

    // Expands the nth provider card by clicking its "Show More" link.
    // Waits for the "More Slots" section (date strip + time buttons) to appear.
    async clickShowMore(cardIndex = 0) {
        const link = this.showMoreLinks.nth(cardIndex);
        await link.waitFor({ state: 'visible', timeout: 10_000 });
        await link.click();
        // "More Slots" heading appears once the expanded section loads
        await this.page.waitForFunction(
            () => document.body.innerText.includes('More Slots'),
            { timeout: 10_000 }
        );
        console.log(`Show More clicked for provider card ${cardIndex}`);
    }

    // Clicks the first time-only button in the "Available Slots" grid that appears
    // after Show More is expanded (e.g. "9:20 AM").
    // These are distinct from the 3 inline preview buttons, which contain both date
    // and time text ("Thu Jun 4 / 9:20 AM") and therefore do NOT match the regex.
    async clickFirstSlot() {
        const slot = this.page.locator('button')
            .filter({ hasText: /^\d{1,2}:\d{2}\s*(AM|PM)$/i })
            .first();
        await slot.waitFor({ state: 'visible', timeout: 10_000 });
        await slot.click();
        console.log('Time slot clicked');
    }

    // Clicks the Continue / Next button after a slot is selected.
    async clickContinue() {
        const btn = this.page.locator('button:has-text("Continue"), button:has-text("Next")').first();
        await btn.waitFor({ state: 'visible', timeout: 10_000 });
        await btn.click();
        console.log('Continue clicked');
    }
}
