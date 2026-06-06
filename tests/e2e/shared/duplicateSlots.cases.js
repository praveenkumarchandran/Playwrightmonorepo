/**
 * DUPLICATE SLOT CHECKER
 *
 * Navigates DIRECTLY to the /findappointment URL (same as a fresh browser visit)
 * and intercepts the raw `getProviders` API response to detect duplicate slots.
 *
 * Why direct navigation instead of booking flow:
 *   The booking flow (landing → slotFilter → findappointment) triggers filter-based
 *   API calls that may return de-duplicated data — hiding real duplicates.
 *   A direct URL visit loads the INITIAL raw API response, which is what users see
 *   and what may contain duplicates. This matches the InPrivate/incognito browser test.
 *
 * @param {Page}   page             — Playwright page
 * @param {string} findApptUrl      — production /findappointment URL
 * @param {string} clientName       — display name for logs
 * @param {string} slotType         — 'clarus'|'tndi'|'datetime' (fallback UI check)
 * @param {string} [service]        — service/reason to check (for logging)
 * @returns {Promise<string[]>}     — duplicate descriptions (empty = clean)
 */
export async function checkForDuplicateSlots(page, findApptUrl, clientName, slotType, service = '') {
    const duplicates = [];

    // ── Intercept the raw getProviders API response ───────────────────────────
    // Set up listener BEFORE navigating so we capture the very first API call
    let apiData = null;

    const responseHandler = async (response) => {
        if (!/getProviders|getAllProviders/i.test(response.url())) return;
        if (response.status() !== 200) return;
        try {
            const json = await response.json();
            if (json && !apiData) apiData = json; // capture first response only
        } catch { /* ignore */ }
    };

    page.on('response', responseHandler);

    try {
        // Navigate directly — this is what the user sees in a fresh browser
        await page.goto(findApptUrl, { waitUntil: 'networkidle', timeout: 30_000 });

        // Wait a bit for all async slot loading to complete
        await page.waitForTimeout(2_000);

    } finally {
        page.off('response', responseHandler);
    }

    // ── Check if API response was captured ────────────────────────────────────
    if (apiData) {
        console.log(`  [${clientName}] API response captured — checking all slots at once`);
        _parseApiResponse(apiData, clientName, duplicates);

        if (duplicates.length === 0) {
            console.log(`  [${clientName}] ✅ No duplicates in API response`);
        }
        return duplicates;
    }

    // ── Fallback: UI-based check (click through each date) ────────────────────
    console.log(`  [${clientName}] No API response captured — using UI date-click fallback`);

    if (slotType === 'clarus')        await _checkClarusStyle(page, duplicates, clientName);
    else if (slotType === 'datetime') await _checkDatetimeStyle(page, duplicates, clientName);
    else                              await _checkTndiStyle(page, duplicates, clientName);

    return duplicates;
}

// ─────────────────────────────────────────────────────────────────────────────
// Parse the Setter API response for duplicate slots
//
// Confirmed API format (from network intercept):
//   { date: "06/15/2026", data: [ { slotId, date, starttime: "09:30", ... }, ... ] }
//   OR nested under providers/dates array
// ─────────────────────────────────────────────────────────────────────────────
function _parseApiResponse(data, clientName, duplicates) {
    // Walk the full response tree and collect all slot objects
    const allSlots = [];
    _collectSlots(data, allSlots);

    if (allSlots.length === 0) {
        console.log(`  [${clientName}] Could not extract slots from API response`);
        return;
    }

    console.log(`  [${clientName}] API returned ${allSlots.length} total slot(s) across all dates`);

    // Group by date+time and detect duplicates
    const byDateTime = new Map();
    for (const slot of allSlots) {
        const key = `${slot.date}|${slot.starttime}|${slot.providerid ?? ''}`;
        if (!byDateTime.has(key)) byDateTime.set(key, []);
        byDateTime.get(key).push(slot);
    }

    for (const [key, slots] of byDateTime) {
        if (slots.length > 1) {
            const [date, time, providerid] = key.split('|');
            const provider = slots[0]?.locationName ?? slots[0]?.providerid ?? 'Provider';
            duplicates.push(`${provider} | ${date} ${time}: duplicate slot (${slots.length}×, slotIds: ${slots.map(s => s.slotId).join(', ')})`);
            console.log(`  ⚠️  [${clientName}] ${provider} | ${date} ${time}: DUPLICATE (${slots.length}× same slot)`);
        }
    }
}

// ── Exported helpers used by the production spec ─────────────────────────────

/**
 * Recursively collect all slot objects from an API response into a flat array.
 * A slot is identified by having a `starttime` field in HH:MM format.
 * Exported so the spec can call it from within the response listener.
 */
export function collectSlots(node, out) {
    _collectSlots(node, out);
}

/**
 * Check a flat array of slot objects for duplicates (same date + starttime).
 * Exported so the spec can call it after collecting slots from all API responses.
 */
export function findDuplicatesInSlots(slots, clientName, duplicates) {
    const byDateTime = new Map();

    for (const slot of slots) {
        if (!slot.date || !slot.starttime) continue;
        // Include appointmenttypeid so slots for DIFFERENT services at the same time
        // are NOT treated as duplicates — a provider can legitimately offer Acne AND
        // BOTOX at 9:00 AM (different appointment types, same time, different slotIds).
        // A real duplicate is the SAME appointment type appearing twice.
        const key = `${slot.date}|${slot.starttime}|${slot.providerid ?? ''}|${slot.appointmenttypeid ?? ''}`;
        if (!byDateTime.has(key)) byDateTime.set(key, []);
        byDateTime.get(key).push(slot);
    }

    for (const [key, group] of byDateTime) {
        if (group.length > 1) {
            const [date, time] = key.split('|');
            const provider   = group[0]?._providerName ?? group[0]?.providerid ?? 'Provider';
            const location   = group[0]?.locationName ?? 'Unknown Location';
            const service    = group[0]?.appointmenttype ?? group[0]?.patientappointmenttypename ?? 'Unknown Service';
            const ids        = group.map(s => s.slotId).join(', ');

            const msg = [
                `Provider : ${provider}`,
                `Location : ${location}`,
                `Service  : ${service}`,
                `Date/Time: ${date} ${time}`,
                `Duplicate: ${group.length}× (slotIds: ${ids})`,
            ].join(' | ');

            duplicates.push(msg);
            console.log(`  ⚠️  [${clientName}]\n       ${msg.replace(/ \| /g, '\n       ')}`);
        }
    }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

// Recursively walk an API response and collect slot objects.
// A slot is identified by having a `starttime` field in HH:MM format.
// Propagates the nearest parent provider name into each slot for accurate logging.
function _collectSlots(node, out, providerName = null) {
    if (!node || typeof node !== 'object') return;

    if (Array.isArray(node)) {
        for (const item of node) _collectSlots(item, out, providerName);
        return;
    }

    // Extract provider name from this node if available (carries down into child slots)
    let currentProvider = providerName;
    if (node.displayName) currentProvider = node.displayName;
    else if (node.firstName && node.lastName) currentProvider = `${node.firstName} ${node.lastName}`.trim();
    else if (node.providerName) currentProvider = node.providerName;

    // A slot object has starttime in HH:MM format
    if (node.starttime && /^\d{2}:\d{2}$/.test(String(node.starttime))) {
        out.push({
            ...node,
            _providerName: currentProvider ?? node.locationName ?? node.providerid ?? 'Unknown',
        });
        return;
    }

    // Recurse into all child values carrying the provider name down
    for (const val of Object.values(node)) {
        if (val && typeof val === 'object') _collectSlots(val, out, currentProvider);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// UI fallback — Clarus / SINY / CVD (provider cards + Show More + date strip)
// ─────────────────────────────────────────────────────────────────────────────
async function _checkClarusStyle(page, duplicates, clientName) {
    const showMoreLinks = page.getByText(/^Show More$/);
    const cardCount = await showMoreLinks.count();

    if (cardCount === 0) {
        console.log(`  [${clientName}] No provider cards — no available slots`);
        return;
    }

    for (let i = 0; i < cardCount; i++) {
        const link = showMoreLinks.nth(i);
        const providerName = await link.evaluate((el, idx) => {
            let node = el.parentElement;
            for (let d = 0; d < 12; d++) {
                if (!node || node === document.body) break;
                const lines = (node.innerText ?? '').split('\n')
                    .map(l => l.trim())
                    .filter(l => l.length > 1 && !l.match(/^(Show|More|Mon|Tue|Wed|Thu|Fri|Sat|Sun|AM$|PM$|\d+:\d+)/i));
                if (lines.length) return lines[0];
                node = node.parentElement;
            }
            return `Provider ${idx + 1}`;
        }, i).catch(() => `Provider ${i + 1}`);

        await link.scrollIntoViewIfNeeded();
        await link.click();
        await page.waitForFunction(
            () => document.body.innerText.includes('More Slots'), { timeout: 10_000 }
        ).catch(() => {});
        await page.waitForTimeout(300);

        await _clickAllDatesAndCheckTimes(page, providerName, duplicates);

        const showLess = page.getByText(/^Show Less$/i).first();
        if (await showLess.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await showLess.click();
            await page.waitForTimeout(200);
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// UI fallback — TNDI / Kronson / Freedman (date strip + time grid)
// ─────────────────────────────────────────────────────────────────────────────
async function _checkTndiStyle(page, duplicates, clientName) {
    const dateCount = await page.locator('button')
        .filter({ hasText: /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i })
        .filter({ hasNotText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
        .count();

    if (dateCount === 0) {
        console.log(`  [${clientName}] No date buttons — no available slots`);
        return;
    }
    await _clickAllDatesAndCheckTimes(page, clientName, duplicates);
}

// ─────────────────────────────────────────────────────────────────────────────
// UI fallback — Hopemark (combined "Wed Jun 4 4:45 PM" datetime buttons)
// ─────────────────────────────────────────────────────────────────────────────
async function _checkDatetimeStyle(page, duplicates, clientName) {
    const texts = await page.locator('button')
        .filter({ hasText: /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b.*\d{1,2}:\d{2}\s*(AM|PM)/i })
        .allTextContents();

    const byDate = new Map();
    for (const raw of texts) {
        const text = raw.trim().replace(/\s+/g, ' ');
        const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
        if (!timeMatch) continue;
        const date = text.replace(timeMatch[0], '').trim();
        if (!byDate.has(date)) byDate.set(date, []);
        byDate.get(date).push(timeMatch[1].trim());
    }

    for (const [date, times] of byDate) {
        _findDuplicates(times, null, date, duplicates);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Click every date in the date strip and collect time slot texts
// ─────────────────────────────────────────────────────────────────────────────
const MAX_DATES = 30;

async function _clickAllDatesAndCheckTimes(page, contextLabel, duplicates) {
    const visited = new Set();

    while (visited.size < MAX_DATES) {
        const visibleDates = page.locator('button')
            .filter({ hasText: /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i })
            .filter({ hasNotText: /\d{1,2}:\d{2}\s*(AM|PM)/i });

        const dateTexts = await visibleDates.allTextContents();
        let clickedAny = false;

        for (let i = 0; i < dateTexts.length; i++) {
            const dateText = dateTexts[i].trim().replace(/\s+/g, ' ');
            if (visited.has(dateText)) continue;
            visited.add(dateText);

            await visibleDates.nth(i).click();
            await page.waitForTimeout(300);

            const allBtnTexts = await page.locator('button').allTextContents();
            const times = allBtnTexts.map(t => {
                const m = t.trim().replace(/\s+/g, ' ').match(/^(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
                return m ? m[1].trim().toUpperCase().replace(/\s+/, ' ') : null;
            }).filter(Boolean);

            console.log(`    ${contextLabel} | ${dateText}: ${times.length} slot(s)${times.length > 0 ? ` [${times.join(', ')}]` : ''}`);
            _findDuplicates(times, contextLabel, dateText, duplicates);

            clickedAny = true;
            break;
        }

        if (!clickedAny) {
            const nextArrow = page.locator('button').filter({ hasText: /^[>›»]$/ }).first();
            if (!await nextArrow.isVisible({ timeout: 2_000 }).catch(() => false)) break;
            const disabled = await nextArrow.evaluate(b =>
                b.disabled || b.getAttribute('aria-disabled') === 'true' || b.classList.contains('Mui-disabled')
            ).catch(() => false);
            if (disabled) break;
            await nextArrow.click();
            await page.waitForTimeout(300);
        }
    }
}

function _findDuplicates(times, providerName, dateName, duplicates) {
    const seen = new Set();
    const ctx = [providerName, dateName].filter(Boolean).join(' | ');
    times.forEach(t => {
        if (seen.has(t)) duplicates.push(`${ctx}: duplicate slot "${t}"`);
        seen.add(t);
    });
}
