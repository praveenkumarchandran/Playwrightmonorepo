/**
 * PRODUCTION Duplicate Slot Check
 *
 * Approach: Navigate once to establish session, then call the getProviders API
 * DIRECTLY for each location × service combination.
 * - No response interception (no timing/body issues)
 * - Full date range (6 months) to catch all duplicates
 * - One API call per location × service → check that response for duplicates
 *
 * A duplicate = same (provider + date + time + appointmenttypeid) appearing 2+ times
 * in ONE API response → Talend inserted it twice.
 *
 * Run:
 *   $env:SETTER_BASE_URL="https://setter.layline.live"
 *   npx playwright test --config=playwright.config.prod.js
 */

import { test, expect }   from '@playwright/test';
import { LandingPage }    from '../../../pages/LandingPage.js';
import { IntakePage }     from '../../../pages/IntakePage.js';
import { SlotPage }       from '../../../pages/SlotPage.js';
import { CLIENTS }        from '../../config/clients.js';
import { collectSlots, findDuplicatesInSlots } from '../shared/duplicateSlots.cases.js';

function toProd(url) { return url.replace('https://stage.', 'https://'); }

// API base
const API_BASE = 'https://4rfbyp30tl.execute-api.us-west-2.amazonaws.com/setterProd';

// Date range: today → 6 months ahead
function getDateRange() {
    const now   = new Date();
    const end   = new Date(now);
    end.setMonth(end.getMonth() + 6);
    const fmt = d => `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;
    return { startDate: fmt(now), endDate: fmt(end) };
}

// ── Client definitions ────────────────────────────────────────────────────────
const PROD_CLIENTS = [
    {
        key: 'SINY_MEDICAL',   hasIntake: true,
        services: [
            { reason: 'Skin Problem', serviceType: 'Acne',           filterReason: 'Acne' },
            { reason: 'Skin Problem', serviceType: 'Rash',           filterReason: 'Rash' },
        ],
    },
    {
        key: 'SINY_COSMETIC',  hasIntake: true,
        services: [
            { reason: 'Cosmetic Procedure', serviceType: 'Botox treatment',    popup: 'Schedule Procedure', filterReason: 'Botox treatment' },
            { reason: 'Cosmetic Procedure', serviceType: 'Laser hair Removal', popup: 'Schedule Procedure', filterReason: 'Laser hair Removal' },
            { reason: 'Cosmetic Procedure', serviceType: 'Chemical Peel',      popup: 'Schedule Procedure', filterReason: 'Chemical Peel' },
            { reason: 'Cosmetic Procedure', serviceType: 'Filler Treatment',   popup: 'Schedule Procedure', filterReason: 'Filler Treatment' },
            { reason: 'Cosmetic Procedure', serviceType: 'Tattoo Removal',     popup: 'Schedule Procedure', filterReason: 'Tattoo Removal' },
        ],
    },
    {
        key: 'CLARUS_DERM',    hasIntake: false,
        services: [
            { reason: 'Acne',                      filterReason: 'Acne' },
            { reason: 'BOTOX',                     filterReason: 'BOTOX' },
            { reason: 'Cancer Screening Full Body', filterReason: 'Cancer Screening Full Body' },
            { reason: 'Rash',                      filterReason: 'Rash' },
            { reason: 'Spot Check',                filterReason: 'Spot Check' },
        ],
    },
    {
        key: 'TNDI',           hasIntake: false,
        services: [{ reason: 'Teleconsultation', filterReason: 'Teleconsultation' }],
    },
    {
        key: 'HOPEMARK',       hasIntake: false,
        services: [
            { reason: 'Psychiatric Evaluation (Virtual)',    filterReason: 'Psychiatric Evaluation (Virtual)' },
            { reason: 'Psychiatric Evaluation (In-Office)',  filterReason: 'Psychiatric Evaluation (In-Office)' },
        ],
    },
    {
        key: 'KRONSON',        hasIntake: false,
        services: [{ reason: 'Vein Consult', filterReason: 'Vein Consult' }],
    },
    {
        key: 'FREEDMAN',       hasIntake: false,
        prodUrl: 'https://setter.layline.live/freedmanent/1/freedmanentdownriver/landing',
        services: [{ reason: 'Consultation', filterReason: 'Consultation' }],
    },
    {
        key: 'CVD',            hasIntake: false,
        services: [{ reason: 'Consult', filterReason: 'Consult' }],
    },
];

// ── One test per client ───────────────────────────────────────────────────────
for (const client of PROD_CLIENTS) {
    const { key, hasIntake, services, prodUrl } = client;
    const cfg = CLIENTS[key];
    if (!cfg?.url || cfg.url.includes('TODO')) continue;

    const prodLandingUrl = prodUrl ?? toProd(cfg.url);

    test(`[${cfg.name}] No duplicate slots on production`, async ({ page }) => {
        const allDuplicates = [];

        // ── 1. Capture API credentials from the initial getProviders call ────
        // These are extracted from the URL of the first API call the page makes
        let credentials = null;

        const credListener = (req) => {
            // Match both /getProviders and /getAllProviders
            if (!req.url().includes('/getProviders') && !req.url().includes('/getAllProviders')) return;
            try {
                const url      = new URL(req.url());
                const authHdr  = req.headers()['authorization'] ?? '';
                credentials = {
                    sessionId:              url.searchParams.get('sessionId'),
                    clientId:               url.searchParams.get('clientId'),
                    departmentid:           url.searchParams.get('departmentid'),
                    locationTimezone:       url.searchParams.get('locationTimezone') ?? 'America/New_York',
                    path:                   url.searchParams.get('path') ?? '',
                    authorization:          authHdr,
                    // appointmenttypeid from the initial page load — used for the first service
                    // (re-selecting the same service already active won't trigger a new API call)
                    initialApptTypeId:      url.searchParams.get('appointmenttypeid'),
                };
            } catch { /* ignore */ }
        };
        page.on('request', credListener);

        // ── 2. Navigate to findappointment to establish session ───────────────
        let onFindAppt = false;
        try {
            const firstSvc = services[0];
            const landing  = new LandingPage(page);
            await landing.open(prodLandingUrl);
            await landing.startNewPatient(firstSvc.reason, {
                serviceType:        firstSvc.serviceType ?? null,
                landingPopupAction: firstSvc.popup ?? null,
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
            await page.waitForTimeout(1_000); // ensure all initial API calls complete
            onFindAppt = page.url().includes('findappointment');
            if (onFindAppt) credentials._findApptUrl = page.url();
        } catch (e) {
            console.log(`[${cfg.name}] Navigation failed: ${e.message.split('\n')[0]}`);
        } finally {
            page.off('request', credListener);
        }

        if (!onFindAppt || !credentials?.sessionId) {
            console.log(`[${cfg.name}] ⚠️  Could not establish session (sessionId: ${credentials?.sessionId ?? 'none'})`);
            return;
        }

        console.log(`[${cfg.name}] Session established — sessionId: ${credentials.sessionId.substring(0, 10)}...`);

        // ── 3. Discover all locations from the UI dropdown ───────────────────
        const slotPg = new SlotPage(page);
        let allLocations = [];
        try {
            // Try autocomplete style (SINY, Clarus, TNDI)
            const locAuto = page.locator('input#appointment_location-select-box');
            if (await locAuto.isVisible({ timeout: 3_000 }).catch(() => false)) {
                await locAuto.click();
                await page.waitForTimeout(400);
                const opts = await page.locator('[role="option"]').allTextContents();
                await page.keyboard.press('Escape').catch(() => {});
                allLocations = opts.map(o => o.trim()).filter(Boolean);
            }

            // Try MUI Select style (Hopemark — Location is a ▼ dropdown, not autocomplete)
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
        } catch { /* no location dropdown */ }
        if (allLocations.length === 0) allLocations = [null];
        console.log(`[${cfg.name}] Locations (${allLocations.length}): ${allLocations.join(', ') || 'pre-set'}`);

        // ── 4. For each location × service: get appointmenttypeid then call API
        const { startDate, endDate } = getDateRange();

        for (const loc of allLocations) {
            for (const svc of services) {
                const label = svc.serviceType ?? svc.filterReason;

                // Apply UI filter to make the page call getProviders with the right appointmenttypeid
                // We capture that call's URL to extract appointmenttypeid
                let appointmenttypeid = null;
                let capturedDeptId    = credentials.departmentid;

                const apptTypeListener = (req) => {
                    if (!req.url().includes('/getProviders') && !req.url().includes('/getAllProviders')) return;
                    try {
                        const url = new URL(req.url());
                        // Always overwrite — page auto-call fires first (default service),
                        // then the explicit service-selection call fires second (target service).
                        const id = url.searchParams.get('appointmenttypeid');
                        if (id) appointmenttypeid = id;
                        capturedDeptId = url.searchParams.get('departmentid') ?? capturedDeptId;
                    } catch {}
                };
                page.on('request', apptTypeListener);

                try {
                    if (!hasIntake && credentials._findApptUrl) {
                        // Non-intake clients: reload the page before each service so
                        // selecting it always fires a fresh getProviders call.
                        await page.goto(credentials._findApptUrl, { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {});
                        await page.waitForTimeout(500);
                    } else if (hasIntake && services.indexOf(svc) > 0) {
                        // Intake clients (SINY): reloading breaks the session.
                        // Instead, select a decoy service first to clear the active
                        // selection, then select the target — forces a new API call.
                        const decoy = services.find(s => s.filterReason !== svc.filterReason);
                        if (decoy) {
                            await slotPg.selectAppointmentReason(decoy.filterReason).catch(() => {});
                            await page.waitForTimeout(400);
                        }
                    }
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
                    console.log(`  [${loc ?? 'pre-set'}] ${label}: ⚠️  Could not get appointmenttypeid — skipping`);
                    continue;
                }

                // ── 5. Call the API directly with full 6-month date range ─────
                console.log(`  [${loc ?? 'pre-set'}] ${label}: calling API (appointmenttypeid=${appointmenttypeid})...`);

                const apiUrl = new URL(`${API_BASE}/getProviders`);
                apiUrl.searchParams.set('sessionId',            credentials.sessionId);
                apiUrl.searchParams.set('path',                 credentials.path);
                apiUrl.searchParams.set('appointmenttypeid',    appointmenttypeid);
                apiUrl.searchParams.set('departmentid',         capturedDeptId);
                apiUrl.searchParams.set('clientId',             credentials.clientId);
                apiUrl.searchParams.set('locationTimezone',     credentials.locationTimezone);
                apiUrl.searchParams.set('providerWithoutCapacity', 'No');
                apiUrl.searchParams.set('sortBy',               'mostCapacity');
                apiUrl.searchParams.set('isExistingPatient',    'false');
                apiUrl.searchParams.set('startDate',            startDate);
                apiUrl.searchParams.set('endDate',              endDate);

                let apiSlots = [];
                try {
                    const data = await page.evaluate(
                        async ({ url, auth }) => {
                            const resp = await fetch(url, {
                                headers: {
                                    'authorization': auth,
                                    'accept': 'application/json, text/plain, */*',
                                },
                            });
                            return resp.ok ? resp.json() : null;
                        },
                        { url: apiUrl.toString(), auth: credentials.authorization }
                    );

                    if (data) {
                        collectSlots(data, apiSlots);
                        // Stamp the known appointmenttypeid so findDuplicatesInSlots has a complete key
                        for (const s of apiSlots) s.appointmenttypeid ??= appointmenttypeid;
                        console.log(`  [${loc ?? 'pre-set'}] ${label}: ${apiSlots.length} slots from API`);
                    } else {
                        console.log(`  [${loc ?? 'pre-set'}] ${label}: ⚠️  API returned no data`);
                    }
                } catch (e) {
                    console.log(`  [${loc ?? 'pre-set'}] ${label}: ⚠️  API call failed — ${e.message.split('\n')[0]}`);
                }

                if (apiSlots.length === 0) continue;

                // ── 6. Log providers × dates × slots ─────────────────────────
                const byProv = new Map();
                for (const s of apiSlots) {
                    const prov = s._providerName ?? s.locationName ?? 'Unknown';
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

                // ── 7. Check for real duplicates in THIS API response ─────────
                findDuplicatesInSlots(apiSlots, `${cfg.name} / ${loc ?? 'pre-set'} / ${label}`, allDuplicates);
            }
        }

        // ── 8. Report ─────────────────────────────────────────────────────────
        const unique = [...new Set(allDuplicates)];
        if (unique.length > 0) {
            const report  = unique.map(d => `  • ${d}`).join('\n');
            const message = [
                ``,
                `╔══════════════════════════════════════════════════════════╗`,
                `║          ⚠️  DUPLICATE SLOTS DETECTED ON PRODUCTION       ║`,
                `╚══════════════════════════════════════════════════════════╝`,
                ``,
                `  Client   : ${cfg.name}`,
                `  URL      : ${prodLandingUrl.replace('/landing', '/findappointment')}`,
                ``,
                `  Duplicates (same slot inserted twice for same provider+location+service):`,
                report,
                ``,
                `  Root cause : Talend slot generation job ran twice or overlapped`,
                `  Action     : Check Talend job logs and remove duplicate slot records`,
                ``,
            ].join('\n');
            expect(unique.length, message).toBe(0);
        } else {
            console.log(`\n[${cfg.name}] ✅ No duplicate slots`);
        }
    });
}
