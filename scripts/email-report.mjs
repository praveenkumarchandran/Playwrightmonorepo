/**
 * Playwright Test Email Report Generator
 *
 * Reads results.json from each project's artifact directory,
 * extracts pass/fail counts and failing test details,
 * and outputs an HTML email body to stdout.
 *
 * Usage: node scripts/email-report.mjs <artifacts-root-dir>
 *
 * Expected artifact structure:
 *   all-results/
 *     results-siny-medical/test-results/results.json
 *     results-clarus/test-results/results.json
 *     ...
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const RESULTS_ROOT = process.argv[2] || 'all-results';
const RUN_URL      = process.argv[3] || '';

// ── Collect all results.json files ────────────────────────────────────────────

function findFiles(dir, name, found = []) {
    if (!existsSync(dir)) return found;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) findFiles(full, name, found);
        else if (entry.name === name) found.push(full);
    }
    return found;
}

const resultFiles = findFiles(RESULTS_ROOT, 'results.json');

// ── Parse each results file ───────────────────────────────────────────────────

let totalPassed = 0, totalFailed = 0, totalSkipped = 0;
const clientRows   = [];
const failedTests  = [];

for (const file of resultFiles) {
    // Derive client name from artifact folder (e.g. results-siny-medical)
    const parts  = file.replace(/\\/g, '/').split('/');
    const artDir = parts.find(p => p.startsWith('results-')) || 'unknown';
    const client = artDir.replace('results-', '');

    let data;
    try { data = JSON.parse(readFileSync(file, 'utf-8')); }
    catch { continue; }

    const s = data.stats || {};
    const passed  = (s.expected  || 0);
    const failed  = (s.unexpected || 0);
    const skipped = (s.skipped   || 0);

    totalPassed  += passed;
    totalFailed  += failed;
    totalSkipped += skipped;

    clientRows.push({ client, passed, failed, skipped });

    // Walk the suite tree to collect failing tests
    function walk(suite, path = []) {
        const label = [...path, suite.title].filter(Boolean);
        for (const spec of (suite.specs || [])) {
            for (const test of (spec.tests || [])) {
                if (test.status === 'unexpected') {
                    const msg = test.results?.[0]?.error?.message ?? '';
                    failedTests.push({
                        client,
                        name: [...label, spec.title].filter(Boolean).join(' › '),
                        error: msg.split('\n')[0].substring(0, 250),
                    });
                }
            }
        }
        for (const sub of (suite.suites || [])) walk(sub, label);
    }
    for (const suite of (data.suites || [])) walk(suite);
}

// ── Build HTML ────────────────────────────────────────────────────────────────

const overall = totalFailed > 0 ? '❌ FAILED' : '✅ ALL PASSED';
const hdrColor = totalFailed > 0 ? '#c62828' : '#2e7d32';
const bgMain   = '#ffffff';
const mono     = 'font-family: Courier New, monospace;';

function cell(content, extra = '') {
    return `<td style="padding:8px 12px; border:1px solid #e0e0e0; ${extra}">${content}</td>`;
}
function hcell(content) {
    return `<th style="padding:8px 12px; border:1px solid #ccc; background:#f5f5f5; text-align:left;">${content}</th>`;
}

// Client summary table
let clientTable = `
<table style="border-collapse:collapse; width:100%; margin-bottom:24px;">
  <tr>${hcell('Client')}${hcell('✅ Passed')}${hcell('❌ Failed')}${hcell('⏭ Skipped')}</tr>`;

for (const r of clientRows.sort((a, b) => b.failed - a.failed)) {
    const bg    = r.failed > 0 ? '#fff3e0' : '#f1f8e9';
    const icon  = r.failed > 0 ? '❌' : '✅';
    const fc    = r.failed > 0 ? 'color:#c62828; font-weight:bold;' : 'color:#2e7d32;';
    clientTable += `
  <tr style="background:${bg};">
    ${cell(`${icon} ${r.client}`)}
    ${cell(r.passed,  'text-align:center; color:#2e7d32;')}
    ${cell(r.failed,  `text-align:center; ${fc}`)}
    ${cell(r.skipped, 'text-align:center; color:#757575;')}
  </tr>`;
}

// Totals row
const totFc = totalFailed > 0 ? 'color:#c62828;' : 'color:#2e7d32;';
clientTable += `
  <tr style="background:#f5f5f5; font-weight:bold;">
    ${cell('Total')}
    ${cell(totalPassed,  'text-align:center; color:#2e7d32;')}
    ${cell(totalFailed,  `text-align:center; ${totFc}`)}
    ${cell(totalSkipped, 'text-align:center; color:#757575;')}
  </tr>
</table>`;

// Failed tests table
let failedSection = '';
if (failedTests.length > 0) {
    failedSection = `
<h3 style="color:#c62828; margin-top:24px;">❌ Failed Tests (${failedTests.length})</h3>
<table style="border-collapse:collapse; width:100%; font-size:13px;">
  <tr>${hcell('Client')}${hcell('Test Name')}${hcell('Error')}</tr>`;

    for (const t of failedTests) {
        failedSection += `
  <tr style="background:#fff3e0;">
    ${cell(`<code style="${mono}">${t.client}</code>`)}
    ${cell(`<span style="${mono} font-size:12px;">${t.name}</span>`)}
    ${cell(`<span style="color:#c62828; ${mono} font-size:11px;">${t.error}</span>`)}
  </tr>`;
    }
    failedSection += '</table>';
}

// Assemble full email
const html = `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; background: ${bgMain}; padding: 20px;">

  <div style="background: ${hdrColor}; color: white; padding: 16px 20px; border-radius: 6px; margin-bottom: 24px;">
    <h2 style="margin:0; font-size: 20px;">Playwright E2E Tests — ${overall}</h2>
    <p style="margin:4px 0 0; font-size: 13px; opacity: 0.9;">
      Total: ${totalPassed + totalFailed + totalSkipped} tests &nbsp;|&nbsp;
      ✅ ${totalPassed} passed &nbsp;|&nbsp;
      ❌ ${totalFailed} failed &nbsp;|&nbsp;
      ⏭ ${totalSkipped} skipped
    </p>
  </div>

  <h3 style="margin-top:0;">Results by Client</h3>
  ${clientTable}

  ${failedSection}

  ${RUN_URL ? `<p style="margin-top:24px; font-size:13px; color:#555;">
    <a href="${RUN_URL}" style="color:#1565c0;">🔗 View full run on GitHub Actions</a>
  </p>` : ''}

</body>
</html>`;

process.stdout.write(html);
