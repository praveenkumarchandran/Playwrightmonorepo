/**
 * SINY Dermatology Widget Flow Test
 *
 * Tests the full booking flow via the SINY widget:
 *   Widget (select filters + calendar date + time slot)
 *   → Schedule Appointment
 *   → Intake Questions (Continue)
 *   → Insurance (Skip)
 *   → Add Info page (verify form + Book Now visible) ← stop here, do NOT submit
 *
 * Run on stage (default):
 *   npx playwright test tests/e2e/widget/sinyWidget.spec.js
 *
 * Run on production:
 *   $env:SETTER_BASE_URL="https://setter.layline.live"
 *   npx playwright test tests/e2e/widget/sinyWidget.spec.js
 */

import { test, expect } from '@playwright/test';

const BASE       = (process.env.SETTER_BASE_URL ?? 'https://stage.setter.layline.live').replace(/\/$/, '');
const WIDGET_URL = `${BASE}/sinydermatology/1/sinydermatologybayridge/widget?widgetId=5&provider=any`;

// Same services as the existing SINY duplicate checker
const SERVICES = [
    { serviceType: 'Skin Problem',       subService: 'Acne' },
    { serviceType: 'Skin Problem',       subService: 'Rash' },
    { serviceType: 'Cosmetic Procedure', subService: 'Botox treatment' },
    { serviceType: 'Cosmetic Procedure', subService: 'Laser hair Removal' },
    { serviceType: 'Cosmetic Procedure', subService: 'Chemical Peel' },
    { serviceType: 'Cosmetic Procedure', subService: 'Filler Treatment' },
    { serviceType: 'Cosmetic Procedure', subService: 'Tattoo Removal' },
];

// ── Helper: select a value from a MUI dropdown by its label ───────────────────
async function selectDropdown(page, labelText, value) {
    const control = page.locator('[class*="MuiFormControl"]')
        .filter({ has: page.locator(`label:has-text("${labelText}")`) })
        .first();
    await control.locator('[role="combobox"], .MuiSelect-select').click();
    await page.waitForTimeout(300);
    await page.locator('[role="listbox"] [role="option"]')
        .filter({ hasText: value })
        .first()
        .click();
    await page.waitForTimeout(500);
}

// ── Helper: check and dismiss any error popup, return its message if found ────
async function getErrorPopup(page) {
    const popup = page.locator('[role="dialog"], .MuiDialog-root, [class*="Modal"]')
        .filter({ hasText: /not available|does not offer/i });
    if (await popup.isVisible({ timeout: 2_000 }).catch(() => false)) {
        const msg = (await popup.textContent()).trim();
        // dismiss
        await page.locator('button').filter({ hasText: /close|ok|×|✕/i }).first().click().catch(() => {});
        await page.keyboard.press('Escape').catch(() => {});
        return msg;
    }
    return null;
}

// ── One test per service ──────────────────────────────────────────────────────
for (const svc of SERVICES) {
    const testLabel = `${svc.serviceType} → ${svc.subService}`;

    test(`[SINY Widget] ${testLabel}`, async ({ page }) => {

        // ── 1. Open widget ────────────────────────────────────────────────────
        await page.goto(WIDGET_URL, { waitUntil: 'networkidle', timeout: 30_000 });
        console.log(`\n[SINY Widget] ${testLabel}: opened widget`);

        // ── 2. Select Service Type ────────────────────────────────────────────
        await selectDropdown(page, 'Service Type', svc.serviceType);
        console.log(`  Selected Service Type: ${svc.serviceType}`);

        // Check for error popup after service type selection
        const err1 = await getErrorPopup(page);
        if (err1) throw new Error(`Error after selecting Service Type: ${err1}`);

        // ── 3. Select sub-service (e.g. Acne under Skin Problem) ─────────────
        const serviceLabel = page.locator('[class*="MuiFormControl"]')
            .filter({ has: page.locator('label:has-text("Service")') })
            .filter({ hasNot: page.locator('label:has-text("Service Type")') })
            .first();

        if (await serviceLabel.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await selectDropdown(page, 'Service', svc.subService);
            console.log(`  Selected Service: ${svc.subService}`);

            const err2 = await getErrorPopup(page);
            if (err2) throw new Error(`Error after selecting Service: ${err2}`);
        }

        // ── 4. Verify calendar has available dates ────────────────────────────
        // Available dates are enabled buttons inside the calendar grid
        const calendarGrid = page.locator('table, [class*="calendar"], [class*="Calendar"]').first();
        const availableDates = calendarGrid.locator('button:not([disabled])').filter({ hasText: /^\d+$/ });

        const dateCount = await availableDates.count();
        console.log(`  Calendar: ${dateCount} available date(s)`);
        expect(dateCount, `No available dates in calendar for ${testLabel}`).toBeGreaterThan(0);

        // ── 5. Click the first available date ────────────────────────────────
        await availableDates.first().click();
        await page.waitForTimeout(800);
        console.log(`  Clicked first available date`);

        const err3 = await getErrorPopup(page);
        if (err3) throw new Error(`Error after selecting date: ${err3}`);

        // ── 6. Verify time slots appear ───────────────────────────────────────
        const slots = page.locator('button').filter({ hasText: /^\d{1,2}:\d{2}\s*(AM|PM)$/i });
        await expect(slots.first(), `No time slots visible for ${testLabel}`).toBeVisible({ timeout: 10_000 });
        const slotCount = await slots.count();
        console.log(`  ${slotCount} time slot(s) visible`);

        // ── 7. Select first time slot ─────────────────────────────────────────
        await slots.first().click();
        await page.waitForTimeout(300);
        console.log(`  Selected first time slot`);

        // ── 8. Click Schedule Appointment ─────────────────────────────────────
        const scheduleBtn = page.locator('button').filter({ hasText: /Schedule Appointment/i });
        await expect(scheduleBtn, `Schedule Appointment button not enabled for ${testLabel}`).toBeEnabled({ timeout: 5_000 });
        await scheduleBtn.click();
        console.log(`  Clicked Schedule Appointment`);

        // ── 9. Intake Questions page ──────────────────────────────────────────
        await page.waitForURL(/intakequestion|intake/i, { timeout: 25_000 });
        const continueBtn = page.locator('button').filter({ hasText: /^Continue$/i });
        await expect(continueBtn, 'Intake: Continue button not found').toBeVisible({ timeout: 10_000 });
        console.log(`  ✅ Intake Questions page loaded`);

        await continueBtn.click();

        // ── 10. Insurance page ────────────────────────────────────────────────
        await page.waitForURL(/insurance/i, { timeout: 20_000 });
        const skipBtn = page.locator('button').filter({ hasText: /^Skip$/i });
        await expect(skipBtn, 'Insurance: Skip button not found').toBeVisible({ timeout: 10_000 });
        console.log(`  ✅ Insurance page loaded`);

        await skipBtn.click();

        // ── 11. Add Info page ─────────────────────────────────────────────────
        await page.waitForURL(/additionaldetails/i, { timeout: 20_000 });
        await expect(
            page.locator('input[placeholder*="First Name"]'),
            'Add Info: First Name field not found'
        ).toBeVisible({ timeout: 10_000 });
        await expect(
            page.locator('button').filter({ hasText: /Book Now/i }),
            'Add Info: Book Now button not found'
        ).toBeVisible({ timeout: 5_000 });
        console.log(`  ✅ Add Info page loaded — flow complete`);

        // Do NOT click Book Now — we don't want to create real appointments
        console.log(`\n✅ [SINY Widget] ${testLabel}: all steps passed`);
    });
}
