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
        // 1. Wait for the first filter input (Location) to appear
        await this.locationDropdown.waitFor({ state: 'visible', timeout: 15_000 });

        // 2. Detect which layout the client uses:
        //    SINY / Clarus / Kronson: "Basic Search" filter panel + provider cards with "Show More"
        //                              (Kronson has only 2 filter dropdowns, not 3 — so we check
        //                               for "Basic Search" text instead of combobox count)
        //    TNDI-style: "Change Filters" panel + flat date strip + "Available Time Slots"
        const hasSINYLayout = await this.page.waitForFunction(() =>
            document.body.innerText.includes('Basic Search') ||
            document.body.innerText.includes('Show More') ||
            /no online availability|no availability|please call/i.test(document.body.innerText),
        { timeout: 5_000 }).then(() => true).catch(() => false);

        if (hasSINYLayout) {
            // Either: provider cards with "Show More" links (slots available)
            //      OR: "no online availability" message (no slots for this filter combo)
            await this.page.waitForFunction(
                () => document.body.innerText.includes('Show More') ||
                      /no online availability|no availability|please call/i.test(document.body.innerText),
                { timeout: 20_000 }
            );
        } else {
            // Flat date+time slot picker (TNDI style)
            await this.page.waitForFunction(
                () => document.body.innerText.includes('Available Time Slots') ||
                      document.body.innerText.includes('Select Date') ||
                      document.body.innerText.includes('Change Filters'),
                { timeout: 20_000 }
            );
        }
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
    // Returns the selected option text, or null if the dropdown doesn't exist or has no gray options.
    // Self-healing: Kronson has no Provider dropdown — isVisible check returns null gracefully.
    async triggerGrayOption(dropdown) {
        const isVisible = await dropdown.isVisible({ timeout: 3_000 }).catch(() => false);
        if (!isVisible) return null; // dropdown absent for this client (e.g. Kronson has no Provider filter)
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

    // Returns true when the page shows a "no online availability" message
    // instead of provider cards. This can happen when:
    //   - The selected location has no providers with online scheduling
    //   - All providers are unavailable for the current filter combination
    async hasNoAvailabilityMessage() {
        return this.page.evaluate(() =>
            /no online availability|no availability|please call our office/i.test(
                document.body.innerText
            )
        );
    }

    // Returns the provider name from the nth provider card (0-indexed).
    //
    // Uses innerText (which preserves line breaks unlike textContent) and filters lines
    // to find the first one that is not a date, time, or "Show More/Less".
    // This handles:
    //   - textContent concatenation:  "JJesse OchoaThu Jul 23..." (image alt + name + slots)
    //   - no word boundary between name and date: "HaugheyThu"
    async getProviderName(cardIndex = 0) {
        const showMoreEl = this.showMoreLinks.nth(cardIndex);
        return showMoreEl.evaluate(anchor => {
            // Walk up from "Show More" to find the card container
            let el = anchor.parentElement;
            for (let depth = 0; depth < 10; depth++) {
                if (!el || el === document.body) break;
                // Use innerText which splits on layout line breaks
                const lines = (el.innerText ?? '').split('\n')
                    .map(l => l.trim())
                    .filter(l =>
                        l.length > 1 &&
                        // Skip: Show More/Less, day names, time patterns, AM/PM only, single chars
                        !l.match(/^(Show\s|Mon|Tue|Wed|Thu|Fri|Sat|Sun|AM$|PM$|\d+:\d+)/i)
                    );
                if (lines.length >= 1) return lines[0];
                el = el.parentElement;
            }
            return null;
        });
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

    // Changes the Appointment Reason/Service Type filter to the given value.
    // Works for both MUI Autocomplete (SINY) and MUI Select (Clarus, Hopemark).
    // After selection, waits for the page to update (new providers or no-availability message).
    async selectServiceType(service) {
        await this.serviceTypeDropdown.click();

        // If a listbox already opened (MUI Select), skip typing and go straight to picking
        const listboxOpened = await this.page.locator('[role="listbox"]')
            .isVisible({ timeout: 1_000 }).catch(() => false);

        if (!listboxOpened) {
            // MUI Autocomplete — clear and type to filter
            await this.serviceTypeDropdown.clear();
            await this.serviceTypeDropdown.pressSequentially(service.substring(0, 6), { delay: 20 });
        }

        const option = this.page.locator('[role="option"]').filter({ hasText: service }).first();
        await option.waitFor({ state: 'visible', timeout: 10_000 });
        await option.click({ force: true });
        console.log(`Service type changed to: ${service}`);

        // Wait for the page to reflect the new service — either provider cards appear
        // OR the "no online availability" message shows. This replaces a fixed timeout
        // which was too short (race condition: providers loaded after assertion ran).
        await this.page.waitForFunction(
            () => document.body.innerText.includes('Show More') ||
                  /no online availability|no availability|please call/i.test(document.body.innerText),
            { timeout: 15_000 }
        ).catch(() => {}); // graceful — some states may not match either
    }

    // Clicks the Continue / Next button after a slot is selected.
    // Self-healing: some clients (e.g. Clarus) navigate directly when a time slot is
    // clicked — no separate Continue button appears. If the URL already changed away
    // from findappointment within 2 seconds, skip the button click entirely.
    async clickContinue() {
        const alreadyNavigated = await this.page
            .waitForURL(url => !url.toString().includes('findappointment'), { timeout: 2_000 })
            .then(() => true)
            .catch(() => false);

        if (alreadyNavigated) {
            console.log('Continue: page already navigated (direct slot-click navigation)');
            return;
        }

        const btn = this.page.locator('button:has-text("Continue"), button:has-text("Next")').first();
        await btn.waitFor({ state: 'visible', timeout: 10_000 });
        await btn.click();
        console.log('Continue clicked');
    }
}
