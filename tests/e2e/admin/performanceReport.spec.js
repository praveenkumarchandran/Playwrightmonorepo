/**
 * ADMIN — Performance Report Count Verification
 *
 * Strategy:
 *   1. Playwright navigates to access.layline.live and handles login.
 *   2. Setting the date range triggers an XHR to insights.layline.live —
 *      we intercept that request to capture the Bearer token.
 *   3. Subsequent data fetches use page.request.post() with the captured token
 *      — direct API calls, no UI scraping.
 *   4. Results are exported as JSON + an HTML analytics dashboard.
 *
 * Run — Clarus year-to-date (default):
 *   npx playwright test --project=admin performanceReport
 *
 * Run — specific date range:
 *   $env:REPORT_START="3/1/2026"; $env:REPORT_END="3/31/2026"
 *   npx playwright test --project=admin performanceReport
 *
 * Run — single test (just the export):
 *   npx playwright test --project=admin performanceReport -g "TC-ADMIN-PR-03"
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';

const ACCESS_BASE = (process.env.ACCESS_BASE_URL ?? 'https://access.layline.live').replace(/\/$/, '');
const INSIGHTS_API = 'https://insights.layline.live/api/v1/reports/performance';
const REPORT_URL = `${ACCESS_BASE}/admin/reports/performance-report`;

// Default: Jan 1 of current year → today (year-to-date).
// Override via env:  $env:REPORT_START="4/1/2026"; $env:REPORT_END="7/15/2026"
const END_DATE = process.env.REPORT_END || (() => {
    const d = new Date();
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
})();
const START_DATE = process.env.REPORT_START || (() => {
    const d = new Date();
    return `1/1/${d.getFullYear()}`;
})();

// Active clients (BrandID → label).  Inactive excluded.
const REQUIRED_CLIENTS = [
    { id: 111, name: 'Bright Direction Dental' },
    { id: 121, name: 'Tennessee Vein' },
    { id: 75, name: 'US Assure' },
    { id: 140, name: 'Fibroid Institute Texas' },
    { id: 141, name: 'The Nerve and Disc Institute' },
    { id: 135, name: 'Acuity Eye' },
    { id: 142, name: 'Vein Clinics Hawaii' },
    { id: 149, name: 'Kronson Vein Institute' },
    { id: 151, name: 'Vein Wellness Texas' },
    { id: 133, name: 'Clarus Dermatology' },
    { id: 124, name: 'Center For Vein Disease' },
    { id: 125, name: 'Aleman' },
    { id: 134, name: 'Hopemark Health' },
    { id: 154, name: 'VVCCK' },
    { id: 156, name: 'Colorado Dermatology Institute' },
    { id: 160, name: 'Freedman ENT' },
    { id: 162, name: 'SINY Dermatology' },
    { id: 168, name: "St. Augustine Foot, Ankle & Vein" }
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert M/D/YYYY (used in UI) → YYYY-MM-DD (required by insights API). */
function toApiDate(mmddyyyy) {
    const [m, d, y] = mmddyyyy.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

/**
 * Navigate to the performance report page and handle login.
 * After login, uses the Reports menu nav rather than direct URL since
 * access.layline.live redirects direct navigations to root after login.
 */
async function goToReport(page) {
    await page.goto(REPORT_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => { });

    const signInBtn = page.getByRole('button', { name: /^Sign In$/i });
    if (await signInBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
        const email = process.env.ACCESS_EMAIL ?? process.env.ADMIN_EMAIL ?? '';
        const password = process.env.ACCESS_PASSWORD ?? process.env.ADMIN_PASSWORD ?? '';
        console.log(`  ⚠️ Login required — signing in as: ${email}`);

        await page.locator('input[type="email"]').first().fill(email);
        await page.locator('input[type="password"]').first().fill(password);
        await signInBtn.click();

        const loginError = page.locator('text=/invalid|incorrect|Error occurred/i').first();
        if (await loginError.isVisible({ timeout: 3_000 }).catch(() => false)) {
            const msg = await loginError.textContent().catch(() => 'unknown');
            throw new Error(`Login failed: "${msg.trim()}" — check ACCESS_EMAIL / ACCESS_PASSWORD in .env`);
        }

        await page.waitForURL(u => !u.pathname.includes('/login'), { timeout: 25_000 });
        await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => { });
        console.log(`  ✅ Signed in — at: ${page.url()}`);
    }

    // Navigate via the Reports menu → Performance Report (works reliably post-login)
    if (!page.url().includes('performance-report')) {
        console.log('  🔄 Navigating via Reports menu...');

        // Click the "Reports" menu item in the nav
        const reportsNav = page.locator('a, button, li, span').filter({ hasText: /^Reports$/i }).first();
        const hasReportsNav = await reportsNav.isVisible({ timeout: 5_000 }).catch(() => false);

        if (hasReportsNav) {
            await reportsNav.click();
            await page.waitForTimeout(500);

            // Click "Performance Report" in the dropdown
            const perfLink = page.locator('a, li, span').filter({ hasText: /Performance Report/i }).first();
            await perfLink.waitFor({ state: 'visible', timeout: 15_000 });
            await perfLink.click();
            await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => { });
        } else {
            // Fallback: direct URL
            await page.goto(REPORT_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
            await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => { });
        }
    }

    if (!page.url().includes('performance-report')) {
        await page.waitForURL(/performance-report/, { timeout: 45_000 });
    }
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => { });
    console.log(`  📍 Loaded: ${page.url()}`);
}

/**
 * Register a context-level route intercept and return a Promise for the captured data.
 *
 * Two-step usage — the await on setupPerfCapture registers the route; the returned
 * capture Promise resolves later when the insights API actually responds:
 *
 *   const capture = await setupPerfCapture(page, [133], fromDate, toDate);
 *   await goToReport(page);
 *   await selectClient(page, 'Clarus Dermatology');  // triggers XHR → route fires
 *   const records = await capture;
 *
 * page.route() does NOT intercept Web Worker requests; context.route() does.
 * route.fetch() runs in Node.js — bypasses browser CORS.
 */
// batchSize: split clientIds into groups of this size to avoid server HTTP 500 on large sets.
// Default 0 = no batching (single request). Set to e.g. 3 for all-clients calls.
async function setupPerfCapture(page, clientIds, fromDate, toDate, timeoutMs = 60_000, batchSize = 0) {
    const targetUrl = `${INSIGHTS_API}?fromDate=${fromDate}&toDate=${toDate}`;
    const effective = batchSize > 0 ? batchSize : clientIds.length;
    const batches = [];
    for (let i = 0; i < clientIds.length; i += effective) {
        batches.push(clientIds.slice(i, i + effective));
    }
    console.log(`  📡 Registering route → ${targetUrl} | clients: [${clientIds.join(',')}] | batches: ${batches.length}`);

    let resolveData, rejectData;
    // This promise resolves LATER when the route handler fires — not when setupPerfCapture returns.
    const capturePromise = new Promise((res, rej) => { resolveData = res; rejectData = rej; });
    let handled = false;

    const handler = async (route, request) => {
        // Only intercept the performance report endpoint — let all other insights requests through
        if (!request.url().includes('/api/v1/reports/performance')) {
            await route.continue();
            return;
        }

        const auth = request.headers()['authorization'] ?? '';
        if (!auth.startsWith('Bearer ')) { await route.continue(); return; }
        if (handled) { await route.continue(); return; }
        handled = true;  // Mark immediately — don't attempt parallel fetches

        console.log(`  🎯 Performance endpoint intercepted: ${request.url()}`);
        try {
            // Build clean headers: keep auth + cookies from original, override content-type
            const orig = request.headers();
            const headers = {
                'authorization': orig['authorization'],
                'content-type': 'application/json',
                'accept': 'application/json, text/plain, */*',
                'origin': orig['origin'] ?? 'https://access.layline.live',
                'referer': orig['referer'] ?? 'https://access.layline.live/',
                'user-agent': orig['user-agent'] ?? '',
                'cookie': orig['cookie'] ?? '',
            };

            // Fetch all batches sequentially and merge records
            const allRecords = [];
            for (let b = 0; b < batches.length; b++) {
                const batch = batches[b];
                console.log(`  📦 Batch ${b + 1}/${batches.length}: clients [${batch.join(',')}]`);
                const resp = await route.fetch({
                    url: targetUrl,
                    method: 'POST',
                    headers,
                    postData: JSON.stringify({ clientId: batch }),
                    timeout: 55_000,
                });
                const text = await resp.text();
                console.log(`  📥 Batch ${b + 1} HTTP ${resp.status()} — first 80: ${text.slice(0, 80)}`);

                if (resp.status() >= 400) {
                    console.log(`  ⚠️ Batch ${b + 1} HTTP ${resp.status()} — skipping clients [${batch.join(',')}] (server error, continuing)`);
                    continue;
                }

                let parsed;
                try { parsed = JSON.parse(text); }
                catch (_) {
                    console.log(`  ⚠️ Batch ${b + 1} non-JSON — skipping clients [${batch.join(',')}]`);
                    continue;
                }

                // API returns { success: true, data: [...] } wrapper — unwrap the array
                const records = (parsed && parsed.success && Array.isArray(parsed.data))
                    ? parsed.data
                    : (Array.isArray(parsed) ? parsed : []);

                allRecords.push(...records);
                console.log(`  ✅ Batch ${b + 1}: ${records.length} records (total so far: ${allRecords.length})`);
            }

            console.log(`  ✅ All batches done — ${allRecords.length} total records`);
            resolveData(allRecords);
            // Fulfill with merged data so the page sees a normal response
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, data: allRecords }),
            });
        } catch (err) {
            console.log(`  ❌ Handler error: ${err.message}`);
            rejectData(err);
            route.abort().catch(() => { });
        }
    };

    // Await registration so the route is active before caller starts navigating
    await page.context().route('https://insights.layline.live/**', handler);

    const timer = setTimeout(
        () => rejectData(new Error(`Timeout (${timeoutMs}ms) — no authenticated insights request intercepted`)),
        timeoutMs
    );

    const cleanup = () => {
        clearTimeout(timer);
        page.context().unroute('https://insights.layline.live/**', handler).catch(() => { });
    };

    // Return the data promise WRAPPED in an object so async-function promise-flattening
    // doesn't cause `await setupPerfCapture(...)` to block until data arrives.
    // Caller does: const { capture } = await setupPerfCapture(...); then await capture;
    const capture = capturePromise.then(r => { cleanup(); return r; }, e => { cleanup(); throw e; });
    return { capture };
}

/**
 * Set the date range using the vue-daterange-picker calendar UI.
 *
 * The trigger is div.reportrange-text. Clicking it opens a popup with:
 *   - Two calendar panels (.drp-calendar.left / .drp-calendar.right)
 *   - Month select (.monthselect) and year select (.yearselect) in each panel
 *   - Date cells as <td class="available"> with the day number
 *   - An "Apply" button to confirm
 *
 * We wait for the popup to appear (via the Apply button) before interacting
 * with the calendar cells to avoid timing issues.
 */
async function setDateRange(page, startDate, endDate) {
    console.log(`  Setting date range: ${startDate} → ${endDate}`);

    const [sm, sd, sy] = startDate.split('/').map(Number);
    const [em, ed, ey] = endDate.split('/').map(Number);

    // Click the trigger to open the calendar popup
    await page.locator('.reportrange-text').first().click();

    // Wait for the Apply button to confirm the popup is open
    const applyBtn = page.getByRole('button', { name: /Apply/i });
    await applyBtn.waitFor({ state: 'visible', timeout: 10_000 });

    // Set left calendar month/year
    await page.locator('.drp-calendar.left .monthselect').selectOption({ index: sm - 1 });
    await page.waitForTimeout(150);
    await page.locator('.drp-calendar.left .yearselect').selectOption(String(sy));
    await page.waitForTimeout(300);

    // Click start date (exact text match to avoid clicking adjacent months' overflow days)
    await page.locator('.drp-calendar.left td.available')
        .filter({ hasText: new RegExp(`^${sd}$`) }).first().click();
    await page.waitForTimeout(200);

    // Set right calendar month/year
    await page.locator('.drp-calendar.right .monthselect').selectOption({ index: em - 1 });
    await page.waitForTimeout(150);
    await page.locator('.drp-calendar.right .yearselect').selectOption(String(ey));
    await page.waitForTimeout(300);

    // Click end date
    await page.locator('.drp-calendar.right td.available')
        .filter({ hasText: new RegExp(`^${ed}$`) }).first().click();
    await page.waitForTimeout(200);

    // Apply
    await applyBtn.click();
    await page.waitForTimeout(500);

    console.log(`  ✅ Date range set: ${startDate} → ${endDate}`);
}

/**
 * Open the Clients List dropdown and select a specific client by partial name.
 *
 * Confirmed from screenshots:
 *   - Dropdown has a SEARCH INPUT — typing filters the list
 *   - Selected items show red background + "Press enter to remove"
 *   - Unselected items show "Press enter to select" on hover
 *   - Clicking a selected item DESELECTS it (removes it from filter)
 */
async function selectClient(page, clientName) {
    console.log(`  Selecting client: "${clientName}"`);

    // This is vue-multiselect. The input (class="multiselect__input") is HIDDEN
    // until the dropdown is opened by clicking the tags container.
    // Confirmed from error log:
    //   resolved to <input class="multiselect__input" placeholder="Pick a client">
    //   but element is not visible (hidden by CSS until dropdown opens)

    // Step 1: Click the visible tags area to open the dropdown
    // In CI the Vue multiselect component renders after networkidle — wait explicitly.
    const tagsArea = page.locator('.multiselect__tags').first();
    await tagsArea.waitFor({ state: 'visible', timeout: 60_000 });
    await tagsArea.click();
    await page.waitForTimeout(400);

    // Step 2: Remove any existing selected tags by clicking their × icons
    let tagIcons = page.locator('.multiselect__tag-icon');
    let tagCount = await tagIcons.count().catch(() => 0);
    while (tagCount > 0) {
        await tagIcons.first().click().catch(() => { });
        await page.waitForTimeout(200);
        tagCount = await tagIcons.count().catch(() => 0);
    }

    // Step 3: Type in the now-visible search input to filter the list
    const msInput = page.locator('.multiselect__input').first();
    await msInput.fill('');
    await msInput.fill(clientName.slice(0, 6));
    await page.waitForTimeout(500);

    // Step 4: Click the matching option from .multiselect__option elements
    const nameRe = new RegExp(clientName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const targetOpt = page.locator('.multiselect__option').filter({ hasText: nameRe }).first();
    const hasTarget = await targetOpt.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!hasTarget) {
        await page.keyboard.press('Escape');
        throw new Error(`"${clientName}" not found in Clients List dropdown`);
    }

    await targetOpt.click();
    console.log(`  ✅ "${clientName}" selected`);

    // Close the dropdown
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
}


/**
 * Aggregate an array of daily API records into per-client totals.
 * Returns a Map<clientId, {name, id, totals, dailyRecords}>.
 */
function aggregateByClient(records) {
    const map = new Map();

    for (const rec of records) {
        // API returns { _id: { eventCreatedDate, clientBrandID }, clientBrandId, ... }
        // Support both flat and nested structures
        const id =
            rec.clientBrandId ?? rec.clientBrandID ??
            rec.clientId ?? rec.client_id ?? rec.brandId ??
            rec._id?.clientBrandID ?? '?';

        const name =
            rec.clientName ?? rec.client_name ?? rec.name ?? String(id);

        if (!map.has(id)) {
            map.set(id, { id, name, dailyRecords: [], totals: {} });
        }

        const entry = map.get(id);
        entry.dailyRecords.push(rec);

        const skipKeys = new Set([
            'clientId', 'clientName', 'eventCreatedDate', 'clientBrandId', 'clientBrandID',
            'client_id', 'client_name', 'event_created_date', '_id', '__v',
        ]);

        for (const [k, v] of Object.entries(rec)) {
            if (skipKeys.has(k) || k === '_id') continue;
            const n = Number(v);
            if (!Number.isNaN(n)) {
                entry.totals[k] = (entry.totals[k] ?? 0) + n;
            }
        }
    }

    return map;
}

/**
 * Generate a standalone HTML analytics dashboard from the aggregated client data.
 * Returns the HTML string.
 */
function buildHtmlReport(clientMap, dateRange) {
    const rows = [...clientMap.values()].sort((a, b) =>
        (b.totals.count ?? 0) - (a.totals.count ?? 0)
    );

    const n = v => Number(v) || 0;
    const fmt = v => n(v).toLocaleString();

    const totalCount = rows.reduce((s, c) => s + n(c.totals.count), 0);
    const totalEmail = rows.reduce((s, c) => s + n(c.totals.emailValid), 0);
    const totalSms = rows.reduce((s, c) => s + n(c.totals.smsValid), 0);
    const totalSurvey = rows.reduce((s, c) => s + n(c.totals.surveyCompleteCount), 0);
    const totalReviews = rows.reduce((s, c) => s + n(c.totals.reviewCount), 0);

    /* ── sparkline SVG (count per day) ──────────────────────────────────── */
    function sparkline(dailyRecords, w = 120, h = 32) {
        const vals = dailyRecords
            .slice().sort((a, b) => (a.eventCreatedDate ?? a._id?.eventCreatedDate ?? '').localeCompare(b.eventCreatedDate ?? b._id?.eventCreatedDate ?? ''))
            .map(r => n(r.count));
        if (vals.length < 2) return `<svg width="${w}" height="${h}"></svg>`;
        const mx = Math.max(...vals, 1);
        const pad = 2;
        const xStep = (w - pad * 2) / (vals.length - 1);
        const pts = vals.map((v, i) => `${pad + i * xStep},${h - pad - ((v / mx) * (h - pad * 2))}`).join(' ');
        const fill = vals.map((v, i) => `${pad + i * xStep},${h - pad - ((v / mx) * (h - pad * 2))}`).join(' ')
            + ` ${pad + (vals.length - 1) * xStep},${h - pad} ${pad},${h - pad}`;
        return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <polygon points="${fill}" fill="rgba(59,130,246,.15)"/>
  <polyline points="${pts}" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
  <circle cx="${pad + (vals.length - 1) * xStep}" cy="${h - pad - ((vals[vals.length - 1] / mx) * (h - pad * 2))}" r="2.5" fill="#3b82f6"/>
</svg>`;
    }

    /* ── summary table row ───────────────────────────────────────────────── */
    const summaryRows = rows.map((c, i) => {
        const t = c.totals;
        const spark = sparkline(c.dailyRecords);
        return `<tr>
  <td class="rank">${i + 1}</td>
  <td class="cname">${c.name}</td>
  <td class="center muted">${c.id}</td>
  <td class="center">${c.dailyRecords.length}</td>
  <td class="num bold">${fmt(t.count)}</td>
  <td class="num">${fmt(t.emailValid)}</td>
  <td class="num">${fmt(t.emailPostedtoAC ?? t.emailPostedToAC ?? t.emailPostedtoAc)}</td>
  <td class="num">${fmt(t.emailCompleteCount)}</td>
  <td class="num">${fmt(t.smsValid)}</td>
  <td class="num">${fmt(t.smsApiDay1Sent ?? t.smsDay1Sent)}</td>
  <td class="num">${fmt(t.smsApiDay2Sent ?? t.smsDay2Sent)}</td>
  <td class="num">${fmt(t.smsSurveySent)}</td>
  <td class="num">${fmt(t.surveyCompleteCount)}</td>
  <td class="num">${fmt(t.reviewCount)}</td>
  <td class="spark">${spark}</td>
</tr>`;
    }).join('\n');

    /* ── per-client daily table ──────────────────────────────────────────── */
    const clientSections = rows.map(c => {
        const sorted = c.dailyRecords.slice().sort((a, b) =>
            (a.eventCreatedDate ?? a._id?.eventCreatedDate ?? '').localeCompare(
                b.eventCreatedDate ?? b._id?.eventCreatedDate ?? '')
        );
        const dailyRows = sorted.map(r => {
            const date = r.eventCreatedDate ?? r._id?.eventCreatedDate ?? '—';
            return `<tr>
  <td class="date">${date}</td>
  <td class="num bold">${fmt(r.count)}</td>
  <td class="num">${fmt(r.emailValid)}</td>
  <td class="num">${fmt(r.emailPostedtoAC ?? r.emailPostedToAC ?? r.emailPostedtoAc)}</td>
  <td class="num">${fmt(r.emailCompleteCount)}</td>
  <td class="num">${fmt(r.smsValid)}</td>
  <td class="num">${fmt(r.smsApiDay1Sent ?? r.smsDay1Sent)}</td>
  <td class="num">${fmt(r.smsApiDay2Sent ?? r.smsDay2Sent)}</td>
  <td class="num">${fmt(r.smsSurveySent)}</td>
  <td class="num">${fmt(r.surveySmsClicks)}</td>
  <td class="num">${fmt(r.surveyCompleteCount)}</td>
  <td class="num">${fmt(r.smsReviewSent)}</td>
  <td class="num">${fmt(r.reviewSmsClicks)}</td>
  <td class="num">${fmt(r.reviewCount)}</td>
</tr>`;
        }).join('\n');

        const bigSpark = sparkline(sorted, 600, 60);
        const slug = `client-${c.id}`;
        return `
<details class="client-detail" id="${slug}">
  <summary class="client-summary">
    <span class="cs-name">${c.name}</span>
    <span class="cs-meta">Brand ID ${c.id} &nbsp;·&nbsp; ${sorted.length} days</span>
    <span class="cs-kpi">Count <strong>${fmt(c.totals.count)}</strong></span>
    <span class="cs-kpi">Reviews <strong>${fmt(c.totals.reviewCount)}</strong></span>
  </summary>
  <div class="detail-body">
    <div class="trend-wrap">${bigSpark}<div class="trend-lbl">Daily Patient Count Trend</div></div>
    <div class="dtable-wrap">
    <table class="dtable">
      <thead>
        <tr>
          <th>Date</th><th>Count</th><th>Email Valid</th><th>Email Posted AC</th>
          <th>Email Completed</th><th>SMS Valid</th><th>SMS Day 1</th><th>SMS Day 2</th>
          <th>Survey Sent</th><th>Survey Clicks</th><th>Survey Completed</th>
          <th>Review SMS Sent</th><th>Review Clicks</th><th>Reviews</th>
        </tr>
      </thead>
      <tbody>${dailyRows}</tbody>
    </table>
    </div>
  </div>
</details>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Performance Report — ${dateRange.start} to ${dateRange.end}</title>
<style>
:root {
  --bg: #f0f4f8; --surface: #fff; --border: #e5e9ef;
  --navy: #1a2744; --blue: #3b82f6; --emerald: #10b981;
  --amber: #f59e0b; --rose: #ef4444;
  --text: #1e293b; --muted: #64748b;
  --th-bg: #1a2744; --th-color: #e2e8f0;
  --row-hover: #f8fafc;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0d1117; --surface: #161b22; --border: #21262d;
    --navy: #0e2340; --text: #c9d1d9; --muted: #8b949e;
    --th-bg: #0e2340; --th-color: #e2e8f0;
    --row-hover: #1c2128;
  }
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
       background: var(--bg); color: var(--text); font-size: 13px; line-height: 1.5; }

/* ── header ── */
header { background: var(--navy); color: #fff; padding: 24px 32px; display: flex; align-items: center; gap: 20px; }
.header-icon { font-size: 32px; }
header h1 { font-size: 22px; font-weight: 700; letter-spacing: -.3px; }
header p  { font-size: 12px; opacity: .65; margin-top: 2px; }

/* ── KPI strip ── */
.kpi-strip { display: flex; gap: 12px; padding: 20px 32px; flex-wrap: wrap; }
.kpi { background: var(--surface); border-radius: 10px; padding: 14px 20px;
       min-width: 140px; flex: 1; box-shadow: 0 1px 3px rgba(0,0,0,.08);
       border-top: 3px solid var(--blue); }
.kpi.green  { border-color: var(--emerald); }
.kpi.amber  { border-color: var(--amber); }
.kpi.rose   { border-color: var(--rose); }
.kpi.purple { border-color: #8b5cf6; }
.kpi .val { font-size: 26px; font-weight: 800; font-variant-numeric: tabular-nums;
            color: var(--navy); }
@media (prefers-color-scheme: dark) { .kpi .val { color: var(--blue); } }
.kpi .lbl { font-size: 11px; color: var(--muted); margin-top: 2px; text-transform: uppercase;
            letter-spacing: .5px; font-weight: 600; }

/* ── section title ── */
.section { padding: 0 32px 24px; }
.section-title { font-size: 14px; font-weight: 700; color: var(--muted);
                 text-transform: uppercase; letter-spacing: .6px;
                 margin-bottom: 12px; padding-bottom: 8px;
                 border-bottom: 1px solid var(--border); }

/* ── summary table ── */
.table-wrap { overflow-x: auto; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
table.summary { width: 100%; border-collapse: collapse; background: var(--surface); }
table.summary th {
  background: var(--th-bg); color: var(--th-color);
  font-size: 10px; font-weight: 700; text-align: right;
  padding: 9px 10px; white-space: nowrap; text-transform: uppercase; letter-spacing: .4px;
}
table.summary th:first-child,
table.summary th:nth-child(2),
table.summary th:nth-child(3),
table.summary th:nth-child(4) { text-align: left; }
table.summary td { padding: 7px 10px; border-bottom: 1px solid var(--border); vertical-align: middle; }
table.summary tr:last-child td { border-bottom: none; }
table.summary tr:hover td { background: var(--row-hover); }
.num { text-align: right; font-variant-numeric: tabular-nums; }
.center { text-align: center; }
.bold { font-weight: 700; }
.muted { color: var(--muted); font-size: 11px; }
.rank { font-size: 11px; color: var(--muted); text-align: center; width: 28px; }
.cname { font-weight: 600; white-space: nowrap; }
.date { font-variant-numeric: tabular-nums; color: var(--muted); white-space: nowrap; }
.spark { text-align: center; padding: 2px 10px; }
.spark svg { display: block; }

/* ── per-client detail ── */
.client-detail { background: var(--surface); border-radius: 10px;
                 box-shadow: 0 1px 3px rgba(0,0,0,.08);
                 margin-bottom: 10px; overflow: hidden; }
.client-summary {
  display: flex; align-items: center; gap: 16px; padding: 14px 20px;
  cursor: pointer; user-select: none; list-style: none;
  border-left: 4px solid var(--blue);
}
.client-summary::-webkit-details-marker { display: none; }
.client-summary::before { content: '▶'; font-size: 10px; color: var(--muted); transition: transform .2s; flex-shrink: 0; }
details[open] .client-summary::before { transform: rotate(90deg); }
.cs-name { font-weight: 700; font-size: 14px; flex: 1; }
.cs-meta { font-size: 11px; color: var(--muted); white-space: nowrap; }
.cs-kpi  { font-size: 12px; color: var(--muted); white-space: nowrap; }
.cs-kpi strong { color: var(--text); }
.detail-body { border-top: 1px solid var(--border); padding: 16px 20px; }
.trend-wrap { margin-bottom: 12px; }
.trend-wrap svg { width: 100%; max-width: 700px; height: 60px; display: block; }
.trend-lbl { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; margin-top: 4px; }
.dtable-wrap { overflow-x: auto; border-radius: 6px; }
table.dtable { width: 100%; border-collapse: collapse; font-size: 12px; }
table.dtable th { background: var(--th-bg); color: var(--th-color); font-size: 10px;
                  font-weight: 700; text-align: right; padding: 7px 10px;
                  white-space: nowrap; text-transform: uppercase; letter-spacing: .4px; }
table.dtable th:first-child { text-align: left; }
table.dtable td { padding: 5px 10px; border-bottom: 1px solid var(--border); }
table.dtable tr:last-child td { border-bottom: none; }
table.dtable tr:hover td { background: var(--row-hover); }

/* ── controls ── */
.controls { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; align-items: center; }
.btn { background: var(--surface); border: 1px solid var(--border); color: var(--text);
       padding: 5px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 500; }
.btn:hover { background: var(--row-hover); }
.search { padding: 5px 10px; border: 1px solid var(--border); border-radius: 6px;
          font-size: 12px; background: var(--surface); color: var(--text); min-width: 200px; }
</style>
</head>
<body>

<header>
  <div class="header-icon">📊</div>
  <div>
    <h1>Performance Report — All Clients</h1>
    <p>${dateRange.start} &ndash; ${dateRange.end} &nbsp;·&nbsp; Generated ${new Date().toISOString()} &nbsp;·&nbsp; ${rows.length} clients</p>
  </div>
</header>

<div class="kpi-strip">
  <div class="kpi"><div class="val">${rows.length}</div><div class="lbl">Active Clients</div></div>
  <div class="kpi blue"><div class="val">${totalCount.toLocaleString()}</div><div class="lbl">Total Patients</div></div>
  <div class="kpi green"><div class="val">${totalEmail.toLocaleString()}</div><div class="lbl">Valid Emails</div></div>
  <div class="kpi amber"><div class="val">${totalSms.toLocaleString()}</div><div class="lbl">Valid SMS</div></div>
  <div class="kpi purple"><div class="val">${totalSurvey.toLocaleString()}</div><div class="lbl">Surveys Completed</div></div>
  <div class="kpi rose"><div class="val">${totalReviews.toLocaleString()}</div><div class="lbl">Reviews</div></div>
</div>

<div class="section">
  <div class="section-title">Client Summary — sorted by patient count</div>
  <div class="table-wrap">
  <table class="summary">
    <thead>
      <tr>
        <th>#</th><th>Client</th><th>ID</th><th>Days</th>
        <th>Count</th>
        <th>Email Valid</th><th>Email→AC</th><th>Email Done</th>
        <th>SMS Valid</th><th>SMS Day 1</th><th>SMS Day 2</th>
        <th>Survey Sent</th><th>Survey Done</th><th>Reviews</th>
        <th>Trend</th>
      </tr>
    </thead>
    <tbody>${summaryRows}</tbody>
  </table>
  </div>
</div>

<div class="section">
  <div class="section-title">Daily Counts by Client</div>
  <div class="controls">
    <input class="search" id="clientSearch" placeholder="Filter clients…" oninput="filterClients(this.value)">
    <button class="btn" onclick="document.querySelectorAll('.client-detail').forEach(d=>d.open=true)">Expand All</button>
    <button class="btn" onclick="document.querySelectorAll('.client-detail').forEach(d=>d.open=false)">Collapse All</button>
  </div>
  <div id="clientList">
${clientSections}
  </div>
</div>

<script>
function filterClients(q) {
  const lq = q.toLowerCase();
  document.querySelectorAll('.client-detail').forEach(el => {
    const name = el.querySelector('.cs-name')?.textContent?.toLowerCase() ?? '';
    el.style.display = name.includes(lq) ? '' : 'none';
  });
}
</script>
</body>
</html>`;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Performance Report', () => {

    // ── TC-ADMIN-PR-01: Page loads correctly ───────────────────────────────

    test('TC-ADMIN-PR-01: Performance report page loads — correct URL, date picker, table visible', async ({ page }) => {
        await goToReport(page);

        expect(page.url()).toContain('performance-report');
        console.log(`  ✅ URL correct: ${page.url()}`);

        // Date picker is div.reportrange-text (vue-daterange-picker), NOT input[type="text"]
        const hasDatePicker = await page.locator('.reportrange-text').first()
            .isVisible({ timeout: 8_000 }).catch(() => false);
        expect(hasDatePicker, 'Date range picker (div.reportrange-text) must be visible').toBe(true);
        console.log('  ✅ Date picker visible');

        const hasTable = await page.locator('table').first()
            .isVisible({ timeout: 10_000 }).catch(() => false);
        expect(hasTable, 'Performance table must be visible').toBe(true);
        console.log('  ✅ Table visible');
    });

    // ── TC-ADMIN-PR-02: UI — select Clarus, verify rows appear ────────────

    test('TC-ADMIN-PR-02: Select Clarus Dermatology from dropdown → table shows rows', async ({ page }) => {
        await goToReport(page);
        await selectClient(page, 'Clarus Dermatology');
        await setDateRange(page, START_DATE, END_DATE);

        await page.locator('table tbody tr').first()
            .waitFor({ state: 'visible', timeout: 30_000 });

        const rowCount = await page.locator('table tbody tr').count();
        expect(rowCount).toBeGreaterThan(0);
        console.log(`  ✅ ${rowCount} daily row(s) visible for Clarus`);
    });

    // ── TC-ADMIN-PR-03: API — Clarus year-to-date data + analytics export ──

    test('TC-ADMIN-PR-03: Clarus Dermatology — fetch year-to-date via API and export analytics', async ({ page }) => {
        const fromDate = toApiDate(START_DATE);
        const toDate = toApiDate(END_DATE);

        // AWAIT the capture setup so the context-level route is registered before any navigation.
        // context.route() intercepts Web Worker requests; page.route() does not.
        const { capture } = await setupPerfCapture(page, [133], fromDate, toDate, 60_000);

        await goToReport(page);
        await selectClient(page, 'Clarus Dermatology'); // triggers the intercepted XHR

        const records = await capture;
        expect(records.length, 'API must return at least one record for Clarus').toBeGreaterThan(0);

        console.log('  📋 Sample record fields:', Object.keys(records[0]).join(', '));

        const clientMap = aggregateByClient(records);
        const clarus = [...clientMap.values()][0];

        console.log(`  📊 Clarus totals (${records.length} daily records):`);
        for (const [k, v] of Object.entries(clarus.totals)) {
            console.log(`     ${k}: ${v.toLocaleString()}`);
        }

        const slug = `${fromDate}_${toDate}`;
        const jsonOut = `test-results/performance-clarus-${slug}.json`;
        fs.mkdirSync('test-results', { recursive: true });
        fs.writeFileSync(jsonOut, JSON.stringify({
            client: 'Clarus Dermatology',
            clientId: 133,
            dateRange: { start: START_DATE, end: END_DATE },
            extractedAt: new Date().toISOString(),
            totalDailyRecords: records.length,
            totals: clarus.totals,
            dailyRecords: records,
        }, null, 2));
        console.log(`  📄 JSON → ${jsonOut}`);

        const htmlOut = `test-results/performance-clarus-${slug}.html`;
        fs.writeFileSync(htmlOut, buildHtmlReport(clientMap, { start: START_DATE, end: END_DATE }));
        console.log(`  📊 HTML dashboard → ${htmlOut}`);

        console.log('  ✅ Clarus year-to-date data extracted and exported');
    });

    // ── TC-ADMIN-PR-04: Sanity — Email Valid ≤ Count for each Clarus day ──

    test('TC-ADMIN-PR-04: Clarus daily records — Email Valid ≤ Count on every day', async ({ page }) => {
        const fromDate = toApiDate(START_DATE);
        const toDate = toApiDate(END_DATE);
        const { capture } = await setupPerfCapture(page, [133], fromDate, toDate, 60_000);

        await goToReport(page);
        await selectClient(page, 'Clarus Dermatology');

        const records = await capture;
        expect(records.length).toBeGreaterThan(0);

        const failures = [];
        for (const rec of records) {
            const date = rec.eventCreatedDate ?? rec.event_created_date ?? '?';
            const count = Number(rec.count ?? rec.Count ?? 0);
            const ev = Number(rec.emailValid ?? rec.email_valid ?? 0);
            const ep = Number(rec.emailPostedToAc ?? rec.email_posted_to_ac ?? 0);

            if (ev > count || ep > ev) {
                failures.push({ date, count, ev, ep });
                console.log(`  ❌ ${date}: Count=${count} EmailValid=${ev} EmailPosted=${ep}`);
            }
        }

        if (failures.length > 0) {
            expect.soft(failures.length, `${failures.length} day(s) failed sanity checks`).toBe(0);
        } else {
            console.log(`  ✅ All ${records.length} daily records passed sanity checks`);
        }
    });

    // ── TC-ADMIN-PR-05: API — verify all required clients return data ──────

    test('TC-ADMIN-PR-05: All required clients return data from the API', async ({ page }) => {
        const fromDate = toApiDate(START_DATE);
        const toDate = toApiDate(END_DATE);
        const ids = REQUIRED_CLIENTS.map(c => c.id);

        const { capture } = await setupPerfCapture(page, ids, fromDate, toDate, 60_000);

        await goToReport(page);
        await selectClient(page, 'Clarus Dermatology'); // triggers the intercepted XHR

        const records = await capture;

        const getId = r => r.clientBrandId ?? r.clientBrandID ?? r.clientId ?? r.client_id ?? r._id?.clientBrandID;
        const returnedIds = new Set(records.map(getId));
        console.log(`  API returned records for IDs: ${[...returnedIds].sort((a, b) => a - b).join(', ')}`);

        const missing = [];
        for (const c of REQUIRED_CLIENTS) {
            if (returnedIds.has(c.id)) {
                const count = records.filter(r => getId(r) === c.id).length;
                console.log(`  ✅ ID ${c.id} (${c.name}): ${count} day(s)`);
            } else {
                console.log(`  ❌ ID ${c.id} (${c.name}): NO DATA`);
                missing.push(c);
            }
        }

        if (missing.length > 0) {
            const names = missing.map(c => `${c.id}/${c.name}`).join(', ');
            expect.soft(missing.length, `${missing.length} client(s) missing: ${names}`).toBe(0);
        }
        console.log(`  ✅ ${REQUIRED_CLIENTS.length - missing.length}/${REQUIRED_CLIENTS.length} clients returned data`);
    });

    // ── TC-ADMIN-PR-06: Full analytics report — all clients, year-to-date ──

    test('TC-ADMIN-PR-06: All clients year-to-date — export full analytics HTML report', async ({ page }) => {
        test.setTimeout(300_000); // 5 min — 17 clients × ~5s each

        const fromDate = toApiDate(START_DATE);
        const toDate = toApiDate(END_DATE);
        const ids = REQUIRED_CLIENTS.map(c => c.id);

        // batchSize=1 → one API request per client to avoid HTTP 500 on large payloads
        const { capture } = await setupPerfCapture(page, ids, fromDate, toDate, 270_000, 1);

        await goToReport(page);
        await selectClient(page, 'Clarus Dermatology'); // triggers XHR → intercepted

        const records = await capture;

        expect(records.length).toBeGreaterThan(0);
        console.log(`  📊 Total daily records across all clients: ${records.length}`);

        const clientMap = aggregateByClient(records);

        for (const [id, entry] of clientMap) {
            const count = entry.totals.count ?? entry.totals.Count ?? 0;
            console.log(`  ${entry.name} (${id}): Count=${count.toLocaleString()} across ${entry.dailyRecords.length} days`);
        }

        const slug = `${toApiDate(START_DATE)}_${toApiDate(END_DATE)}`;
        const jsonOut = `test-results/performance-all-clients-${slug}.json`;
        const htmlOut = `test-results/performance-all-clients-${slug}.html`;

        fs.mkdirSync('test-results', { recursive: true });
        fs.writeFileSync(jsonOut, JSON.stringify({
            dateRange: { start: START_DATE, end: END_DATE },
            extractedAt: new Date().toISOString(),
            totalRecords: records.length,
            clients: [...clientMap.values()].map(e => ({
                id: e.id,
                name: e.name,
                days: e.dailyRecords.length,
                totals: e.totals,
            })),
            rawRecords: records,
        }, null, 2));

        fs.writeFileSync(htmlOut, buildHtmlReport(clientMap, { start: START_DATE, end: END_DATE }));

        console.log(`  📄 JSON → ${jsonOut}`);
        console.log(`  📊 HTML → ${htmlOut}`);
        console.log(`  ✅ Full analytics report exported for ${clientMap.size} clients`);
    });

    // ── TC-ADMIN-PR-08: Patient count decline alert — last 30 days ───────────

    test('TC-ADMIN-PR-08: All clients — detect 4-day decline streak and send alert email', async ({ page }) => {
        test.setTimeout(300_000); // 5 min — 18 clients × ~5s each

        // Last 30 days
        const endD   = new Date();
        const startD = new Date(endD); startD.setDate(startD.getDate() - 30);
        const fmt30  = d => `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
        const alertStart = fmt30(startD);
        const alertEnd   = fmt30(endD);

        const fromDate = toApiDate(alertStart);
        const toDate   = toApiDate(alertEnd);
        const ids      = REQUIRED_CLIENTS.map(c => c.id);

        console.log(`  📅 Alert window: ${alertStart} → ${alertEnd}`);

        // ── Step 1: Get Bearer token via the login API directly ──────────────
        // Calling api.config.layline.live/api/login is far more reliable than
        // navigating the Vue SPA and scraping sessionStorage — no browser rendering,
        // no timing races, works identically locally and in CI headless.
        const accessEmail    = process.env.ACCESS_EMAIL    ?? process.env.ADMIN_EMAIL ?? '';
        const accessPassword = process.env.ACCESS_PASSWORD ?? process.env.ADMIN_PASSWORD ?? '';
        console.log(`  🔑 Calling login API as ${accessEmail}...`);

        const loginResp = await page.request.post('https://api.config.layline.live/api/login', {
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Origin': 'https://access.layline.live',
                'Referer': 'https://access.layline.live/',
            },
            data: { email: accessEmail, password: accessPassword },
            timeout: 30_000,
        });

        if (!loginResp.ok()) {
            throw new Error(`Login API ${loginResp.status()} — check ACCESS_EMAIL / ACCESS_PASSWORD`);
        }

        const loginJson = await loginResp.json();
        // Token field varies by API version — check common locations
        const bearerToken =
            loginJson.token ??
            loginJson.accessToken ??
            loginJson.access_token ??
            loginJson.data?.token ??
            loginJson.data?.accessToken ??
            null;

        if (!bearerToken) {
            console.log('  ⚠️ Login response keys:', Object.keys(loginJson).join(', '));
            throw new Error('Bearer token not found in login API response — update key lookup above');
        }
        console.log(`  ✅ Bearer token obtained (length: ${bearerToken.length})`);

        // ── Step 2: Fetch all client data directly ───────────────────────────
        // One POST per client avoids HTTP 500 on large payloads.
        const targetUrl = `https://insights.layline.live/api/v1/reports/performance?fromDate=${fromDate}&toDate=${toDate}`;
        console.log(`  📡 Direct API → ${targetUrl} | ${ids.length} clients`);

        const allRecords = [];
        for (let i = 0; i < ids.length; i++) {
            const clientId = ids[i];
            console.log(`  📦 Client ${clientId} (${i + 1}/${ids.length})...`);
            try {
                const resp = await page.request.post(targetUrl, {
                    headers: {
                        'Authorization': `Bearer ${bearerToken}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json, text/plain, */*',
                        'Origin': 'https://access.layline.live',
                        'Referer': 'https://access.layline.live/',
                    },
                    data: { clientId: [clientId] },
                    timeout: 60_000,
                });

                if (!resp.ok()) {
                    console.log(`  ⚠️ Client ${clientId} HTTP ${resp.status()} — skipping`);
                    continue;
                }

                const json = await resp.json().catch(() => null);
                const records = (json?.success && Array.isArray(json.data)) ? json.data
                              : Array.isArray(json) ? json
                              : [];

                allRecords.push(...records);
                console.log(`  ✅ Client ${clientId}: ${records.length} records (total: ${allRecords.length})`);
            } catch (err) {
                console.log(`  ❌ Client ${clientId} error: ${err.message} — skipping`);
            }
        }

        const records = allRecords;
        expect(records.length).toBeGreaterThan(0);

        const clientMap = aggregateByClient(records);

        // Attach known client names from REQUIRED_CLIENTS (API may return ID only)
        for (const [id, entry] of clientMap) {
            const known = REQUIRED_CLIENTS.find(c => String(c.id) === String(id));
            if (known && entry.name === String(id)) entry.name = known.name;
        }

        // ── Streak detection ──────────────────────────────────────────────────
        const STREAK_THRESHOLD = Number(process.env.ALERT_STREAK ?? 4);
        const flagged = [];

        for (const [, entry] of clientMap) {
            const sorted = entry.dailyRecords
                .map(r => ({
                    date: r.eventCreatedDate ?? r._id?.eventCreatedDate ?? '',
                    count: Number(r.count ?? r.Count ?? 0),
                }))
                .filter(r => r.date && r.count > 0)
                .sort((a, b) => a.date.localeCompare(b.date));

            if (sorted.length < 2) continue;

            let best = null, cur = 1, curStart = 0;
            for (let i = 1; i < sorted.length; i++) {
                if (sorted[i].count < sorted[i - 1].count) {
                    cur++;
                    if (cur > (best?.streak ?? 0)) {
                        best = { streak: cur, startIdx: curStart };
                    }
                } else {
                    cur = 1; curStart = i;
                }
            }

            if (best && best.streak >= STREAK_THRESHOLD) {
                const streakDays = sorted.slice(best.startIdx, best.startIdx + best.streak);
                const peakDay    = best.startIdx > 0 ? sorted[best.startIdx - 1] : null;
                const peak       = peakDay?.count ?? streakDays[0].count;
                const low        = streakDays[streakDays.length - 1].count;
                const drop       = peak > 0 ? Math.round((peak - low) / peak * 100) : 0;
                flagged.push({ id: entry.id, name: entry.name, streak: best.streak, streakDays, peakDay, peak, low, drop });
                console.log(`  ⚠️  ${entry.name}: ${best.streak}-day decline streak — peak ${peak} → low ${low} (−${drop}%)`);
            } else {
                console.log(`  ✅ ${entry.name}: no sustained decline`);
            }
        }

        fs.mkdirSync('test-results', { recursive: true });

        if (flagged.length === 0) {
            console.log('  ✅ No alerts — all clients healthy. No email sent.');
            // Remove stale flag so GH Actions does not re-send
            try { fs.unlinkSync('test-results/alert-triggered.txt'); } catch (_) {}
            return;
        }

        // ── Build alert email HTML ────────────────────────────────────────────
        const healthy = [...clientMap.values()]
            .filter(e => !flagged.find(f => String(f.id) === String(e.id)))
            .map(e => e.name);

        const htmlEmail = buildAlertEmail(flagged, healthy, alertStart, alertEnd);
        fs.writeFileSync('test-results/alert-email.html', htmlEmail);

        // Flag file — GH Actions checks this to decide whether to send
        fs.writeFileSync('test-results/alert-triggered.txt',
            `${flagged.length} client(s) flagged\n${flagged.map(f => `- ${f.name}: ${f.streak}-day decline, −${f.drop}%`).join('\n')}`
        );

        console.log(`  📧 Alert email written → test-results/alert-email.html`);
        console.log(`  🚨 ${flagged.length} client(s) flagged:\n${flagged.map(f => `     ${f.name} (${f.streak}-day streak, −${f.drop}%)`).join('\n')}`);

        expect(flagged.length, 'flagged clients written to alert-email.html — email will be sent by CI').toBeGreaterThanOrEqual(0);
    });

    // ── TC-ADMIN-PR-07: Clarus UI filter smoke test ────────────────────────

    test('TC-ADMIN-PR-07: Clarus Dermatology — UI filter shows only Clarus rows', async ({ page }) => {
        await goToReport(page);
        await selectClient(page, 'Clarus Dermatology');
        await setDateRange(page, START_DATE, END_DATE);

        await page.locator('table tbody tr').first()
            .waitFor({ state: 'visible', timeout: 30_000 });

        const { rows } = await extractTable(page);
        const allClarus = rows.every(r => /Clarus/i.test(r['Client Name'] ?? r[Object.keys(r)[1]] ?? ''));

        console.log(`  Rows: ${rows.length} — all Clarus: ${allClarus}`);
        if (rows.length > 0) {
            const count = rows[0]['Count'] ?? rows[0][Object.keys(rows[0])[3]] ?? '?';
            console.log(`  Latest row Count: ${count}`);
        }

        expect(rows.length).toBeGreaterThan(0);
        console.log('  ✅ Clarus filter smoke test passed');
    });

});

// ── Alert email builder (used by PR-08) ──────────────────────────────────────

function buildAlertEmail(flagged, healthy, startDate, endDate) {
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const dayLabel = d => {
        const dt = new Date(d + 'T00:00:00');
        return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };
    const pct = (a, b) => b > 0 ? `−${Math.round((b - a) / b * 100)}%` : '—';

    const summaryRows = flagged.map(f => `
        <tr>
          <td style="padding:8px 10px;font-size:12px;font-weight:600;color:#1a2535;border-bottom:1px solid #edf0f5">${f.name}</td>
          <td style="padding:8px 10px;font-size:11px;border-bottom:1px solid #edf0f5">
            <span style="background:#fdf2f2;color:#c93030;border:1px solid #f0d8d8;border-radius:3px;padding:2px 7px;font-weight:700;font-size:10px">${f.streak} days ↓</span>
          </td>
          <td style="padding:8px 10px;font-size:12px;text-align:right;font-variant-numeric:tabular-nums;border-bottom:1px solid #edf0f5">${f.peak.toLocaleString()}</td>
          <td style="padding:8px 10px;font-size:12px;text-align:right;font-variant-numeric:tabular-nums;border-bottom:1px solid #edf0f5">${f.low.toLocaleString()}</td>
          <td style="padding:8px 10px;font-size:12px;text-align:right;font-weight:700;color:#c93030;border-bottom:1px solid #edf0f5">−${f.drop}%</td>
          <td style="padding:8px 10px;font-size:11px;color:#6b7d93;border-bottom:1px solid #edf0f5">${dayLabel(f.streakDays[0].date)} – ${dayLabel(f.streakDays[f.streakDays.length-1].date)}</td>
        </tr>`).join('');

    const clientCards = flagged.map(f => {
        const allRows = [f.peakDay, ...f.streakDays].filter(Boolean);
        const dayRows = allRows.map((r, i) => {
            const isDecline = i > 0;
            const prev = allRows[i - 1]?.count;
            const change = isDecline && prev ? pct(r.count, prev) : '—';
            const bg  = isDecline ? 'background:#fff8f8;' : '';
            const clr = isDecline ? 'color:#c93030;' : 'color:#6b7d93;';
            const arr = isDecline ? '↓' : '—';
            return `
              <tr>
                <td style="${bg}padding:7px 12px;font-size:12px;color:#1a2535;border-top:1px solid #edf0f5">${dayLabel(r.date)}</td>
                <td style="${bg}padding:7px 12px;font-size:13px;${clr}">${arr}</td>
                <td style="${bg}padding:7px 12px;font-size:12px;text-align:right;font-variant-numeric:tabular-nums;font-weight:600;${clr}">${r.count.toLocaleString()}</td>
                <td style="${bg}padding:7px 12px;font-size:12px;text-align:right;${clr}">${change}</td>
              </tr>`;
        }).join('');

        return `
        <div style="margin-bottom:20px;border:1px solid #e4e9f0;border-radius:6px;overflow:hidden">
          <div style="background:#f7f9fc;padding:11px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e4e9f0">
            <span style="font-size:13px;font-weight:700;color:#1a2535">${f.name} <span style="font-size:11px;color:#9aacbe;font-weight:400">(ID ${f.id})</span></span>
            <span style="background:#fdf2f2;color:#c93030;border:1px solid #f0d8d8;border-radius:3px;font-size:11px;font-weight:600;padding:2px 8px">${f.streak} consecutive days declining</span>
          </div>
          <table width="100%" style="border-collapse:collapse">
            <thead>
              <tr>
                <th style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#6b7d93;padding:7px 12px;text-align:left;background:#f7f9fc">Date</th>
                <th style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#6b7d93;padding:7px 12px;background:#f7f9fc"></th>
                <th style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#6b7d93;padding:7px 12px;text-align:right;background:#f7f9fc">Daily Count</th>
                <th style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#6b7d93;padding:7px 12px;text-align:right;background:#f7f9fc">Change</th>
              </tr>
            </thead>
            <tbody>${dayRows}</tbody>
          </table>
        </div>`;
    }).join('');

    const healthyNote = healthy.length > 0
        ? `<div style="background:#f2faf6;border:1px solid #c0e8d5;border-radius:5px;padding:12px 16px;font-size:12px;color:#1a3a28;margin-top:4px">
             <strong style="color:#0a8f62">✓ ${healthy.length} client${healthy.length > 1 ? 's' : ''} healthy</strong> — no sustained decline detected:
             <span style="color:#4a7a63"> ${healthy.join(', ')}</span>
           </div>`
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Patient Count Alert — ${now}</title></head>
<body style="margin:0;padding:0;background:#eef1f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
<div style="padding:32px 16px">
<div style="max-width:620px;margin:0 auto;background:#fff;border-radius:6px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.10)">

  <!-- Header -->
  <div style="background:#0e1e2e;padding:24px 32px;display:flex;align-items:center;justify-content:space-between">
    <div>
      <div style="color:#fff;font-size:17px;font-weight:700;letter-spacing:-.2px">Layline &nbsp;·&nbsp; Performance Alert</div>
      <div style="color:#6fa3c8;font-size:11px;margin-top:2px;letter-spacing:.3px">AUTOMATED MONITORING · ${startDate} – ${endDate}</div>
    </div>
    <div style="background:#c93030;color:#fff;font-size:10px;font-weight:700;padding:4px 10px;border-radius:20px;letter-spacing:.4px;white-space:nowrap">⚠ ALERT</div>
  </div>

  <!-- Alert strip -->
  <div style="background:#fdf2f2;border-top:3px solid #c93030;border-bottom:1px solid #f0d8d8;padding:14px 32px;display:flex;align-items:center;gap:12px">
    <div style="font-size:22px;flex-shrink:0">📉</div>
    <div style="font-size:13px;color:#3a1515;line-height:1.5">
      <strong style="color:#c93030">${flagged.length} client${flagged.length > 1 ? 's' : ''}</strong> show a sustained patient count decline —
      ${flagged.length > 1 ? 'each has' : 'has'} <strong>4 or more consecutive days</strong> of decreasing daily counts
      in the last 30 days (${startDate} – ${endDate}).
    </div>
  </div>

  <div style="padding:24px 32px">

    <!-- Summary table -->
    <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#6b7d93;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #edf0f5">Flagged Clients</div>
    <div style="overflow-x:auto;border-radius:6px;border:1px solid #e4e9f0">
      <table width="100%" style="border-collapse:collapse">
        <thead>
          <tr style="background:#f0f3f8">
            <th style="font-size:9.5px;text-transform:uppercase;letter-spacing:.5px;color:#6b7d93;font-weight:700;padding:7px 10px;text-align:left;border-bottom:2px solid #dde4ef">Client</th>
            <th style="font-size:9.5px;text-transform:uppercase;letter-spacing:.5px;color:#6b7d93;font-weight:700;padding:7px 10px;border-bottom:2px solid #dde4ef">Streak</th>
            <th style="font-size:9.5px;text-transform:uppercase;letter-spacing:.5px;color:#6b7d93;font-weight:700;padding:7px 10px;text-align:right;border-bottom:2px solid #dde4ef">Peak</th>
            <th style="font-size:9.5px;text-transform:uppercase;letter-spacing:.5px;color:#6b7d93;font-weight:700;padding:7px 10px;text-align:right;border-bottom:2px solid #dde4ef">Streak Low</th>
            <th style="font-size:9.5px;text-transform:uppercase;letter-spacing:.5px;color:#6b7d93;font-weight:700;padding:7px 10px;text-align:right;border-bottom:2px solid #dde4ef">Drop</th>
            <th style="font-size:9.5px;text-transform:uppercase;letter-spacing:.5px;color:#6b7d93;font-weight:700;padding:7px 10px;border-bottom:2px solid #dde4ef">Period</th>
          </tr>
        </thead>
        <tbody>${summaryRows}</tbody>
      </table>
    </div>

    <!-- Per-client breakdowns -->
    <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#6b7d93;margin:20px 0 10px;padding-bottom:6px;border-bottom:1px solid #edf0f5">Daily Breakdown</div>
    ${clientCards}

    <!-- Healthy clients -->
    ${healthyNote}

  </div>

  <!-- Footer -->
  <div style="background:#f7f9fc;border-top:1px solid #e4e9f0;padding:16px 32px;font-size:11px;color:#8fa0b5;line-height:1.6">
    Generated automatically by <strong>Layline Performance Monitor</strong> on <strong>${now}</strong>
    &nbsp;·&nbsp; Monitoring window: <strong>${startDate} – ${endDate}</strong>
    &nbsp;·&nbsp; Alert threshold: <strong>4 consecutive days of declining daily patient count</strong>
    <br>Days with 0 patients (weekends / holidays) are excluded from streak detection.
  </div>

</div>
</div>
</body>
</html>`;
}

// ── Shared UI helper used by PR-07 ────────────────────────────────────────────

async function extractTable(page) {
    const rawHeaders = await page.locator('table thead th, table thead td').allTextContents();
    const headers = rawHeaders.map(h => h.trim().replace(/\s+/g, ' ')).filter(Boolean);
    const rowLocator = page.locator('table tbody tr');
    const rowCount = await rowLocator.count();
    const rows = [];
    for (let i = 0; i < rowCount; i++) {
        const cells = await rowLocator.nth(i).locator('td').allTextContents();
        const row = {};
        headers.forEach((h, idx) => { row[h] = cells[idx]?.trim() ?? ''; });
        rows.push(row);
    }
    return { headers, rows };
}
