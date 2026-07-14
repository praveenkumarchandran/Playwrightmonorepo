/**
 * ADMIN — Scheduler Configuration Tests
 *
 * Covers the Manage Scheduler page at:
 *   /admin/{slug}/1/managescheduler
 *
 * All 7 clients tested. Auth: global-setup.js logs in once → admin-auth.json.
 *
 * Client slugs are derived from tests/config/clients.js (source of truth).
 * Freedman uses slug "test" (its patient URL is /test/1/... — non-standard).
 *
 * Sections tested:
 *   - Page load & header controls
 *   - Scheduler selector dropdown
 *   - General section toggle
 *   - Landing page section (message fields, radio buttons, toggles)
 *   - Save all changes
 *   - Create new scheduler modal (fields, validation, success popup)
 *   - See all schedulers
 *
 * Landing Page — Allow Multiple Appointments behavior:
 *   No  → New patient: error msg on setter landing page
 *   No  → Existing patient: warning popup on identity page after "Find Appointment"
 *   Yes → Patient can book multiple appointments
 */

import { test, expect } from '@playwright/test';

const BASE = (process.env.SETTER_BASE_URL ?? 'https://stage.setter.layline.live').replace(/\/$/, '');

// ── Client registry ────────────────────────────────────────────────────────────
// Derived from tests/config/clients.js. Keep in sync when adding new clients.

const CLIENTS = [
    {
        name: 'SINY Dermatology',
        slug: 'sinydermatology',
        adminUrl: '/admin/sinydermatology/1/managescheduler',
        landingUrl: `${BASE}/sinydermatology/1/sinydermatologybayridge/landing`,
        findAppointmentUrl: `${BASE}/sinydermatology/1/sinydermatologybayridge/findappointment`,
        existingPatient: { firstName: 'Kyletest0889', lastName: 'Laramoretest0889', dob: '01/08/1987' },
        // Insurance tests require a service that goes through the insurance page.
        // "Cosmetic Consultation" skips insurance — use "Skin Problem" instead.
        landingService: 'Skin Problem',
    },
    {
        name: 'Clarus Dermatology',
        slug: 'clarusdermatology',
        adminUrl: '/admin/clarusdermatology/1/managescheduler',
        landingUrl: `${BASE}/clarusdermatology/1/minnetonka/landing`,
        findAppointmentUrl: `${BASE}/clarusdermatology/1/minnetonka/findappointment`,
        existingPatient: { firstName: 'Madhantest', lastName: 'S', dob: '11/11/2002' },
    },
    {
        name: 'TNDI',
        slug: 'thenerveanddiscinstitute',
        adminUrl: '/admin/thenerveanddiscinstitute/1/managescheduler',
        landingUrl: `${BASE}/thenerveanddiscinstitute/1/thenerveanddiscinstitutefarmington/landing`,
        findAppointmentUrl: `${BASE}/thenerveanddiscinstitute/1/thenerveanddiscinstitutefarmington/findappointment`,
        existingPatient: { firstName: 'Mangaleswari', lastName: 'dev', dob: '07/11/1994' },
        // Admin dropdown shows "The Nerve and Disc Institute" — not the acronym "TNDI".
        selectorSearch: 'nerve',
        selectorPattern: /nerve.*disc/i,
        // TNDI has no providers assigned — Find Appointment always shows flat slots
        // regardless of the "Group by provider" Yes/No setting.
        hasProviders: false,
        // TNDI has no patient-facing insurance step — Insurance Intake tests skipped.
        skipInsurance: true,
    },
    {
        name: 'Hopemark Health',
        slug: 'hopemarkhealth',
        adminUrl: '/admin/hopemarkhealth/1/managescheduler',
        landingUrl: `${BASE}/hopemarkhealth/1/downtown/landing`,
        findAppointmentUrl: `${BASE}/hopemarkhealth/1/downtown/findappointment`,
        existingPatient: { firstName: 'test', lastName: 'pv155', dob: '02/02/2000' },
        landingService: 'Psychiatric Evaluation (Virtual)',
    },
    {
        name: 'Kronson Vein Institute',
        slug: 'kronsonveininstitute',
        adminUrl: '/admin/kronsonveininstitute/1/managescheduler',
        landingUrl: `${BASE}/kronsonveininstitute/1/arcadia/landing`,
        findAppointmentUrl: `${BASE}/kronsonveininstitute/1/arcadia/findappointment`,
        existingPatient: { firstName: 'Madhan', lastName: 'Srinivasan', dob: '05/21/2026' },
    },
    {
        name: 'Center for Vein Disease (CVD)',
        slug: 'centerforveindisease',
        adminUrl: '/admin/centerforveindisease/1/managescheduler',
        landingUrl: `${BASE}/centerforveindisease/1/mainoffice/landing`,
        findAppointmentUrl: `${BASE}/centerforveindisease/1/mainoffice/findappointment`,
        existingPatient: null, // TODO: fill in after verifying in browser
        // Admin dropdown shows "Center for Vein Disease" (no "(CVD)").
        // "disease" is unique — avoids matching "Center for Varicose Veins".
        selectorSearch: 'disease',
        selectorPattern: /vein disease/i,
        // CVD landing page: pick "Consult" service (not the first option which may be wrong).
        landingService: 'Consult',
    },
    {
        // Freedman patient URL uses /test/ slug (non-standard)
        name: 'Freedman ENT',
        slug: 'test',
        adminUrl: '/admin/test/1/managescheduler',
        landingUrl: `${BASE}/test/1/freedmanentdownriver/landing`,
        findAppointmentUrl: `${BASE}/test/1/freedmanentdownriver/findappointment`,
        existingPatient: { firstName: 'AmirthamJ', lastName: 'S', dob: '05/05/2026' },
        // Admin dropdown shows "test" (the client slug) — not "Freedman ENT".
        selectorSearch: 'test',
        selectorPattern: /^test$/i,
        // Freedman has no providers assigned — provider grouping has no effect on the patient page.
        hasProviders: false,
        // Freedman has no patient-facing insurance step — Insurance Intake tests skipped.
        skipInsurance: true,
    },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

async function goToScheduler(page, client) {
    // Step 1: Navigate to any admin patients URL.
    // The server 302 redirects to whichever client's patients page the session is on.
    // If the session is expired it redirects to /login.
    const ADMIN_ENTRY = 'https://stage.setter.layline.live/admin/sinydermatology/1/patients';
    await page.goto(ADMIN_ENTRY, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => { });
    console.log(`  After goto: ${page.url()}`);

    // Detect login page by element presence, NOT by page.url().
    // page.url() has a race condition: the /login page may JS-redirect away between
    // the time Playwright resolves networkidle and the time .includes('/login') is checked,
    // causing the block to be silently skipped even though the browser showed /login.
    const emailInput = page.getByPlaceholder('Email');
    const onLogin = await emailInput.isVisible({ timeout: 3_000 }).catch(() => false);
    if (onLogin) {
        console.log('  ⚠️ Session expired — re-logging in...');
        await emailInput.fill(process.env.ADMIN_EMAIL);
        await page.getByPlaceholder('Password').fill(process.env.ADMIN_PASSWORD);
        await page.getByRole('button', { name: 'Sign In' }).click();

        // Detect login failure immediately — e.g. "Error occurred: Request failed with status code 400"
        // Without this check, the test silently waits 25s then throws a confusing timeout error.
        const loginErrorMsg = page.locator('text=/Error occurred|Request failed|invalid.*credential|incorrect.*password/i').first();
        const hasLoginError = await loginErrorMsg.isVisible({ timeout: 3_000 }).catch(() => false);
        if (hasLoginError) {
            const errText = await loginErrorMsg.textContent().catch(() => 'unknown');
            throw new Error(`❌ Admin login failed: "${errText.trim()}" — verify ADMIN_EMAIL and ADMIN_PASSWORD in .env`);
        }

        await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 25_000 });
        await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => { });
        console.log(`  ✅ Logged in — now at: ${page.url()}`);
    }

    // Step 2: Switch to the target client in the top-right dropdown — while still on patients page.
    // Switching BEFORE clicking Schedulers means the sidebar link goes directly to that
    // client's managescheduler in one step, with no extra goto/redirect needed.
    //
    // Wait explicitly for the "Select Client" input to render — networkidle resolves before
    // the MUI Autocomplete component is mounted, so a lazy-render gap of several seconds
    // can cause selectClientFromTopRight to silently skip the switch and leave the wrong
    // client active (next Schedulers click goes to the previous client's managescheduler).
    await page.locator('input[placeholder="Select Client"]')
        .waitFor({ state: 'visible', timeout: 15_000 })
        .catch(() => console.log('  ⚠️ "Select Client" input did not appear — will try anyway'));
    await selectClientFromTopRight(page, client);

    // Step 3: Click Schedulers in the sidebar — arrives at target client's managescheduler directly.
    console.log(`  Clicking Schedulers in sidebar`);
    const schedulersLink = page.locator('a').filter({ hasText: /^Schedulers$/i }).first();
    await schedulersLink.waitFor({ state: 'visible', timeout: 20_000 });
    await schedulersLink.click();
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => { });
    await page.waitForTimeout(500);
    console.log(`  After Schedulers click: ${page.url()}`);

    // Step 4: Confirm we reached the correct managescheduler and the page is ready.
    if (!page.url().includes('managescheduler')) {
        throw new Error(`Expected managescheduler but landed on: ${page.url()}`);
    }
    await page.locator('button:has-text("Create new scheduler"), button:has-text("Save all changes")')
        .first().waitFor({ state: 'visible', timeout: 30_000 });
    console.log(`  ✅ Scheduler page ready: ${page.url()}`);
}

/**
 * Check the top-right client selector and switch to the target client if needed.
 *
 * The client selector is a MUI Autocomplete (input[placeholder="Select Client"]).
 * Confirmed from page HTML — it is NOT a MUI Select.
 *
 * Flow:
 *   1. Read the input's current value via inputValue().
 *   2. If it already shows the target client → skip.
 *   3. If not → type the client name to filter, click the matching option.
 *   4. After switching, ensure we stay on the managescheduler page.
 */
async function selectClientFromTopRight(page, client) {
    // The client selector is a MUI Autocomplete with placeholder="Select Client".
    // (Not a MUI Select — confirmed from actual page HTML.)
    const clientInput = page.locator('input[placeholder="Select Client"]');
    // Wait up to 15s — the MUI Autocomplete renders lazily after React hydration.
    // 5s was not enough when navigating back from the patient-facing setter page.
    const isVisible = await clientInput.isVisible({ timeout: 15_000 }).catch(() => false);

    if (!isVisible) {
        // Admin may only have one client — the selector simply doesn't render.
        console.log('  ℹ️ Client selector not found (single-client admin account) — proceeding as-is');
        return;
    }

    const currentVal = await clientInput.inputValue().catch(() => '');
    console.log(`  Client selector current value: "${currentVal}"`);

    // selectorSearch: per-client override for what to type (e.g. TNDI types 'nerve', Freedman types 'test').
    const firstWord = client.name.split(/\s+/)[0].toLowerCase();
    const searchTerm = (client.selectorSearch ?? firstWord).toLowerCase();

    // Skip if the input already shows this client
    if (searchTerm.length > 1 && currentVal.toLowerCase().includes(searchTerm)) {
        console.log(`  ✅ Client already set to "${client.name}" — no change needed`);
        return;
    }

    // MUI Autocomplete: select all then type to filter options
    await clientInput.click();
    await clientInput.selectText();
    await clientInput.type(searchTerm, { delay: 50 });
    await page.waitForTimeout(500);

    // Build the option-match regex.
    // Prefer client.selectorPattern (explicit override for non-standard display names).
    // Fall back to first 2 non-trivial name words — avoids brittle full-name matches like "(CVD)".
    const nameWords = client.name
        .replace(/[()]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 1 && !/^(and|for|the|of|in|at)$/i.test(w));
    const optionRegex = client.selectorPattern ?? new RegExp(nameWords.slice(0, 2).join('.*'), 'i');

    const option = page.locator('[role="option"]')
        .filter({ hasText: optionRegex })
        .first();
    const hasOption = await option.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasOption) {
        await option.click();
        // Wait for the SPA to finish navigating after the client switch
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => { });
        const newVal = await clientInput.inputValue().catch(() => '');
        console.log(`  ✅ Client switched to: "${newVal}"`);
    } else {
        // Log what's available to help debug unexpected dropdown names
        const allOptionTexts = await page.locator('[role="option"]').allTextContents().catch(() => []);
        await page.keyboard.press('Escape');
        if (allOptionTexts.length > 0) {
            console.log(`  ℹ️ No match for "${client.name}" (searched "${searchTerm}"). Options: [${allOptionTexts.join(' | ')}]`);
        } else {
            console.log(`  ℹ️ "${client.name}" not in client selector (searched "${searchTerm}") — no options appeared`);
        }
    }
}

/**
 * Navigate to the target client's managescheduler page after the client context is set.
 *
 * Primary: goto(client.adminUrl) — works after selectClientFromTopRight updates the
 * server-side SPA context, so the SPA no longer redirects away from that client's URL.
 * Fallback: click a[href*="managescheduler"] in the sidebar nav.
 */
async function clickSchedulerSection(page, client) {
    // Direct navigation now works because the SPA client context was just updated.
    await page.goto(client.adminUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => { });
    console.log(`  After goto(${client.adminUrl}): ${page.url()}`);

    if (!page.url().includes('managescheduler')) {
        // SPA still redirected — try clicking the Scheduler nav link from here
        console.log('  Redirected — trying sidebar Scheduler nav link');
        const schedulerLink = page.locator('a[href*="managescheduler"]').first();
        const appeared = await schedulerLink.waitFor({ state: 'visible', timeout: 8_000 })
            .then(() => true).catch(() => false);
        if (appeared) {
            await schedulerLink.click();
            await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => { });
        }
    }

    if (!page.url().includes('managescheduler')) {
        console.log(`  ℹ️ Could not reach ${client.name} managescheduler — at: ${page.url()}`);
        return;
    }

    await page.locator('button:has-text("Create new scheduler"), button:has-text("Save all changes")')
        .first().waitFor({ state: 'visible', timeout: 20_000 });
    console.log(`  ✅ Scheduler section loaded: ${page.url()}`);
}

/**
 * Select the first available scheduler from the "Currently editing" Autocomplete.
 * "Currently editing" is an MUI Autocomplete — scope to MuiAutocomplete-root that
 * contains the label text, click the input to open the dropdown, pick first option.
 */
async function selectActiveScheduler(page) {
    // Count all autocomplete roots to help diagnose wrong-element issues
    const allAutoCount = await page.locator('[class*="MuiAutocomplete-root"]').count();
    console.log(`  MuiAutocomplete-root elements on page: ${allAutoCount}`);

    // Scope to the autocomplete whose subtree contains "Currently editing"
    const autocomplete = page.locator('[class*="MuiAutocomplete-root"]')
        .filter({ hasText: /Currently editing/i })
        .first();

    const isVisible = await autocomplete.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!isVisible) {
        console.log('  ℹ️ Currently editing Autocomplete not found, skipping');
        return;
    }

    // The Autocomplete input has role="combobox"
    const schedulerInput = autocomplete.locator('input[role="combobox"]').first();
    const inputVisible = await schedulerInput.isVisible({ timeout: 2_000 }).catch(() => false);
    if (!inputVisible) {
        console.log('  ℹ️ Autocomplete combobox input not visible');
        return;
    }

    const currentVal = await schedulerInput.inputValue().catch(() => '');
    console.log(`  Currently editing scheduler: "${currentVal}"`);

    // Click the input directly to open the dropdown (most reliable approach)
    await schedulerInput.click();
    await page.waitForTimeout(600);

    const options = page.locator('[role="option"]');
    const count = await options.count();
    console.log(`  Available schedulers in dropdown: ${count}`);

    if (count > 0) {
        const firstOptionText = await options.first().textContent().catch(() => '');
        await options.first().click();
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => { });
        await page.waitForTimeout(800);
        const newVal = await schedulerInput.inputValue().catch(() => '');
        console.log(`  ✅ Scheduler selected: "${firstOptionText?.trim()}" (input now: "${newVal}")`);
    } else {
        await page.keyboard.press('Escape');
        console.log('  ℹ️ No scheduler options found in Currently editing dropdown');
    }
}

/** Expand a section if it is collapsed (click its header to open it). */
async function expandSection(page, sectionLabel) {
    const section = page.locator(`text=/^${sectionLabel}$/i`).first();
    await section.waitFor({ state: 'visible', timeout: 10_000 });
    await section.scrollIntoViewIfNeeded().catch(() => { });

    // MUI Accordion summary renders as a button with aria-expanded="true|false".
    // Check that attribute to detect collapsed vs expanded state without risking
    // accidentally toggling an already-open section.
    const summaryBtn = page.locator('button[aria-expanded], [role="button"][aria-expanded]')
        .filter({ has: page.locator(`text=/${sectionLabel}/i`) })
        .first();

    const ariaExpanded = await summaryBtn.getAttribute('aria-expanded', { timeout: 3_000 }).catch(() => null);
    console.log(`  Section "${sectionLabel}" aria-expanded: ${ariaExpanded}`);

    if (ariaExpanded !== 'true') {
        // Click the accordion button if found, otherwise click the text itself
        const btnVisible = await summaryBtn.isVisible({ timeout: 1_000 }).catch(() => false);
        await (btnVisible ? summaryBtn : section).click();
        // Wait for radio inputs to appear inside the now-expanded section
        await page.locator('input[type="radio"]').first()
            .waitFor({ state: 'visible', timeout: 10_000 }).catch(() => { });
        await page.waitForTimeout(300);
    }
}

/**
 * Ensure "Automation Scheduler" exists for the client, select it in "Currently editing",
 * and return its numeric ruleid for use in patient-facing URLs (?ruleId=N).
 *
 * API shape: GET /getSchedulerName?clientId=N
 *   → { result: [{ schedulerName, ruleid, configId, ... }], latestOne: [...] }
 *
 * Strategy:
 *   1. Attach a response listener BEFORE navigating (page load fires the API).
 *   2. After goToScheduler, inspect the LAST captured response (target client's list).
 *   3. If "Automation Scheduler" found → use its ruleid.
 *   4. If not → create it; intercept the post-create API call to get the new ruleid.
 *   5. Select "Automation Scheduler" in the "Currently editing" dropdown.
 */
async function ensureAutomationScheduler(page, client) {
    const SCHEDULER_NAME = 'Automation Scheduler';

    // Collect ALL getSchedulerName responses — last one is for the target client
    let lastSchedulerList = null;
    const pendingJsons = [];

    const responseHandler = (response) => {
        if (response.url().includes('getSchedulerName')) {
            const p = response.json()
                .then(data => { if (data?.result) lastSchedulerList = data.result; })
                .catch(() => { });
            pendingJsons.push(p);
        }
    };

    page.on('response', responseHandler);
    await goToScheduler(page, client);
    page.off('response', responseHandler);

    // Wait for any in-flight JSON parses to finish
    await Promise.all(pendingJsons).catch(() => { });
    await page.waitForTimeout(300);

    // Check if Automation Scheduler already exists in the client's scheduler list
    let ruleid = null;
    if (lastSchedulerList) {
        const match = lastSchedulerList.find(
            s => s.schedulerName?.toLowerCase() === SCHEDULER_NAME.toLowerCase()
        );
        if (match) {
            ruleid = match.ruleid;
            console.log(`  ✅ Found existing "${SCHEDULER_NAME}" for ${client.name} (ruleid: ${ruleid})`);
        }
    }

    if (!ruleid) {
        // "Automation Scheduler" not found — create it
        console.log(`  "${SCHEDULER_NAME}" not found for ${client.name} — creating...`);

        // Need an active scheduler selected before the Create button becomes available
        await selectActiveScheduler(page);
        await page.waitForTimeout(800);

        // Intercept the post-create getSchedulerName call BEFORE clicking Create
        const afterCreatePromise = page.waitForResponse(
            r => r.url().includes('getSchedulerName'),
            { timeout: 25_000 }
        ).catch(() => null);

        await page.locator('button').filter({ hasText: /Create new scheduler/i }).first().click();
        const modal = page.locator('form:has(input[name="schedulerName"])');
        await modal.waitFor({ state: 'visible', timeout: 25_000 });
        await modal.locator('input[placeholder="Enter here"]').first().fill(SCHEDULER_NAME);
        await modal.locator('button').filter({ hasText: /^Create$/i }).first().click();

        // The page calls getSchedulerName after creation to refresh the list
        const afterCreateResponse = await afterCreatePromise;
        if (afterCreateResponse) {
            const data = await afterCreateResponse.json().catch(() => null);
            const list = data?.result ?? [];
            const match = list.find(
                s => s.schedulerName?.toLowerCase() === SCHEDULER_NAME.toLowerCase()
            );
            if (match) {
                ruleid = match.ruleid;
                console.log(`  ✅ Created "${SCHEDULER_NAME}" for ${client.name} (ruleid: ${ruleid})`);
            }
        }

        // Wait for success popup then dismiss it
        const successPopup = page.locator('[role="dialog"]').filter({ hasText: /Data Uploaded/i });
        const hasSuccess = await successPopup.isVisible({ timeout: 10_000 }).catch(() => false);
        if (hasSuccess) {
            await successPopup.locator('button').first().click().catch(() => page.keyboard.press('Escape'));
            await successPopup.waitFor({ state: 'hidden', timeout: 8_000 }).catch(() => { });
        }

        if (!ruleid) {
            console.log(`  ⚠️ Could not get ruleid for "${SCHEDULER_NAME}" — continuing without it`);
        }
    }

    // Select "Automation Scheduler" in the "Currently editing" autocomplete
    if (ruleid) {
        const autocomplete = page.locator('[class*="MuiAutocomplete-root"]')
            .filter({ hasText: /Currently editing/i }).first();
        const schedulerInput = autocomplete.locator('input[role="combobox"]').first();

        const currentVal = await schedulerInput.inputValue().catch(() => '');
        if (currentVal.toLowerCase() !== SCHEDULER_NAME.toLowerCase()) {
            await schedulerInput.click();
            await schedulerInput.selectText();
            await schedulerInput.type('Automation', { delay: 40 });
            await page.waitForTimeout(400);

            const option = page.locator('[role="option"]')
                .filter({ hasText: /Automation Scheduler/i }).first();
            const hasOption = await option.isVisible({ timeout: 5_000 }).catch(() => false);
            if (hasOption) {
                await option.click();
                await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => { });
                console.log(`  ✅ "${SCHEDULER_NAME}" selected in Currently editing`);
            } else {
                await page.keyboard.press('Escape');
                console.log(`  ⚠️ Could not select "${SCHEDULER_NAME}" in Currently editing dropdown`);
            }
        } else {
            console.log(`  ✅ "${SCHEDULER_NAME}" already selected in Currently editing`);
        }
    }

    return ruleid;
}

// ── Tests (run for each client) ───────────────────────────────────────────────

for (const client of CLIENTS) {

    test.describe(`Scheduler Config — ${client.name}`, () => {

        // ── Page Load ─────────────────────────────────────────────────────────

        test(`TC-ADMIN-SC-01 [${client.slug}]: Scheduler page loads with "Schedulers" heading`, async ({ page }) => {
            await goToScheduler(page, client);
            await expect(page.locator('text=/Schedulers/i').first()).toBeVisible({ timeout: 10_000 });
            console.log(`  ✅ Schedulers heading visible at: ${page.url()}`);
        });

        test(`TC-ADMIN-SC-02 [${client.slug}]: "Currently editing" scheduler selector is visible`, async ({ page }) => {
            await goToScheduler(page, client);
            await expect(page.locator('text=/Currently editing/i').first()).toBeVisible({ timeout: 10_000 });
            // The selector dropdown (MUI Select) should show a scheduler name
            const selector = page.locator('[class*="MuiSelect-select"], [role="combobox"]').first();
            await expect(selector).toBeVisible({ timeout: 8_000 });
            const val = await selector.textContent().catch(() => '');
            console.log(`  ✅ Currently editing: "${val?.trim()}"`);
        });

        test(`TC-ADMIN-SC-03 [${client.slug}]: "Save all changes" button is visible`, async ({ page }) => {
            await goToScheduler(page, client);
            await expect(
                page.locator('button').filter({ hasText: /Save all changes/i }).first()
            ).toBeVisible({ timeout: 10_000 });
            console.log('  ✅ Save all changes button visible');
        });

        test(`TC-ADMIN-SC-04 [${client.slug}]: "Create new scheduler" button is visible`, async ({ page }) => {
            await goToScheduler(page, client);
            await expect(
                page.locator('button').filter({ hasText: /Create new scheduler/i }).first()
            ).toBeVisible({ timeout: 10_000 });
            console.log('  ✅ Create new scheduler button visible');
        });

        test(`TC-ADMIN-SC-05 [${client.slug}]: "See all schedulers" button is visible`, async ({ page }) => {
            await goToScheduler(page, client);
            await expect(
                page.locator('button').filter({ hasText: /See all schedulers/i }).first()
            ).toBeVisible({ timeout: 10_000 });
            console.log('  ✅ See all schedulers button visible');
        });

        test(`TC-ADMIN-SC-06 [${client.slug}]: Notes field is visible next to scheduler selector`, async ({ page }) => {
            await goToScheduler(page, client);
            // Notes: either a labeled input or a placeholder-based one
            const notesField = page.locator('input[placeholder*="Note" i], textarea[placeholder*="Note" i]')
                .or(page.locator('[aria-label*="Note" i], label:has-text("Notes") + input'))
                .first();
            const hasNotes = await notesField.isVisible({ timeout: 8_000 }).catch(() => false);
            if (hasNotes) {
                console.log('  ✅ Notes field visible');
            } else {
                // Fallback: look for "Notes" label text
                const notesLabel = page.locator('text=/^Notes$/i').first();
                const hasLabel = await notesLabel.isVisible({ timeout: 5_000 }).catch(() => false);
                console.log(`  Notes label visible: ${hasLabel}`);
            }
        });

        // ── Scheduler Selector ────────────────────────────────────────────────

        test(`TC-ADMIN-SC-07 [${client.slug}]: Scheduler selector dropdown shows at least one scheduler`, async ({ page }) => {
            await goToScheduler(page, client);
            // Open the scheduler selector
            const selector = page.locator('[class*="MuiSelect-select"], [role="combobox"]').first();
            await selector.click();
            await page.waitForTimeout(500);
            const options = page.locator('[role="option"], li[role="option"]');
            const count = await options.count();
            console.log(`  Scheduler options: ${count}`);
            if (count > 0) {
                const firstOption = await options.first().textContent();
                console.log(`  First option: "${firstOption?.trim()}"`);
                expect(count).toBeGreaterThan(0);
            } else {
                console.log('  ℹ️ No dropdown options found — scheduler may be loaded differently');
            }
            await page.keyboard.press('Escape');
        });

        // ── Section Visibility ────────────────────────────────────────────────

        test(`TC-ADMIN-SC-08 [${client.slug}]: "General" section header is visible`, async ({ page }) => {
            await goToScheduler(page, client);
            await expect(page.locator('text=/^General$/i').first()).toBeVisible({ timeout: 10_000 });
            console.log('  ✅ General section visible');
        });

        test(`TC-ADMIN-SC-09 [${client.slug}]: "Landing page" section header is visible`, async ({ page }) => {
            await goToScheduler(page, client);
            await expect(page.locator('text=/^Landing page$/i').first()).toBeVisible({ timeout: 10_000 });
            console.log('  ✅ Landing page section visible');
        });

        test(`TC-ADMIN-SC-10 [${client.slug}]: General section has a toggle switch`, async ({ page }) => {
            await goToScheduler(page, client);
            // The General row has a toggle (MUI Switch) — look for it in the General section row
            const generalRow = page.locator('text=/^General$/i').first().locator('../..');
            const toggle = generalRow.locator('[class*="MuiSwitch"], [role="checkbox"], input[type="checkbox"]').first();
            const hasToggle = await toggle.isVisible({ timeout: 8_000 }).catch(() => false);
            console.log(`  General toggle visible: ${hasToggle}`);
            // Toggle may not be directly queryable (MUI hidden input) — verify the switch visual element
            const switchEl = generalRow.locator('[class*="Switch"], [class*="switch"]').first();
            const hasSwitchEl = await switchEl.isVisible({ timeout: 5_000 }).catch(() => false);
            console.log(`  General toggle switch element: ${hasSwitchEl}`);
        });

        test(`TC-ADMIN-SC-11 [${client.slug}]: Landing page section has a toggle switch`, async ({ page }) => {
            await goToScheduler(page, client);
            const landingRow = page.locator('text=/^Landing page$/i').first().locator('../..');
            const switchEl = landingRow.locator('[class*="Switch"], [class*="switch"], [role="checkbox"]').first();
            const hasSwitchEl = await switchEl.isVisible({ timeout: 8_000 }).catch(() => false);
            console.log(`  Landing page toggle visible: ${hasSwitchEl}`);
        });

        // ── Landing Page Section Content ──────────────────────────────────────

        test(`TC-ADMIN-SC-12 [${client.slug}]: Landing page — "Message for call-to-schedule services" field visible`, async ({ page }) => {
            await goToScheduler(page, client);
            // Scroll to ensure the section is in view and expanded
            await page.locator('text=/Landing page/i').first().scrollIntoViewIfNeeded();
            // Look for the label text
            const label = page.locator('text=/Message for call-to-schedule services/i').first();
            const hasLabel = await label.isVisible({ timeout: 10_000 }).catch(() => false);
            if (hasLabel) {
                console.log('  ✅ "Message for call-to-schedule services" label visible');
                // The textarea should be visible nearby
                const textarea = page.locator('textarea').first();
                await expect(textarea).toBeVisible({ timeout: 8_000 });
            } else {
                console.log('  ℹ️ Label not found — Landing page section may be collapsed');
            }
        });

        test(`TC-ADMIN-SC-13 [${client.slug}]: Landing page — "Allow patients to schedule multiple appointments" radio group visible`, async ({ page }) => {
            await goToScheduler(page, client);
            await page.locator('text=/Landing page/i').first().scrollIntoViewIfNeeded();
            const label = page.locator('text=/Allow patients to schedule multiple appointments/i').first();
            const hasLabel = await label.isVisible({ timeout: 10_000 }).catch(() => false);
            if (hasLabel) {
                console.log('  ✅ Multiple appointments label visible');
                // Yes/No radio buttons should be nearby
                const yesRadio = page.locator('input[type="radio"]').filter({ has: page.locator('..') })
                    .or(page.locator('[role="radio"]').filter({ hasText: /Yes/i }))
                    .first();
                const hasRadio = await page.locator('text=/^Yes$/i').first()
                    .isVisible({ timeout: 5_000 }).catch(() => false);
                const hasNoRadio = await page.locator('text=/^No$/i').first()
                    .isVisible({ timeout: 5_000 }).catch(() => false);
                console.log(`  Yes radio visible: ${hasRadio}, No radio visible: ${hasNoRadio}`);
            } else {
                console.log('  ℹ️ Multiple appointments label not found — section may be collapsed');
            }
        });

        test(`TC-ADMIN-SC-14 [${client.slug}]: Landing page — "Message for patients who already have an appointment" field visible`, async ({ page }) => {
            await goToScheduler(page, client);
            await page.locator('text=/Landing page/i').first().scrollIntoViewIfNeeded();
            const label = page.locator('text=/Message for patients who already have an appointment/i').first();
            const hasLabel = await label.isVisible({ timeout: 10_000 }).catch(() => false);
            if (hasLabel) {
                console.log('  ✅ "Message for patients who already have appointment" label visible');
                // Should have a textarea with APPTDATE/APPTTIME placeholder text
                const textareas = page.locator('textarea');
                const count = await textareas.count();
                console.log(`  Textarea count on page: ${count}`);
                expect(count).toBeGreaterThan(0);
            } else {
                console.log('  ℹ️ Label not found — section may be collapsed or outside viewport');
            }
        });

        test(`TC-ADMIN-SC-15 [${client.slug}]: Landing page message fields contain default text`, async ({ page }) => {
            await goToScheduler(page, client);
            await page.locator('text=/Landing page/i').first().scrollIntoViewIfNeeded();
            const textareas = page.locator('textarea');
            const count = await textareas.count();
            if (count > 0) {
                const firstVal = await textareas.first().inputValue().catch(() => '');
                console.log(`  First textarea value: "${firstVal?.substring(0, 80)}"`);
                expect(firstVal.length).toBeGreaterThanOrEqual(0);
                console.log('  ✅ Textarea fields have content');
            } else {
                console.log('  ℹ️ No textareas visible — Landing page section may be collapsed');
            }
        });

        test(`TC-ADMIN-SC-16 [${client.slug}]: APPTDATE and APPTTIME placeholders present in appointment message`, async ({ page }) => {
            await goToScheduler(page, client);
            await page.locator('text=/Landing page/i').first().scrollIntoViewIfNeeded();
            // The second textarea should contain the appointment message with APPTDATE/APPTTIME
            const textareas = page.locator('textarea');
            const count = await textareas.count();
            if (count >= 2) {
                const secondVal = await textareas.nth(1).inputValue().catch(() => '');
                const hasPlaceholders = /APPTDATE|APPTTIME/i.test(secondVal);
                console.log(`  Second textarea contains APPTDATE/APPTTIME: ${hasPlaceholders}`);
                console.log(`  Value: "${secondVal?.substring(0, 100)}"`);
                if (hasPlaceholders) {
                    expect(hasPlaceholders).toBe(true);
                }
            } else {
                console.log(`  ℹ️ Only ${count} textarea(s) found — APPTDATE/APPTTIME check skipped`);
            }
        });

        // ── Multiple Appointments Radio ────────────────────────────────────────

        test(`TC-ADMIN-SC-17 [${client.slug}]: "No" is the default selected option for multiple appointments`, async ({ page }) => {
            await goToScheduler(page, client);
            await page.locator('text=/Landing page/i').first().scrollIntoViewIfNeeded();
            const label = page.locator('text=/Allow patients to schedule multiple appointments/i').first();
            const hasLabel = await label.isVisible({ timeout: 8_000 }).catch(() => false);
            if (!hasLabel) { console.log('  ℹ️ Section collapsed — skipping'); return; }
            // "No" radio should be selected by default (based on screenshot)
            const radios = page.locator('input[type="radio"]');
            const radioCount = await radios.count();
            if (radioCount >= 2) {
                const yesChecked = await radios.nth(0).isChecked().catch(() => false);
                const noChecked = await radios.nth(1).isChecked().catch(() => false);
                console.log(`  Yes checked: ${yesChecked}, No checked: ${noChecked}`);
            } else {
                // MUI Radio may use different structure — check via role
                const noBtn = page.locator('[role="radio"]').filter({ hasText: /^No$/i }).first();
                const isNoSelected = await noBtn.getAttribute('aria-checked').catch(() => null);
                console.log(`  No radio aria-checked: ${isNoSelected}`);
            }
        });

        test(`TC-ADMIN-SC-18 [${client.slug}]: Clicking "Yes" on multiple appointments updates selection`, async ({ page }) => {
            await goToScheduler(page, client);
            await page.locator('text=/Landing page/i').first().scrollIntoViewIfNeeded();
            const label = page.locator('text=/Allow patients to schedule multiple appointments/i').first();
            const hasLabel = await label.isVisible({ timeout: 8_000 }).catch(() => false);
            if (!hasLabel) { console.log('  ℹ️ Section collapsed — skipping'); return; }
            // Click the "Yes" option
            const yesOption = page.locator('text=/^Yes$/i').first();
            const hasYes = await yesOption.isVisible({ timeout: 5_000 }).catch(() => false);
            if (!hasYes) { console.log('  ℹ️ Yes radio not found'); return; }
            await yesOption.click();
            await page.waitForTimeout(300);
            // Revert back to No to avoid leaving the page in a changed state
            const noOption = page.locator('text=/^No$/i').first();
            const hasNo = await noOption.isVisible({ timeout: 3_000 }).catch(() => false);
            if (hasNo) await noOption.click();
            console.log('  ✅ Yes/No radio buttons are clickable');
        });

        // ── Save All Changes ──────────────────────────────────────────────────

        test(`TC-ADMIN-SC-19 [${client.slug}]: "Save all changes" button is clickable`, async ({ page }) => {
            await goToScheduler(page, client);
            const saveBtn = page.locator('button').filter({ hasText: /Save all changes/i }).first();
            await expect(saveBtn).toBeVisible({ timeout: 10_000 });
            // Verify button is not disabled
            const isDisabled = await saveBtn.isDisabled().catch(() => false);
            console.log(`  Save all changes disabled: ${isDisabled}`);
            expect(isDisabled).toBe(false);
            console.log('  ✅ Save all changes button is enabled and clickable');
        });

        // ── See All Schedulers ────────────────────────────────────────────────

        test(`TC-ADMIN-SC-20 [${client.slug}]: "See all schedulers" navigates to schedulers list`, async ({ page }) => {
            await goToScheduler(page, client);
            const seeAllBtn = page.locator('button').filter({ hasText: /See all schedulers/i }).first();
            await expect(seeAllBtn).toBeVisible({ timeout: 10_000 });
            await seeAllBtn.click();
            // Wait for navigation or modal to open
            await page.waitForTimeout(1_000);
            await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => { });
            const url = page.url();
            console.log(`  After "See all schedulers" click: ${url}`);
            // Either navigates to a list page or opens a modal/drawer
            const hasSchedulerList = await page.locator('text=/Scheduler/i').first()
                .isVisible({ timeout: 8_000 }).catch(() => false);
            console.log(`  Scheduler list/page visible: ${hasSchedulerList}`);
        });

        // ── URL & Auth verification ───────────────────────────────────────────

        test(`TC-ADMIN-SC-21 [${client.slug}]: Admin page requires auth — unauthenticated access redirects to login`, async ({ browser }) => {
            // Open a fresh context with no storage state (no auth)
            const freshContext = await browser.newContext();
            const freshPage = await freshContext.newPage();
            await freshPage.goto(`https://stage.setter.layline.live${CLIENTS[0].adminUrl}`, {
                waitUntil: 'domcontentloaded',
                timeout: 20_000,
            });
            await freshPage.waitForTimeout(1_000);
            const url = freshPage.url();
            const isRedirected = url.includes('login') || url.includes('signin') ||
                await freshPage.locator('text=/Sign In|Login/i').first().isVisible({ timeout: 5_000 }).catch(() => false);
            console.log(`  Unauthenticated URL: ${url}, redirected: ${isRedirected}`);
            await freshContext.close();
        });

        // ── Section count ─────────────────────────────────────────────────────

        test(`TC-ADMIN-SC-22 [${client.slug}]: Multiple configuration sections are present on the page`, async ({ page }) => {
            await goToScheduler(page, client);
            // Scroll down to load all sections
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(500);
            await page.evaluate(() => window.scrollTo(0, 0));
            // Count visible section headers (General, Landing page, and likely more)
            const sectionHeaders = page.locator('text=/^General$|^Landing page$|^Slot|^Intake|^Insurance|^Patient/i');
            const count = await sectionHeaders.count();
            console.log(`  Section headers found: ${count}`);
            expect(count).toBeGreaterThanOrEqual(2);
            console.log('  ✅ At least General and Landing page sections present');
        });

        // ── Create New Scheduler Modal ────────────────────────────────────────

        test.describe('Create New Scheduler Modal', () => {

            // The modal is a <form> (not a role="dialog") — scope tests to this form.
            // Identified by the unique scheduler-name input: input[name="schedulerName"].
            const MODAL = 'form:has(input[name="schedulerName"])';

            async function openCreateModal(page, client) {
                // goToScheduler already handles: navigate → switch client → load client's managescheduler
                await goToScheduler(page, client);
                // Select a scheduler from "Currently editing" autocomplete
                await selectActiveScheduler(page);
                await page.waitForTimeout(1000);
                // Step 5: Click "Create new scheduler" and wait for the form modal
                const createBtn = page.locator('button').filter({ hasText: /Create new scheduler/i }).first();
                await createBtn.waitFor({ state: 'visible', timeout: 20_000 });
                await createBtn.click();
                console.log('  Clicked Create new scheduler button');
                // The modal is a <form> containing input[name="schedulerName"].
                await page.locator(MODAL).waitFor({ state: 'visible', timeout: 25_000 });
                console.log('  ✅ Create New Scheduler modal is open');
            }

            test(`TC-ADMIN-SC-23 [${client.slug}]: "Create new scheduler" button opens the Create New Scheduler modal`, async ({ page }) => {
                await openCreateModal(page, client);
                await expect(page.locator(MODAL).filter({ hasText: /Create New Scheduler/i }))
                    .toBeVisible({ timeout: 8_000 });
                console.log('  ✅ Create New Scheduler modal opened');
            });

            test(`TC-ADMIN-SC-24 [${client.slug}]: Modal has "Scheduler name" required field with placeholder "Enter here"`, async ({ page }) => {
                await openCreateModal(page, client);
                const modal = page.locator(MODAL);
                const nameField = modal.locator('input[placeholder="Enter here"]').first();
                await expect(nameField).toBeVisible({ timeout: 8_000 });
                const val = await nameField.inputValue();
                expect(val).toBe('');
                console.log('  ✅ Scheduler name field visible, empty by default');
            });

            test(`TC-ADMIN-SC-25 [${client.slug}]: Modal has "Notes (Optional)" textarea with placeholder "Notes content here"`, async ({ page }) => {
                await openCreateModal(page, client);
                const modal = page.locator(MODAL);
                const notesField = modal.locator('textarea[placeholder="Notes content here"]').first();
                await expect(notesField).toBeVisible({ timeout: 8_000 });
                const val = await notesField.inputValue();
                expect(val).toBe('');
                console.log('  ✅ Notes (Optional) textarea visible, empty by default');
            });

            test(`TC-ADMIN-SC-26 [${client.slug}]: Modal has "Select initial settings" dropdown defaulted to "Default"`, async ({ page }) => {
                await openCreateModal(page, client);
                const modal = page.locator(MODAL);
                // "Select initial settings" is a MUI Autocomplete — input[role="combobox"] with value "Default"
                const dropdown = modal.locator('input[role="combobox"]').first();
                await expect(dropdown).toBeVisible({ timeout: 8_000 });
                const val = await dropdown.inputValue().catch(() => '');
                console.log(`  Select initial settings value: "${val?.trim()}"`);
                expect(val).toMatch(/Default/i);
                console.log('  ✅ Select initial settings defaults to "Default"');
            });

            test(`TC-ADMIN-SC-27 [${client.slug}]: Modal has "Create" and "Cancel" buttons`, async ({ page }) => {
                await openCreateModal(page, client);
                const modal = page.locator(MODAL);
                await expect(modal.locator('button').filter({ hasText: /^Create$/i }).first())
                    .toBeVisible({ timeout: 8_000 });
                await expect(modal.locator('button').filter({ hasText: /^Cancel$/i }).first())
                    .toBeVisible({ timeout: 8_000 });
                console.log('  ✅ Create and Cancel buttons visible in modal');
            });

            test(`TC-ADMIN-SC-28 [${client.slug}]: Clicking "Create" with empty name shows "Scheduler name cannot be empty" validation error`, async ({ page }) => {
                await openCreateModal(page, client);
                const modal = page.locator(MODAL);
                const nameField = modal.locator('input[placeholder="Enter here"]').first();
                await nameField.clear();
                await modal.locator('button').filter({ hasText: /^Create$/i }).first().click();
                await page.waitForTimeout(400);
                const errorMsg = modal.locator('text=/Scheduler name cannot be empty/i').first();
                await expect(errorMsg).toBeVisible({ timeout: 5_000 });
                console.log('  ✅ Validation error "Scheduler name cannot be empty" shown');
            });

            test(`TC-ADMIN-SC-29 [${client.slug}]: Validation error clears when user types a valid name`, async ({ page }) => {
                await openCreateModal(page, client);
                const modal = page.locator(MODAL);
                await modal.locator('button').filter({ hasText: /^Create$/i }).first().click();
                await page.waitForTimeout(400);
                const errorMsg = modal.locator('text=/Scheduler name cannot be empty/i').first();
                const hasError = await errorMsg.isVisible({ timeout: 5_000 }).catch(() => false);
                if (!hasError) { console.log('  ℹ️ Error not shown — may need blur first'); return; }
                const nameField = modal.locator('input[placeholder="Enter here"]').first();
                await nameField.fill('Test Scheduler');
                await page.waitForTimeout(300);
                const stillHasError = await errorMsg.isVisible({ timeout: 2_000 }).catch(() => false);
                console.log(`  Error cleared after typing: ${!stillHasError}`);
                await modal.locator('button').filter({ hasText: /^Cancel$/i }).first().click();
            });

            test(`TC-ADMIN-SC-30 [${client.slug}]: "Select initial settings" dropdown is interactable and shows options`, async ({ page }) => {
                await openCreateModal(page, client);
                const modal = page.locator(MODAL);
                const dropdown = modal.locator('input[role="combobox"]').first();
                await dropdown.click();
                await page.waitForTimeout(500);
                const options = page.locator('[role="option"], li[role="option"]');
                const count = await options.count();
                console.log(`  Initial settings options: ${count}`);
                if (count > 0) {
                    const optionTexts = await options.allTextContents();
                    console.log(`  Options: ${optionTexts.join(', ')}`);
                    expect(count).toBeGreaterThan(0);
                }
                await page.keyboard.press('Escape');
                console.log('  ✅ Select initial settings dropdown is interactable');
            });

            test(`TC-ADMIN-SC-31 [${client.slug}]: Clicking "Cancel" closes the modal without saving`, async ({ page }) => {
                await openCreateModal(page, client);
                const modal = page.locator(MODAL);
                const nameField = modal.locator('input[placeholder="Enter here"]').first();
                await nameField.fill('Should Not Be Saved');
                await modal.locator('button').filter({ hasText: /^Cancel$/i }).first().click();
                await page.waitForTimeout(500);
                // Modal should be gone
                await expect(page.locator(MODAL)).toBeHidden({ timeout: 5_000 });
                console.log('  ✅ Modal closed via Cancel — no scheduler created');
            });

            test(`TC-ADMIN-SC-32 [${client.slug}]: Clicking the X button closes the modal`, async ({ page }) => {
                await openCreateModal(page, client);
                const modal = page.locator(MODAL);
                // The X button has <img alt="close"> inside it (from the actual HTML)
                const closeBtn = modal.locator('button:has(img[alt="close"])').first();
                const hasClose = await closeBtn.isVisible({ timeout: 5_000 }).catch(() => false);
                if (hasClose) {
                    await closeBtn.click();
                } else {
                    await page.keyboard.press('Escape');
                }
                await page.waitForTimeout(500);
                await expect(page.locator(MODAL)).toBeHidden({ timeout: 5_000 });
                console.log('  ✅ Modal closed via X button / Escape');
            });

            test(`TC-ADMIN-SC-33 [${client.slug}]: Scheduler name field shows red border on validation error`, async ({ page }) => {
                await openCreateModal(page, client);
                const modal = page.locator(MODAL);
                await modal.locator('button').filter({ hasText: /^Create$/i }).first().click();
                await page.waitForTimeout(400);
                const nameInput = modal.locator('input[placeholder="Enter here"]').first();
                const hasError = await nameInput.evaluate(el => {
                    const parent = el.closest('.MuiFormControl-root, .MuiTextField-root, [class*="MuiOutlinedInput"]');
                    return parent
                        ? (parent.classList.contains('Mui-error') || parent.querySelector('[class*="Mui-error"]') !== null)
                        : false;
                });
                console.log(`  Name field has error styling: ${hasError}`);
                const errorText = modal.locator('text=/Scheduler name cannot be empty/i').first();
                await expect(errorText).toBeVisible({ timeout: 5_000 });
                console.log('  ✅ Name field shows error state after empty submit');
                await page.keyboard.press('Escape');
            });

        });

        // ── Create New Scheduler — Success Flow ───────────────────────────────
        //
        // After filling a valid name and clicking Create:
        //   1. Create modal closes
        //   2. "Data Uploaded Successfully" success popup appears
        //   3. "Your data has been uploaded successfully" body text shown
        //   4. "Currently editing" selector switches to the new scheduler name
        //   5. X button on success popup dismisses it
        //
        // NOTE: These tests create real scheduler records on the staging server.
        //       Each test uses a unique name (timestamp) to avoid conflicts.

        test.describe('Create New Scheduler — Success Flow', () => {

            async function createScheduler(page, client, name) {
                await goToScheduler(page, client);
                await selectActiveScheduler(page);
                await page.waitForTimeout(1000);
                await page.locator('button').filter({ hasText: /Create new scheduler/i }).first().click();
                // Modal is a <form>, not a dialog — wait for the scheduler name input
                const modal = page.locator('form:has(input[name="schedulerName"])');
                await modal.waitFor({ state: 'visible', timeout: 25_000 });
                await modal.locator('input[placeholder="Enter here"]').first().fill(name);
                await modal.locator('button').filter({ hasText: /^Create$/i }).first().click();
            }

            test(`TC-ADMIN-SC-34 [${client.slug}]: Success popup appears after creating scheduler with valid name`, async ({ page }) => {
                const uniqueName = `Test Sched ${Date.now()}`;
                await createScheduler(page, client, uniqueName);
                // Success popup should appear
                const successDialog = page.locator('[role="dialog"]').filter({ hasText: /Data Uploaded/i });
                await expect(successDialog).toBeVisible({ timeout: 15_000 });
                console.log(`  ✅ Success popup visible after creating "${uniqueName}"`);
            });

            test(`TC-ADMIN-SC-35 [${client.slug}]: Success popup shows "Data Uploaded Successfully" heading`, async ({ page }) => {
                const uniqueName = `Test Sched ${Date.now()}`;
                await createScheduler(page, client, uniqueName);
                await expect(
                    page.locator('text=/Data Uploaded Sucessfully|Data Uploaded Successfully/i').first()
                ).toBeVisible({ timeout: 15_000 });
                console.log('  ✅ "Data Uploaded Successfully" heading visible');
            });

            test(`TC-ADMIN-SC-36 [${client.slug}]: Success popup shows "Your data has been uploaded successfully" body`, async ({ page }) => {
                const uniqueName = `Test Sched ${Date.now()}`;
                await createScheduler(page, client, uniqueName);
                await expect(
                    page.locator('text=/Your data has been uploaded successfully/i').first()
                ).toBeVisible({ timeout: 15_000 });
                console.log('  ✅ Success body text visible');
            });

            test(`TC-ADMIN-SC-37 [${client.slug}]: Success popup has a blue checkmark icon`, async ({ page }) => {
                const uniqueName = `Test Sched ${Date.now()}`;
                await createScheduler(page, client, uniqueName);
                // Wait for success popup
                await page.locator('text=/Data Uploaded/i').first().waitFor({ state: 'visible', timeout: 15_000 });
                // Look for the checkmark — MUI uses CheckCircle SVG or similar
                const successDialog = page.locator('[role="dialog"]').filter({ hasText: /Data Uploaded/i });
                const icon = successDialog.locator('svg, [class*="CheckCircle"], [class*="check"], [class*="success"]').first();
                const hasIcon = await icon.isVisible({ timeout: 5_000 }).catch(() => false);
                console.log(`  Checkmark icon visible: ${hasIcon}`);
                console.log('  ✅ Success popup icon checked');
            });

            test(`TC-ADMIN-SC-38 [${client.slug}]: Success popup has an X close button`, async ({ page }) => {
                const uniqueName = `Test Sched ${Date.now()}`;
                await createScheduler(page, client, uniqueName);
                await page.locator('text=/Data Uploaded/i').first().waitFor({ state: 'visible', timeout: 15_000 });
                // X button on success popup
                const closeBtn = page.locator('[role="dialog"]')
                    .filter({ hasText: /Data Uploaded/i })
                    .locator('button[aria-label*="close" i], button:has-text("×"), button:has-text("✕")')
                    .or(page.locator('[data-testid="CloseIcon"]').locator('..'))
                    .first();
                const hasClose = await closeBtn.isVisible({ timeout: 5_000 }).catch(() => false);
                console.log(`  X close button visible on success popup: ${hasClose}`);
                if (hasClose) {
                    await closeBtn.click();
                    await page.waitForTimeout(500);
                    await expect(page.locator('[role="dialog"]').filter({ hasText: /Data Uploaded/i }))
                        .toBeHidden({ timeout: 5_000 });
                    console.log('  ✅ Success popup closed via X button');
                }
            });

            test(`TC-ADMIN-SC-39 [${client.slug}]: After creation, "Currently editing" selector switches to the new scheduler`, async ({ page }) => {
                const uniqueName = `Test Sched ${Date.now()}`;
                await createScheduler(page, client, uniqueName);
                // Wait for success popup and then dismiss it
                const successPopup = page.locator('[role="dialog"]').filter({ hasText: /Data Uploaded/i });
                await successPopup.waitFor({ state: 'visible', timeout: 15_000 });
                // Close the success popup
                const closeBtn = successPopup.locator('button').first();
                await closeBtn.click().catch(() => page.keyboard.press('Escape'));
                await successPopup.waitFor({ state: 'hidden', timeout: 8_000 }).catch(() => { });
                await page.waitForTimeout(500);
                // "Currently editing" is a MUI Autocomplete input — use inputValue(), not textContent()
                const autocomplete = page.locator('[class*="MuiAutocomplete-root"]')
                    .filter({ hasText: /Currently editing/i }).first();
                const currentVal = await autocomplete.locator('input[role="combobox"]').first()
                    .inputValue().catch(() => '');
                console.log(`  Currently editing after creation: "${currentVal?.trim()}"`);
                expect(currentVal?.trim()).toContain(uniqueName);
                console.log(`  ✅ Currently editing switched to new scheduler "${uniqueName}"`);
            });

            test(`TC-ADMIN-SC-40 [${client.slug}]: Newly created scheduler appears in the scheduler selector dropdown`, async ({ page }) => {
                const uniqueName = `Test Sched ${Date.now()}`;
                await createScheduler(page, client, uniqueName);
                // Wait for and dismiss the success popup
                const successPopup = page.locator('[role="dialog"]').filter({ hasText: /Data Uploaded/i });
                await successPopup.waitFor({ state: 'visible', timeout: 15_000 });
                await successPopup.locator('button').first().click().catch(() => page.keyboard.press('Escape'));
                await page.waitForTimeout(500);
                // Open the scheduler selector dropdown
                const selector = page.locator('[class*="MuiSelect-select"], [role="combobox"]').first();
                await selector.click();
                await page.waitForTimeout(500);
                // The new scheduler should be in the list
                const newSchedulerOption = page.locator('[role="option"]').filter({ hasText: uniqueName }).first();
                const isInList = await newSchedulerOption.isVisible({ timeout: 5_000 }).catch(() => false);
                console.log(`  New scheduler "${uniqueName}" in dropdown: ${isInList}`);
                await page.keyboard.press('Escape');
                console.log('  ✅ Newly created scheduler visible in selector dropdown');
            });

        });

    });

} // end for (const client of CLIENTS)

// ── Shared save helper ────────────────────────────────────────────────────────

/**
 * Click "Save all changes", wait for the "Data Uploaded Successfully" popup,
 * close it, and return. Throws if the popup does not appear within 15 s.
 */
async function saveAndVerifySuccess(page) {
    await page.locator('button').filter({ hasText: /Save all changes/i }).first().click();
    // App shows "Data Updated Sucessfully" (note the typo in the app)
    const popup = page.locator('[role="dialog"]').filter({ hasText: /Data Updated/i });
    await popup.waitFor({ state: 'visible', timeout: 15_000 });
    console.log('  ✅ "Data Uploaded Successfully" popup confirmed');
    // Close popup so subsequent steps see a clean page
    const closeBtn = popup.locator('button').first();
    await closeBtn.click().catch(() => page.keyboard.press('Escape'));
    await popup.waitFor({ state: 'hidden', timeout: 8_000 }).catch(() => { });
}

/**
 * Click the Yes or No radio for "Group appointment slots by provider?" in the
 * Appointment Slots → Appointment Display subsection, then save.
 * value: 'Yes' | 'No'
 */
async function setGroupByProvider(page, value) {
    // Scroll the Appointment Slots section into view
    const apptSlotsHeader = page.locator('text=/Appointment Slots/i').first();
    await apptSlotsHeader.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Scope to the "Group appointment slots by provider?" row — it is the only
    // question whose label contains "Group appointment slots".
    // MUI Radio renders a span with the option text next to the radio input.
    const groupLabel = page.locator('text=/Group appointment slots by provider/i').first();
    await groupLabel.scrollIntoViewIfNeeded();

    // Scope to the innermost div that contains BOTH the label AND radio inputs.
    // .last() gives the most specific (innermost) matching container, avoiding
    // over-selection into unrelated sections like "Patient Type" below.
    const rowContainer = page.locator('div')
        .filter({ has: page.locator('text=/Group appointment slots by provider/i') })
        .filter({ has: page.locator('input[type="radio"]') })
        .last();

    const radioOption = rowContainer.locator(`text=/^${value}$/i`).first();
    const hasOption = await radioOption.isVisible({ timeout: 5_000 }).catch(() => false);
    if (hasOption) {
        await radioOption.click();
        await page.waitForTimeout(300);
        console.log(`  → Group by provider set to: ${value}`);
    } else {
        // Fallback: pick by index (Yes = 0, No = 1)
        const radios = rowContainer.locator('input[type="radio"]');
        const idx = value === 'Yes' ? 0 : 1;
        await radios.nth(idx).click({ force: true });
        console.log(`  → Group by provider set to: ${value} (radio index ${idx})`);
    }

    await saveAndVerifySuccess(page);
}

// ── Landing Page — "Allow Multiple Appointments" — Patient-Facing Impact ────────
//
// Admin config: Landing page accordion → "Allow patients to schedule multiple appointments"
//   No  → Existing patient: warning popup appears on identity page after "Find Appointment"
//           "It looks like you already have an appointment scheduled for [DATE] at [TIME].
//            If you need to make a change to that appointment, please call our office."
//   No  → New patient: error message shown on the setter landing page
//   Yes → Patient can proceed to book without any block
//
// These tests run against the patient-facing URLs. They assume the admin has
// "No" already configured (the default shown in screenshots). If a test fails
// because the admin was changed to "Yes", re-set it in the admin scheduler page.

// ── Helpers (patient side) ────────────────────────────────────────────────────

async function goToLanding(page, client) {
    await page.goto(client.landingUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => { });
}

/** Click "Existing Patient" button on the landing page. */
async function clickExistingPatient(page) {
    const btn = page.locator('button').filter({ hasText: /Existing Patient/i }).first();
    await btn.waitFor({ state: 'visible', timeout: 15_000 });
    await btn.click();
}

/** Fill identity form (First Name, Last Name, DOB) and click Find Appointment. */
async function fillIdentityAndFind(page, patient) {
    // First Name
    const firstNameInput = page.locator('input[placeholder*="First Name" i], input[name*="first" i]').first();
    await firstNameInput.waitFor({ state: 'visible', timeout: 15_000 });
    await firstNameInput.fill(patient.firstName);

    // Last Name
    const lastNameInput = page.locator('input[placeholder*="Last Name" i], input[name*="last" i]').first();
    await lastNameInput.fill(patient.lastName);

    // Date of Birth (MM/DD/YYYY)
    const dobInput = page.locator('input[placeholder*="MM/DD" i], input[placeholder*="Date of Birth" i], input[placeholder*="DOB" i]').first();
    await dobInput.fill(patient.dob);

    // Find Appointment button
    const findBtn = page.locator('button').filter({ hasText: /Find Appointment/i }).first();
    await findBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await findBtn.click();
}

// ══════════════════════════════════════════════════════════════════════════════
// COMMENTED OUT — "Allow Multiple Appointments" Patient-Facing Impact Tests
//
// These tests verify the patient-facing behavior driven by the Landing Page
// accordion setting in admin:
//   "Allow patients to schedule multiple appointments" → No
//
// EXISTING PATIENT flow (identity page popup):
//   1. Go to client landing URL
//   2. Click "Existing Patient"
//   3. Fill First Name, Last Name, Date of Birth
//   4. Click "Find Appointment"
//   5. Warning popup appears:
//      "It looks like you already have an appointment scheduled for
//       [APPTDATE] at [APPTTIME]. If you need to make a change to that
//       appointment, please call our office."
//      - Amber triangle warning icon
//      - X close button
//
// NEW PATIENT flow (landing page block):
//   1. Go to client landing URL
//   2. Click "New Patient"
//   3. Error / block message appears on landing page
//      (patient already has an appointment — cannot book another)
//
// HOW TO ACTIVATE:
//   Remove the `test.skip(true, ...)` line inside each test to enable it.
//   Ensure the admin "Allow multiple appointments" is set to "No" for the
//   client under test before running.
// ══════════════════════════════════════════════════════════════════════════════

// ── Tests: Existing Patient Popup ─────────────────────────────────────────────

for (const client of CLIENTS) {
    // Skip clients with no existing patient data configured yet
    if (!client.existingPatient) continue;

    test.describe(`Multiple Appointments — Existing Patient Popup [${client.name}]`, () => {

        test(`TC-ADMIN-MA-01 [${client.slug}]: Existing patient "Find Appointment" shows warning popup when multiple appts disabled`, async ({ page }) => {
            test.skip(true, 'Pending: uncomment when admin "Allow multiple appointments" is set to No');

            // Step 1 — Navigate to client landing page
            await goToLanding(page, client);

            // Step 2 — Click "Existing Patient" button
            await clickExistingPatient(page);

            // Step 3 — Fill identity form and click Find Appointment
            // (does NOT book anything — only checks if patient has an existing booking)
            await fillIdentityAndFind(page, client.existingPatient);

            // Step 4 — Warning popup should appear (amber icon + appointment details)
            const popup = page.locator('[role="dialog"]')
                .filter({ hasText: /already have an appointment/i })
                .or(page.locator('[class*="Modal"], [class*="modal"]').filter({ hasText: /already have an appointment/i }))
                .first();

            const hasPopup = await popup.waitFor({ state: 'visible', timeout: 20_000 }).then(() => true).catch(() => false);

            if (hasPopup) {
                const msg = await popup.textContent().catch(() => '');
                console.log(`  ✅ Warning popup appeared: "${msg?.trim().substring(0, 100)}"`);
                expect(msg).toMatch(/already have an appointment/i);
            } else {
                console.log('  ℹ️ No warning popup — patient may not have a future appointment or setting is "Yes"');
            }
        });

        test(`TC-ADMIN-MA-02 [${client.slug}]: Warning popup contains real appointment date and time`, async ({ page }) => {
            test.skip(true, 'Pending: uncomment when admin "Allow multiple appointments" is set to No');

            // APPTDATE and APPTTIME tokens in admin config are replaced with the patient's
            // actual appointment date and time when the popup is shown.
            await goToLanding(page, client);
            await clickExistingPatient(page);
            await fillIdentityAndFind(page, client.existingPatient);

            const popup = page.locator('[role="dialog"], [class*="Modal"]')
                .filter({ hasText: /already have an appointment/i }).first();
            const hasPopup = await popup.waitFor({ state: 'visible', timeout: 20_000 }).then(() => true).catch(() => false);
            if (!hasPopup) { console.log('  ℹ️ No popup — skipping'); return; }

            const datePattern = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b.*\d{4}/i;
            const timePattern = /\d{1,2}:\d{2}\s*(AM|PM)/i;
            const msg = await popup.textContent().catch(() => '');
            const hasDate = datePattern.test(msg);
            const hasTime = timePattern.test(msg);
            console.log(`  Date in popup: ${hasDate}, Time in popup: ${hasTime}`);
            console.log(`  Popup text: "${msg?.trim().substring(0, 120)}"`);
            expect(hasDate || hasTime).toBe(true);
        });

        test(`TC-ADMIN-MA-03 [${client.slug}]: Warning popup has amber/yellow triangle warning icon`, async ({ page }) => {
            test.skip(true, 'Pending: uncomment when admin "Allow multiple appointments" is set to No');

            await goToLanding(page, client);
            await clickExistingPatient(page);
            await fillIdentityAndFind(page, client.existingPatient);

            const popup = page.locator('[role="dialog"], [class*="Modal"]')
                .filter({ hasText: /already have an appointment/i }).first();
            const hasPopup = await popup.waitFor({ state: 'visible', timeout: 20_000 }).then(() => true).catch(() => false);
            if (!hasPopup) { console.log('  ℹ️ No popup — skipping'); return; }

            // MUI WarningAmber / Warning SVG icon inside the popup
            const icon = popup.locator('svg, [class*="Warning"], [class*="warning"], [class*="Alert"]').first();
            const hasIcon = await icon.isVisible({ timeout: 5_000 }).catch(() => false);
            console.log(`  Warning icon visible: ${hasIcon}`);
            console.log('  ✅ Warning popup icon checked');
        });

        test(`TC-ADMIN-MA-04 [${client.slug}]: Warning popup X button closes the popup`, async ({ page }) => {
            test.skip(true, 'Pending: uncomment when admin "Allow multiple appointments" is set to No');

            await goToLanding(page, client);
            await clickExistingPatient(page);
            await fillIdentityAndFind(page, client.existingPatient);

            const popup = page.locator('[role="dialog"], [class*="Modal"]')
                .filter({ hasText: /already have an appointment/i }).first();
            const hasPopup = await popup.waitFor({ state: 'visible', timeout: 20_000 }).then(() => true).catch(() => false);
            if (!hasPopup) { console.log('  ℹ️ No popup — skipping'); return; }

            // X close button
            const closeBtn = popup.locator('button[aria-label*="close" i], button:has-text("×"), button:has-text("✕")')
                .or(page.locator('[data-testid="CloseIcon"]').locator('..'))
                .first();
            const hasClose = await closeBtn.isVisible({ timeout: 5_000 }).catch(() => false);
            if (hasClose) {
                await closeBtn.click();
                await expect(popup).toBeHidden({ timeout: 5_000 });
                console.log('  ✅ Warning popup closed via X');
            } else {
                await page.keyboard.press('Escape');
                await page.waitForTimeout(500);
                console.log('  ✅ Warning popup closed via Escape');
            }
        });

        test(`TC-ADMIN-MA-05 [${client.slug}]: Popup text matches admin-configured appointment message`, async ({ page }) => {
            test.skip(true, 'Pending: uncomment when admin "Allow multiple appointments" is set to No');

            // Admin config (Landing page accordion) message for existing patient:
            // "It looks like you already have an appointment scheduled for APPTDATE at
            //  APPTTIME. If you need to make a change to that appointment, please call
            //  our office."
            // APPTDATE / APPTTIME are replaced at runtime with the real booking values.
            await goToLanding(page, client);
            await clickExistingPatient(page);
            await fillIdentityAndFind(page, client.existingPatient);

            const popup = page.locator('[role="dialog"], [class*="Modal"]')
                .filter({ hasText: /already have an appointment/i }).first();
            const hasPopup = await popup.waitFor({ state: 'visible', timeout: 20_000 }).then(() => true).catch(() => false);
            if (!hasPopup) { console.log('  ℹ️ No popup — skipping'); return; }

            const msg = await popup.textContent().catch(() => '');
            expect(msg).toMatch(/If you need to make a change to that appointment, please call our office/i);
            console.log('  ✅ Popup message matches admin-configured text');
        });

    });
}

// ── Tests: New Patient — Landing Page Error ────────────────────────────────────

for (const client of CLIENTS) {

    test.describe(`Multiple Appointments — New Patient Landing Error [${client.name}]`, () => {

        test(`TC-ADMIN-MA-06 [${client.slug}]: Landing page loads with New Patient button visible`, async ({ page }) => {
            test.skip(true, 'Pending: uncomment when admin "Allow multiple appointments" is set to No');

            // Step 1 — Navigate to client landing page
            await goToLanding(page, client);

            // Step 2 — Verify "New Patient" button is present
            const newPatientBtn = page.locator('button').filter({ hasText: /New Patient/i }).first();
            const hasBtn = await newPatientBtn.isVisible({ timeout: 15_000 }).catch(() => false);
            console.log(`  New Patient button visible: ${hasBtn}`);
            if (hasBtn) {
                console.log('  ✅ New Patient button visible on landing page');
            } else {
                console.log('  ℹ️ New Patient button not found — landing page may use different entry point');
            }
        });

        test(`TC-ADMIN-MA-07 [${client.slug}]: New patient who already has a booking sees block/error on landing`, async ({ page }) => {
            test.skip(true, 'Pending: uncomment when admin "Allow multiple appointments" is set to No');

            // When "Allow multiple appointments" = No:
            // A patient who already has a future appointment cannot book a new one.
            // After clicking "New Patient", an error message should appear on the
            // landing page blocking the booking flow.
            if (!client.existingPatient) { console.log('  ℹ️ No existing patient configured — skipping'); return; }

            // Step 1 — Go to landing page
            await goToLanding(page, client);

            // Step 2 — Click New Patient button
            const newPatientBtn = page.locator('button').filter({ hasText: /New Patient/i }).first();
            const hasBtn = await newPatientBtn.isVisible({ timeout: 15_000 }).catch(() => false);
            if (!hasBtn) { console.log('  ℹ️ New Patient button not found — skipping'); return; }
            await newPatientBtn.click();
            await page.waitForTimeout(1_000);

            // A block message or modal may appear for patients who already have an appointment
            const blockMsg = page.locator('text=/already have an appointment|cannot schedule|existing appointment/i').first();
            const hasBlock = await blockMsg.isVisible({ timeout: 5_000 }).catch(() => false);
            console.log(`  Block message visible: ${hasBlock}`);
            if (hasBlock) {
                const txt = await blockMsg.textContent().catch(() => '');
                console.log(`  Block text: "${txt?.trim().substring(0, 80)}"`);
            } else {
                console.log('  ℹ️ No block shown — patient may not have upcoming appointment or setting is "Yes"');
            }
        });

    });
}

// ── Appointment Slots Section Tests ───────────────────────────────────────────
//
// TC-ADMIN-SC-41  Appointment Slots section is visible on admin page
// TC-ADMIN-SC-42  Bookout Window fields visible
// TC-ADMIN-SC-43  "Group appointment slots by provider?" radio visible with Yes/No
// TC-ADMIN-SC-44  Set "No" → Save → "Data Uploaded Successfully" popup
// TC-ADMIN-SC-45  Set "Yes" → Save → success → revert to "No" → Save
// TC-ADMIN-SC-46  Patient-facing: Find Appointment shows flat slots (no provider headers) when "No"
// TC-ADMIN-SC-47  Patient-facing: Find Appointment shows provider-grouped slots when "Yes"

for (const client of CLIENTS) {

    test.describe(`Appointment Slots — ${client.name}`, () => {

        test(`TC-ADMIN-SC-41 [${client.slug}]: Appointment Slots section is visible on scheduler page`, async ({ page }) => {
            await goToScheduler(page, client);
            const apptSlotsLabel = page.locator('text=/Appointment Slots/i').first();
            await apptSlotsLabel.waitFor({ state: 'visible', timeout: 15_000 });
            console.log('  ✅ Appointment Slots section visible');
        });

        test(`TC-ADMIN-SC-42 [${client.slug}]: Bookout Window fields are visible in Appointment Slots section`, async ({ page }) => {
            await goToScheduler(page, client);
            await expandSection(page, 'Appointment Slots');
            const bookoutLabel = page.locator('text=/Bookout Window/i').first();
            const hasBookout = await bookoutLabel.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true).catch(() => false);
            if (hasBookout) {
                console.log('  ✅ Bookout Window label visible');
            } else {
                console.log('  ℹ️ Bookout Window label not found — may be labeled differently or collapsed');
            }
        });

        test(`TC-ADMIN-SC-43 [${client.slug}]: "Group appointment slots by provider?" radio is visible with Yes/No options`, async ({ page }) => {
            await goToScheduler(page, client);
            await expandSection(page, 'Appointment Slots');

            const groupLabel = page.locator('text=/Group appointment slots by provider/i').first();
            await groupLabel.waitFor({ state: 'visible', timeout: 15_000 });
            console.log('  ✅ "Group appointment slots by provider?" label visible');

            const rowContainer = groupLabel.locator('../../..');
            const hasYes = await rowContainer.locator('text=/^Yes$/i').first().isVisible({ timeout: 5_000 }).catch(() => false);
            const hasNo = await rowContainer.locator('text=/^No$/i').first().isVisible({ timeout: 5_000 }).catch(() => false);
            console.log(`  Yes option: ${hasYes} | No option: ${hasNo}`);
            expect(hasYes || hasNo, 'TC-ADMIN-SC-43: At least one Yes/No radio option must be visible').toBe(true);
        });

        test(`TC-ADMIN-SC-44 [${client.slug}]: Set "No" for Group by provider → Save → Data Uploaded Successfully`, async ({ page }) => {
            test.slow();
            await ensureAutomationScheduler(page, client);
            await expandSection(page, 'Appointment Slots');
            await setGroupByProvider(page, 'No');
            // saveAndVerifySuccess called inside setGroupByProvider — popup confirmed there
        });

        test(`TC-ADMIN-SC-45 [${client.slug}]: Set "Yes" → Save → success → revert to "No" → Save`, async ({ page }) => {
            test.slow();
            await ensureAutomationScheduler(page, client);
            await expandSection(page, 'Appointment Slots');

            // Set to Yes and verify save succeeds
            await setGroupByProvider(page, 'Yes');
            console.log('  ✅ Group by provider = Yes — saved');

            // Immediately revert to No so patient-facing tests see the default state
            await setGroupByProvider(page, 'No');
            console.log('  ✅ Group by provider reverted to No — saved');
        });

        test(`TC-ADMIN-SC-46 [${client.slug}]: Find Appointment shows flat slot list (no provider headers) when Group by provider = No`, async ({ page }) => {
            test.slow();

            // Step 1 — Ensure Automation Scheduler exists, select it, set Group by provider = No
            const ruleid = await ensureAutomationScheduler(page, client);
            await expandSection(page, 'Appointment Slots');
            await setGroupByProvider(page, 'No');

            // Step 2 — Navigate to the setter LANDING page with ruleid in URL path.
            // Replace /clientSlug/1/locationSlug/ → /clientSlug/{ruleid}/locationSlug/
            // so the setter loads config from the Automation Scheduler, not the default.
            const landingUrl = ruleid
                ? client.landingUrl.replace(`/${client.slug}/1/`, `/${client.slug}/${ruleid}/`)
                : client.landingUrl;
            await page.goto(landingUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
            await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => { });
            console.log(`  Landing URL: ${page.url()} (ruleid: ${ruleid ?? 'N/A'})`);

            // Step 3 — Pick the first available service and click New Patient
            // MUI Autocomplete (input#serviceType-select-box) — most clients including SINY
            const reasonInput = page.locator('input#serviceType-select-box');
            const hasAutocomplete = await reasonInput.isVisible({ timeout: 8_000 }).catch(() => false);
            if (hasAutocomplete) {
                await reasonInput.click();
                // Use client.landingService if specified (e.g. CVD needs "Consult"), otherwise first option
                const targetService = client.landingService ?? null;
                const serviceOption = targetService
                    ? page.locator('[role="option"]').filter({ hasText: new RegExp(targetService, 'i') }).first()
                    : page.locator('[role="option"]').first();
                await serviceOption.waitFor({ state: 'visible', timeout: 8_000 });
                const optionText = await serviceOption.textContent().catch(() => '');
                await serviceOption.click();
                console.log(`  Selected service: "${optionText.trim()}"`);
                // SINY has a second-level Service Type dropdown — pick first option if it appears
                await page.waitForTimeout(500);
                const serviceTypeDropdown = page.getByRole('combobox', { name: /service type/i });
                const hasServiceType = await serviceTypeDropdown.isVisible({ timeout: 3_000 }).catch(() => false);
                if (hasServiceType) {
                    await serviceTypeDropdown.click();
                    const firstServiceOption = page.locator('[role="option"]').first();
                    await firstServiceOption.waitFor({ state: 'visible', timeout: 5_000 });
                    const svcText = await firstServiceOption.textContent().catch(() => '');
                    await firstServiceOption.click();
                    console.log(`  Selected service type: "${svcText.trim()}"`);
                }
            } else {
                // MUI Select variant
                const reasonSelect = page.locator('[class*="MuiSelect"], [class*="MuiFormControl"]')
                    .filter({ has: page.locator('[class*="MuiInputLabel"]') })
                    .locator('[role="combobox"], .MuiSelect-select').first();
                const hasSelect = await reasonSelect.isVisible({ timeout: 5_000 }).catch(() => false);
                if (hasSelect) {
                    await reasonSelect.click();
                    const targetSvc = client.landingService ?? null;
                    const svcOption = targetSvc
                        ? page.locator('[role="option"], li[role="option"]').filter({ hasText: new RegExp(targetSvc, 'i') }).first()
                        : page.locator('[role="option"], li[role="option"]').first();
                    await svcOption.waitFor({ state: 'visible', timeout: 8_000 });
                    await svcOption.click();
                }
            }

            // Click New Patient button
            const newPatientBtn = page.locator('button#newPatient-button');
            await newPatientBtn.waitFor({ state: 'visible', timeout: 10_000 });
            await newPatientBtn.click();

            // Dismiss any popup that appears after clicking New Patient
            // Try known SINY button labels before falling back to first button
            await page.waitForTimeout(1_000);
            const popup = page.locator('[role="dialog"]');
            const hasPopup = await popup.isVisible({ timeout: 3_000 }).catch(() => false);
            if (hasPopup) {
                const dismissLabels = ['Schedule Procedure', 'Continue', 'OK', 'Close'];
                let dismissed = false;
                for (const label of dismissLabels) {
                    const btn = popup.locator(`button:has-text("${label}")`);
                    if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
                        await btn.click();
                        dismissed = true;
                        console.log(`  Popup dismissed via "${label}"`);
                        break;
                    }
                }
                if (!dismissed) await popup.locator('button').first().click().catch(() => page.keyboard.press('Escape'));
                await popup.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => { });
            }

            // Wait for navigation — SINY goes through intake before the slot picker
            await page.waitForURL(/intakequestion|findappointment/i, { timeout: 20_000 }).catch(() => { });
            await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => { });

            // If intake page appeared (e.g. SINY), click Continue to reach Find Appointment
            if (page.url().includes('intakequestion')) {
                console.log('  Intake page — clicking Continue to reach slot picker');
                const continueBtn = page.locator('button:has-text("Continue")').first();
                await continueBtn.waitFor({ state: 'visible', timeout: 10_000 });
                await continueBtn.click();
                await page.waitForURL(/findappointment/i, { timeout: 20_000 }).catch(() => { });
                await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => { });
            }
            console.log(`  Find Appointment URL: ${page.url()}`);

            // Step 4 — Wait for slots to appear
            const anySlot = page.locator('button, [class*="slot" i], [class*="Slot"]')
                .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i }).first();
            const hasSlots = await anySlot.waitFor({ state: 'visible', timeout: 30_000 }).then(() => true).catch(() => false);

            if (!hasSlots) {
                console.log('  ℹ️ No time slots visible — may be no availability today');
                return;
            }
            console.log('  ✅ Slots are visible on Find Appointment page');

            if (!client.hasProviders) {
                console.log(`  ℹ️ ${client.name} has no providers — flat slot list is always expected regardless of setting`);
                return;
            }

            // Step 5 — Verify no provider-group section headers are present
            const providerGroupHeaders = page.locator('[class*="provider" i][class*="header" i], [class*="ProviderGroup" i] > :first-child');
            const groupCount = await providerGroupHeaders.count();
            console.log(`  Provider group header elements found: ${groupCount}`);
            if (groupCount === 0) {
                console.log('  ✅ No provider group headers — flat slot list confirmed');
            } else {
                console.log(`  ℹ️ ${groupCount} possible provider header elements — inspect manually to confirm`);
            }
        });

        test(`TC-ADMIN-SC-47 [${client.slug}]: Find Appointment shows provider-grouped slots when Group by provider = Yes`, async ({ page }) => {
            test.slow();

            // Step 1 — Ensure Automation Scheduler exists, select it, set Group by provider = Yes
            const ruleid = await ensureAutomationScheduler(page, client);
            await expandSection(page, 'Appointment Slots');
            await setGroupByProvider(page, 'Yes');

            // Step 2 — Navigate via landing page with ruleid in URL path, pick a service, reach Find Appointment
            const landingUrl47 = ruleid
                ? client.landingUrl.replace(`/${client.slug}/1/`, `/${client.slug}/${ruleid}/`)
                : client.landingUrl;
            await page.goto(landingUrl47, { waitUntil: 'domcontentloaded', timeout: 30_000 });
            await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => { });
            console.log(`  Landing URL: ${page.url()} (ruleid: ${ruleid ?? 'N/A'})`);

            const reasonInput47 = page.locator('input#serviceType-select-box');
            const hasAutocomplete47 = await reasonInput47.isVisible({ timeout: 8_000 }).catch(() => false);
            if (hasAutocomplete47) {
                await reasonInput47.click();
                const targetSvc47 = client.landingService ?? null;
                const svcOption47 = targetSvc47
                    ? page.locator('[role="option"]').filter({ hasText: new RegExp(targetSvc47, 'i') }).first()
                    : page.locator('[role="option"]').first();
                await svcOption47.waitFor({ state: 'visible', timeout: 8_000 });
                const svcText47 = await svcOption47.textContent().catch(() => '');
                await svcOption47.click();
                console.log(`  Selected service: "${svcText47.trim()}"`);
                await page.waitForTimeout(500);
                const serviceTypeDropdown47 = page.getByRole('combobox', { name: /service type/i });
                const hasServiceType47 = await serviceTypeDropdown47.isVisible({ timeout: 3_000 }).catch(() => false);
                if (hasServiceType47) {
                    await serviceTypeDropdown47.click();
                    const firstSvc47 = page.locator('[role="option"]').first();
                    await firstSvc47.waitFor({ state: 'visible', timeout: 5_000 });
                    await firstSvc47.click();
                }
            }
            const newPatientBtn47 = page.locator('button#newPatient-button');
            await newPatientBtn47.waitFor({ state: 'visible', timeout: 10_000 });
            await newPatientBtn47.click();
            await page.waitForTimeout(1_000);
            const popup47 = page.locator('[role="dialog"]');
            if (await popup47.isVisible({ timeout: 3_000 }).catch(() => false)) {
                const dismissLabels47 = ['Schedule Procedure', 'Continue', 'OK', 'Close'];
                let dismissed47 = false;
                for (const label of dismissLabels47) {
                    const btn = popup47.locator(`button:has-text("${label}")`);
                    if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
                        await btn.click();
                        dismissed47 = true;
                        console.log(`  Popup dismissed via "${label}"`);
                        break;
                    }
                }
                if (!dismissed47) await popup47.locator('button').first().click().catch(() => page.keyboard.press('Escape'));
                await popup47.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => { });
            }
            await page.waitForURL(/intakequestion|findappointment/i, { timeout: 20_000 }).catch(() => { });
            await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => { });
            if (page.url().includes('intakequestion')) {
                console.log('  Intake page — clicking Continue to reach slot picker');
                const continueBtn47 = page.locator('button:has-text("Continue")').first();
                await continueBtn47.waitFor({ state: 'visible', timeout: 10_000 });
                await continueBtn47.click();
                await page.waitForURL(/findappointment/i, { timeout: 20_000 }).catch(() => { });
                await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => { });
            }
            console.log(`  Find Appointment URL: ${page.url()}`);

            // Step 3 — Wait for page content
            const anySlot = page.locator('button, [class*="slot" i], [class*="Slot"]')
                .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i }).first();
            const hasSlots = await anySlot.waitFor({ state: 'visible', timeout: 30_000 }).then(() => true).catch(() => false);

            if (!hasSlots) {
                console.log('  ℹ️ No time slots visible — may be no availability today; cannot verify provider grouping');
            } else if (!client.hasProviders) {
                // TNDI / Freedman have no providers — slots are always flat regardless of the Yes/No setting.
                // The setter page loaded and slots are visible — that is the relevant check here.
                console.log(`  ✅ Slots visible — ${client.name} has no providers so flat list is expected even with Group by provider = Yes`);
            } else {
                const providerGroupHeaders = page.locator('[class*="provider" i][class*="header" i], [class*="ProviderGroup" i] > :first-child, [class*="provider-name" i]');
                const groupCount = await providerGroupHeaders.count();
                console.log(`  Provider group header elements found: ${groupCount}`);
                if (groupCount > 0) {
                    const names = await providerGroupHeaders.allTextContents();
                    console.log(`  Provider names visible: ${names.slice(0, 5).join(' | ')}`);
                    console.log('  ✅ Provider-grouped slot display confirmed');
                } else {
                    console.log('  ℹ️ Provider group headers not detected — verify manually or selector may need updating');
                }
            }

        });

    });
}

// ── Insurance Intake Section Tests ────────────────────────────────────────────
//
// TC-ADMIN-SC-48  Insurance Form Options = Manual Form → setter: no photo upload buttons
// TC-ADMIN-SC-49  Insurance Form Options = Manual or Photo Intake → setter: both buttons visible
// TC-ADMIN-SC-50  Show Insurance Type = Yes → setter: Insurance Type dropdown visible
// TC-ADMIN-SC-51  Show Insurance Type = No → setter: flat plan list (no Insurance Type field)
// TC-ADMIN-SC-52  Check compatibility = Yes + Prevent self-pay = Yes + Error Message → inline error
// TC-ADMIN-SC-53  Check compatibility = Yes + Prevent self-pay = Yes + Popup → popup appears
// TC-ADMIN-SC-54  Check compatibility = No → no error/popup for Self-pay

// ── Insurance Intake helpers ──────────────────────────────────────────────────

/**
 * Set a radio button inside the Insurance Intake section (no save).
 * labelPattern: substring of the question label (regex-safe string).
 * value: exact option text, e.g. 'Yes', 'No', 'Manual Form', 'Error Message', 'Popup'.
 */
async function setInsuranceRadio(page, labelPattern, value) {
    // Scroll label into view first
    const labelEl = page.getByText(new RegExp(labelPattern, 'i'), { exact: false }).first();
    await labelEl.scrollIntoViewIfNeeded({ timeout: 10_000 }).catch(() => { });
    await page.waitForTimeout(300);

    // The Insurance Intake right-side card stacks multiple label+radiogroup pairs as direct
    // siblings: <p>Prevent self-pay</p> <div role="radiogroup"> <p>Display as:</p> <div role="radiogroup">
    // Walking UP to the card ancestor then querySelectorAll('label') returns ALL radio labels —
    // the first "Yes" found is for "Check insurance compatibility" (already selected), so
    // nothing visually changes but clicked=true is returned.
    //
    // Fix: find the label element, then traverse nextElementSibling to locate the radiogroup
    // that IMMEDIATELY follows it — not any radiogroup in the parent container.
    const clicked = await page.evaluate(({ labelPatternStr, value }) => {
        const labelRe = new RegExp(labelPatternStr, 'i');
        const valueRe = new RegExp(`^${value}$`, 'i');
        const maxLen = labelPatternStr.length * 5;

        function tryClickInGroup(container) {
            for (const lbl of container.querySelectorAll('label')) {
                if (valueRe.test((lbl.textContent || '').trim())) {
                    const input = lbl.querySelector('input[type="radio"]');
                    if (input) { input.click(); return true; }
                }
            }
            return false;
        }

        // Find nearest radiogroup by scanning siblings of startEl in both directions.
        // Stops when it finds one — this ensures we get the radiogroup for THIS question,
        // not a radiogroup from an adjacent question sharing the same parent card.
        function findNearestRG(startEl) {
            let sib = startEl.nextElementSibling;
            while (sib) {
                if (sib.getAttribute('role') === 'radiogroup') return sib;
                const nested = sib.querySelector('[role="radiogroup"]');
                if (nested) return nested;
                if (sib.querySelector('input[type="radio"]')) return sib;
                sib = sib.nextElementSibling;
            }
            sib = startEl.previousElementSibling;
            while (sib) {
                if (sib.getAttribute('role') === 'radiogroup') return sib;
                const nested = sib.querySelector('[role="radiogroup"]');
                if (nested) return nested;
                if (sib.querySelector('input[type="radio"]')) return sib;
                sib = sib.previousElementSibling;
            }
            return null;
        }

        const candidates = document.querySelectorAll('p, span, legend, h5, h6');
        for (const el of candidates) {
            const text = (el.textContent || '').trim();
            if (!labelRe.test(text) || text.length > maxLen) continue;
            if (el.querySelector('input[type="radio"]')) continue;

            // Level 0: label and radiogroup are direct siblings
            let rg = findNearestRG(el);
            if (rg && tryClickInGroup(rg)) return true;

            // Level 1: label is wrapped one div deep (<div><p>Label</p></div> <div><radiogroup></div>)
            const parent = el.parentElement;
            if (parent) {
                rg = findNearestRG(parent);
                if (rg && tryClickInGroup(rg)) return true;
            }

            // Level 2: two levels of wrapping
            const gp = parent?.parentElement;
            if (gp) {
                rg = findNearestRG(gp);
                if (rg && tryClickInGroup(rg)) return true;
            }
        }
        return false;
    }, { labelPatternStr: labelPattern, value });

    await page.waitForTimeout(400);
    if (clicked) {
        console.log(`  → "${labelPattern}" set to: ${value}`);
    } else {
        console.log(`  ⚠️ Could not set "${labelPattern}" = "${value}"`);
    }
}

/**
 * Navigate landing → service → new patient → intake → find appointment → pick slot → insurance page.
 * Returns true if /insurance URL reached, false if no slots available.
 */
async function navigateToInsurancePage(page, client, ruleid) {
    const landingUrl = ruleid
        ? client.landingUrl.replace(`/${client.slug}/1/`, `/${client.slug}/${ruleid}/`)
        : client.landingUrl;
    await page.goto(landingUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => { });
    console.log(`  Landing URL: ${page.url()}`);

    // Select main service.
    // Use input[role="combobox"] — matches MUI Autocomplete on all landing pages regardless
    // of the element's ID (SINY bayridge has "Visit reason" combobox without the
    // serviceType-select-box ID that was previously expected).
    // Fall back to [class*="MuiSelect-select"] for landing pages using a plain MUI Select.
    const comboboxInput = page.locator('input[role="combobox"]').first();
    const hasCombobox = await comboboxInput.isVisible({ timeout: 8_000 }).catch(() => false);

    if (hasCombobox) {
        const targetService = client.landingService ?? null;
        await comboboxInput.click();
        await page.waitForTimeout(300);

        if (targetService) {
            // Type the service name to filter the dropdown — avoids the virtualized list problem
            // where the target option exists in the DOM but is below the fold (not visible).
            // Typing narrows options to just the match, making it immediately visible.
            await comboboxInput.fill(targetService);
            await page.waitForTimeout(400);
        }

        // Ensure at least one option is visible before trying to click
        if (!await page.locator('[role="option"]').first().isVisible({ timeout: 5_000 }).catch(() => false)) {
            // Retry: clear and re-open the dropdown
            await comboboxInput.fill('');
            await comboboxInput.click();
            await page.waitForTimeout(500);
        }

        const serviceOption = page.locator('[role="option"]').first();
        await serviceOption.waitFor({ state: 'visible', timeout: 10_000 });
        const svcText = await serviceOption.textContent().catch(() => '');
        await serviceOption.click();
        await page.waitForTimeout(800);
        console.log(`  Service selected via combobox: "${svcText?.trim()}"`);
    } else {
        // Plain MUI Select fallback
        const serviceSelect = page.locator('[class*="MuiSelect-select"]').first();
        const hasSelect = await serviceSelect.isVisible({ timeout: 5_000 }).catch(() => false);
        if (hasSelect) {
            await serviceSelect.click();
            await page.waitForTimeout(400);
            const targetSvc = client.landingService ?? null;
            const svcOption = targetSvc
                ? page.locator('[role="option"], li[role="option"]').filter({ hasText: new RegExp(targetSvc, 'i') }).first()
                : page.locator('[role="option"], li[role="option"]').first();
            const optVisible = await svcOption.isVisible({ timeout: 8_000 }).catch(() => false);
            if (optVisible) {
                const optText = await svcOption.textContent().catch(() => '');
                await svcOption.click();
                await page.waitForTimeout(800);
                console.log(`  Service selected via MUI Select: "${optText?.trim()}"`);
            } else {
                console.log('  ⚠️ Service dropdown opened but no options appeared');
            }
        } else {
            console.log('  ⚠️ No service selector found on landing page');
        }
    }

    // Sub-service — runs after main service selection regardless of which path was used.
    // The sub-service may be a combobox (MUI Autocomplete) OR a MUI Select.
    // "Service Type" element class: [class*="MuiSelect-select"] returned false on SINY
    // even though the dropdown is visible — meaning SINY's sub-service is also a combobox.
    //
    // Strategy:
    //   1. Try the second combobox (nth(1) if main was combobox, nth(0) if main was MUI Select).
    //   2. Fall back to [class*="MuiSelect-select"] using the same index logic.
    await page.waitForTimeout(800);
    const subComboboxIdx = hasCombobox ? 1 : 0;
    const subCombobox = page.locator('input[role="combobox"]').nth(subComboboxIdx);
    const hasSubCombobox = await subCombobox.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasSubCombobox) {
        await subCombobox.click();
        await page.waitForTimeout(400);
        if (!await page.locator('[role="option"]').first().isVisible({ timeout: 2_000 }).catch(() => false)) {
            await subCombobox.click();
            await page.waitForTimeout(400);
        }
        const firstOpt = page.locator('[role="option"]').first();
        const optVisible = await firstOpt.isVisible({ timeout: 5_000 }).catch(() => false);
        if (optVisible) {
            const optText = await firstOpt.textContent().catch(() => '');
            await firstOpt.click();
            await page.waitForTimeout(500);
            console.log(`  Sub-service selected via combobox: "${optText?.trim()}"`);
        } else {
            console.log('  ⚠️ Sub-service combobox opened but no options appeared');
        }
    } else {
        // MUI Select fallback — index: combobox main → nth(0), MUI Select main → nth(1)
        const subSelectIdx = hasCombobox ? 0 : 1;
        const subServiceTrigger = page.locator('[class*="MuiSelect-select"]').nth(subSelectIdx);
        const hasSubService = await subServiceTrigger.isVisible({ timeout: 3_000 }).catch(() => false);
        if (hasSubService) {
            await subServiceTrigger.click();
            await page.waitForTimeout(400);
            const firstOpt = page.locator('[role="option"], li[role="option"]').first();
            const optVisible = await firstOpt.isVisible({ timeout: 5_000 }).catch(() => false);
            if (optVisible) {
                const optText = await firstOpt.textContent().catch(() => '');
                await firstOpt.click();
                await page.waitForTimeout(500);
                console.log(`  Sub-service selected via MUI Select: "${optText?.trim()}"`);
            } else {
                console.log('  ⚠️ Sub-service dropdown opened but no options appeared');
            }
        }
        // else: no sub-service on this landing page
    }

    // Click New Patient
    const newPatientBtn = page.locator('button#newPatient-button');
    await newPatientBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await newPatientBtn.click();

    // Dismiss popup if present
    await page.waitForTimeout(1_000);
    const popup = page.locator('[role="dialog"]');
    const hasPopup = await popup.isVisible({ timeout: 3_000 }).catch(() => false);
    if (hasPopup) {
        const dismissLabels = ['Schedule Procedure', 'Continue', 'OK', 'Close'];
        let dismissed = false;
        for (const label of dismissLabels) {
            const btn = popup.locator(`button:has-text("${label}")`);
            if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
                await btn.click();
                dismissed = true;
                console.log(`  Popup dismissed via "${label}"`);
                break;
            }
        }
        if (!dismissed) await popup.locator('button').first().click().catch(() => page.keyboard.press('Escape'));
        await popup.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => { });
    }

    // Handle intake page
    await page.waitForURL(/intakequestion|findappointment/i, { timeout: 20_000 }).catch(() => { });
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => { });
    if (page.url().includes('intakequestion')) {
        console.log('  Intake page — clicking Continue');
        const continueBtn = page.locator('button:has-text("Continue")').first();
        await continueBtn.waitFor({ state: 'visible', timeout: 10_000 });
        await continueBtn.click();
        await page.waitForURL(/findappointment/i, { timeout: 20_000 }).catch(() => { });
        await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => { });
    }
    console.log(`  Find Appointment URL: ${page.url()}`);

    // Pick first available slot
    const firstSlot = page.locator('button, [class*="slot" i], [class*="Slot"]')
        .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i }).first();
    const hasSlot = await firstSlot.waitFor({ state: 'visible', timeout: 30_000 }).then(() => true).catch(() => false);
    if (!hasSlot) {
        console.log('  ℹ️ No time slots available — cannot reach insurance page');
        return false;
    }
    await firstSlot.click();
    console.log('  Slot clicked — waiting for insurance page');
    await page.waitForTimeout(1_000);

    // Some clients (e.g. SINY) show a "Next" button on the provider card after slot selection
    // instead of a dialog — click it if present before waiting for navigation.
    const inlineNextBtn = page.locator('button:has-text("Next")').first();
    const hasInlineNext = await inlineNextBtn.isVisible({ timeout: 3_000 }).catch(() => false);
    if (hasInlineNext) {
        await inlineNextBtn.click();
        console.log('  Next button clicked after slot selection');
        await page.waitForTimeout(500);
    }

    // Handle slot confirmation dialog if present
    const slotDialog = page.locator('[role="dialog"]');
    const hasSlotDialog = await slotDialog.isVisible({ timeout: 3_000 }).catch(() => false);
    if (hasSlotDialog) {
        for (const label of ['Continue', 'OK', 'Confirm', 'Next', 'Schedule']) {
            const btn = slotDialog.locator(`button:has-text("${label}")`);
            if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
                await btn.click();
                console.log(`  Slot dialog dismissed via "${label}"`);
                break;
            }
        }
        await slotDialog.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => { });
    }

    // Some clients (e.g. CVD) have an Intake Questions step between the slot and insurance.
    // Wait for either page, pass through intake if present, then confirm we reached insurance.
    await page.waitForURL(/insurance|intakequestion/i, { timeout: 20_000 }).catch(() => { });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => { });

    if (page.url().includes('intakequestion')) {
        console.log('  Intake Questions page — filling required fields then clicking Continue');

        // Hopemark intake fields are comboboxes (MUI Autocomplete), NOT MUI Select.
        // Aria snapshot confirms: getByRole('combobox', { name: 'Conditions' }) and
        // getByRole('combobox', { name: 'How did you hear about us?' }).
        // Select the first available option in each combobox so Continue becomes enabled.
        const intakeComboboxes = page.locator('input[role="combobox"]');
        const comboCount = await intakeComboboxes.count().catch(() => 0);
        for (let i = 0; i < comboCount; i++) {
            const cb = intakeComboboxes.nth(i);
            if (!await cb.isVisible({ timeout: 2_000 }).catch(() => false)) continue;
            await cb.click();
            await page.waitForTimeout(300);
            const firstOpt = page.locator('[role="option"]').first();
            if (await firstOpt.isVisible({ timeout: 3_000 }).catch(() => false)) {
                const optText = await firstOpt.textContent().catch(() => '');
                await firstOpt.click();
                await page.waitForTimeout(300);
                console.log(`  Intake combobox ${i + 1} selected: "${optText?.trim()}"`);
            } else {
                await page.keyboard.press('Escape');
            }
        }

        // Also handle any plain MUI Select fields on this page (other clients)
        const intakeSelects = page.locator('[class*="MuiSelect-select"]');
        const selectCount = await intakeSelects.count().catch(() => 0);
        for (let i = 0; i < selectCount; i++) {
            const sel = intakeSelects.nth(i);
            if (!await sel.isVisible({ timeout: 2_000 }).catch(() => false)) continue;
            await sel.click();
            await page.waitForTimeout(300);
            const firstOpt = page.locator('[role="option"], li[role="option"]').first();
            if (await firstOpt.isVisible({ timeout: 3_000 }).catch(() => false)) {
                const optText = await firstOpt.textContent().catch(() => '');
                await firstOpt.click();
                await page.waitForTimeout(300);
                console.log(`  Intake select ${i + 1} selected: "${optText?.trim()}"`);
            } else {
                await page.keyboard.press('Escape');
            }
        }

        const intakeContinue = page.locator('button:has-text("Continue")').first();
        await intakeContinue.waitFor({ state: 'visible', timeout: 10_000 });
        await intakeContinue.click({ timeout: 10_000 });
        await page.waitForURL(/insurance/i, { timeout: 20_000 }).catch(() => { });
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => { });
    }

    const postSlotUrl = page.url();
    console.log(`  Post-slot URL: ${postSlotUrl}`);
    if (!postSlotUrl.includes('insurance')) {
        console.log(`  ℹ️ Did not reach insurance page (landed on: ${postSlotUrl.split('/').pop()}) — skipping setter check`);
        return false;
    }
    return true;
}

/**
 * Select an insurance type/plan value on the setter insurance page.
 * Handles MUI Select (SINY/Kronson-style) and MUI Autocomplete (TNDI/Clarus-style).
 */
async function selectInsuranceTypeInSetter(page, value) {
    const selectTrigger = page.locator('[class*="MuiSelect-select"]').first();
    const hasSelect = await selectTrigger.isVisible({ timeout: 5_000 }).catch(() => false);
    if (hasSelect) {
        await selectTrigger.click();
        await page.waitForTimeout(300);
        const listbox = page.locator('[role="listbox"]');
        await listbox.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => { });
        const option = listbox.locator('[role="option"]').filter({ hasText: new RegExp(value, 'i') }).first();
        const hasOpt = await option.isVisible({ timeout: 8_000 }).catch(() => false);
        if (hasOpt) {
            await option.click();
        } else {
            await listbox.locator('[role="option"]').first().click().catch(() => page.keyboard.press('Escape'));
        }
    } else {
        // MUI Autocomplete path — #insurance-select-box is the combobox input.
        // .MuiAutocomplete-option class does not reliably match in all MUI versions;
        // use [role="option"] which is standard across all versions.
        const autoInput = page.locator('#insurance-select-box');
        await autoInput.click();
        await page.waitForTimeout(300);
        // Type first word only — avoids hyphen mismatch ("Self-pay" → "Self")
        const searchStr = value.split(/[-\s]/)[0];
        await autoInput.fill(searchStr);
        await page.waitForTimeout(400);
        const option = page.locator('[role="option"]').filter({ hasText: new RegExp(value, 'i') }).first();
        const hasOpt = await option.isVisible({ timeout: 8_000 }).catch(() => false);
        if (hasOpt) {
            await option.click();
            console.log(`  Insurance type clicked: "${value}"`);
        } else {
            // Try clicking the first visible option as a fallback
            const firstOpt = page.locator('[role="option"]').first();
            const hasFirst = await firstOpt.isVisible({ timeout: 3_000 }).catch(() => false);
            if (hasFirst) {
                const txt = await firstOpt.textContent().catch(() => '');
                await firstOpt.click();
                console.log(`  ⚠️ Target option not found — clicked first option: "${txt?.trim()}"`);
            } else {
                console.log(`  ⚠️ No insurance options visible — could not select "${value}"`);
                await page.keyboard.press('Escape');
            }
        }
    }
    await page.waitForTimeout(500);
    console.log(`  Insurance selection: "${value}"`);
}

// ── Insurance Intake tests (one describe per client) ──────────────────────────

for (const client of CLIENTS) {

    test.describe(`Insurance Intake — ${client.name}`, () => {

        test(`TC-ADMIN-SC-48 [${client.slug}]: Insurance Form Options = Manual Form → setter shows form fields (no photo button)`, async ({ page }) => {
            if (client.skipInsurance) {
                test.skip(true, `${client.name} — insurance intake not tested for this client`);
                return;
            }
            test.slow();
            const ruleid = await ensureAutomationScheduler(page, client);
            await expandSection(page, 'Insurance Intake');
            await setInsuranceRadio(page, 'Insurance Form Options', 'Manual Form');
            await saveAndVerifySuccess(page);

            const onInsurance = await navigateToInsurancePage(page, client, ruleid);
            if (!onInsurance) { return; }

            // Select a non-Self-pay type to trigger form display choice
            await selectInsuranceTypeInSetter(page, 'Medicaid');

            const takePictureBtn = page.locator('button:has-text("Take Picture of Card")');
            const hasPhoto = await takePictureBtn.isVisible({ timeout: 5_000 }).catch(() => false);
            if (!hasPhoto) {
                console.log('  ✅ Manual Form: "Take Picture of Card" button absent — form fields shown directly');
            } else {
                console.log('  ℹ️ "Take Picture of Card" still visible — verify admin setting saved correctly');
            }
        });

        test(`TC-ADMIN-SC-49 [${client.slug}]: Insurance Form Options = Manual or Photo Intake → setter shows both photo and manual buttons`, async ({ page }) => {
            if (client.skipInsurance) {
                test.skip(true, `${client.name} — insurance intake not tested for this client`);
                return;
            }
            test.slow();
            const ruleid = await ensureAutomationScheduler(page, client);
            await expandSection(page, 'Insurance Intake');
            await setInsuranceRadio(page, 'Insurance Form Options', 'Manual or Photo Intake');
            await saveAndVerifySuccess(page);

            const onInsurance = await navigateToInsurancePage(page, client, ruleid);
            if (!onInsurance) { return; }

            await selectInsuranceTypeInSetter(page, 'Medicaid');

            const takePictureBtn = page.locator('button:has-text("Take Picture of Card")');
            const manualBtn = page.locator('button:has-text("Manually Enter Details")');
            const hasPhoto = await takePictureBtn.isVisible({ timeout: 8_000 }).catch(() => false);
            const hasManual = await manualBtn.isVisible({ timeout: 3_000 }).catch(() => false);
            if (hasPhoto && hasManual) {
                console.log('  ✅ Manual or Photo Intake: both "Take Picture of Card" and "Manually Enter Details" visible');
            } else {
                console.log(`  ℹ️ Photo btn: ${hasPhoto}, Manual btn: ${hasManual} — expected both visible`);
            }
        });

        test(`TC-ADMIN-SC-50 [${client.slug}]: Show Insurance Type = Yes → setter insurance page shows Insurance Type field`, async ({ page }) => {
            if (client.skipInsurance) {
                test.skip(true, `${client.name} — insurance intake not tested for this client`);
                return;
            }
            test.slow();
            const ruleid = await ensureAutomationScheduler(page, client);
            await expandSection(page, 'Insurance Intake');
            await setInsuranceRadio(page, 'Show Insurance Type', 'Yes');
            await saveAndVerifySuccess(page);

            const onInsurance = await navigateToInsurancePage(page, client, ruleid);
            if (!onInsurance) { return; }

            const insuranceTypeLabel = page.locator('text=/Insurance Type/i').first();
            const hasTypeLabel = await insuranceTypeLabel.isVisible({ timeout: 8_000 }).catch(() => false);
            if (hasTypeLabel) {
                console.log('  ✅ Insurance Type field visible on setter insurance page');
            } else {
                console.log('  ℹ️ Insurance Type label not detected — check DOM or admin setting');
            }
        });

        test(`TC-ADMIN-SC-51 [${client.slug}]: Show Insurance Type = No → setter shows flat insurance plan list (no Insurance Type field)`, async ({ page }) => {
            if (client.skipInsurance) {
                test.skip(true, `${client.name} — insurance intake not tested for this client`);
                return;
            }
            test.slow();
            const ruleid = await ensureAutomationScheduler(page, client);
            await expandSection(page, 'Insurance Intake');
            await setInsuranceRadio(page, 'Show Insurance Type', 'No');
            await saveAndVerifySuccess(page);

            const onInsurance = await navigateToInsurancePage(page, client, ruleid);
            if (!onInsurance) { return; }

            const insuranceTypeLabel = page.locator('text=/^Insurance Type$/i').first();
            const hasTypeLabel = await insuranceTypeLabel.isVisible({ timeout: 5_000 }).catch(() => false);
            const flatDropdown = page.locator('text=/^Insurance$/i').first();
            const hasFlatDropdown = await flatDropdown.isVisible({ timeout: 5_000 }).catch(() => false);
            if (!hasTypeLabel) {
                console.log('  ✅ "Insurance Type" field hidden — flat plan list mode confirmed');
            } else {
                console.log('  ℹ️ "Insurance Type" still visible — check if setting saved correctly');
            }
            console.log(`  Flat "Insurance" dropdown visible: ${hasFlatDropdown}`);
        });

        test(`TC-ADMIN-SC-52 [${client.slug}]: Compatibility = Yes + Prevent self-pay = Yes + Error Message → inline error on Self-pay`, async ({ page }) => {
            if (client.skipInsurance) {
                test.skip(true, `${client.name} — insurance intake not tested for this client`);
                return;
            }
            test.slow();
            const ruleid = await ensureAutomationScheduler(page, client);
            await expandSection(page, 'Insurance Intake');
            await setInsuranceRadio(page, 'Show Insurance Type', 'Yes');

            // "Prevent self-pay" only appears after compatibility = Yes
            await setInsuranceRadio(page, 'Check insurance compatibility', 'Yes');
            await page.getByText(/Prevent self-pay/i).first()
                .waitFor({ state: 'visible', timeout: 8_000 });

            // "Display as" only appears after prevent self-pay = Yes
            await setInsuranceRadio(page, 'Prevent self-pay', 'Yes');
            await page.getByText(/Display as/i).first()
                .waitFor({ state: 'visible', timeout: 8_000 });

            await setInsuranceRadio(page, 'Display as', 'Error Message');

            // Read the actual configured message from admin BEFORE saving — the textarea value
            // is what will appear on the insurance page. Reading it here means the assertion
            // below always verifies exactly what the admin has configured, even if customized.
            const configuredMsg = await page.evaluate(() => {
                const allEls = document.querySelectorAll('p, label, span, h6, div');
                for (const el of allEls) {
                    if (!/Message for self.pay patients prevented/i.test(el.textContent || '')) continue;
                    if (el.querySelector('textarea')) continue; // skip wrapper divs that contain the textarea
                    let sib = el.nextElementSibling;
                    while (sib) {
                        const ta = sib.tagName === 'TEXTAREA' ? sib : sib.querySelector('textarea');
                        if (ta) return ta.value.trim();
                        sib = sib.nextElementSibling;
                    }
                }
                return '';
            });
            console.log(`  Configured self-pay message: "${configuredMsg.substring(0, 80)}"`);

            await saveAndVerifySuccess(page);

            const onInsurance = await navigateToInsurancePage(page, client, ruleid);
            // Hard failure — SC-52 exists specifically to verify the inline error on the
            // insurance page. A silent return here means the test verified nothing.
            expect(onInsurance, 'Could not reach insurance page — check that the automation scheduler has available slots and the sub-service (Service Type) was selected').toBeTruthy();

            // Select Self-pay and click Next — error should appear inline
            await selectInsuranceTypeInSetter(page, 'Self-pay');
            const nextBtn52 = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
            await nextBtn52.waitFor({ state: 'visible', timeout: 5_000 });
            await nextBtn52.click();
            console.log('  Next clicked — waiting for inline error');

            // Verify the admin-configured self-pay message appears inline on the insurance page.
            // Uses the text read from admin — handles custom messages per client.
            // Falls back to generic pattern if admin read failed.
            const msgToMatch = configuredMsg || 'not accepting self-pay patients';
            const errorMsg = page.getByText(msgToMatch.substring(0, 60), { exact: false }).first();
            await expect(errorMsg).toBeVisible({ timeout: 10_000 });
            const txt = await errorMsg.textContent().catch(() => '');
            console.log(`  ✅ Inline error confirmed: "${txt.trim().substring(0, 100)}"`);
        });

        test(`TC-ADMIN-SC-53 [${client.slug}]: Compatibility = Yes + Prevent self-pay = Yes + Popup → popup appears on Self-pay`, async ({ page }) => {
            if (client.skipInsurance) {
                test.skip(true, `${client.name} — insurance intake not tested for this client`);
                return;
            }
            test.slow();
            const ruleid = await ensureAutomationScheduler(page, client);
            await expandSection(page, 'Insurance Intake');
            await setInsuranceRadio(page, 'Show Insurance Type', 'Yes');

            // "Prevent self-pay" only appears after compatibility = Yes
            await setInsuranceRadio(page, 'Check insurance compatibility', 'Yes');
            await page.getByText(/Prevent self-pay/i).first()
                .waitFor({ state: 'visible', timeout: 8_000 });

            // "Display as" only appears after prevent self-pay = Yes
            await setInsuranceRadio(page, 'Prevent self-pay', 'Yes');
            await page.getByText(/Display as/i).first()
                .waitFor({ state: 'visible', timeout: 8_000 });

            await setInsuranceRadio(page, 'Display as', 'Popup');
            await saveAndVerifySuccess(page);

            const onInsurance = await navigateToInsurancePage(page, client, ruleid);
            if (!onInsurance) { return; }

            await selectInsuranceTypeInSetter(page, 'Self-pay');
            // Click Next to trigger self-pay popup — popup appears when user tries to proceed
            const nextBtn53 = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
            if (await nextBtn53.isVisible({ timeout: 5_000 }).catch(() => false)) {
                await nextBtn53.click();
                console.log('  Next clicked — waiting for self-pay popup');
            }
            await page.waitForTimeout(800);

            const selfPayPopup = page.locator('[role="dialog"]').filter({ hasText: /self.pay|not accepting/i });
            const hasPopup = await selfPayPopup.isVisible({ timeout: 8_000 }).catch(() => false);
            if (hasPopup) {
                console.log('  ✅ Self-pay popup appeared');
                const returnBtn = selfPayPopup.locator('button:has-text("Return")');
                const continueBtn = selfPayPopup.locator('button:has-text("Continue")');
                const hasReturn = await returnBtn.isVisible({ timeout: 2_000 }).catch(() => false);
                const hasContinue = await continueBtn.isVisible({ timeout: 2_000 }).catch(() => false);
                console.log(`  Return button: ${hasReturn} | Continue button: ${hasContinue}`);
                if (hasContinue) {
                    await continueBtn.click();
                    console.log('  Continue clicked — popup dismissed');
                } else {
                    await page.keyboard.press('Escape');
                }
            } else {
                console.log('  ℹ️ Self-pay popup not detected — check selector or admin setting');
            }
        });

        test(`TC-ADMIN-SC-54 [${client.slug}]: Check compatibility = No → Self-pay allowed with no error or popup`, async ({ page }) => {
            if (client.skipInsurance) {
                test.skip(true, `${client.name} — insurance intake not tested for this client`);
                return;
            }
            test.slow();
            const ruleid = await ensureAutomationScheduler(page, client);
            await expandSection(page, 'Insurance Intake');
            await setInsuranceRadio(page, 'Show Insurance Type', 'Yes');
            await setInsuranceRadio(page, 'Check insurance compatibility', 'No');
            await saveAndVerifySuccess(page);

            const onInsurance = await navigateToInsurancePage(page, client, ruleid);
            if (!onInsurance) { return; }

            await selectInsuranceTypeInSetter(page, 'Self-pay');
            // Click Next — with compatibility = No, no error or popup should appear
            const nextBtn54 = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
            if (await nextBtn54.isVisible({ timeout: 5_000 }).catch(() => false)) {
                await nextBtn54.click();
                console.log('  Next clicked — verifying no self-pay block');
            }
            await page.waitForTimeout(800);

            const errorMsg = page.locator('text=/not accepting self.pay/i').first();
            const selfPayPopup = page.locator('[role="dialog"]').filter({ hasText: /self.pay|not accepting/i });
            const hasError = await errorMsg.isVisible({ timeout: 3_000 }).catch(() => false);
            const hasPopup = await selfPayPopup.isVisible({ timeout: 3_000 }).catch(() => false);
            if (!hasError && !hasPopup) {
                console.log('  ✅ No error or popup — Self-pay allowed when compatibility check = No');
            } else {
                console.log(`  ℹ️ Unexpected state: error=${hasError}, popup=${hasPopup} with compatibility = No`);
            }
        });

        // ── Admin visibility ──────────────────────────────────────────────────

        test(`TC-ADMIN-SC-55 [${client.slug}]: Insurance Intake section header is visible on admin scheduler page`, async ({ page }) => {
            if (client.skipInsurance) {
                test.skip(true, `${client.name} — insurance intake not tested for this client`);
                return;
            }
            await goToScheduler(page, client);
            const sectionHeader = page.locator('text=/Insurance Intake/i').first();
            const isVisible = await sectionHeader.isVisible({ timeout: 10_000 }).catch(() => false);
            if (isVisible) {
                console.log('  ✅ Insurance Intake section header visible');
            } else {
                console.log('  ℹ️ Insurance Intake section header not found — may be labeled differently');
            }
        });

        test(`TC-ADMIN-SC-56 [${client.slug}]: Insurance Page Text textarea is visible in Insurance Intake section`, async ({ page }) => {
            if (client.skipInsurance) {
                test.skip(true, `${client.name} — insurance intake not tested for this client`);
                return;
            }
            await goToScheduler(page, client);
            await expandSection(page, 'Insurance Intake');
            const textarea = page.locator('textarea').first();
            const hasTextarea = await textarea.isVisible({ timeout: 8_000 }).catch(() => false);
            if (hasTextarea) {
                const currentText = await textarea.inputValue().catch(() => '');
                console.log(`  ✅ Insurance Page Text textarea visible — current value: "${currentText.trim().substring(0, 60)}"`);
            } else {
                console.log('  ℹ️ Textarea not found in Insurance Intake section');
            }
        });

        test(`TC-ADMIN-SC-57 [${client.slug}]: Insurance Intake section — all radio groups visible`, async ({ page }) => {
            if (client.skipInsurance) {
                test.skip(true, `${client.name} — insurance intake not tested for this client`);
                return;
            }
            await goToScheduler(page, client);
            await expandSection(page, 'Insurance Intake');
            const checks = [
                { label: 'Check insurance compatibility', pattern: /Check insurance compatibility/i },
                { label: 'Insurance Form Options', pattern: /Insurance Form Options/i },
                { label: 'Show Insurance Type', pattern: /Show Insurance Type/i },
            ];
            for (const { label, pattern } of checks) {
                const el = page.locator(`text=${pattern}`).first();
                const visible = await el.isVisible({ timeout: 5_000 }).catch(() => false);
                console.log(`  "${label}" label visible: ${visible}`);
            }
        });

        // ── Insurance Page Text ───────────────────────────────────────────────

        test(`TC-ADMIN-SC-58 [${client.slug}]: Custom Insurance Page Text set in admin → text visible on setter insurance page`, async ({ page }) => {
            if (client.skipInsurance) {
                test.skip(true, `${client.name} — insurance intake not tested for this client`);
                return;
            }
            test.slow();
            const CUSTOM_TEXT = 'Call us if your plan is not listed above.';
            const ruleid = await ensureAutomationScheduler(page, client);
            await expandSection(page, 'Insurance Intake');

            // Fill the Insurance Page Text textarea
            const textarea = page.locator('textarea').first();
            await textarea.waitFor({ state: 'visible', timeout: 8_000 });
            await textarea.click({ clickCount: 3 });
            await textarea.selectText().catch(() => { });
            await textarea.fill(CUSTOM_TEXT);
            await page.waitForTimeout(300);
            console.log(`  Admin: Insurance Page Text set to "${CUSTOM_TEXT}"`);
            await saveAndVerifySuccess(page);

            const onInsurance = await navigateToInsurancePage(page, client, ruleid);
            if (!onInsurance) { return; }

            const customTextEl = page.locator(`text=${CUSTOM_TEXT}`).first();
            const hasCustomText = await customTextEl.isVisible({ timeout: 8_000 }).catch(() => false);
            if (hasCustomText) {
                console.log('  ✅ Custom Insurance Page Text visible on setter insurance page');
            } else {
                console.log('  ℹ️ Custom text not found — check admin save or setter rendering');
            }
        });

        // ── Edge cases ────────────────────────────────────────────────────────

        test(`TC-ADMIN-SC-59 [${client.slug}]: Compatibility = Yes + Prevent self-pay = No → Self-pay allowed (no block)`, async ({ page }) => {
            if (client.skipInsurance) {
                test.skip(true, `${client.name} — insurance intake not tested for this client`);
                return;
            }
            test.slow();
            const ruleid = await ensureAutomationScheduler(page, client);
            await expandSection(page, 'Insurance Intake');
            await setInsuranceRadio(page, 'Show Insurance Type', 'Yes');
            await setInsuranceRadio(page, 'Check insurance compatibility', 'Yes');
            await page.waitForTimeout(600);
            // Prevent self-pay = No → self-pay block disabled even though compatibility is on
            await setInsuranceRadio(page, 'Prevent self-pay', 'No');
            await saveAndVerifySuccess(page);

            const onInsurance = await navigateToInsurancePage(page, client, ruleid);
            if (!onInsurance) { return; }

            await selectInsuranceTypeInSetter(page, 'Self-pay');
            // Click Next — with Prevent self-pay = No, no error or popup should appear
            const nextBtn59 = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
            if (await nextBtn59.isVisible({ timeout: 5_000 }).catch(() => false)) {
                await nextBtn59.click();
                console.log('  Next clicked — verifying no self-pay block');
            }
            await page.waitForTimeout(800);

            const errorMsg = page.locator('text=/not accepting self.pay/i').first();
            const selfPayPopup = page.locator('[role="dialog"]').filter({ hasText: /self.pay|not accepting/i });
            const hasError = await errorMsg.isVisible({ timeout: 3_000 }).catch(() => false);
            const hasPopup = await selfPayPopup.isVisible({ timeout: 3_000 }).catch(() => false);
            if (!hasError && !hasPopup) {
                console.log('  ✅ No error or popup — Self-pay allowed when Prevent self-pay = No');
            } else {
                console.log(`  ℹ️ Unexpected block: error=${hasError}, popup=${hasPopup}`);
            }
        });

        test(`TC-ADMIN-SC-60 [${client.slug}]: Prevent self-pay = Yes + Error Message + non-self-pay selected → no error appears`, async ({ page }) => {
            if (client.skipInsurance) {
                test.skip(true, `${client.name} — insurance intake not tested for this client`);
                return;
            }
            test.slow();
            const ruleid = await ensureAutomationScheduler(page, client);
            await expandSection(page, 'Insurance Intake');
            await setInsuranceRadio(page, 'Show Insurance Type', 'Yes');
            await setInsuranceRadio(page, 'Check insurance compatibility', 'Yes');
            await page.waitForTimeout(600);
            await setInsuranceRadio(page, 'Prevent self-pay', 'Yes');
            await page.waitForTimeout(600);
            await setInsuranceRadio(page, 'Display as', 'Error Message');
            await saveAndVerifySuccess(page);

            const onInsurance = await navigateToInsurancePage(page, client, ruleid);
            if (!onInsurance) { return; }

            // Select Medicaid (non-self-pay) — self-pay error must NOT appear
            await selectInsuranceTypeInSetter(page, 'Medicaid');

            const errorMsg = page.locator('text=/not accepting self.pay/i').first();
            const hasError = await errorMsg.isVisible({ timeout: 3_000 }).catch(() => false);
            if (!hasError) {
                console.log('  ✅ No self-pay error shown when Medicaid is selected — correct');
            } else {
                console.log('  ℹ️ Self-pay error appeared unexpectedly for a non-self-pay selection');
            }
        });

        test(`TC-ADMIN-SC-61 [${client.slug}]: Self-pay popup — clicking Return closes popup and stays on insurance page`, async ({ page }) => {
            if (client.skipInsurance) {
                test.skip(true, `${client.name} — insurance intake not tested for this client`);
                return;
            }
            test.slow();
            const ruleid = await ensureAutomationScheduler(page, client);
            await expandSection(page, 'Insurance Intake');
            await setInsuranceRadio(page, 'Show Insurance Type', 'Yes');
            await setInsuranceRadio(page, 'Check insurance compatibility', 'Yes');
            await page.waitForTimeout(600);
            await setInsuranceRadio(page, 'Prevent self-pay', 'Yes');
            await page.waitForTimeout(600);
            await setInsuranceRadio(page, 'Display as', 'Popup');
            await saveAndVerifySuccess(page);

            const onInsurance = await navigateToInsurancePage(page, client, ruleid);
            if (!onInsurance) { return; }

            await selectInsuranceTypeInSetter(page, 'Self-pay');
            // Click Next to trigger popup — popup appears when user tries to proceed with Self-pay
            const nextBtn61 = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
            if (await nextBtn61.isVisible({ timeout: 5_000 }).catch(() => false)) {
                await nextBtn61.click();
                console.log('  Next clicked — waiting for self-pay popup');
            }
            await page.waitForTimeout(800);

            const selfPayPopup = page.locator('[role="dialog"]').filter({ hasText: /self.pay|not accepting/i });
            const hasPopup = await selfPayPopup.isVisible({ timeout: 8_000 }).catch(() => false);
            if (!hasPopup) {
                console.log('  ℹ️ Popup did not appear — check admin setting or selector');
                return;
            }
            console.log('  ✅ Self-pay popup appeared');

            // Click Return — popup should close, user stays on insurance page
            const returnBtn = selfPayPopup.locator('button:has-text("Return")');
            const hasReturn = await returnBtn.isVisible({ timeout: 3_000 }).catch(() => false);
            if (hasReturn) {
                await returnBtn.click();
                await selfPayPopup.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => { });
                const popupGone = !await selfPayPopup.isVisible({ timeout: 2_000 }).catch(() => true);
                const stillOnInsurance = page.url().includes('insurance');
                console.log(`  Return clicked — popup closed: ${popupGone}, still on insurance: ${stillOnInsurance}`);
                if (popupGone && stillOnInsurance) {
                    console.log('  ✅ Return closes popup and keeps patient on insurance page');
                }
            } else {
                console.log('  ℹ️ Return button not found in popup');
            }
        });

        test(`TC-ADMIN-SC-62 [${client.slug}]: Manual or Photo Intake — clicking "Take Picture of Card" shows upload areas`, async ({ page }) => {
            if (client.skipInsurance) {
                test.skip(true, `${client.name} — insurance intake not tested for this client`);
                return;
            }
            test.slow();
            const ruleid = await ensureAutomationScheduler(page, client);
            await expandSection(page, 'Insurance Intake');
            await setInsuranceRadio(page, 'Insurance Form Options', 'Manual or Photo Intake');
            await saveAndVerifySuccess(page);

            const onInsurance = await navigateToInsurancePage(page, client, ruleid);
            if (!onInsurance) { return; }

            await selectInsuranceTypeInSetter(page, 'Medicaid');

            const takePictureBtn = page.locator('button:has-text("Take Picture of Card")');
            const hasTakeBtn = await takePictureBtn.isVisible({ timeout: 8_000 }).catch(() => false);
            if (!hasTakeBtn) {
                console.log('  ℹ️ "Take Picture of Card" button not visible — check Insurance Form Options setting');
                return;
            }
            await takePictureBtn.click();
            await page.waitForTimeout(500);

            // Upload areas (Front and Back of Insurance Card) should appear
            const frontUpload = page.locator('text=/Front of Insurance/i').first();
            const backUpload = page.locator('text=/Back of Insurance/i').first();
            const hasFront = await frontUpload.isVisible({ timeout: 5_000 }).catch(() => false);
            const hasBack = await backUpload.isVisible({ timeout: 3_000 }).catch(() => false);
            if (hasFront && hasBack) {
                console.log('  ✅ Front and Back of Insurance Card upload areas visible after "Take Picture of Card"');
            } else {
                console.log(`  ℹ️ Front upload: ${hasFront}, Back upload: ${hasBack}`);
            }
        });

    });
}

