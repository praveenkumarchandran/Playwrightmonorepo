/**
 * Parses Playwright JSON results from the production slot checker
 * and generates an HTML email body listing the exact duplicate slots found.
 *
 * Usage: node scripts/slot-check-report.mjs <results-dir> <run-url>
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const resultsDir = process.argv[2] ?? 'prod-results';
const runUrl     = process.argv[3] ?? '';
const outputFile = process.argv[4] ?? 'slot-check-email.html';

const resultsFile = join(resultsDir, 'results.json');

if (!existsSync(resultsFile)) {
    const html = `<p>No results file found at ${resultsFile}. The test may have failed to start.</p>`;
    writeFileSync(outputFile, html);
    process.exit(0);
}

const results = JSON.parse(readFileSync(resultsFile, 'utf-8'));

// Collect all failed tests and their duplicate details
const failures = [];

function processTests(tests) {
    for (const test of tests ?? []) {
        if (test.status === 'failed' || test.status === 'unexpected') {
            const title   = test.title ?? '';
            const errors  = test.results?.flatMap(r => r.errors ?? []) ?? [];
            const message = errors.map(e => e.message ?? '').join('\n');

            // Extract duplicate lines from the error message
            const dupLines = message
                .split('\n')
                .filter(l => l.includes('Provider :') || l.includes('Location :') ||
                              l.includes('Service  :') || l.includes('Date/Time:') ||
                              l.includes('Duplicate:') || l.trim().startsWith('•'))
                .map(l => l.trim());

            if (dupLines.length > 0 || message.includes('Duplicate')) {
                failures.push({ title, dupLines, message });
            }
        }
    }
}

function processSuites(suites) {
    for (const suite of suites ?? []) {
        processTests(suite.tests);
        processSuites(suite.suites);
        processSuites(suite.specs?.flatMap(s => [s]) ?? []);
    }
}

for (const suite of results.suites ?? []) {
    processSuites([suite]);
    processTests(suite.tests);
}

// Also check top-level specs
for (const spec of results.suites?.flatMap(s => s.specs ?? []) ?? []) {
    for (const test of spec.tests ?? []) {
        if (test.status === 'failed' || test.status === 'unexpected') {
            const errors  = test.results?.flatMap(r => r.errors ?? []) ?? [];
            const message = errors.map(e => e.message ?? '').join('\n');
            const dupLines = message
                .split('\n')
                .filter(l => l.includes('Provider :') || l.includes('Location :') ||
                              l.includes('Service  :') || l.includes('Date/Time:') ||
                              l.includes('Duplicate:') || l.trim().startsWith('•'))
                .map(l => l.trim());
            if (dupLines.length > 0 || message.includes('Duplicate')) {
                failures.push({ title: spec.title, dupLines, message });
            }
        }
    }
}

const totalTests  = results.stats?.expected ?? 0;
const totalFailed = failures.length;

const affectedNames = failures.map(f => f.title.replace(/\[|\]/g, '').replace(/No duplicate slots.*$/i, '').trim());

// Build HTML
let html = `
<div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto">

  <!-- Header -->
  <div style="background:#c0392b;color:white;padding:20px;border-radius:8px 8px 0 0">
    <h2 style="margin:0;font-size:20px">⚠️ Duplicate Appointment Slots Detected</h2>
    <p style="margin:6px 0 0;opacity:0.9">Production — setter.layline.live</p>
  </div>

  <!-- Summary -->
  <div style="background:#fff5f5;border:1px solid #e74c3c;padding:16px;border-top:none">
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:6px 12px;color:#666">Clients checked</td>
        <td style="padding:6px 12px;font-weight:bold">${totalTests}</td>
      </tr>
      <tr style="background:#fdf0f0">
        <td style="padding:6px 12px;color:#666">Clients with duplicates</td>
        <td style="padding:6px 12px;font-weight:bold;color:#c0392b">${totalFailed}</td>
      </tr>
      ${affectedNames.length > 0 ? `
      <tr>
        <td style="padding:6px 12px;color:#666;vertical-align:top">Affected clients</td>
        <td style="padding:6px 12px">
          ${affectedNames.map(n => `<span style="display:inline-block;background:#c0392b;color:white;border-radius:4px;padding:2px 8px;margin:2px 4px 2px 0;font-size:12px;font-weight:bold">${n}</span>`).join('')}
        </td>
      </tr>` : ''}
    </table>
  </div>
`;

// Duplicate details per client
for (const { title, dupLines, message } of failures) {
    // Extract bullet-point duplicates from error message
    const bullets = message.split('\n').filter(l => l.trim().startsWith('•'));

    html += `
  <!-- Client failure -->
  <div style="margin-top:16px;border:1px solid #e74c3c;border-radius:6px;overflow:hidden">
    <div style="background:#e74c3c;color:white;padding:10px 16px;font-weight:bold">
      ${title.replace(/\[|\]/g, '')}
    </div>
    <div style="padding:12px 16px;background:white">
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr style="background:#f8f8f8">
          <th style="padding:6px 10px;text-align:left;border-bottom:1px solid #ddd">Duplicate Slot</th>
        </tr>
`;

    if (bullets.length > 0) {
        for (const b of bullets) {
            html += `
        <tr>
          <td style="padding:6px 10px;border-bottom:1px solid #f0f0f0;font-family:monospace;font-size:12px">${b.replace('•', '').trim()}</td>
        </tr>`;
        }
    } else if (dupLines.length > 0) {
        html += `
        <tr>
          <td style="padding:6px 10px;font-family:monospace;font-size:12px;white-space:pre-wrap">${dupLines.join('\n')}</td>
        </tr>`;
    }

    html += `
      </table>
    </div>
  </div>
`;
}

// Footer
html += `
  <!-- Action -->
  <div style="margin-top:20px;padding:16px;background:#f9f9f9;border-radius:6px;border:1px solid #ddd">
    <p style="margin:0 0 8px;font-weight:bold">Action Required</p>
    <p style="margin:0;color:#555;font-size:13px">
      Check Talend job logs and remove the duplicate slot records immediately
      to prevent patients from double-booking the same appointment time.
    </p>
  </div>

  ${runUrl ? `
  <div style="margin-top:16px;text-align:center">
    <a href="${runUrl}"
       style="background:#2980b9;color:white;padding:10px 24px;text-decoration:none;border-radius:4px;font-weight:bold;display:inline-block">
      View Full Test Report on GitHub
    </a>
  </div>` : ''}

  <p style="color:#aaa;font-size:11px;margin-top:20px;text-align:center">
    Production slot checker runs every 30 minutes automatically
  </p>

</div>
`;

writeFileSync(outputFile, html);

if (failures.length === 0) {
    console.log(`✅ No duplicate slots found across all ${totalTests} client(s).`);
} else {
    console.log(`\n⚠️  DUPLICATE SLOTS DETECTED — ${failures.length} client(s) affected:\n`);
    for (const name of affectedNames) {
        console.log(`  ❌  ${name}`);
    }
    console.log(`\nEmail report written to ${outputFile}`);
}
