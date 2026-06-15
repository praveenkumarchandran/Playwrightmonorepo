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

const headerBg = failures.length > 0 ? '#b71c1c' : '#1b5e20';
const status   = failures.length > 0 ? 'DUPLICATE APPOINTMENT SLOTS DETECTED' : 'NO DUPLICATE SLOTS FOUND';

// Summary block
const summaryBlock = `
<table width="100%" cellpadding="0" cellspacing="0"
       style="border-collapse:collapse; font-size:13px; font-family:Arial,sans-serif;">
  <tr style="background:#fafafa;">
    <td style="padding:8px 16px; color:#555; font-weight:600; width:200px; border-bottom:1px solid #e8e8e8;">Run Time</td>
    <td style="padding:8px 16px; color:#222; border-bottom:1px solid #e8e8e8;">${esc(RUN_DATE)}</td>
  </tr>
  <tr>
    <td style="padding:8px 16px; color:#555; font-weight:600; border-bottom:1px solid #e8e8e8;">Check ID</td>
    <td style="padding:8px 16px; color:#222; font-family:monospace; border-bottom:1px solid #e8e8e8;">${esc(checkId)}</td>
  </tr>
  <tr style="background:#fafafa;">
    <td style="padding:8px 16px; color:#555; font-weight:600; border-bottom:1px solid #e8e8e8;">Total Clients Checked</td>
    <td style="padding:8px 16px; color:#222; border-bottom:1px solid #e8e8e8;">${totalChecked}</td>
  </tr>
  <tr>
    <td style="padding:8px 16px; color:#555; font-weight:600; border-bottom:1px solid #e8e8e8;">Clients Affected</td>
    <td style="padding:8px 16px; font-weight:700; color:${failures.length > 0 ? '#b71c1c' : '#1b5e20'}; border-bottom:1px solid #e8e8e8;">
      ${failures.length}
    </td>
  </tr>
  <tr style="background:#fafafa;">
    <td style="padding:8px 16px; color:#555; font-weight:600;">Total Duplicate Pairs</td>
    <td style="padding:8px 16px; font-weight:700; color:${totalPairs > 0 ? '#b71c1c' : '#1b5e20'};">
      ${totalPairs}
    </td>
  </tr>
</table>`;

// Client sections
const clientSections = failures.map((f, i) => {
    const pairCount = Math.max(f.pairs.length, 1);

    const metaRows = [
        f.location ? `<tr><td style="padding:6px 16px; color:#555; font-weight:600; width:120px; border-bottom:1px solid #f0f0f0;">Location</td><td style="padding:6px 16px; color:#222; border-bottom:1px solid #f0f0f0;">${esc(f.location)}</td></tr>` : '',
        f.service  ? `<tr style="background:#fafafa;"><td style="padding:6px 16px; color:#555; font-weight:600; border-bottom:1px solid #f0f0f0;">Service</td><td style="padding:6px 16px; color:#222; border-bottom:1px solid #f0f0f0;">${esc(f.service)}</td></tr>` : '',
        f.provider ? `<tr><td style="padding:6px 16px; color:#555; font-weight:600; border-bottom:1px solid #f0f0f0;">Provider</td><td style="padding:6px 16px; color:#222; border-bottom:1px solid #f0f0f0;">${esc(f.provider)}</td></tr>` : '',
        `<tr style="background:#fff3f3;"><td style="padding:6px 16px; color:#555; font-weight:600;">Duplicates Found</td><td style="padding:6px 16px; color:#b71c1c; font-weight:700;">${pairCount} ${pairCount === 1 ? 'pair' : 'pairs'}</td></tr>`,
    ].filter(Boolean).join('');

    const slotRows = f.pairs.length > 0
        ? f.pairs.map((p, j) => {
            const dt   = p['date/time'] ?? p['datetime'] ?? null;
            const ids  = p['appointmentid'] ?? p['duplicate'] ?? p['appointmenttypeid'] ?? null;
            const by   = p['bookedby'] ?? null;
            const raw  = p['raw'] ?? null;

            return `
      <tr style="background:#fffafa;">
        <td colspan="2" style="padding:4px 16px 0;">
          <div style="font-size:11px; font-weight:700; color:#888; letter-spacing:0.5px;
                      padding-top:10px; border-top:1px dashed #e0e0e0;">
            SLOT ${j + 1} OF ${pairCount}
          </div>
        </td>
      </tr>
      ${dt  ? `<tr><td style="padding:5px 16px 5px 28px; color:#555; font-weight:600; font-size:13px; width:120px;">Date &amp; Time</td><td style="padding:5px 16px; color:#222; font-size:13px; font-weight:600;">${esc(dt)}</td></tr>` : ''}
      ${ids ? `<tr style="background:#fff8f8;"><td style="padding:5px 16px 5px 28px; color:#555; font-weight:600; font-size:13px;">Appointment IDs</td><td style="padding:5px 16px; font-family:monospace; color:#b71c1c; font-size:13px;">${esc(ids)}</td></tr>` : ''}
      <tr><td style="padding:5px 16px 5px 28px; color:#555; font-weight:600; font-size:13px;">Issue</td><td style="padding:5px 16px; color:#b71c1c; font-size:13px;">Same provider booked for same date/time twice</td></tr>
      ${by  ? `<tr style="background:#fff8f8;"><td style="padding:5px 16px 5px 28px; color:#555; font-weight:600; font-size:13px;">Booked By</td><td style="padding:5px 16px; color:#222; font-size:13px;">${esc(by)}</td></tr>` : ''}
      ${!dt && raw ? `<tr><td colspan="2" style="padding:5px 16px 5px 28px; font-family:monospace; font-size:12px; color:#444;">${esc(raw)}</td></tr>` : ''}`;
        }).join('')
        : `<tr><td colspan="2" style="padding:10px 16px; font-family:monospace; font-size:12px;
             color:#555; white-space:pre-wrap;">${esc(f.raw.substring(0, 600))}</td></tr>`;

    return `
  <!-- Client ${i + 1} -->
  <div style="margin-bottom:24px; border:1px solid #d0d0d0; border-top:3px solid #b71c1c;
              border-radius:4px; overflow:hidden; font-family:Arial,sans-serif;">

    <!-- Client title bar -->
    <div style="background:#f5f5f5; padding:10px 16px; border-bottom:1px solid #d0d0d0;">
      <span style="font-size:11px; color:#888; letter-spacing:0.5px;">CLIENT ${i + 1} OF ${failures.length}</span>
      <span style="font-size:15px; font-weight:700; color:#222; margin-left:10px;">${esc(f.title || 'Unknown Client')}</span>
    </div>

    <!-- Meta info -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="border-collapse:collapse; font-size:13px; border-bottom:1px solid #e0e0e0;">
      ${metaRows}
    </table>

    <!-- Duplicate slots -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${slotRows}
    </table>

    <!-- Action required -->
    <div style="background:#fff8e1; border-top:1px solid #ffe082; padding:10px 16px;">
      <span style="font-weight:700; color:#e65100; font-size:13px;">ACTION REQUIRED</span>
      <span style="color:#333; font-size:13px; margin-left:8px;">
        Contact <strong>${esc(f.title || 'the client')}</strong> administrator to resolve
        ${pairCount} overlapping appointment${pairCount !== 1 ? 's' : ''} immediately.
      </span>
    </div>
  </div>`;
}).join('');

// All-clear card
const allClear = failures.length === 0 ? `
  <div style="background:#e8f5e9; border:1px solid #a5d6a7; border-radius:4px;
              padding:20px; text-align:center; font-family:Arial,sans-serif;">
    <div style="font-size:15px; font-weight:700; color:#1b5e20;">All ${totalChecked} clients checked — no duplicate slots found.</div>
    <div style="font-size:13px; color:#555; margin-top:4px;">System is operating normally.</div>
  </div>` : '';

const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Slot Duplicate Check</title></head>
<body style="margin:0; padding:0; background:#eeeeee; font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#eeeeee;">
<tr><td align="center" style="padding:24px 12px;">
<table width="660" cellpadding="0" cellspacing="0"
       style="background:#ffffff; border-radius:5px; overflow:hidden;
              box-shadow:0 2px 6px rgba(0,0,0,0.10);">

  <!-- Header -->
  <tr>
    <td style="background:${headerBg}; padding:18px 24px;">
      <div style="color:#fff; font-size:16px; font-weight:700; letter-spacing:0.5px;">
        ${status}
      </div>
      <div style="color:rgba(255,255,255,0.80); font-size:12px; margin-top:5px;">
        Production Slot Integrity Check &nbsp;|&nbsp; setter.layline.live
      </div>
    </td>
  </tr>

  <!-- Summary -->
  <tr>
    <td style="border-bottom:2px solid #e0e0e0;">
      <div style="padding:14px 24px 6px; font-size:11px; font-weight:700;
                  color:#888; letter-spacing:1px; text-transform:uppercase;">
        Summary
      </div>
      <div style="padding:0 24px 14px;">
        ${summaryBlock}
      </div>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:20px 24px;">
      ${allClear}
      ${clientSections}

      ${runUrl ? `
      <div style="text-align:center; margin-top:8px; padding-top:16px; border-top:1px solid #e0e0e0;">
        <a href="${runUrl}"
           style="display:inline-block; background:#1565c0; color:#ffffff;
                  padding:9px 26px; border-radius:4px; text-decoration:none;
                  font-size:13px; font-weight:600;">
          View Full Run on GitHub Actions
        </a>
      </div>` : ''}
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#f5f5f5; border-top:1px solid #e0e0e0;
               padding:10px 24px; text-align:center;">
      <div style="font-size:11px; color:#aaa;">
        Automated check runs every 30 minutes &nbsp;|&nbsp; Playwright &nbsp;|&nbsp; GitHub Actions
      </div>
    </td>
  </tr>

</table>
</td></tr>
</table>

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
