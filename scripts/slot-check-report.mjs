/**
 * Slot Duplicate Check — Email Report Generator (Option 1: Clean Table Style)
 *
 * Usage: node scripts/slot-check-report.mjs <results-dir> <run-url> [output-file]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const resultsDir = process.argv[2] ?? 'prod-results';
const runUrl     = process.argv[3] ?? '';
const outputFile = process.argv[4] ?? 'slot-check-email.html';

const RUN_DATE = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short'
});

const resultsFile = join(resultsDir, 'results.json');

if (!existsSync(resultsFile)) {
    writeFileSync(outputFile, `<p>No results file found at ${resultsFile}. The check may have failed to start.</p>`);
    process.exit(0);
}

const results = JSON.parse(readFileSync(resultsFile, 'utf-8'));

// ── Parse failures ────────────────────────────────────────────────────────────

const failures = [];

function getMeta(msg, key) {
    const m = msg.match(new RegExp(`${key}\\s*[:|]\\s*(.+)`, 'i'));
    return m ? m[1].trim() : null;
}

function extractPairs(message) {
    const pairs = [];
    const lines = message.split('\n').map(l => l.trim());
    let cur = null;

    for (const line of lines) {
        if (line.startsWith('•') || /^Slot\s*\d+/i.test(line) || /^Duplicate\s+\d+/i.test(line)) {
            if (cur) pairs.push(cur);
            cur = {};
        }
        const kv = line.match(/^(Date\/Time|DateTime|Appointment ID|Duplicate|Booked by|Issue|Provider|AppointmentTypeId)\s*[:|]\s*(.+)/i);
        if (kv && cur) cur[kv[1].toLowerCase().replace(/\s+/g, '')] = kv[2].trim();
        if (line.startsWith('•') && cur && !cur.raw) cur.raw = line.replace(/^•\s*/, '');
    }
    if (cur) pairs.push(cur);
    return pairs.filter(p => Object.keys(p).length > 0);
}

function walk(suites) {
    for (const suite of suites ?? []) {
        for (const spec of suite.specs ?? []) {
            for (const test of spec.tests ?? []) {
                if (test.status === 'unexpected' || test.status === 'failed') {
                    const msg = (test.results ?? [])
                        .flatMap(r => r.errors ?? [])
                        .map(e => e.message ?? '')
                        .join('\n');
                    if (/duplicate/i.test(msg)) {
                        failures.push({
                            title:    (spec.title ?? suite.title ?? '').replace(/\[|\]/g, '').trim(),
                            location: getMeta(msg, 'Location'),
                            service:  getMeta(msg, 'Service'),
                            provider: getMeta(msg, 'Provider'),
                            pairs:    extractPairs(msg),
                            raw:      msg,
                        });
                    }
                }
            }
        }
        walk(suite.suites);
    }
}

walk(results.suites ?? []);

const totalChecked = (results.stats?.expected ?? 0) + (results.stats?.unexpected ?? 0);
const totalPairs   = failures.reduce((s, f) => s + Math.max(f.pairs.length, 1), 0);
const runId        = results.stats?.startTime
    ? new Date(results.stats.startTime).getTime().toString().slice(-6)
    : Date.now().toString().slice(-6);
const checkId = `slot-check-#${runId}`;

// ── HTML helpers ──────────────────────────────────────────────────────────────

const esc = s => String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const hasIssues   = failures.length > 0;
const clientsOk   = totalChecked - failures.length;

// ── Per-client affected cards ─────────────────────────────────────────────────

const clientCards = failures.map(f => {
    const pairCount = Math.max(f.pairs.length, 1);

    const slotRows = f.pairs.length > 0
        ? f.pairs.map(p => {
            const dt  = p['date/time'] ?? p['datetime'] ?? null;
            const ids = p['appointmentid'] ?? p['duplicate'] ?? p['appointmenttypeid'] ?? null;
            const by  = p['bookedby'] ?? null;
            const raw = p['raw'] ?? null;

            const idChips = ids
                ? ids.split(/[,\s]+/).filter(Boolean).map(id =>
                    `<span style="font-family:'Courier New',Courier,monospace;font-size:12px;
                            background:#F3F4F6;border:1px solid #E5E7EB;color:#374151;
                            padding:2px 9px;border-radius:3px;display:inline-block;">${esc(id.trim())}</span>`
                  ).join(' ')
                : null;

            return `
        <div style="padding:16px 18px;border-bottom:1px solid #F0F2F5;">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px 20px;margin-bottom:${idChips ? '14px' : '0'};">
            ${f.provider ? `<div><div style="font-size:10px;text-transform:uppercase;letter-spacing:.9px;color:#A0ABBA;font-weight:600;margin-bottom:3px;">Provider</div><div style="font-size:13px;font-weight:500;color:#1A2B3C;">${esc(f.provider)}</div></div>` : ''}
            ${f.location ? `<div><div style="font-size:10px;text-transform:uppercase;letter-spacing:.9px;color:#A0ABBA;font-weight:600;margin-bottom:3px;">Location</div><div style="font-size:13px;font-weight:500;color:#1A2B3C;">${esc(f.location)}</div></div>` : ''}
            ${f.service  ? `<div><div style="font-size:10px;text-transform:uppercase;letter-spacing:.9px;color:#A0ABBA;font-weight:600;margin-bottom:3px;">Service</div><div style="font-size:13px;font-weight:500;color:#1A2B3C;">${esc(f.service)}</div></div>` : ''}
            ${dt ? `<div><div style="font-size:10px;text-transform:uppercase;letter-spacing:.9px;color:#A0ABBA;font-weight:600;margin-bottom:3px;">Date &amp; Time</div><div style="font-size:13px;font-weight:500;color:#1A2B3C;">${esc(dt)}</div></div>` : ''}
            <div><div style="font-size:10px;text-transform:uppercase;letter-spacing:.9px;color:#A0ABBA;font-weight:600;margin-bottom:3px;">Occurrences</div><div style="font-size:13px;font-weight:500;color:#1A2B3C;">${pairCount}&times; duplicate</div></div>
            ${by ? `<div><div style="font-size:10px;text-transform:uppercase;letter-spacing:.9px;color:#A0ABBA;font-weight:600;margin-bottom:3px;">Booked By</div><div style="font-size:13px;font-weight:500;color:#1A2B3C;">${esc(by)}</div></div>` : ''}
          </div>
          ${idChips ? `
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;
                      padding-top:12px;border-top:1px dashed #E8ECF1;">
            <span style="font-size:10px;text-transform:uppercase;letter-spacing:.9px;color:#A0ABBA;font-weight:600;white-space:nowrap;">Slot IDs</span>
            ${idChips}
          </div>` : ''}
          ${!dt && !ids && raw ? `<div style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#555;white-space:pre-wrap;">${esc(raw.substring(0, 400))}</div>` : ''}
        </div>`;
        }).join('')
        : `<div style="padding:16px 18px;font-family:'Courier New',Courier,monospace;font-size:12px;color:#555;white-space:pre-wrap;">${esc(f.raw.substring(0, 500))}</div>`;

    return `
    <div style="background:#FFFFFF;border:1px solid #DDE2E9;border-radius:8px;overflow:hidden;margin-bottom:14px;">
      <div style="background:#FEF2F2;border-bottom:1px solid #FECACA;padding:13px 18px;display:flex;align-items:center;gap:12px;">
        <span style="font-size:14px;font-weight:600;color:#991B1B;flex:1;">${esc(f.title || 'Unknown Client')}</span>
        <span style="background:#C0392B;color:white;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;white-space:nowrap;">${pairCount} duplicate${pairCount !== 1 ? 's' : ''} found</span>
      </div>
      ${slotRows}
    </div>`;
}).join('');

// ── Clear clients list ────────────────────────────────────────────────────────

const clearClientNames = results.suites
    ?.flatMap(s => s.suites ?? [])
    .filter(s => !failures.find(f => f.title === s.title))
    .map(s => s.title)
    .filter(Boolean) ?? [];

const clearRows = clearClientNames.length > 0
    ? clearClientNames.map(name => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid #F0F2F5;">
      <div style="width:8px;height:8px;border-radius:50%;background:#16A34A;flex-shrink:0;"></div>
      <span style="font-size:13px;color:#374151;font-weight:500;flex:1;">${esc(name)}</span>
      <span style="font-size:11px;font-weight:600;color:#16A34A;letter-spacing:.3px;">Clear</span>
    </div>`).join('')
    : '';

// ── All-clear body ────────────────────────────────────────────────────────────

const allClearBody = !hasIssues ? `
    <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:24px;text-align:center;">
      <div style="font-size:16px;font-weight:700;color:#15803D;margin-bottom:6px;">All ${totalChecked} clients checked — no duplicates found.</div>
      <div style="font-size:13px;color:#166534;">System is operating normally.</div>
    </div>` : '';

// ── Full HTML ─────────────────────────────────────────────────────────────────

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Appointment Slot Alert — setter.layline.live</title>
</head>
<body style="margin:0;padding:40px 16px 72px;background:#EEF1F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;color:#1A2B3C;-webkit-font-smoothing:antialiased;">

<div style="max-width:660px;margin:0 auto;">

  <!-- Header -->
  <div style="background:#0F1F2E;border-radius:10px 10px 0 0;padding:28px 32px 26px;display:flex;align-items:center;gap:18px;">
    <div style="width:44px;height:44px;background:${hasIssues ? '#C0392B' : '#16A34A'};border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:22px;line-height:1;">
      ${hasIssues ? '⚠' : '✓'}
    </div>
    <div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:normal;color:#FFFFFF;letter-spacing:-.2px;">
        ${hasIssues ? 'Duplicate Appointment Slots Detected' : 'No Duplicate Slots Found'}
      </div>
      <div style="margin-top:6px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.45);font-weight:500;">
        Production &mdash; setter.layline.live &nbsp;&bull;&nbsp; ${esc(RUN_DATE)}
      </div>
    </div>
  </div>

  <!-- Stats bar -->
  <div style="background:#FFFFFF;border-left:1px solid #DDE2E9;border-right:1px solid #DDE2E9;display:grid;grid-template-columns:repeat(3,1fr);">
    <div style="padding:20px 24px;border-right:1px solid #DDE2E9;">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#8A96A3;font-weight:600;">Clients Checked</div>
      <div style="font-size:32px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.1;margin-top:6px;color:#1A2B3C;">${totalChecked}</div>
    </div>
    <div style="padding:20px 24px;border-right:1px solid #DDE2E9;">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#8A96A3;font-weight:600;">With Duplicates</div>
      <div style="font-size:32px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.1;margin-top:6px;color:${hasIssues ? '#C0392B' : '#1A2B3C'};">${failures.length}</div>
    </div>
    <div style="padding:20px 24px;">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#8A96A3;font-weight:600;">No Issues</div>
      <div style="font-size:32px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.1;margin-top:6px;color:#16A34A;">${clientsOk}</div>
    </div>
  </div>

  <!-- Body -->
  <div style="background:#F5F7FA;border:1px solid #DDE2E9;border-top:2px solid ${hasIssues ? '#C0392B' : '#16A34A'};border-radius:0 0 10px 10px;padding:28px 32px 36px;">

    ${hasIssues ? `
    <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.2px;font-weight:700;color:#8A96A3;margin-bottom:14px;">Affected Clients</div>
    ${clientCards}
    ${clearRows ? `
    <div style="height:1px;background:#DDE2E9;margin:24px 0;"></div>
    <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.2px;font-weight:700;color:#8A96A3;margin-bottom:14px;">Clients with No Issues</div>
    <div style="background:#FFFFFF;border:1px solid #DDE2E9;border-radius:8px;overflow:hidden;">
      ${clearRows}
    </div>` : ''}

    <!-- Action Required -->
    <div style="background:#FFFBEB;border:1px solid #FCD34D;border-left:4px solid #F59E0B;border-radius:6px;padding:16px 18px;margin-top:24px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;color:#92400E;margin-bottom:7px;">Action Required</div>
      <div style="font-size:13px;color:#78350F;line-height:1.65;">
        Check Talend job logs and remove the duplicate slot records immediately to prevent patients from double-booking the same appointment time. Use the Slot IDs above to locate and delete the duplicate entries.
      </div>
    </div>` : allClearBody}

    <!-- Footer -->
    <div style="margin-top:28px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:12px;color:#A0ABBA;letter-spacing:.2px;">
      <div style="width:7px;height:7px;border-radius:50%;background:#16A34A;flex-shrink:0;"></div>
      Production slot checker runs automatically every 30 minutes
    </div>

  </div>

</div>

</body>
</html>`;

writeFileSync(outputFile, html);

if (failures.length === 0) {
    console.log(`All ${totalChecked} client(s) checked — no duplicate slots found.`);
} else {
    console.log(`\nDUPLICATE SLOTS DETECTED — ${failures.length} client(s) affected:\n`);
    for (const f of failures) {
        console.log(`  ${f.title || 'Unknown'} — ${Math.max(f.pairs.length, 1)} pair(s)`);
    }
    console.log(`\nReport written to: ${outputFile}`);
}
