/**
 * PRODUCTION All-Slots Audit
 *
 * Checks every client → location → service combination and calls the API
 * directly for a full 6-month date range. No assertions — just a complete
 * slot report so you can see every available slot on production.
 *
 * The key difference from the duplicate checker:
 *   - Reloads the findappointment page before each service selection so the
 *     UI always fires a fresh getProviders call → no "skipped" combinations.
 *   - Never fails the test — just logs and writes prod-results/<client>_slots.json.
 *
 * Run:
 *   $env:SETTER_BASE_URL="https://setter.layline.live"
 *   npx playwright test tests/e2e/production/allSlots.spec.js --config=playwright.config.prod.js
 */

import { test }         from '@playwright/test';
import { writeFileSync } from 'fs';
import { LandingPage }  from '../../../pages/LandingPage.js';
import { IntakePage }   from '../../../pages/IntakePage.js';
import { SlotPage }     from '../../../pages/SlotPage.js';
import { CLIENTS }      from '../../config/clients.js';
import { collectSlots } from '../shared/duplicateSlots.cases.js';

function toProd(url) { return url.replace('https://stage.', 'https://'); }

const API_BASE = 'https://4rfbyp30tl.execute-api.us-west-2.amazonaws.com/setterProd';

function getDateRange() {
    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + 6);
    const fmt = d =>
        `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
    return { startDate: fmt(now), endDate: fmt(end) };
}

const PROD_CLIENTS = [
    {
        key: 'SINY_MEDICAL', hasIntake: true,
        services: [
            { reason: 'Skin Problem', serviceType: 'Acne',           filterReason: 'Acne' },
            { reason: 'Skin Problem', serviceType: 'Rash',           filterReason: 'Rash' },
        ],
    },
    {
        key: 'SINY_COSMETIC', hasIntake: true,
        services: [
            { reason: 'Cosmetic Procedure', serviceType: 'Botox treatment',    popup: 'Schedule Procedure', filterReason: 'Botox treatment' },
            { reason: 'Cosmetic Procedure', serviceType: 'Laser hair Removal', popup: 'Schedule Procedure', filterReason: 'Laser hair Removal' },
            { reason: 'Cosmetic Procedure', serviceType: 'Chemical Peel',      popup: 'Schedule Procedure', filterReason: 'Chemical Peel' },
            { reason: 'Cosmetic Procedure', serviceType: 'Filler Treatment',   popup: 'Schedule Procedure', filterReason: 'Filler Treatment' },
            { reason: 'Cosmetic Procedure', serviceType: 'Tattoo Removal',     popup: 'Schedule Procedure', filterReason: 'Tattoo Removal' },
        ],
    },
    {
        key: 'CLARUS_DERM', hasIntake: false,
        services: [
            { reason: 'Acne',                       filterReason: 'Acne' },
            { reason: 'BOTOX',                      filterReason: 'BOTOX' },
            { reason: 'Cancer Screening Full Body',  filterReason: 'Cancer Screening Full Body' },
            { reason: 'Rash',                       filterReason: 'Rash' },
            { reason: 'Spot Check',                 filterReason: 'Spot Check' },
        ],
    },
    {
        key: 'TNDI', hasIntake: false,
        services: [{ reason: 'Teleconsultation', filterReason: 'Teleconsultation' }],
    },
    {
        key: 'HOPEMARK', hasIntake: false,
        services: [
            { reason: 'Psychiatric Evaluation (Virtual)',   filterReason: 'Psychiatric Evaluation (Virtual)' },
            { reason: 'Psychiatric Evaluation (In-Office)', filterReason: 'Psychiatric Evaluation (In-Office)' },
        ],
    },
    {
        key: 'KRONSON', hasIntake: false,
        services: [{ reason: 'Vein Consult', filterReason: 'Vein Consult' }],
    },
    {
        key: 'FREEDMAN', hasIntake: false,
        prodUrl: 'https://setter.layline.live/freedmanent/1/freedmanentdownriver/landing',
        services: [{ reason: 'Consultation', filterReason: 'Consultation' }],
    },
    {
        key: 'CVD', hasIntake: false,
        services: [{ reason: 'Consult', filterReason: 'Consult' }],
    },
];

for (const client of PROD_CLIENTS) {
    const { key, hasIntake, services, prodUrl } = client;
    const cfg = CLIENTS[key];
    if (!cfg?.url || cfg.url.includes('TODO')) continue;

    const prodLandingUrl = prodUrl ?? toProd(cfg.url);

    test(`[${cfg.name}] All slots — production`, async ({ page }) => {
        const report = [];

        // ── 1. Navigate through the booking flow to reach findappointment ─────
        let credentials  = null;
        let findApptUrl  = null;

        const credListener = (req) => {
            if (!req.url().includes('/getProviders') && !req.url().includes('/getAllProviders')) return;
            if (credentials) return; // capture first call only
            try {
                const url    = new URL(req.url());
                const auth   = req.headers()['authorization'] ?? '';
                credentials  = {
                    sessionId:         url.searchParams.get('sessionId'),
                    clientId:          url.searchParams.get('clientId'),
                    departmentid:      url.searchParams.get('departmentid'),
                    locationTimezone:  url.searchParams.get('locationTimezone') ?? 'America/New_York',
                    path:              url.searchParams.get('path') ?? '',
                    authorization:     auth,
                };
            } catch {}
        };
        page.on('request', credListener);

        try {
            const firstSvc = services[0];
            const landing  = new LandingPage(page);
            await landing.open(prodLandingUrl);
            await landing.startNewPatient(firstSvc.reason, {
                serviceType:        firstSvc.serviceType  ?? null,
                landingPopupAction: firstSvc.popup        ?? null,
            });

            if (hasIntake) {
                await Promise.race([
                    page.waitForURL(u => u.toString().includes('findappointment'), { timeout: 20_000 }),
                    page.waitForURL(u => u.toString().includes('intake'),          { timeout: 20_000 }),
                ]).catch(() => {});
                if (page.url().includes('intake')) {
                    const intake = new IntakePage(page);
                    await intake.waitForLoad();
                    await intake.continue();
                }
            }

            await page.waitForURL(u => u.toString().includes('findappointment'), { timeout: 25_000 }).catch(() => {});
            await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
            await page.waitForTimeout(1_000);
            findApptUrl = page.url();
        } finally {
            page.off('request', credListener);
        }

        if (!credentials?.sessionId || !findApptUrl?.includes('findappointment')) {
            console.log(`[${cfg.name}] ⚠️  Could not reach findappointment — aborting`);
            return;
        }
        console.log(`[${cfg.name}] Session ready — ${findApptUrl}`);

        // ── 2. Discover locations ─────────────────────────────────────────────
        const slotPg = new SlotPage(page);
        let allLocations = [];

        try {
            const locAuto = page.locator('input#appointment_location-select-box');
            if (await locAuto.isVisible({ timeout: 3_000 }).catch(() => false)) {
                await locAuto.click();
                await page.waitForTimeout(400);
                const opts = await page.locator('[role="option"]').allTextContents();
                await page.keyboard.press('Escape').catch(() => {});
                allLocations = opts.map(o => o.trim()).filter(Boolean);
            }

            if (allLocations.length === 0) {
                const locSelect = page.locator('[class*="MuiFormControl"]')
                    .filter({ has: page.locator('label:has-text("Location")') })
                    .locator('[role="combobox"], .MuiSelect-select')
                    .first();
                if (await locSelect.isVisible({ timeout: 3_000 }).catch(() => false)) {
                    await locSelect.click();
                    await page.waitForTimeout(400);
                    const opts = await page.locator('[role="option"]').allTextContents();
                    await page.keyboard.press('Escape').catch(() => {});
                    await page.waitForTimeout(200);
                    allLocations = opts.map(o => o.trim()).filter(Boolean);
                }
            }
        } catch {}

        if (allLocations.length === 0) allLocations = [null];
        console.log(`[${cfg.name}] Locations (${allLocations.length}): ${allLocations.join(', ') || 'pre-set'}`);

        // ── 3. For each location × service: reload → select → call API ────────
        const { startDate, endDate } = getDateRange();

        for (const loc of allLocations) {
            for (const svc of services) {
                const label = svc.serviceType ?? svc.filterReason;

                // Always reload the findappointment page before each service.
                // This guarantees the page fires a fresh getProviders call when we
                // select the service, so appointmenttypeid is never missed.
                let appointmenttypeid = null;
                let capturedDeptId   = credentials.departmentid;

                const apptTypeListener = (req) => {
                    if (!req.url().includes('/getProviders') && !req.url().includes('/getAllProviders')) return;
                    try {
                        const url = new URL(req.url());
                        // Always overwrite — page auto-call fires first (default service),
                        // then the service-selection call fires second (target service).
                        // The last captured value is always the correct one.
                        const id = url.searchParams.get('appointmenttypeid');
                        if (id) appointmenttypeid = id;
                        capturedDeptId = url.searchParams.get('departmentid') ?? capturedDeptId;
                    } catch {}
                };
                page.on('request', apptTypeListener);

                try {
                    await page.goto(findApptUrl, { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {});
                    await page.waitForTimeout(500);

                    if (loc) {
                        await slotPg.selectLocation(loc).catch(() => {});
                        await page.waitForTimeout(400);
                    }
                    await slotPg.selectAppointmentReason(svc.filterReason).catch(() => {});
                    await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
                    await page.waitForTimeout(400);
                } finally {
                    page.off('request', apptTypeListener);
                }

                if (!appointmenttypeid) {
                    console.log(`  [${loc ?? 'pre-set'}] ${label}: ⚠️  Could not capture appointmenttypeid — skipping`);
                    continue;
                }

                // ── 4. Call API directly for full 6-month range ───────────────
                console.log(`  [${loc ?? 'pre-set'}] ${label}: calling API (appointmenttypeid=${appointmenttypeid})...`);

                const apiUrl = new URL(`${API_BASE}/getProviders`);
                apiUrl.searchParams.set('sessionId',              credentials.sessionId);
                apiUrl.searchParams.set('path',                   credentials.path);
                apiUrl.searchParams.set('appointmenttypeid',      appointmenttypeid);
                apiUrl.searchParams.set('departmentid',           capturedDeptId);
                apiUrl.searchParams.set('clientId',               credentials.clientId);
                apiUrl.searchParams.set('locationTimezone',       credentials.locationTimezone);
                apiUrl.searchParams.set('providerWithoutCapacity','No');
                apiUrl.searchParams.set('sortBy',                 'mostCapacity');
                apiUrl.searchParams.set('isExistingPatient',      'false');
                apiUrl.searchParams.set('startDate',              startDate);
                apiUrl.searchParams.set('endDate',                endDate);

                let apiSlots = [];
                try {
                    const data = await page.evaluate(
                        async ({ url, auth }) => {
                            const resp = await fetch(url, {
                                headers: { 'authorization': auth, 'accept': 'application/json, text/plain, */*' },
                            });
                            return resp.ok ? resp.json() : null;
                        },
                        { url: apiUrl.toString(), auth: credentials.authorization }
                    );

                    if (data) {
                        collectSlots(data, apiSlots);
                        // Stamp known appointmenttypeid onto each slot
                        for (const s of apiSlots) s.appointmenttypeid ??= appointmenttypeid;
                        console.log(`  [${loc ?? 'pre-set'}] ${label}: ${apiSlots.length} slot(s)`);
                    } else {
                        console.log(`  [${loc ?? 'pre-set'}] ${label}: 0 slots (no data from API)`);
                    }
                } catch (e) {
                    console.log(`  [${loc ?? 'pre-set'}] ${label}: ⚠️  API error — ${e.message.split('\n')[0]}`);
                }

                // ── 5. Log all providers × dates × times ─────────────────────
                const byProv = new Map();
                for (const s of apiSlots) {
                    const prov = s._providerName ?? s.providerid ?? 'Unknown';
                    if (!byProv.has(prov)) byProv.set(prov, new Map());
                    if (!byProv.get(prov).has(s.date)) byProv.get(prov).set(s.date, []);
                    byProv.get(prov).get(s.date).push(s.starttime);
                }
                for (const [prov, byDate] of byProv) {
                    console.log(`    Provider: ${prov}`);
                    for (const [date, times] of byDate) {
                        console.log(`      ${date}: ${times.join(', ')} (${times.length})`);
                    }
                }

                report.push({
                    client:           cfg.name,
                    location:         loc ?? 'pre-set',
                    service:          label,
                    appointmenttypeid,
                    totalSlots:       apiSlots.length,
                    dateRange:        { startDate, endDate },
                    providers:        Object.fromEntries(
                        [...byProv.entries()].map(([prov, byDate]) => [
                            prov,
                            Object.fromEntries([...byDate.entries()]),
                        ])
                    ),
                });
            }
        }

        // ── 6. Write per-client JSON report ───────────────────────────────────
        if (report.length > 0) {
            const outFile = `prod-results/${cfg.name.replace(/[^a-z0-9]/gi, '_')}_slots.json`;
            try {
                writeFileSync(outFile, JSON.stringify(report, null, 2));
                console.log(`\n[${cfg.name}] Report written → ${outFile}`);
            } catch (e) {
                console.log(`\n[${cfg.name}] Could not write report: ${e.message}`);
            }
        }

        const total = report.reduce((sum, r) => sum + r.totalSlots, 0);
        console.log(`\n[${cfg.name}] ✅ Done — ${report.length} combination(s) checked, ${total} total slot(s)`);
    });
}
