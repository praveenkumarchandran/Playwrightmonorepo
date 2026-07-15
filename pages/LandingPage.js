export class LandingPage {
    constructor(page) {
        this.page = page;
        this.newPatientBtn = page.locator('button#newPatient-button');
        // MUI Autocomplete (most clients)
        this.reasonAutocomplete = page.locator('input#serviceType-select-box');
        // MUI Select (Hopemark — <div role="combobox"> trigger)
        this.reasonSelect = page.locator('[class*="MuiSelect"], [class*="MuiFormControl"]')
            .filter({ has: page.locator('label:has-text("Reason"), label:has-text("Service Type"), [class*="MuiInputLabel"]') })
            .locator('[role="combobox"], .MuiSelect-select')
            .first();

        // Existing patient entry point
        this.existingPatientBtn = page.locator('button:has-text("Existing Patient")');

        // ── SINY gray-service / location flow ─────────────────────────────────
        // Service Type combobox (second-level, appears after reason selection)
        this.serviceTypeDropdown = page.getByRole('combobox', { name: /service type/i });
        // Location combobox (appears when a gray/unavailable service is selected)
        this.locationDropdown = page.getByRole('combobox', { name: /^location$/i });
        // "Service not available" dialog shown when gray service + gray location are both chosen
        this.unavailabilityPopup = page.locator('[role="dialog"]').filter({
            hasText: /not available/i,
        });
    }

    async open(url) {
        await this.page.goto(url, { waitUntil: 'networkidle' });
        // Extra guard: SPAs can keep showing "Loading..." after networkidle fires.
        // Wait until the reason dropdown OR the New Patient button actually renders.
        // This protects ALL fixtures that call runFlow (findAppointmentPage, stepperPage, etc.)
        await this.page.waitForSelector(
            'button#newPatient-button, input#serviceType-select-box, [role="combobox"]',
            { timeout: 30_000 }
        );
    }

    async startExistingPatient(reasonType, opts = {}) {
        await this._selectReason(reasonType);

        if (opts.serviceType) {
            await this._selectServiceType(opts.serviceType);
        }

        await this.existingPatientBtn.waitFor({ state: 'visible' });
        await this.existingPatientBtn.click();

        // Auto-dismiss any popup that appears — handles all SINY service types
        await this._autoDismissPopup(opts.landingPopupAction);

        await this.page.waitForLoadState('networkidle', { timeout: 30_000 });
    }

    async _autoDismissPopup(preferredButton = null) {
        const dialog = this.page.locator('[role="dialog"], [class*="MuiDialog-paper"]');
        const isVisible = await dialog.isVisible({ timeout: 3_000 }).catch(() => false);
        if (!isVisible) return;

        const candidates = [
            preferredButton,
            'Schedule Procedure',
            'Continue',
            'OK',
            'Close',
        ].filter(Boolean);

        for (const label of candidates) {
            const btn = dialog.locator(`button:has-text("${label}")`);
            const visible = await btn.isVisible({ timeout: 1_000 }).catch(() => false);
            if (visible) {
                await btn.click();
                console.log(`Popup dismissed via "${label}"`);
                await this.page.waitForLoadState('networkidle', { timeout: 15_000 });
                return;
            }
        }

        console.warn('Popup appeared but no known dismiss button was found');
    }

    async startNewPatient(reasonType, opts = {}) {
        const hasAutocomplete = await this.reasonAutocomplete
            .isVisible({ timeout: 3_000 })
            .catch(() => false);

        if (hasAutocomplete) {
            await this.reasonAutocomplete.click();

            const optionLocator = this.page.locator('[role="option"]').filter({ hasText: reasonType }).first();

            // Check if options appear immediately (static list — no typing needed)
            const optionAlreadyVisible = await optionLocator.isVisible({ timeout: 3_000 }).catch(() => false);

            if (!optionAlreadyVisible) {
                // True autocomplete — type to filter
                await this.reasonAutocomplete.pressSequentially(reasonType, { delay: 20 });
            }

            await optionLocator.waitFor({ state: 'visible' });
            await optionLocator.click();
        } else {
            // MUI Select style (Hopemark, SINY)
            await this.reasonSelect.waitFor({ state: 'visible' });
            await this.reasonSelect.click();
            const option = this.page.locator('[role="option"], li[role="option"]')
                .filter({ hasText: reasonType }).first();
            await option.waitFor({ state: 'visible' });
            await option.click();
        }
        console.log(`Reason selected: ${reasonType}`);

        // SINY: second-level service type dropdown appears after reason selection
        if (opts.serviceType) {
            await this._selectServiceType(opts.serviceType);
        }

        await this.newPatientBtn.waitFor({ state: 'visible' });
        await this.newPatientBtn.click();

        // Dismiss any post-click popup (SINY fee notice or consultation-required dialog)
        if (opts.landingPopupAction) {
            await this._dismissPopup(opts.landingPopupAction);
        } else {
            await this._dismissPopup('Continue');
        }

        await this.page.waitForLoadState('networkidle', { timeout: 30_000 });
    }

    async _selectServiceType(serviceType) {
        await this.serviceTypeDropdown.waitFor({ state: 'visible' });
        await this.serviceTypeDropdown.click();

        const option = this.page.locator('[role="option"], li[role="option"]')
            .filter({ hasText: serviceType }).first();
        await option.waitFor({ state: 'visible' });
        await option.click();
        console.log(`Service type selected: ${serviceType}`);
    }

    async _selectReason(reasonType) {
        const hasAutocomplete = await this.reasonAutocomplete
            .isVisible({ timeout: 3_000 })
            .catch(() => false);

        if (hasAutocomplete) {
            await this.reasonAutocomplete.click();
            await this.reasonAutocomplete.pressSequentially(reasonType, { delay: 20 });
            const option = this.page.locator('[role="option"]').filter({ hasText: reasonType }).first();
            await option.waitFor({ state: 'visible' });
            await option.click();
        } else {
            await this.reasonSelect.waitFor({ state: 'visible' });
            await this.reasonSelect.click();
            const option = this.page.locator('[role="option"], li[role="option"]')
                .filter({ hasText: reasonType }).first();
            await option.waitFor({ state: 'visible' });
            await option.click();
        }
        console.log(`Reason selected: ${reasonType}`);
    }

    async _findGrayOptionText() {
        const listbox = this.page.locator('[role="listbox"]');
        await listbox.waitFor({ state: 'visible' });
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

    async _findValidOptionText() {
        const listbox = this.page.locator('[role="listbox"]');
        await listbox.waitFor({ state: 'visible' });
        return listbox.evaluate(lb => {
            const isGray = el => {
                const { color, opacity } = window.getComputedStyle(el);
                if (parseFloat(opacity) < 0.8) return true;
                const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
                if (!m) return false;
                const [r, g, b, a] = [+m[1], +m[2], +m[3], +(m[4] ?? '1')];
                return a < 0.6 || (r > 80 && g > 80 && b > 80 && Math.abs(r - g) < 50 && Math.abs(g - b) < 50);
            };
            for (const el of lb.querySelectorAll('[role="option"]')) {
                if (!isGray(el)) return el.textContent?.trim() ?? null;
            }
            return null;
        });
    }

    async _openServiceTypeAndSelectValid() {
        await this.serviceTypeDropdown.waitFor({ state: 'visible' });
        await this.serviceTypeDropdown.click();
        const text = await this._findValidOptionText();
        if (!text) throw new Error('No valid (non-gray) service option found');
        const option = this.page.locator('[role="option"]').filter({ hasText: text }).first();
        await option.click();
        console.log(`Valid service selected: ${text}`);
        return text;
    }

    async _openServiceTypeAndSelectGray() {
        await this.serviceTypeDropdown.waitFor({ state: 'visible' });
        await this.serviceTypeDropdown.click();
        const text = await this._findGrayOptionText();
        if (!text) throw new Error('No gray/unavailable service option found in the dropdown');
        const option = this.page.locator('[role="option"]').filter({ hasText: text }).first();
        await option.click({ force: true });
        console.log(`Gray service selected: ${text}`);
        return text;
    }

    async _selectFirstValidLocation() {
        await this.locationDropdown.waitFor({ state: 'visible' });
        await this.locationDropdown.click();
        const text = await this._findValidOptionText();
        if (!text) throw new Error('No valid (non-gray) location option found');
        const option = this.page.locator('[role="option"]').filter({ hasText: text }).first();
        await option.click();
        console.log(`Valid location selected: ${text}`);
        return text;
    }

    async _openLocationAndSelectGray() {
        await this.locationDropdown.waitFor({ state: 'visible' });
        await this.locationDropdown.click();
        const text = await this._findGrayOptionText();
        if (!text) throw new Error('No gray/unavailable location option found in the dropdown');
        const option = this.page.locator('[role="option"]').filter({ hasText: text }).first();
        await option.click({ force: true });
        console.log(`Gray location selected: ${text}`);
        return text;
    }

    async _selectServiceForPopup(serviceText) {
        await this.serviceTypeDropdown.waitFor({ state: 'visible' });
        await this.serviceTypeDropdown.click();
        await this.page.locator('[role="listbox"]').waitFor({ state: 'visible' });
        const option = this.page.locator('[role="option"]').filter({ hasText: serviceText }).first();
        await option.waitFor({ state: 'visible' });
        await option.click({ force: true });
        console.log(`Popup-service selected: ${serviceText}`);

        const locationAppeared = await this.locationDropdown
            .isVisible({ timeout: 4_000 })
            .catch(() => false);
        if (locationAppeared) {
            await this.locationDropdown.click();
            const first = this.page.locator('[role="option"]').first();
            await first.waitFor({ state: 'visible' });
            await first.click({ force: true });
            console.log('Location picked to advance to unavailability popup');
        }
    }

    async closeUnavailabilityPopup() {
        const closeBtn = this.unavailabilityPopup
            .locator('button[aria-label="close"], button[aria-label="Close"], .MuiIconButton-root')
            .first();
        await closeBtn.click();
    }

    async _dismissPopup(buttonLabel) {
        const dialog = this.page.locator('[role="dialog"], [class*="MuiDialog-paper"]');
        const isVisible = await dialog.isVisible({ timeout: 3_000 }).catch(() => false);
        if (!isVisible) return;

        const btn = dialog.locator(`button:has-text("${buttonLabel}")`);
        const btnVisible = await btn.isVisible({ timeout: 3_000 }).catch(() => false);
        if (!btnVisible) return;

        await btn.click();
        console.log(`Popup dismissed via "${buttonLabel}"`);
        await this.page.waitForLoadState('networkidle', { timeout: 15_000 });
    }
}
