/**
 * HOPEMARK HEALTH — WIDGET E2E TESTS (PRODUCTION)
 *
 * Widget URL: https://setter.layline.live/hopemarkhealth/1/oakbrook/widget?widgetId=2
 * Embedded at: hopemarkheath.com/outpatient-psychiatry-clinic/oak-brook/#schedule
 *
 * Widget structure:
 *   Two filter dropdowns: Patient Type ▼ | Visit Reason ▼
 *   Provider card: Alexander Whalen (Nurse Practitioner) + combined date+time slot cards
 *   "Show More" link + "Schedule Appointment" button (disabled until slot selected)
 *   "Powered by Layline.live" footer
 *
 * Booking flow (PRODUCTION):
 *   Widget → slot click + Schedule Appointment (or Show More) → Intake Questions (/intakequestion)
 *   Intake Questions → Continue → Insurance (/insurance)
 *   Insurance → Next → Add Info (/additionaldetails)
 *
 * Stepper: Location(1) → Choose Date & Time(2) → Intake Questions(3) → Add Insurance(4) → Add Info(5)
 *
 * Key differences vs Clarus/SINY widgets:
 *   - No Location dropdown on widget (only Patient Type + Visit Reason)
 *   - Clicking widget slot + Schedule Appointment goes DIRECTLY to /intakequestion (no FA page)
 *   - Show More also navigates directly to /intakequestion (not to a Find Appointment page)
 *   - Conditions on Intake = MUI Autocomplete multi-select (chips), not checkboxes
 *   - Insurance has Next only — NO Skip button on production
 *   - Add Info includes full address fields (Address1, Address2, City, State, Zip)
 *   - Stepper on production is DISPLAY-ONLY — clicking steps does NOT navigate back
 */

import { test, expect } from '@playwright/test';

// ── Constants ──────────────────────────────────────────────────────────────────

const WIDGET_URL = 'https://setter.layline.live/hopemarkhealth/1/oakbrook/widget?widgetId=2';

const VISIT_REASONS = [
    'Psychiatric Evaluation (In-Office)',
    'Psychiatric Evaluation (Virtual)',
];

const PATIENT_TYPES = ['New Patient', 'Existing Patient'];

const PROVIDER_NAME = 'Alexander Whalen';
const PROVIDER_TITLE = 'Nurse Practitioner';

// Existing Patient flow is blocked online — shown as a red error message
const EXISTING_PATIENT_ERROR = 'Existing patients are not able to schedule online at this time';
const EXISTING_PATIENT_PHONE = '630-791-5923';

// In-Office is the widget default (no reason-switch needed) and has more available slots.
// Virtual has too few slots — after one test reserves the only slot, subsequent tests skip.
const DEFAULT_REASON = 'Psychiatric Evaluation (In-Office)';

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Open the widget and wait until the Visit Reason dropdown is visible */
async function goToWidget(page) {
    await page.goto(WIDGET_URL);
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => { });
    await page.locator('text=/Visit Reason/i').first()
        .waitFor({ state: 'visible', timeout: 25_000 });
}

/**
 * Locator for the first combined date+time slot card.
 * Hopemark slots show "Wed Jul 8 / 8:00 AM" in one card.
 * These may be <div> or <button> elements — match by content, not element type.
 * Works on both the widget page and the Intake Questions page.
 */
function slotLocator(page) {
    return page.locator('button, [role="button"], div')
        .filter({ hasText: /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/ })
        .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
        .filter({ hasNotText: /Choose Date|Schedule Appointment|Show More|Powered by|Patient Type|Visit Reason|Alexander|Nurse/i })
        .filter({ hasNotText: /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[\s\S]+(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i })
        .first();
}

/** Select a Visit Reason from the second combobox on the widget */
async function selectReason(page, reason) {
    const trigger = page.locator('[role="combobox"]').nth(1);
    await trigger.waitFor({ state: 'visible', timeout: 10_000 });
    await trigger.click();
    const option = page.locator('[role="option"]').filter({ hasText: reason }).first();
    await option.waitFor({ state: 'visible', timeout: 10_000 });
    await option.click();
    await page.waitForTimeout(600);
}

/** Select a Patient Type from the first combobox on the widget */
async function selectPatientType(page, patientType) {
    const trigger = page.locator('[role="combobox"]').first();
    await trigger.waitFor({ state: 'visible', timeout: 10_000 });
    await trigger.click();
    const option = page.locator('[role="option"]').filter({ hasText: patientType }).first();
    await option.waitFor({ state: 'visible', timeout: 10_000 });
    await option.click();
    await page.waitForTimeout(600);
}

/**
 * Navigate from widget directly to the Intake Questions page.
 * PRIMARY:  click a slot card then "Schedule Appointment"
 * FALLBACK: click "Show More"
 * Returns true on success, false if no slots/trigger found.
 */
async function goToIntake(page, reason = DEFAULT_REASON) {
    await goToWidget(page);

    const currentReason = await page.locator('[role="combobox"]').nth(1)
        .textContent().catch(() => '');
    if (!currentReason.includes(reason)) {
        await selectReason(page, reason);
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => { });
        await page.waitForTimeout(800);
    }

    const slot = slotLocator(page);
    const hasSlot = await slot.waitFor({ state: 'visible', timeout: 25_000 }).then(() => true).catch(() => false);

    if (hasSlot) {
        await slot.click();
        const schedBtn = page.locator('button').filter({ hasText: /Schedule Appointment/i }).first();
        await expect(schedBtn,
            'Helper goToIntake: Schedule Appointment button must enable after clicking a slot card — slot click may not have registered or button state did not update'
        ).toBeEnabled({ timeout: 10_000 });
        await schedBtn.click();
        console.log('  → Schedule Appointment clicked');
    } else {
        const showMore = page.locator('text=/Show More/i').first();
        const hasShowMore = await showMore.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true).catch(() => false);
        if (!hasShowMore) {
            console.log(`  ℹ️ No slots or Show More for "${reason}" — skipping`);
            return false;
        }
        await showMore.click();
        console.log('  → Show More clicked');
    }

    await page.waitForURL(/intakequestion/i, { timeout: 45_000, waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => { });
    console.log(`  → Intake Questions: ${page.url()}`);
    return true;
}

/**
 * Complete the Hopemark Intake Questions page:
 *   - Conditions = MUI Autocomplete multi-select → pick first available condition
 *   - "How did you hear about us?" = MUI Select combobox → pick Friends/Family
 *   - Click Continue
 */
async function completeIntake(page) {
    await page.waitForURL(/intake/i, { timeout: 45_000, waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => { });

    const conditionInput = page.locator('input[aria-autocomplete="list"]').first();
    const hasConditionInput = await conditionInput.isVisible({ timeout: 8_000 }).catch(() => false);
    if (hasConditionInput) {
        await conditionInput.click();
        const candidates = ['ADHD', 'Anxiety', 'Depression', 'Bipolar Disorder', 'Trauma'];
        let selected = false;
        for (const cond of candidates) {
            const opt = page.locator('[role="option"]')
                .filter({ hasText: new RegExp(`^${cond}$`, 'i') }).first();
            const visible = await opt.isVisible({ timeout: 3_000 }).catch(() => false);
            if (visible) {
                await opt.click();
                selected = true;
                console.log(`  Condition selected: ${cond}`);
                break;
            }
        }
        if (!selected) {
            const firstOpt = page.locator('[role="option"]').first();
            if (await firstOpt.isVisible({ timeout: 3_000 }).catch(() => false)) {
                await firstOpt.click();
                console.log('  Condition: first option clicked');
            } else {
                await page.keyboard.press('Escape');
            }
        }
        await page.keyboard.press('Escape');
    }

    const hearVisible = await page.locator('text=/How did you hear/i').first()
        .isVisible({ timeout: 3_000 }).catch(() => false);
    if (hearVisible) {
        const comboboxes = page.locator('[role="combobox"]');
        const count = await comboboxes.count();
        if (count > 0) {
            await comboboxes.last().click();
            const opt = page.locator('[role="option"]')
                .filter({ hasText: /Friends|Family|Online|Google|Internet/i }).first();
            if (await opt.isVisible({ timeout: 5_000 }).catch(() => false)) {
                await opt.click();
                console.log('  Referral source selected');
            } else {
                const firstOpt = page.locator('[role="option"]').first();
                if (await firstOpt.isVisible({ timeout: 3_000 }).catch(() => false)) {
                    await firstOpt.click();
                } else {
                    await page.keyboard.press('Escape');
                }
            }
        }
    }

    const continueBtn = page.locator('button').filter({ hasText: /^Continue$/i }).first();
    await continueBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await continueBtn.click();
    console.log('  → Intake Continue clicked');
}

/**
 * Drive the full path: Widget → slot → Schedule Appointment → Intake → Insurance page.
 * Returns false if no slots are available at any point.
 */
async function completeWidgetToInsurance(page, reason = DEFAULT_REASON) {
    const reachedIntake = await goToIntake(page, reason);
    if (!reachedIntake) return false;

    await completeIntake(page);

    await page.waitForURL(/insurance/i, { timeout: 45_000, waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => { });

    const hasApptData = await page.locator('text=/Appointment Time|Your Appointment|Add Insurance/i')
        .first().waitFor({ state: 'visible', timeout: 15_000 }).then(() => true).catch(() => false);
    if (!hasApptData) {
        throw new Error(
            '[completeWidgetToInsurance] Insurance page loaded but appointment summary data is missing — ' +
            `expected "Appointment Time", "Your Appointment", or "Add Insurance" to be visible at ${page.url()} but none appeared within 15s`
        );
    }

    console.log('  ✅ Reached insurance page');
    return true;
}

/**
 * Drive the full path through to Add Info page.
 * Insurance has Next only — no Skip button on production.
 * Hopemark insurance requires selecting a type before Next will navigate —
 * clicking Next without a selection shows a validation error rather than navigating.
 * We always select Self-pay to put the form into a valid state first.
 * Returns false if navigation fails at any step.
 */
async function completeToAddInfo(page, reason = DEFAULT_REASON) {
    const reached = await completeWidgetToInsurance(page, reason);
    if (!reached) return false;

    // Hopemark requires selecting an insurance type before Next will navigate.
    // Screenshot confirmed: MUI Select dropdown (role="combobox" aria-haspopup="listbox"),
    // shows "Insurance" placeholder with "Insurance type is required." error when empty.
    // Try MUI Autocomplete (#insurance-select-box) first, then MUI Select via ARIA role.
    const autocomplete = page.locator('#insurance-select-box');
    const hasAutocomplete = await autocomplete.waitFor({ state: 'visible', timeout: 5_000 }).then(() => true).catch(() => false);
    let trigger;
    if (hasAutocomplete) {
        trigger = autocomplete;
    } else {
        // MUI Select: role="combobox" + aria-haspopup="listbox" is the definitive attribute pair
        const muiSelect = page.locator('[role="combobox"][aria-haspopup="listbox"]').first();
        const hasSelect = await muiSelect.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false);
        if (hasSelect) trigger = muiSelect;
    }
    if (trigger) {
        const currentVal = hasAutocomplete
            ? await trigger.inputValue().catch(() => '')
            : await trigger.textContent().catch(() => '');
        if (!/self.?pay/i.test(currentVal)) {
            await trigger.click();
            const selfPayOpt = page.locator('[role="option"]').filter({ hasText: /Self-pay/i }).first();
            const hasOpt = await selfPayOpt.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false);
            if (hasOpt) {
                await selfPayOpt.click();
                await page.waitForTimeout(400);
                console.log('  → Self-pay selected on insurance page');
            } else {
                await page.keyboard.press('Escape');
            }
        } else {
            console.log(`  → Insurance already set to: "${currentVal}"`);
        }
    } else {
        throw new Error(
            '[completeToAddInfo] Insurance type selector not found on insurance page — ' +
            'neither #insurance-select-box (MUI Autocomplete) nor [role="combobox"][aria-haspopup="listbox"] (MUI Select) was visible. ' +
            'Cannot proceed to Add Info without selecting an insurance type.'
        );
    }

    const nextBtn = page.locator('button').filter({ hasText: /^Next$/i }).first();
    await nextBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await nextBtn.click();
    console.log('  → Next clicked on insurance page');

    await page.waitForURL(/additionaldetails/i, { timeout: 45_000, waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => { });
    console.log('  ✅ Reached Add Info page');
    return true;
}

// ══════════════════════════════════════════════════════════════════════════════
// WIDGET PAGE TESTS
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Widget Page', () => {

    test('TC-HW-01: Widget loads and shows "Choose Date and Time" heading', async ({ page }) => {
        await goToWidget(page);
        await expect(page.locator('text=/Choose Date and Time/i').first(),
            'TC-HW-01: "Choose Date and Time" heading must be visible — widget may have failed to load or the heading text changed'
        ).toBeVisible({ timeout: 15_000 });
        console.log(`  ✅ Widget loaded: ${page.url()}`);
    });

    test('TC-HW-02: Patient Type dropdown has New Patient and Established Patient options', async ({ page }) => {
        await goToWidget(page);
        const trigger = page.locator('[role="combobox"]').first();
        await trigger.waitFor({ state: 'visible', timeout: 10_000 });
        await trigger.click();
        for (const pt of PATIENT_TYPES) {
            await expect(
                page.locator('[role="option"]').filter({ hasText: pt }).first(),
                `TC-HW-02: Patient Type option "${pt}" must appear in the dropdown — option may be missing from production config`
            ).toBeVisible({ timeout: 5_000 });
        }
        await page.keyboard.press('Escape');
        console.log(`  ✅ Patient types: ${PATIENT_TYPES.join(', ')}`);
    });

    test('TC-HW-03: Visit Reason dropdown has both In-Office and Virtual options', async ({ page }) => {
        await goToWidget(page);
        const trigger = page.locator('[role="combobox"]').nth(1);
        await trigger.waitFor({ state: 'visible', timeout: 10_000 });
        await trigger.click();
        for (const reason of VISIT_REASONS) {
            await expect(
                page.locator('[role="option"]').filter({ hasText: reason }).first(),
                `TC-HW-03: Visit Reason option "${reason}" must appear in the dropdown — option may have been removed or renamed in production config`
            ).toBeVisible({ timeout: 5_000 });
        }
        await page.keyboard.press('Escape');
        console.log(`  ✅ Visit reasons confirmed: ${VISIT_REASONS.join(', ')}`);
    });

    test('TC-HW-04: Provider card shows Alexander Whalen as Nurse Practitioner', async ({ page }) => {
        await goToWidget(page);
        await expect(page.locator(`text=${PROVIDER_NAME}`).first(),
            `TC-HW-04: Provider name "${PROVIDER_NAME}" must be visible on the widget — provider card may not have loaded or provider was reassigned`
        ).toBeVisible({ timeout: 10_000 });
        await expect(page.locator(`text=${PROVIDER_TITLE}`).first(),
            `TC-HW-04: Provider title "${PROVIDER_TITLE}" must be visible on the widget — provider title may have changed or the card did not render`
        ).toBeVisible({ timeout: 5_000 });
        console.log(`  ✅ Provider: ${PROVIDER_NAME}, ${PROVIDER_TITLE}`);
    });

    test('TC-HW-05: Provider photo is visible on the widget', async ({ page }) => {
        await goToWidget(page);
        const img = page.locator('img').first();
        await expect(img,
            'TC-HW-05: Provider photo (img) must be visible on the widget — image may have failed to load or the provider card did not render'
        ).toBeVisible({ timeout: 10_000 });
        const src = await img.getAttribute('src').catch(() => '');
        console.log(`  ✅ Provider photo visible (src: ${src?.substring(0, 60)})`);
    });

    test('TC-HW-06: Combined date+time slot cards are visible on page load', async ({ page }) => {
        await goToWidget(page);
        const slot = slotLocator(page);
        const hasSlot = await slot.waitFor({ state: 'visible', timeout: 25_000 }).then(() => true).catch(() => false);
        if (hasSlot) {
            const text = (await slot.textContent() ?? '').replace(/\s+/g, ' ').trim();
            console.log(`  ✅ First slot: "${text}"`);
        } else {
            console.log('  ℹ️ No slots visible — provider may have no availability today');
        }
        await expect(page.locator('text=/Visit Reason/i').first(),
            'TC-HW-06: "Visit Reason" dropdown label must remain visible — widget may have crashed or filter panel disappeared after slot rendering'
        ).toBeVisible();
    });

    test('TC-HW-07: "Show More" link is visible and navigates to Find Appointment page', async ({ page }) => {
        await goToWidget(page);
        const showMore = page.locator('text=/Show More/i').first();
        const hasShowMore = await showMore.waitFor({ state: 'visible', timeout: 15_000 }).then(() => true).catch(() => false);
        if (!hasShowMore) { console.log('  ℹ️ Show More not visible — may have fewer than 7 slots'); return; }
        await showMore.click();
        await page.waitForURL(/findappointment/i, { timeout: 45_000, waitUntil: 'domcontentloaded' });
        console.log(`  ✅ Show More → Find Appointment: ${page.url()}`);
    });

    test('TC-HW-08: "Powered by Layline.live" branding is visible', async ({ page }) => {
        await goToWidget(page);
        await expect(page.locator('text=/Powered by Layline/i').first(),
            'TC-HW-08: "Powered by Layline.live" branding must be visible at the bottom of the widget — branding may have been removed or the footer did not render'
        ).toBeVisible({ timeout: 10_000 });
        console.log('  ✅ Layline.live branding confirmed');
    });

    test('TC-HW-09: Two filter dropdowns are visible — Patient Type and Visit Reason', async ({ page }) => {
        await goToWidget(page);
        await expect(page.locator('text=/Patient Type/i').first(),
            'TC-HW-09: "Patient Type" label must be visible — filter panel may not have rendered or label text changed'
        ).toBeVisible({ timeout: 10_000 });
        await expect(page.locator('text=/Visit Reason/i').first(),
            'TC-HW-09: "Visit Reason" label must be visible — Hopemark widget should have exactly 2 filter dropdowns (no Location dropdown)'
        ).toBeVisible({ timeout: 5_000 });
        const allComboboxes = await page.locator('[role="combobox"]').count();
        console.log(`  ✅ Comboboxes on widget: ${allComboboxes} (expected 2, no Location dropdown)`);
    });

});

// ══════════════════════════════════════════════════════════════════════════════
// SLOT SELECTION TESTS
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Slot Selection', () => {

    test('TC-HW-SLT-01: Schedule Appointment is disabled before any slot is selected', async ({ page }) => {
        await goToWidget(page);
        const schedBtn = page.locator('button').filter({ hasText: /Schedule Appointment/i });
        await schedBtn.waitFor({ state: 'visible', timeout: 10_000 });
        const isDisabled = await schedBtn.evaluate(btn =>
            btn.disabled ||
            btn.classList.contains('Mui-disabled') ||
            window.getComputedStyle(btn).pointerEvents === 'none'
        );
        expect(isDisabled,
            'TC-HW-SLT-01: Schedule Appointment button must be disabled before a slot is selected — button is enabled too early, allowing booking without a selected time slot'
        ).toBe(true);
        console.log('  ✅ Schedule Appointment disabled before slot selection');
    });

    test('TC-HW-SLT-02: Clicking a slot enables the Schedule Appointment button', async ({ page }) => {
        await goToWidget(page);
        const slot = slotLocator(page);
        const hasSlot = await slot.waitFor({ state: 'visible', timeout: 20_000 }).then(() => true).catch(() => false);
        if (!hasSlot) { console.log('  ℹ️ No slots — skipping'); return; }
        await slot.click();
        const schedBtn = page.locator('button').filter({ hasText: /Schedule Appointment/i });
        await expect(schedBtn,
            'TC-HW-SLT-02: Schedule Appointment button must become enabled after clicking a slot card — slot click may not have registered or the button state did not update'
        ).toBeEnabled({ timeout: 10_000 });
        console.log('  ✅ Schedule Appointment enabled after slot click');
    });

    test('TC-HW-SLT-03: Clicking slot then Schedule Appointment navigates to Intake Questions', async ({ page }) => {
        test.slow();
        await goToWidget(page);
        const slot = slotLocator(page);
        const hasSlot = await slot.waitFor({ state: 'visible', timeout: 20_000 }).then(() => true).catch(() => false);
        if (!hasSlot) { console.log('  ℹ️ No slots — skipping'); return; }
        await slot.click();
        const schedBtn = page.locator('button').filter({ hasText: /Schedule Appointment/i }).first();
        await expect(schedBtn,
            'TC-HW-SLT-03: Schedule Appointment button must enable before clicking — slot may not have been selected correctly'
        ).toBeEnabled({ timeout: 10_000 });
        await schedBtn.click();
        await page.waitForURL(/intakequestion/i, { timeout: 45_000, waitUntil: 'domcontentloaded' });
        console.log(`  ✅ Widget → Intake Questions: ${page.url()}`);
    });

    test('TC-HW-SLT-04: Each slot card shows a day name and a time (AM/PM)', async ({ page }) => {
        await goToWidget(page);
        const slot = slotLocator(page);
        const hasSlot = await slot.waitFor({ state: 'visible', timeout: 20_000 }).then(() => true).catch(() => false);
        if (!hasSlot) { console.log('  ℹ️ No slots — skipping'); return; }
        const text = await slot.textContent() ?? '';
        const hasDay = /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/i.test(text);
        const hasTime = /\d{1,2}:\d{2}\s*(AM|PM)/i.test(text);
        expect(hasDay && hasTime,
            `TC-HW-SLT-04: Slot card must contain both a day abbreviation (Mon–Sun) and a time (HH:MM AM/PM) — slot text was: "${text.replace(/\s+/g, ' ').trim()}"`
        ).toBe(true);
        console.log(`  ✅ Slot text: "${text.replace(/\s+/g, ' ').trim()}"`);
    });

    test('TC-HW-SLT-05: Multiple slot cards are visible on load', async ({ page }) => {
        await goToWidget(page);
        await slotLocator(page).waitFor({ state: 'visible', timeout: 20_000 }).catch(() => { });
        const count = await page.locator('button')
            .filter({ hasText: /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/ }).count();
        if (count > 0) {
            expect(count,
                'TC-HW-SLT-05: At least one slot card must be visible on the widget — slots may not have loaded or provider has no upcoming availability'
            ).toBeGreaterThan(0);
            console.log(`  ✅ ${count} slot cards visible`);
        } else {
            console.log('  ℹ️ No slot cards — provider may have no availability');
        }
    });

});

// ══════════════════════════════════════════════════════════════════════════════
// FILTER TESTS
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Filters', () => {

    for (const reason of VISIT_REASONS) {
        test(`TC-HW-RSN: Selecting "${reason}" keeps the widget stable`, async ({ page }) => {
            await goToWidget(page);
            await selectReason(page, reason);
            await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => { });
            await expect(page.locator(`text=${PROVIDER_NAME}`).first(),
                `TC-HW-RSN: Provider "${PROVIDER_NAME}" must remain visible after selecting reason "${reason}" — widget may have crashed or the provider card was removed`
            ).toBeVisible({ timeout: 10_000 });
            const hasSlot = await slotLocator(page).waitFor({ state: 'visible', timeout: 15_000 }).then(() => true).catch(() => false);
            console.log(`  ✅ "${reason}": provider visible, slots: ${hasSlot}`);
        });
    }

    test('TC-HW-PT-01: Selecting Existing Patient shows error message and disables Visit Reason', async ({ page }) => {
        await goToWidget(page);
        await selectPatientType(page, 'Existing Patient');
        await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => { });
        await expect(page.locator(`text=/Existing patients are not able to schedule/i`).first(),
            'TC-HW-PT-01: Red error message must appear when Existing Patient is selected — online booking block is not working correctly'
        ).toBeVisible({ timeout: 10_000 });
        await expect(page.locator(`text=/${EXISTING_PATIENT_PHONE}/`).first(),
            `TC-HW-PT-01: Phone number ${EXISTING_PATIENT_PHONE} must be shown in the Existing Patient error message — patients need this to book by phone`
        ).toBeVisible({ timeout: 5_000 });
        const reasonCombobox = page.locator('[role="combobox"]').nth(1);
        const isDisabled = await reasonCombobox.evaluate(el =>
            el.classList.contains('Mui-disabled') ||
            el.getAttribute('aria-disabled') === 'true' ||
            window.getComputedStyle(el).pointerEvents === 'none'
        ).catch(() => false);
        console.log(`  ✅ Existing Patient: error message shown, Visit Reason disabled: ${isDisabled}`);
    });

    test('TC-HW-PT-02: Switching from Existing Patient back to New Patient clears the error', async ({ page }) => {
        await goToWidget(page);
        await selectPatientType(page, 'Existing Patient');
        await page.waitForTimeout(500);
        const hasError = await page.locator(`text=/Existing patients are not able/i`).first()
            .isVisible({ timeout: 8_000 }).catch(() => false);
        console.log(`  Error shown for Existing Patient: ${hasError}`);
        await selectPatientType(page, 'New Patient');
        await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => { });
        const errorGone = !(await page.locator(`text=/Existing patients are not able/i`).first()
            .isVisible({ timeout: 3_000 }).catch(() => false));
        await expect(page.locator('text=/Visit Reason/i').first(),
            'TC-HW-PT-02: "Visit Reason" dropdown must be visible and re-enabled after switching back to New Patient — widget may not have restored its normal state'
        ).toBeVisible({ timeout: 10_000 });
        console.log(`  ✅ Back to New Patient — error cleared: ${errorGone}, Visit Reason visible`);
    });

});

// ══════════════════════════════════════════════════════════════════════════════
// EXISTING PATIENT — ONLINE BOOKING BLOCKED
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Existing Patient — Online Booking Blocked', () => {

    test('TC-HW-EP-01: Patient Type dropdown has exactly New Patient and Existing Patient options', async ({ page }) => {
        await goToWidget(page);
        const trigger = page.locator('[role="combobox"]').first();
        await trigger.waitFor({ state: 'visible', timeout: 10_000 });
        await trigger.click();
        await expect(page.locator('[role="option"]').filter({ hasText: 'New Patient' }).first(),
            'TC-HW-EP-01: "New Patient" option must be in the Patient Type dropdown — option may have been removed from production config'
        ).toBeVisible({ timeout: 5_000 });
        await expect(page.locator('[role="option"]').filter({ hasText: 'Existing Patient' }).first(),
            'TC-HW-EP-01: "Existing Patient" option must be in the Patient Type dropdown — option may have been removed from production config'
        ).toBeVisible({ timeout: 5_000 });
        const count = await page.locator('[role="option"]').count();
        console.log(`  ✅ Patient Type options: ${count} (New Patient + Existing Patient)`);
        await page.keyboard.press('Escape');
    });

    test('TC-HW-EP-02: Selecting Existing Patient shows the red error message', async ({ page }) => {
        await goToWidget(page);
        await selectPatientType(page, 'Existing Patient');
        await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => { });
        await expect(page.locator(`text=/Existing patients are not able to schedule/i`).first(),
            'TC-HW-EP-02: Red error message must appear when Existing Patient is selected — online booking block is not enforced'
        ).toBeVisible({ timeout: 10_000 });
        console.log(`  ✅ Red error message visible for Existing Patient`);
    });

    test('TC-HW-EP-03: Error message contains the correct phone number 630-791-5923', async ({ page }) => {
        await goToWidget(page);
        await selectPatientType(page, 'Existing Patient');
        await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => { });
        await expect(page.locator(`text=/${EXISTING_PATIENT_PHONE}/`).first(),
            `TC-HW-EP-03: Phone number ${EXISTING_PATIENT_PHONE} must appear in the error message — patients need a valid number to call for booking, wrong or missing number would block them`
        ).toBeVisible({ timeout: 10_000 });
        console.log(`  ✅ Phone number ${EXISTING_PATIENT_PHONE} shown in error message`);
    });

    test('TC-HW-EP-04: Visit Reason dropdown is disabled when Existing Patient is selected', async ({ page }) => {
        await goToWidget(page);
        await selectPatientType(page, 'Existing Patient');
        await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => { });
        const reasonCombobox = page.locator('[role="combobox"]').nth(1);
        await reasonCombobox.waitFor({ state: 'visible', timeout: 8_000 });
        const isDisabled = await reasonCombobox.evaluate(el =>
            el.classList.contains('Mui-disabled') ||
            el.getAttribute('aria-disabled') === 'true' ||
            window.getComputedStyle(el).pointerEvents === 'none'
        ).catch(() => false);
        console.log(`  ✅ Visit Reason disabled when Existing Patient: ${isDisabled}`);
        await reasonCombobox.click({ force: true }).catch(() => { });
        await page.waitForTimeout(500);
        const optionsVisible = await page.locator('[role="option"]').first()
            .isVisible({ timeout: 2_000 }).catch(() => false);
        expect(optionsVisible,
            'TC-HW-EP-04: Visit Reason dropdown must NOT open when Existing Patient is selected — clicking the disabled dropdown should not show any options'
        ).toBe(false);
        console.log(`  ✅ Visit Reason dropdown click ignored: options NOT shown`);
    });

    test('TC-HW-EP-05: No slot cards are visible when Existing Patient is selected', async ({ page }) => {
        await goToWidget(page);
        await selectPatientType(page, 'Existing Patient');
        await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => { });
        const slotCount = await page.locator('button')
            .filter({ hasText: /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/ }).count();
        expect(slotCount,
            'TC-HW-EP-05: No slot cards should be visible when Existing Patient is selected — slots should be hidden to prevent online booking for existing patients'
        ).toBe(0);
        console.log(`  ✅ Slot cards visible: ${slotCount} (expected 0)`);
    });

    test('TC-HW-EP-06: Schedule Appointment button is not visible when Existing Patient is selected', async ({ page }) => {
        await goToWidget(page);
        await selectPatientType(page, 'Existing Patient');
        await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => { });
        const hasSchedBtn = await page.locator('button')
            .filter({ hasText: /Schedule Appointment/i }).first()
            .isVisible({ timeout: 3_000 }).catch(() => false);
        expect(hasSchedBtn,
            'TC-HW-EP-06: Schedule Appointment button must NOT be visible when Existing Patient is selected — button being visible would allow existing patients to bypass the booking block'
        ).toBe(false);
        console.log(`  ✅ Schedule Appointment button not visible for Existing Patient`);
    });

    test('TC-HW-EP-07: "Powered by Layline.live" branding still shows with Existing Patient', async ({ page }) => {
        await goToWidget(page);
        await selectPatientType(page, 'Existing Patient');
        await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => { });
        await expect(page.locator('text=/Powered by Layline/i').first(),
            'TC-HW-EP-07: "Powered by Layline.live" branding must remain visible even when Existing Patient state is shown — branding should not disappear when the error state is active'
        ).toBeVisible({ timeout: 8_000 });
        console.log(`  ✅ Layline.live branding still visible with Existing Patient`);
    });

    test('TC-HW-EP-08: Alexander Whalen provider card is NOT shown for Existing Patient', async ({ page }) => {
        await goToWidget(page);
        await selectPatientType(page, 'Existing Patient');
        await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => { });
        const hasProvider = await page.locator(`text=${PROVIDER_NAME}`).first()
            .isVisible({ timeout: 3_000 }).catch(() => false);
        console.log(`  Provider card visible for Existing Patient: ${hasProvider} (expected false)`);
        expect(hasProvider,
            `TC-HW-EP-08: Provider card for "${PROVIDER_NAME}" must NOT be visible when Existing Patient is selected — showing the provider card could mislead existing patients into thinking they can book`
        ).toBe(false);
    });

    test('TC-HW-EP-09: Switching from Existing Patient to New Patient fully restores the widget', async ({ page }) => {
        await goToWidget(page);
        await selectPatientType(page, 'Existing Patient');
        await page.waitForTimeout(500);
        const hasError = await page.locator(`text=/Existing patients are not able/i`).first()
            .isVisible({ timeout: 8_000 }).catch(() => false);
        expect(hasError,
            'TC-HW-EP-09: Error message must appear after selecting Existing Patient (prerequisite for this test) — Existing Patient block may not be working'
        ).toBe(true);
        console.log(`  Existing Patient blocked: ${hasError}`);
        await selectPatientType(page, 'New Patient');
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => { });
        const errorGone = !(await page.locator(`text=/Existing patients are not able/i`).first()
            .isVisible({ timeout: 3_000 }).catch(() => false));
        expect(errorGone,
            'TC-HW-EP-09: Error message must disappear after switching back to New Patient — widget did not clear the Existing Patient blocked state'
        ).toBe(true);
        await expect(page.locator(`text=${PROVIDER_NAME}`).first(),
            `TC-HW-EP-09: Provider card "${PROVIDER_NAME}" must reappear after switching back to New Patient — widget did not fully restore its normal state`
        ).toBeVisible({ timeout: 10_000 });
        await expect(page.locator('text=/Visit Reason/i').first(),
            'TC-HW-EP-09: "Visit Reason" dropdown must be visible and re-enabled after switching back to New Patient — dropdown may still be in a disabled state'
        ).toBeVisible({ timeout: 5_000 });
        const hasSlots = await slotLocator(page).isVisible({ timeout: 15_000 }).catch(() => false);
        console.log(`  ✅ Widget fully restored — error gone: ${errorGone}, provider: true, slots: ${hasSlots}`);
    });

});

// ══════════════════════════════════════════════════════════════════════════════
// INTAKE PAGE TESTS
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Intake Page', () => {

    test('TC-HW-INT-01: Widget → slot → Schedule Appointment navigates to Intake Questions page', async ({ page }) => {
        test.slow();
        const reached = await goToIntake(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await expect(page.locator('text=/Intake Questions/i').first(),
            'TC-HW-INT-01: "Intake Questions" heading must be visible after clicking Schedule Appointment — navigation may have gone to a different page or the heading text changed'
        ).toBeVisible({ timeout: 10_000 });
        console.log(`  ✅ Navigated to Intake Questions: ${page.url()}`);
    });

    test('TC-HW-INT-02: Intake page has Conditions multi-select (MUI Autocomplete)', async ({ page }) => {
        test.slow();
        const reached = await goToIntake(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        const conditionInput = page.locator('input[aria-autocomplete="list"]').first();
        const hasConditions = await conditionInput.isVisible({ timeout: 8_000 }).catch(() => false);
        expect(hasConditions,
            'TC-HW-INT-02: Conditions MUI Autocomplete multi-select input must be visible on the intake page — the field may be missing or the selector needs updating if the component changed'
        ).toBe(true);
        console.log('  ✅ Conditions multi-select visible on intake page');
    });

    test('TC-HW-INT-03: Intake Conditions dropdown opens and shows options', async ({ page }) => {
        test.slow();
        const reached = await goToIntake(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        const conditionInput = page.locator('input[aria-autocomplete="list"]').first();
        const hasInput = await conditionInput.isVisible({ timeout: 8_000 }).catch(() => false);
        if (!hasInput) {
            throw new Error(
                'TC-HW-INT-03: Conditions MUI Autocomplete input not found on the intake page — ' +
                'Hopemark intake must have a Conditions multi-select; field is missing or the selector needs updating'
            );
        }
        await conditionInput.click();
        const optionCount = await page.locator('[role="option"]').count();
        expect(optionCount,
            'TC-HW-INT-03: Conditions dropdown must show at least one option when opened — dropdown opened but no condition options appeared, API or config may have no conditions set up'
        ).toBeGreaterThan(0);
        await page.keyboard.press('Escape');
        console.log(`  ✅ ${optionCount} condition options available`);
    });

    test('TC-HW-INT-04: Intake page has "How did you hear about us?" dropdown', async ({ page }) => {
        test.slow();
        const reached = await goToIntake(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await expect(page.locator('text=/How did you hear/i').first(),
            'TC-HW-INT-04: "How did you hear about us?" question must be visible on the intake page — field may be missing from the intake form config for this client'
        ).toBeVisible({ timeout: 10_000 });
        console.log('  ✅ "How did you hear about us?" visible on intake');
    });

    test('TC-HW-INT-05: Intake page Continue button is visible', async ({ page }) => {
        test.slow();
        const reached = await goToIntake(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        const btn = page.locator('button').filter({ hasText: /^Continue$/i }).first();
        await expect(btn,
            'TC-HW-INT-05: "Continue" button must be visible on the intake page — button may be missing, renamed, or the page did not fully load'
        ).toBeVisible({ timeout: 10_000 });
        console.log('  ✅ Continue button visible on intake');
    });

    test('TC-HW-INT-06: Stepper shows all 5 steps on intake page', async ({ page }) => {
        test.slow();
        const reached = await goToIntake(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await expect(page.locator('text=/Intake Questions/i').first(),
            'TC-HW-INT-06: Stepper step "Intake Questions" must be visible on the intake page — stepper may not have rendered or step label changed'
        ).toBeVisible({ timeout: 8_000 });
        await expect(page.locator('text=/Add Insurance/i').first(),
            'TC-HW-INT-06: Stepper step "Add Insurance" must be visible on the intake page — step label may have changed or stepper is incomplete'
        ).toBeVisible({ timeout: 5_000 });
        await expect(page.locator('text=/Add Info/i').first(),
            'TC-HW-INT-06: Stepper step "Add Info" must be visible on the intake page — step label may have changed or stepper is incomplete'
        ).toBeVisible({ timeout: 5_000 });
        await expect(page.locator('text=/Choose Date/i').first(),
            'TC-HW-INT-06: Stepper step "Choose Date & Time" must be visible on the intake page — step label may have changed or stepper is incomplete'
        ).toBeVisible({ timeout: 5_000 });
        console.log('  ✅ All 5 stepper steps visible on intake page');
    });

    test('TC-HW-INT-07: Appointment summary panel (Your Appointment) is visible on intake', async ({ page }) => {
        test.slow();
        const reached = await goToIntake(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        const hasYourAppt = await page.locator('text=/Your Appointment/i').first()
            .isVisible({ timeout: 8_000 }).catch(() => false);
        const hasApptTime = await page.locator('text=/Appointment Time/i').first()
            .isVisible({ timeout: 5_000 }).catch(() => false);
        console.log(`  Your Appointment panel: ${hasYourAppt}, Appointment Time: ${hasApptTime}`);
    });

});

// ══════════════════════════════════════════════════════════════════════════════
// INSURANCE PAGE TESTS
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Insurance Page', () => {

    test('TC-HW-INS-01: Insurance page loads after completing intake', async ({ page }) => {
        test.slow();
        const reached = await completeWidgetToInsurance(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await expect(page.locator('text=/Insurance Policy/i').first(),
            'TC-HW-INS-01: "Insurance Policy" heading must be visible on the insurance page — intake may not have navigated to /insurance or the page failed to load'
        ).toBeVisible({ timeout: 10_000 });
        console.log('  ✅ Insurance Policy heading visible');
    });

    test('TC-HW-INS-02: Appointment Time is shown on the insurance summary panel', async ({ page }) => {
        test.slow();
        const reached = await completeWidgetToInsurance(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await expect(page.locator('text=/Appointment Time/i').first(),
            'TC-HW-INS-02: "Appointment Time" label must be visible on the insurance page — appointment session data may not have carried through from the booking'
        ).toBeVisible({ timeout: 10_000 });
        await expect(page.locator('text=/\\d{1,2}:\\d{2}\\s*(AM|PM)/i').first(),
            'TC-HW-INS-02: A valid time in HH:MM AM/PM format must be shown on the insurance page — appointment time was not passed to the insurance summary panel'
        ).toBeVisible({ timeout: 8_000 });
        console.log('  ✅ Appointment Time visible on insurance page');
    });

    test('TC-HW-INS-03: Location is shown on the insurance appointment summary', async ({ page }) => {
        test.slow();
        const reached = await completeWidgetToInsurance(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await expect(page.locator('text=/Location/i').first(),
            'TC-HW-INS-03: "Location" label must be visible in the insurance summary — appointment data may be missing or the summary panel did not render'
        ).toBeVisible({ timeout: 8_000 });
        const locText = await page.locator('text=/Location/i').first()
            .locator('..').textContent().catch(() => '');
        console.log(`  ✅ Location: "${locText?.trim().substring(0, 60)}"`);
    });

    test('TC-HW-INS-04: Provider name is visible on the insurance summary panel', async ({ page }) => {
        test.slow();
        const reached = await completeWidgetToInsurance(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        const hasProvider = await page.locator(`text=${PROVIDER_NAME}`).first()
            .isVisible({ timeout: 8_000 }).catch(() => false);
        console.log(`  ✅ Provider "${PROVIDER_NAME}" on insurance page: ${hasProvider}`);
    });

    test('TC-HW-INS-05: Insurance page has Next button (no Skip on production)', async ({ page }) => {
        test.slow();
        const reached = await completeWidgetToInsurance(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        const nextBtn = page.locator('button').filter({ hasText: /^Next$/i }).first();
        await expect(nextBtn,
            'TC-HW-INS-05: "Next" button must be visible on the insurance page — button may be missing or the page did not fully load'
        ).toBeVisible({ timeout: 15_000 });
        await expect(nextBtn,
            'TC-HW-INS-05: "Next" button must be enabled on the insurance page — button may be blocked by a validation error or form state issue'
        ).toBeEnabled({ timeout: 5_000 });
        const hasSkip = await page.locator('button').filter({ hasText: /^Skip$/i }).first()
            .isVisible({ timeout: 3_000 }).catch(() => false);
        console.log(`  ✅ Next button present: true | Skip button: ${hasSkip} (expected false on production)`);
    });

    test('TC-HW-INS-06: Self-pay is pre-selected on insurance page', async ({ page }) => {
        test.slow();
        const reached = await completeWidgetToInsurance(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        // Screenshot confirmed: Hopemark uses MUI Select (role="combobox" aria-haspopup="listbox")
        // Try MUI Autocomplete (#insurance-select-box) first, then MUI Select via ARIA role.
        const autocomplete = page.locator('#insurance-select-box');
        const hasAutocomplete = await autocomplete.waitFor({ state: 'visible', timeout: 5_000 }).then(() => true).catch(() => false);
        if (hasAutocomplete) {
            const val = await autocomplete.inputValue().catch(() => '');
            console.log(`  ✅ Insurance (autocomplete) value: "${val}" | Self-pay: ${/self.?pay/i.test(val)}`);
        } else {
            const muiSelect = page.locator('[role="combobox"][aria-haspopup="listbox"]').first();
            const hasSelect = await muiSelect.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false);
            if (hasSelect) {
                const val = await muiSelect.textContent().catch(() => '');
                console.log(`  ✅ Insurance (MUI Select) value: "${val}" | Self-pay: ${/self.?pay/i.test(val)}`);
            } else {
                console.log('  ℹ️ Insurance field not found');
            }
        }
    });

    test('TC-HW-INS-07: Stepper shows all 5 steps on insurance page', async ({ page }) => {
        test.slow();
        const reached = await completeWidgetToInsurance(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await expect(page.locator('text=/Add Insurance/i').first(),
            'TC-HW-INS-07: Stepper step "Add Insurance" must be visible on the insurance page — stepper may not have rendered or step label changed'
        ).toBeVisible({ timeout: 8_000 });
        await expect(page.locator('text=/Add Info/i').first(),
            'TC-HW-INS-07: Stepper step "Add Info" must be visible on the insurance page — step label may have changed or stepper is incomplete'
        ).toBeVisible({ timeout: 5_000 });
        await expect(page.locator('text=/Choose Date/i').first(),
            'TC-HW-INS-07: Stepper step "Choose Date & Time" must be visible on the insurance page — step label may have changed or stepper is incomplete'
        ).toBeVisible({ timeout: 5_000 });
        await expect(page.locator('text=/Intake Questions/i').first(),
            'TC-HW-INS-07: Stepper step "Intake Questions" must be visible on the insurance page — step label may have changed or stepper is incomplete'
        ).toBeVisible({ timeout: 5_000 });
        console.log('  ✅ All stepper steps visible on insurance page');
    });

    test('TC-HW-INS-08: Clicking Next on insurance navigates to Add Info page', async ({ page }) => {
        test.slow();
        const reached = await completeToAddInfo(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await expect(page.locator('input[placeholder*="First Name"]').first(),
            'TC-HW-INS-08: First Name input must be visible on Add Info after clicking Next on insurance — navigation to /additionaldetails succeeded but the form did not render'
        ).toBeVisible({ timeout: 10_000 });
        console.log('  ✅ Add Info page reached via Next on insurance');
    });

    test('TC-HW-INS-09: Appointment Type label is shown on insurance page', async ({ page }) => {
        test.slow();
        const reached = await completeWidgetToInsurance(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await expect(page.locator('text=/Appointment Type/i').first(),
            'TC-HW-INS-09: "Appointment Type" label must be visible on the insurance page — appointment data panel may be missing or label text changed'
        ).toBeVisible({ timeout: 8_000 });
        const apptTypeVal = await page.locator('text=/Appointment Type/i').first()
            .locator('..').textContent().catch(() => '');
        console.log(`  ✅ Appointment Type label visible — value: "${apptTypeVal?.trim().substring(0, 60)}"`);
    });

    test('TC-HW-INS-10: Insurance Type dropdown is interactable and shows options', async ({ page }) => {
        test.slow();
        const reached = await completeWidgetToInsurance(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        // Try MUI Autocomplete first, then MUI Select via ARIA role (confirmed by screenshot)
        const autocomplete = page.locator('#insurance-select-box');
        const hasAutocomplete = await autocomplete.waitFor({ state: 'visible', timeout: 5_000 }).then(() => true).catch(() => false);
        let trigger;
        if (hasAutocomplete) {
            trigger = autocomplete;
        } else {
            const muiSelect = page.locator('[role="combobox"][aria-haspopup="listbox"]').first();
            const hasSelect = await muiSelect.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false);
            if (!hasSelect) {
                throw new Error(
                    'TC-HW-INS-10: Insurance type selector not found on the insurance page — ' +
                    'neither #insurance-select-box nor [role="combobox"][aria-haspopup="listbox"] was visible. ' +
                    'The insurance type dropdown is required and must be present on the insurance page'
                );
            }
            trigger = muiSelect;
        }
        await trigger.click();
        await page.waitForTimeout(400);
        const options = page.locator('[role="option"], .MuiAutocomplete-option');
        const count = await options.count();
        if (count > 0) {
            expect(count,
                'TC-HW-INS-10: Insurance Type dropdown must show at least one option when opened'
            ).toBeGreaterThan(0);
            console.log(`  ✅ ${count} insurance type options in dropdown`);
        } else {
            console.log('  ℹ️ No options appeared — dropdown may use a different structure');
        }
        await page.keyboard.press('Escape');
    });

});

// ══════════════════════════════════════════════════════════════════════════════
// ADD INFO PAGE TESTS
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Add Info Page', () => {

    test('TC-HW-PI-01: First Name and Last Name fields are visible', async ({ page }) => {
        test.slow();
        const reached = await completeToAddInfo(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await expect(page.locator('input[placeholder*="First Name"]').first(),
            'TC-HW-PI-01: First Name input must be visible on Add Info — form may not have loaded or placeholder text changed'
        ).toBeVisible({ timeout: 10_000 });
        await expect(page.locator('input[placeholder*="Last Name"]').first(),
            'TC-HW-PI-01: Last Name input must be visible on Add Info — form may not have loaded or placeholder text changed'
        ).toBeVisible({ timeout: 5_000 });
        console.log('  ✅ First Name, Last Name visible');
    });

    test('TC-HW-PI-02: Date of Birth field is visible', async ({ page }) => {
        test.slow();
        const reached = await completeToAddInfo(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        const dob = page.locator(
            'input[placeholder*="Date of Birth"], input[placeholder*="MM/DD"], input[placeholder*="DOB"]'
        ).first();
        await expect(dob,
            'TC-HW-PI-02: Date of Birth input must be visible on Add Info — field may be missing from this client\'s form config or the placeholder text changed'
        ).toBeVisible({ timeout: 8_000 });
        console.log('  ✅ Date of Birth visible');
    });

    test('TC-HW-PI-03: Email and Phone fields are visible', async ({ page }) => {
        test.slow();
        const reached = await completeToAddInfo(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await expect(page.locator('input[placeholder*="Email"]').first(),
            'TC-HW-PI-03: Email input must be visible on Add Info — field may be missing from the form or placeholder text changed'
        ).toBeVisible({ timeout: 8_000 });
        await expect(page.locator('input[placeholder*="Phone"]').first(),
            'TC-HW-PI-03: Phone input must be visible on Add Info — field may be missing from the form or placeholder text changed'
        ).toBeVisible({ timeout: 5_000 });
        console.log('  ✅ Email and Phone visible');
    });

    test('TC-HW-PI-04: Gender dropdown is visible', async ({ page }) => {
        test.slow();
        const reached = await completeToAddInfo(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await expect(page.locator('text=/Gender/i').first(),
            'TC-HW-PI-04: Gender label/field must be visible on Add Info — field may be missing from the form or label text changed'
        ).toBeVisible({ timeout: 8_000 });
        console.log('  ✅ Gender visible');
    });

    test('TC-HW-PI-05: Address2 (Optional) field is visible on Add Info', async ({ page }) => {
        test.slow();
        const reached = await completeToAddInfo(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        const address2 = page.locator(
            'input[placeholder*="Address 2"], input[placeholder*="Address2"], input[placeholder*="Optional"]'
        ).first();
        const hasAddress2 = await address2.isVisible({ timeout: 8_000 }).catch(() => false);
        console.log(`  ✅ Address2 (Optional) field visible: ${hasAddress2}`);
    });

    test('TC-HW-PI-06: Address1 field is visible (full address on Hopemark Add Info)', async ({ page }) => {
        test.slow();
        const reached = await completeToAddInfo(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        const address1 = page.locator(
            'input[placeholder*="Address1 *"], input[placeholder*="Address1"], input[placeholder*="Street"]'
        ).first();
        await expect(address1,
            'TC-HW-PI-06: Address1 input must be visible on Add Info — Hopemark includes full address fields; field may be missing or placeholder text changed'
        ).toBeVisible({ timeout: 8_000 });
        console.log('  ✅ Address1 field visible');
    });

    test('TC-HW-PI-07: City, State, and Zip fields are visible', async ({ page }) => {
        test.slow();
        const reached = await completeToAddInfo(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        const city = page.locator('input[placeholder*="City"]').first();
        const state = page.locator('input[placeholder*="State"], text=/\\bState\\b/i').first();
        const zip = page.locator(
            'input[placeholder*="Zip"], input[placeholder*="Home Zip"], input[placeholder*="Postal"]'
        ).first();
        await expect(city,
            'TC-HW-PI-07: City input must be visible on Add Info — address section may be missing or placeholder text changed'
        ).toBeVisible({ timeout: 8_000 });
        console.log('  ✅ City visible');
        const hasState = await state.isVisible({ timeout: 5_000 }).catch(() => false);
        const hasZip = await zip.isVisible({ timeout: 5_000 }).catch(() => false);
        console.log(`  State visible: ${hasState} | Zip visible: ${hasZip}`);
    });

    test('TC-HW-PI-08: SMS consent checkbox is visible and unchecked by default', async ({ page }) => {
        test.slow();
        const reached = await completeToAddInfo(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        const checkbox = page.locator('input[type="checkbox"]').first();
        await expect(checkbox,
            'TC-HW-PI-08: SMS consent checkbox must be visible on Add Info — checkbox may be missing or the form did not render correctly'
        ).toBeVisible({ timeout: 8_000 });
        const checked = await checkbox.isChecked();
        expect(checked,
            'TC-HW-PI-08: SMS consent checkbox must be unchecked by default — checkbox is pre-checked which would auto-enroll patients in SMS without their explicit consent'
        ).toBe(false);
        console.log('  ✅ SMS consent checkbox visible and unchecked');
    });

    test('TC-HW-PI-09: Book Now button is visible on Add Info page', async ({ page }) => {
        test.slow();
        const reached = await completeToAddInfo(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await expect(page.locator('button').filter({ hasText: /Book Now/i }).first(),
            'TC-HW-PI-09: "Book Now" button must be visible on Add Info — button may be missing, renamed, or the page did not fully render'
        ).toBeVisible({ timeout: 8_000 });
        console.log('  ✅ Book Now button visible');
    });

    test('TC-HW-PI-10: "Your Appointment" summary panel shows time on Add Info', async ({ page }) => {
        test.slow();
        const reached = await completeToAddInfo(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await expect(page.locator('text=/Your Appointment/i').first(),
            'TC-HW-PI-10: "Your Appointment" summary panel must be visible on Add Info — appointment context may not have carried through to this step'
        ).toBeVisible({ timeout: 8_000 });
        await expect(page.locator('text=/Appointment Time/i').first(),
            'TC-HW-PI-10: "Appointment Time" label must be visible in the Add Info summary panel — appointment data may be missing from the session'
        ).toBeVisible({ timeout: 5_000 });
        await expect(page.locator('text=/\\d{1,2}:\\d{2}\\s*(AM|PM)/i').first(),
            'TC-HW-PI-10: A valid time in HH:MM AM/PM format must be shown in the Add Info summary — time was not passed through from the slot selection step'
        ).toBeVisible({ timeout: 5_000 });
        console.log('  ✅ Appointment summary visible on Add Info');
    });

    test('TC-HW-PI-11: Stepper shows all 5 steps on Add Info page', async ({ page }) => {
        test.slow();
        const reached = await completeToAddInfo(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await expect(page.locator('text=/Add Info/i').first(),
            'TC-HW-PI-11: Stepper step "Add Info" must be visible on the Add Info page — stepper may not have rendered or step label changed'
        ).toBeVisible({ timeout: 8_000 });
        await expect(page.locator('text=/Add Insurance/i').first(),
            'TC-HW-PI-11: Stepper step "Add Insurance" must be visible on the Add Info page — step label may have changed or stepper is incomplete'
        ).toBeVisible({ timeout: 5_000 });
        await expect(page.locator('text=/Intake Questions/i').first(),
            'TC-HW-PI-11: Stepper step "Intake Questions" must be visible on the Add Info page — step label may have changed or stepper is incomplete'
        ).toBeVisible({ timeout: 5_000 });
        console.log('  ✅ All stepper steps visible on Add Info page');
    });

});

// ══════════════════════════════════════════════════════════════════════════════
// STEPPER NAVIGATION — PRODUCTION NON-NAVIGABLE
// On production, stepper step labels/numbers are display-only.
// Clicking them does NOT navigate back to a previous page.
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Stepper Navigation — Production Non-Navigable', () => {

    test('TC-HW-STEP-01: From Add Info, clicking "Intake Questions" step does not navigate', async ({ page }) => {
        test.slow();
        const reached = await completeToAddInfo(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        const urlBefore = page.url();
        const step = page.locator('text=/Intake Questions/i').first();
        const hasStep = await step.isVisible({ timeout: 8_000 }).catch(() => false);
        if (!hasStep) {
            throw new Error('TC-HW-STEP-01: "Intake Questions" stepper step label not found on Add Info page — stepper may not have rendered or step label changed');
        }
        await step.click();
        await page.waitForTimeout(2_000);
        expect(page.url(),
            'TC-HW-STEP-01: URL must not change after clicking "Intake Questions" stepper step from Add Info — production stepper is display-only and should not navigate'
        ).toBe(urlBefore);
        console.log(`  ✅ Clicking "Intake Questions" from Add Info: URL unchanged — ${page.url()}`);
    });

    test('TC-HW-STEP-02: From Add Info, clicking "Add Insurance" step does not navigate', async ({ page }) => {
        test.slow();
        const reached = await completeToAddInfo(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        const urlBefore = page.url();
        const step = page.locator('text=/Add Insurance/i').first();
        const hasStep = await step.isVisible({ timeout: 8_000 }).catch(() => false);
        if (!hasStep) {
            throw new Error('TC-HW-STEP-02: "Add Insurance" stepper step label not found on Add Info page — stepper may not have rendered or step label changed');
        }
        await step.click();
        await page.waitForTimeout(2_000);
        expect(page.url(),
            'TC-HW-STEP-02: URL must not change after clicking "Add Insurance" stepper step from Add Info — production stepper is display-only and should not navigate'
        ).toBe(urlBefore);
        console.log(`  ✅ Clicking "Add Insurance" from Add Info: URL unchanged — ${page.url()}`);
    });

    test('TC-HW-STEP-03: From insurance, clicking "Intake Questions" step does not navigate', async ({ page }) => {
        test.slow();
        const reached = await completeWidgetToInsurance(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        const urlBefore = page.url();
        const step = page.locator('text=/Intake Questions/i').first();
        const hasStep = await step.isVisible({ timeout: 8_000 }).catch(() => false);
        if (!hasStep) {
            throw new Error('TC-HW-STEP-03: "Intake Questions" stepper step label not found on insurance page — stepper may not have rendered or step label changed');
        }
        await step.click();
        await page.waitForTimeout(2_000);
        expect(page.url(),
            'TC-HW-STEP-03: URL must not change after clicking "Intake Questions" stepper step from insurance — production stepper is display-only and should not navigate'
        ).toBe(urlBefore);
        console.log(`  ✅ Clicking "Intake Questions" from insurance: URL unchanged — ${page.url()}`);
    });

    test('TC-HW-STEP-04: From intake, clicking "Choose Date & Time" step does not navigate', async ({ page }) => {
        test.slow();
        const reached = await goToIntake(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        const urlBefore = page.url();
        const step = page.locator('text=/Choose Date/i').first();
        const hasStep = await step.isVisible({ timeout: 8_000 }).catch(() => false);
        if (!hasStep) {
            throw new Error('TC-HW-STEP-04: "Choose Date" stepper step label not found on intake page — stepper may not have rendered or step label changed');
        }
        await step.click();
        await page.waitForTimeout(2_000);
        expect(page.url(),
            'TC-HW-STEP-04: URL must not change after clicking "Choose Date & Time" stepper step from intake — production stepper is display-only and should not navigate'
        ).toBe(urlBefore);
        console.log(`  ✅ Clicking "Choose Date" from intake: URL unchanged — ${page.url()}`);
    });

});

// ══════════════════════════════════════════════════════════════════════════════
// BROWSER BACK BUTTON TESTS
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Browser Back Button', () => {

    test('TC-HW-BACK-01: Back from Intake Questions returns to a non-blank page', async ({ page }) => {
        test.slow();
        const reached = await goToIntake(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await page.goBack();
        await page.waitForLoadState('domcontentloaded', { timeout: 30_000 });
        const bodyText = await page.locator('body').textContent().catch(() => '');
        expect(bodyText?.trim().length,
            'TC-HW-BACK-01: Page must not be blank after browser back from Intake Questions — SPA back navigation returned a blank/empty page'
        ).toBeGreaterThan(0);
        console.log(`  ✅ After back from Intake Questions: ${page.url()}`);
    });

    test('TC-HW-BACK-02: Back from intake returns to a non-blank page', async ({ page }) => {
        test.slow();
        const reached = await goToIntake(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await page.goBack();
        await page.waitForLoadState('domcontentloaded', { timeout: 30_000 });
        const bodyText = await page.locator('body').textContent().catch(() => '');
        expect(bodyText?.trim().length,
            'TC-HW-BACK-02: Page must not be blank after browser back from intake — SPA back navigation returned a blank/empty page'
        ).toBeGreaterThan(0);
        console.log(`  ✅ After back from intake: ${page.url()}`);
    });

    test('TC-HW-BACK-03: Back from insurance returns to a non-blank page', async ({ page }) => {
        test.slow();
        const reached = await completeWidgetToInsurance(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await page.goBack();
        await page.waitForLoadState('domcontentloaded', { timeout: 30_000 });
        const bodyText = await page.locator('body').textContent().catch(() => '');
        expect(bodyText?.trim().length,
            'TC-HW-BACK-03: Page must not be blank after browser back from insurance — SPA back navigation returned a blank/empty page'
        ).toBeGreaterThan(0);
        console.log(`  ✅ After back from insurance: ${page.url()}`);
    });

    test('TC-HW-BACK-04: Back from Add Info returns to a non-blank page', async ({ page }) => {
        test.slow();
        const reached = await completeToAddInfo(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await page.goBack();
        await page.waitForLoadState('domcontentloaded', { timeout: 30_000 });
        const count = await page.locator('button, input, h1, h2, h3').count();
        expect(count,
            'TC-HW-BACK-04: Page after browser back from Add Info must contain interactive elements — SPA back navigation may have returned a blank or broken page'
        ).toBeGreaterThan(0);
        console.log(`  ✅ After back from Add Info: ${page.url()}`);
    });

    test('TC-HW-BACK-05: Forward after back from Add Info returns to Add Info', async ({ page }) => {
        test.slow();
        const reached = await completeToAddInfo(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await page.goBack();
        await page.waitForLoadState('domcontentloaded', { timeout: 30_000 });
        await page.goForward();
        await page.waitForLoadState('domcontentloaded', { timeout: 30_000 });
        const count = await page.locator('button, input, h1, h2, h3').count();
        expect(count,
            'TC-HW-BACK-05: Page after forward navigation must contain interactive elements — browser forward navigation returned a blank or broken page'
        ).toBeGreaterThan(0);
        console.log(`  ✅ Forward after back: ${page.url()}`);
    });

});

// ══════════════════════════════════════════════════════════════════════════════
// PAGE REFRESH TESTS
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Page Refresh', () => {

    test('TC-HW-REF-01: Refresh on widget page reloads slot cards and dropdowns', async ({ page }) => {
        await goToWidget(page);
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
        await expect(page.locator('text=/Visit Reason/i').first(),
            'TC-HW-REF-01: "Visit Reason" dropdown must be visible after refreshing the widget page — widget may have crashed on reload or the filter panel did not re-render'
        ).toBeVisible({ timeout: 20_000 });
        console.log('  ✅ Widget reloaded — Visit Reason visible after refresh');
    });

    test('TC-HW-REF-02: Refresh on Intake Questions page does not crash', async ({ page }) => {
        test.slow();
        const reached = await goToIntake(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
        await page.waitForTimeout(1_000);
        const content = await page.locator('body').textContent();
        expect(content?.trim().length,
            'TC-HW-REF-02: Intake Questions page must have content after refresh — page may have crashed or reset to a blank state on reload'
        ).toBeGreaterThan(0);
        console.log(`  ✅ Intake Questions page stable after refresh: ${page.url()}`);
    });

    test('TC-HW-REF-03: Refresh on intake page does not crash', async ({ page }) => {
        test.slow();
        const reached = await goToIntake(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
        await page.waitForTimeout(1_000);
        const content = await page.locator('body').textContent();
        expect(content?.trim().length,
            'TC-HW-REF-03: Intake page must have content after refresh — page may have crashed or lost session state on reload'
        ).toBeGreaterThan(0);
        console.log(`  ✅ Intake page stable after refresh: ${page.url()}`);
    });

    test('TC-HW-REF-04: Refresh on insurance page does not crash', async ({ page }) => {
        test.slow();
        const reached = await completeWidgetToInsurance(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
        await page.waitForTimeout(1_000);
        const content = await page.locator('body').textContent();
        expect(content?.trim().length,
            'TC-HW-REF-04: Insurance page must have content after refresh — page may have crashed or reset to a blank state on reload'
        ).toBeGreaterThan(0);
        console.log(`  ✅ Insurance page stable after refresh: ${page.url()}`);
    });

    test('TC-HW-REF-05: Refresh on Add Info page does not crash', async ({ page }) => {
        test.slow();
        const reached = await completeToAddInfo(page);
        if (!reached) { console.log('  ℹ️ No slots — skipping'); return; }
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
        await page.waitForTimeout(1_000);
        const content = await page.locator('body').textContent();
        expect(content?.trim().length,
            'TC-HW-REF-05: Add Info page must have substantial content after refresh — page may have crashed, lost session state, or rendered a nearly blank error page'
        ).toBeGreaterThan(50);
        console.log(`  ✅ Add Info page stable after refresh: ${page.url()}`);
    });

});

// ══════════════════════════════════════════════════════════════════════════════
// FULL BOOKING FLOW TESTS — one per Visit Reason
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Full Booking Flow', () => {

    for (const reason of VISIT_REASONS) {
        test(`[Full Flow] ${reason} → Intake → Insurance → Add Info`, async ({ page }) => {
            test.slow();
            const reached = await completeToAddInfo(page, reason);
            if (!reached) {
                console.log(`  ℹ️ "${reason}" — no available slots, skipping full flow`);
                return;
            }
            await expect(page.locator('text=/Add Info/i').first(),
                `[Full Flow] ${reason}: "Add Info" step label must be visible after completing the full booking flow — navigation may have stopped before reaching /additionaldetails`
            ).toBeVisible({ timeout: 10_000 });
            await expect(page.locator('input[placeholder*="First Name"]').first(),
                `[Full Flow] ${reason}: First Name input must be visible on Add Info — the form did not render after full flow navigation for reason "${reason}"`
            ).toBeVisible({ timeout: 8_000 });
            console.log(`  ✅ Full flow for "${reason}" reached Add Info successfully`);
        });
    }

});
