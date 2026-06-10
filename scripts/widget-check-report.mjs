/**
 * Parses Playwright JSON results from the widget production checker
 * and generates an HTML email body.
 *
 * Usage: node scripts/widget-check-report.mjs <results-dir> <run-url> <output-file>
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const resultsDir = process.argv[2] ?? 'prod-results';
const runUrl     = process.argv[3] ?? '';
const outputFile = process.argv[4] ?? 'widget-check-email.html';

const resultsFile = join(resultsDir, 'widget-results.json');

if (!existsSync(resultsFile)) {
    writeFileSync(outputFile, `<p>No results file found at ${resultsFile}. The test may have failed to start.</p>`);
    process.exit(0);
}

const results = JSON.parse(readFileSync(resultsFile, 'utf-8'));

const totalTests  = results.stats?.expected ?? 0;
const totalFailed = results.stats?.unexpected ?? 0;
const totalPassed = results.stats?.expected - totalFailed;

// Collect failures
const failures = [];
function processTests(tests) {
    for (const test of tests ?? []) {
        if (test.status === 'failed' || test.status === 'unexpected') {
            failures.push({ title: test.title ?? '' });
        }
    }
}
function processSuites(suites) {
    for (const suite of suites ?? []) {
        processTests(suite.tests);
        processSuites(suite.suites);
    }
}
for (const suite of results.suites ?? []) {
    processSuites([suite]);
    processTests(suite.tests);
}

const failedNames = [...new Set(failures.map(f => f.title.replace(/No .*$/i, '').trim()))];

const statusColor = totalFailed === 0 ? '#27ae60' : '#c0392b';
const statusIcon  = totalFailed === 0 ? '✅' : '⚠️';
const statusText  = totalFailed === 0 ? 'All Widget Tests Passed' : 'Widget Tests Failed';

const html = `
<div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto">

  <div style="background:${statusColor};color:white;padding:20px;border-radius:8px 8px 0 0">
    <h2 style="margin:0;font-size:20px">${statusIcon} SINY Widget — ${statusText}</h2>
    <p style="margin:6px 0 0;opacity:0.9">Production — setter.layline.live</p>
  </div>

  <div style="background:#f9f9f9;border:1px solid #ddd;padding:16px;border-top:none">
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:6px 12px;color:#666">Total tests</td>
        <td style="padding:6px 12px;font-weight:bold">${totalTests}</td>
      </tr>
      <tr style="background:#f0fff0">
        <td style="padding:6px 12px;color:#666">Passed</td>
        <td style="padding:6px 12px;font-weight:bold;color:#27ae60">${totalPassed}</td>
      </tr>
      ${totalFailed > 0 ? `
      <tr style="background:#fff0f0">
        <td style="padding:6px 12px;color:#666">Failed</td>
        <td style="padding:6px 12px;font-weight:bold;color:#c0392b">${totalFailed}</td>
      </tr>` : ''}
      ${failedNames.length > 0 ? `
      <tr>
        <td style="padding:6px 12px;color:#666;vertical-align:top">Failed tests</td>
        <td style="padding:6px 12px">
          ${failedNames.map(n => `<span style="display:block;margin:2px 0;color:#c0392b;font-size:13px">• ${n}</span>`).join('')}
        </td>
      </tr>` : ''}
    </table>
  </div>

  ${runUrl ? `
  <div style="margin-top:16px;text-align:center">
    <a href="${runUrl}"
       style="background:#2980b9;color:white;padding:10px 24px;text-decoration:none;border-radius:4px;font-weight:bold;display:inline-block">
      View Full Test Report on GitHub
    </a>
  </div>` : ''}

  <p style="color:#aaa;font-size:11px;margin-top:20px;text-align:center">
    SINY Widget production check runs daily automatically
  </p>

</div>
`;

writeFileSync(outputFile, html);
console.log(`Widget report written to ${outputFile} — ${totalFailed} failed, ${totalPassed} passed`);
