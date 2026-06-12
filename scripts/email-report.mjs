/**
 * Playwright Test Email Report Generator
 *
 * Reads results.json from each project artifact directory,
 * extracts pass/fail counts and detailed failure information,
 * and outputs a professional HTML email body to stdout.
 *
 * Usage: node scripts/email-report.mjs <artifacts-root-dir> <run-url>
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';

const RESULTS_ROOT = process.argv[2] || 'all-results';
const RUN_URL      = process.argv[3] || '';
const RUN_DATE     = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short'
});

// ── File discovery ────────────────────────────────────────────────────────────

function findFiles(dir, name, found = []) {
    if (!existsSync(dir)) return found;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) findFiles(full, name, found);
        else if (entry.name === name) found.push(full);
    }
    return found;
}

// ── Error analysis helpers ────────────────────────────────────────────────────

function extractTestId(title) {
    const m = title.match(/TC[-–][A-Z0-9\-]+/i);
    return m ? m[0] : '';
}

function classifyError(msg) {
    if (/toBeVisible.*timeout|element.*not found|not.*visible/i.test(msg))
        return 'Element Not Visible';
    if (/waitForURL.*[Tt]imeout/i.test(msg))
        return 'Navigation Timeout';
    if (/waitForSelector.*[Tt]imeout|waitFor.*[Tt]imeout/i.test(msg))
        return 'Element Load Timeout';
    if (/fixture.*failed|insurancePage.*failed|patientPage.*failed/i.test(msg))
        return 'Test Setup Failure (Fixture)';
    if (/TimeoutError/i.test(msg))
        return 'Operation Timeout';
    if (/toBeEnabled/i.test(msg))
        return 'Element Not Enabled';
    if (/toHaveValue|toHaveText|toBe\(/i.test(msg))
        return 'Value Assertion Failed';
    return 'Test Assertion Failed';
}

function extractLocator(msg) {
    const m = msg.match(/Locator:\s*(.+?)(?:\n|$)/);
    return m ? m[1].trim() : null;
}

function extractUrl(msg) {
    const m = msg.match(/https?:\/\/[^\s\n"']+/);
    return m ? m[0] : null;
}

function extractFlow(msg) {
    const m = msg.match(/Flow:\s*(.+?)(?:\n|$)/);
    return m ? m[1].trim() : null;
}

function whatFailed(msg, testName) {
    const locator = extractLocator(msg);

    if (/toBeVisible/i.test(msg)) {
        const loc = locator ? `"${locator}"` : 'the expected element';
        return `The test verified that ${loc} is visible on the page. The element was not found within the configured timeout.`;
    }
    if (/waitForURL/i.test(msg)) {
        const urlMatch = msg.match(/waiting for.*?"([^"]+)"/);
        const target = urlMatch ? `"${urlMatch[1]}"` : 'the expected URL';
        return `The test waited for the page to navigate to ${target}. Navigation did not complete within the configured timeout.`;
    }
    if (/fixture.*failed|insurancePage.*failed/i.test(msg)) {
        const flow = extractFlow(msg);
        return `The test setup (fixture) failed during the booking flow${flow ? ` at step: ${flow}` : ''}. The test could not reach the target page before the test body ran.`;
    }
    if (/waitForSelector/i.test(msg)) {
        const sel = msg.match(/locator\('(.+?)'\)/)?.[1] || 'a required element';
        return `The test setup waited for "${sel}" to appear on the page. The element did not appear within the configured timeout.`;
    }
    if (/toBeEnabled/i.test(msg)) {
        return `The test verified that ${locator ? `"${locator}"` : 'a button'} is enabled and interactive. The element was found but remained disabled throughout the timeout.`;
    }
    if (/toHaveValue|toHaveText/i.test(msg)) {
        return `The test verified the value or text content of an element. The actual value did not match the expected value.`;
    }
    return 'The test assertion did not pass as expected. See the error details below for the specific condition that failed.';
}

function rootCause(msg, testName, client) {
    const lowerMsg  = msg.toLowerCase();
    const lowerName = testName.toLowerCase();

    if (/skip.*button|skip.*visible|skip.*navigate/i.test(testName)) {
        return 'The Skip button on the insurance page is admin-configured. It only appears when an administrator has enabled it for this client in the settings. The button was not present at the time of the test run.';
    }
    if (/appointment type.*skin problem|skin problem.*appointment/i.test(testName)) {
        return 'The appointment summary panel displays the type of the booked service. If "Skin Problem" slots were unavailable on stage, the booking fixture may have selected a different service, causing the panel to display different text (e.g. "New Patient" or "Routine Skin Screening").';
    }
    if (/appointment type.*cosmetic|cosmetic.*appointment/i.test(testName)) {
        return 'The SINY cosmetic flow displays "New Patient" as the appointment type in the summary panel, not the service reason. This is the expected behavior on stage for cosmetic bookings.';
    }
    if (/take picture/i.test(testName)) {
        return 'The "Take Picture of Card" button is only present on the stage insurance page. It does not appear on the production insurance page, which uses a simplified Self-pay and Next button flow instead.';
    }

    if (/fixture.*failed|insurancePage.*failed/i.test(msg)) {
        if (/intake/i.test(msg)) {
            return 'The stage server took longer than 10 seconds to render the intake page textarea. This is an intermittent slowness issue on the stage environment. The test is likely to pass on re-run when the server is under lighter load.';
        }
        return 'The test setup could not complete the booking flow. Common causes are: slow stage server response, no available appointment slots for the selected service, or an unexpected UI change in the booking flow.';
    }

    if (/waitForURL.*timeout/i.test(msg)) {
        if (/additionaldetails/i.test(msg)) {
            return 'The insurance page "Next" button was clicked but the browser did not navigate to the Add Info page within the timeout. This is commonly caused by the production server responding slowly under CI load. The test is likely to pass on re-run.';
        }
        return 'The page did not navigate to the expected URL within the configured timeout. This is commonly caused by high server load on the stage or production environment, a broken navigation flow, or a missing button click.';
    }

    if (/toBeVisible.*timeout|element.*not found/i.test(msg)) {
        if (/slot|time.*button|\d{1,2}:\d{2}/i.test(lowerName)) {
            return 'No appointment slots were available for the selected service and location at the time of the test run. Slot availability on stage varies and is not guaranteed. The test passes when slots are available.';
        }
        if (/provider/i.test(lowerName)) {
            return 'The provider dropdown did not populate within the timeout. This can happen when the stage API is slow to return provider data after a service is selected.';
        }
        return 'The element did not appear within the configured timeout. This is typically caused by the stage server responding slowly, a UI component taking longer to render under CI load, or the element being conditionally rendered based on data that was not yet available.';
    }

    if (/toBeEnabled/i.test(msg)) {
        return 'The element was found on the page but remained in a disabled state. This can happen when a preceding dropdown or selection has not fully updated the page state, or when the stage API call that enables the button has not completed.';
    }

    if (/special character|o\'brien/i.test(lowerName)) {
        return 'The input field may have a slower event cycle under CI load. The value was set but the assertion ran before the field fully updated in the React state.';
    }

    return 'The test encountered an unexpected condition on the page. This may be caused by a recent application change, environment-specific behavior, or intermittent server slowness. Check the error details and the page URL to identify the specific issue.';
}

// ── Parse results ─────────────────────────────────────────────────────────────

let totalPassed = 0, totalFailed = 0, totalSkipped = 0, totalFlaky = 0;
const clientRows  = [];
const failures    = [];

const resultFiles = findFiles(RESULTS_ROOT, 'results.json');

for (const file of resultFiles) {
    const parts  = file.replace(/\\/g, '/').split('/');
    const artDir = parts.find(p => p.startsWith('results-')) || 'unknown';
    const client = artDir.replace('results-', '');

    let data;
    try { data = JSON.parse(readFileSync(file, 'utf-8')); }
    catch { continue; }

    const s       = data.stats || {};
    const passed  = s.expected   || 0;
    const failed  = s.unexpected || 0;
    const skipped = s.skipped    || 0;
    const flaky   = s.flaky      || 0;
    const dur     = s.duration   || 0;

    totalPassed  += passed;
    totalFailed  += failed;
    totalSkipped += skipped;
    totalFlaky   += flaky;

    clientRows.push({ client, passed, failed, skipped, flaky, dur });

    function walk(suite, path = []) {
        const label = [...path, suite.title].filter(Boolean);
        for (const spec of (suite.specs || [])) {
            for (const test of (spec.tests || [])) {
                if (test.status !== 'unexpected') continue;
                const allResults = test.results || [];
                const firstFail  = allResults.find(r => r.status === 'failed') || allResults[0] || {};
                const err        = firstFail.error || {};
                const errMsg     = err.message || '';
                const loc        = err.location || {};
                const retries    = allResults.length - 1;
                const duration   = allResults.reduce((sum, r) => sum + (r.duration || 0), 0);
                const fullName   = [...label, spec.title].filter(Boolean).join(' › ');
                const section    = label.filter(Boolean).join(' › ');

                failures.push({
                    client,
                    testId:    extractTestId(spec.title),
                    testName:  spec.title,
                    section,
                    file:      loc.file   ? loc.file.replace(/\\/g, '/') : '',
                    line:      loc.line   || 0,
                    column:    loc.column || 0,
                    errorMsg,
                    errorType: classifyError(errMsg),
                    locator:   extractLocator(errMsg),
                    url:       extractUrl(errMsg),
                    flow:      extractFlow(errMsg),
                    retries,
                    duration,
                    whatFailed: whatFailed(errMsg, spec.title),
                    rootCause:  rootCause(errMsg, spec.title, client),
                });
            }
        }
        for (const sub of (suite.suites || [])) walk(sub, label);
    }

    for (const suite of (data.suites || [])) walk(suite);
}

// ── HTML helpers ──────────────────────────────────────────────────────────────

const esc = s => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const fmt = ms => ms >= 60_000
    ? `${(ms / 60_000).toFixed(1)} min`
    : `${(ms / 1_000).toFixed(1)} s`;

// ── Build HTML ────────────────────────────────────────────────────────────────

const overallStatus = totalFailed > 0 ? 'FAILED' : 'ALL TESTS PASSED';
const headerBg      = totalFailed > 0 ? '#b71c1c' : '#1b5e20';
const totalTests    = totalPassed + totalFailed + totalSkipped;

// Summary table rows
const summaryRows = clientRows
    .sort((a, b) => b.failed - a.failed)
    .map(r => {
        const status    = r.failed > 0 ? 'FAIL' : 'PASS';
        const statusBg  = r.failed > 0 ? '#fce4e4' : '#e8f5e9';
        const statusClr = r.failed > 0 ? '#b71c1c' : '#1b5e20';
        const failedClr = r.failed > 0 ? '#b71c1c' : '#333';
        return `
        <tr style="background:${statusBg}; border-bottom:1px solid #e0e0e0;">
          <td style="padding:10px 14px; font-weight:600; color:${statusClr};">${status}</td>
          <td style="padding:10px 14px; font-family:monospace;">${esc(r.client)}</td>
          <td style="padding:10px 14px; text-align:center;">${r.passed + r.failed + r.skipped}</td>
          <td style="padding:10px 14px; text-align:center; color:#1b5e20; font-weight:600;">${r.passed}</td>
          <td style="padding:10px 14px; text-align:center; color:${failedClr}; font-weight:600;">${r.failed}</td>
          <td style="padding:10px 14px; text-align:center; color:#555;">${r.skipped}</td>
          <td style="padding:10px 14px; text-align:center; color:#777;">${r.flaky > 0 ? r.flaky : '-'}</td>
        </tr>`;
    }).join('');

// Total row
const totalBg  = totalFailed > 0 ? '#fce4e4' : '#e8f5e9';
const totalClr = totalFailed > 0 ? '#b71c1c' : '#1b5e20';
const summaryTotals = `
    <tr style="background:${totalBg}; font-weight:700; border-top:2px solid #9e9e9e;">
      <td style="padding:10px 14px; color:${totalClr};">${totalFailed > 0 ? 'FAIL' : 'PASS'}</td>
      <td style="padding:10px 14px;">TOTAL</td>
      <td style="padding:10px 14px; text-align:center;">${totalTests}</td>
      <td style="padding:10px 14px; text-align:center; color:#1b5e20;">${totalPassed}</td>
      <td style="padding:10px 14px; text-align:center; color:${totalClr};">${totalFailed}</td>
      <td style="padding:10px 14px; text-align:center; color:#555;">${totalSkipped}</td>
      <td style="padding:10px 14px; text-align:center; color:#777;">${totalFlaky > 0 ? totalFlaky : '-'}</td>
    </tr>`;

// Failure detail cards
const failureCards = failures.map((f, i) => {
    const shortFile = f.file ? f.file.split('/').slice(-3).join('/') : '';
    const lineRef   = f.file && f.line ? `${shortFile}  :  Line ${f.line}` : 'Not available';

    const errorLines = f.errorMsg
        ? f.errorMsg.split('\n').slice(0, 6).map(esc).join('<br>')
        : 'No error message captured';

    const locatorRow = f.locator
        ? `<tr><td style="${labelStyle}">Locator</td><td style="${valStyle} font-family:monospace;">${esc(f.locator)}</td></tr>`
        : '';

    const urlRow = f.url
        ? `<tr><td style="${labelStyle}">Page URL</td><td style="${valStyle} font-family:monospace; word-break:break-all;">${esc(f.url)}</td></tr>`
        : '';

    const flowRow = f.flow
        ? `<tr><td style="${labelStyle}">Booking Flow</td><td style="${valStyle} font-family:monospace;">${esc(f.flow)}</td></tr>`
        : '';

    const retryRow = f.retries > 0
        ? `<tr><td style="${labelStyle}">Retries</td><td style="${valStyle}">Failed on all ${f.retries + 1} attempts</td></tr>`
        : `<tr><td style="${labelStyle}">Retries</td><td style="${valStyle}">No retry — failed on first attempt</td></tr>`;

    return `
    <div style="border:1px solid #d32f2f; border-left:5px solid #d32f2f; border-radius:4px;
                margin-bottom:28px; background:#ffffff; overflow:hidden;">

      <!-- Card header -->
      <div style="background:#d32f2f; color:#ffffff; padding:12px 18px;
                  font-family:Arial,sans-serif; font-size:13px;">
        <span style="font-weight:700; font-size:14px; letter-spacing:0.5px;">
          FAILURE ${i + 1} OF ${failures.length}
        </span>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <span style="font-weight:600;">${esc(f.testId || 'No ID')}</span>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <span style="opacity:0.9;">${esc(f.client)}</span>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <span style="opacity:0.9;">${fmt(f.duration)}</span>
      </div>

      <div style="padding:18px 20px;">

        <!-- Test identification -->
        <table style="border-collapse:collapse; width:100%; margin-bottom:16px;
                      font-family:Arial,sans-serif; font-size:13px;">
          <tr><td style="${labelStyle}">Test Name</td>
              <td style="${valStyle} font-weight:600;">${esc(f.testName)}</td></tr>
          <tr><td style="${labelStyle}">Suite</td>
              <td style="${valStyle} font-family:monospace;">${esc(f.client)}</td></tr>
          <tr><td style="${labelStyle}">Section</td>
              <td style="${valStyle}">${esc(f.section)}</td></tr>
          <tr><td style="${labelStyle}">Error Type</td>
              <td style="${valStyle} color:#b71c1c; font-weight:600;">${esc(f.errorType)}</td></tr>
          ${retryRow}
        </table>

        <!-- File location -->
        <div style="background:#f5f5f5; border:1px solid #e0e0e0; border-radius:3px;
                    padding:10px 14px; margin-bottom:16px; font-family:Arial,sans-serif; font-size:13px;">
          <div style="font-weight:700; color:#333; margin-bottom:6px; letter-spacing:0.3px;">
            FILE LOCATION
          </div>
          <table style="border-collapse:collapse; width:100%;">
            <tr><td style="${labelStyle}">File</td>
                <td style="${valStyle} font-family:monospace;">${esc(shortFile || 'Not available')}</td></tr>
            <tr><td style="${labelStyle}">Line</td>
                <td style="${valStyle} font-family:monospace;">${f.line > 0 ? f.line : 'Not available'}</td></tr>
            ${urlRow}
            ${flowRow}
          </table>
        </div>

        <!-- Error details -->
        <div style="background:#fff8f8; border:1px solid #f5c6c6; border-radius:3px;
                    padding:10px 14px; margin-bottom:16px; font-family:Arial,sans-serif; font-size:13px;">
          <div style="font-weight:700; color:#b71c1c; margin-bottom:8px; letter-spacing:0.3px;">
            ERROR DETAILS
          </div>
          <table style="border-collapse:collapse; width:100%; margin-bottom:10px;">
            ${locatorRow}
          </table>
          <div style="font-family:monospace; font-size:12px; color:#333;
                      background:#fff3f3; padding:8px 10px; border-radius:3px;
                      border-left:3px solid #d32f2f; line-height:1.6; white-space:pre-wrap;">
${errorLines}
          </div>
        </div>

        <!-- What failed -->
        <div style="background:#fff8e1; border:1px solid #ffe082; border-radius:3px;
                    padding:10px 14px; margin-bottom:16px; font-family:Arial,sans-serif; font-size:13px;">
          <div style="font-weight:700; color:#e65100; margin-bottom:6px; letter-spacing:0.3px;">
            WHAT FAILED
          </div>
          <div style="color:#333; line-height:1.6;">${esc(f.whatFailed)}</div>
        </div>

        <!-- Root cause -->
        <div style="background:#e8f5e9; border:1px solid #a5d6a7; border-radius:3px;
                    padding:10px 14px; font-family:Arial,sans-serif; font-size:13px;">
          <div style="font-weight:700; color:#1b5e20; margin-bottom:6px; letter-spacing:0.3px;">
            ROOT CAUSE
          </div>
          <div style="color:#333; line-height:1.6;">${esc(f.rootCause)}</div>
        </div>

      </div>
    </div>`;
}).join('');

const labelStyle = `padding:5px 12px 5px 0; color:#555; white-space:nowrap;
                    vertical-align:top; font-weight:600; min-width:110px;`;
const valStyle   = `padding:5px 0; color:#222;`;

const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Playwright Test Report</title></head>
<body style="margin:0; padding:0; background:#f0f0f0; font-family:Arial, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;">
<tr><td align="center" style="padding:24px 12px;">
<table width="700" cellpadding="0" cellspacing="0"
       style="background:#ffffff; border-radius:6px; overflow:hidden;
              box-shadow:0 2px 8px rgba(0,0,0,0.12);">

  <!-- Header -->
  <tr><td style="background:${headerBg}; padding:20px 28px;">
    <div style="color:#ffffff; font-size:18px; font-weight:700; letter-spacing:0.5px;">
      PLAYWRIGHT E2E TEST REPORT
    </div>
    <div style="color:rgba(255,255,255,0.85); font-size:13px; margin-top:6px;">
      ${overallStatus}
      &nbsp;&nbsp;|&nbsp;&nbsp;${RUN_DATE}
      ${RUN_URL ? `&nbsp;&nbsp;|&nbsp;&nbsp;<a href="${RUN_URL}"
        style="color:rgba(255,255,255,0.9); text-decoration:underline;">
        View Full Run on GitHub Actions</a>` : ''}
    </div>
  </td></tr>

  <!-- Summary metrics -->
  <tr><td style="background:#fafafa; border-bottom:1px solid #e0e0e0; padding:16px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:0 12px; border-right:1px solid #e0e0e0;">
        <div style="font-size:26px; font-weight:700; color:#333;">${totalTests}</div>
        <div style="font-size:11px; color:#777; letter-spacing:0.5px; text-transform:uppercase;">Total</div>
      </td>
      <td align="center" style="padding:0 12px; border-right:1px solid #e0e0e0;">
        <div style="font-size:26px; font-weight:700; color:#1b5e20;">${totalPassed}</div>
        <div style="font-size:11px; color:#777; letter-spacing:0.5px; text-transform:uppercase;">Passed</div>
      </td>
      <td align="center" style="padding:0 12px; border-right:1px solid #e0e0e0;">
        <div style="font-size:26px; font-weight:700; color:${totalFailed > 0 ? '#b71c1c' : '#333'};">
          ${totalFailed}
        </div>
        <div style="font-size:11px; color:#777; letter-spacing:0.5px; text-transform:uppercase;">Failed</div>
      </td>
      <td align="center" style="padding:0 12px; border-right:1px solid #e0e0e0;">
        <div style="font-size:26px; font-weight:700; color:#555;">${totalSkipped}</div>
        <div style="font-size:11px; color:#777; letter-spacing:0.5px; text-transform:uppercase;">Skipped</div>
      </td>
      <td align="center" style="padding:0 12px;">
        <div style="font-size:26px; font-weight:700; color:#e65100;">${totalFlaky}</div>
        <div style="font-size:11px; color:#777; letter-spacing:0.5px; text-transform:uppercase;">Flaky</div>
      </td>
    </tr>
    </table>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:24px 28px;">

    <!-- Results by client -->
    <div style="font-size:14px; font-weight:700; color:#333; margin-bottom:12px;
                letter-spacing:0.5px; text-transform:uppercase; border-bottom:2px solid #e0e0e0;
                padding-bottom:6px;">
      Results by Client
    </div>
    <table width="100%" cellpadding="0" cellspacing="0"
           style="border-collapse:collapse; font-size:13px; margin-bottom:28px;">
      <tr style="background:#eeeeee; border-bottom:2px solid #bdbdbd;">
        <th style="padding:9px 14px; text-align:left; font-weight:700; color:#333;">Status</th>
        <th style="padding:9px 14px; text-align:left; font-weight:700; color:#333;">Client</th>
        <th style="padding:9px 14px; text-align:center; font-weight:700; color:#333;">Total</th>
        <th style="padding:9px 14px; text-align:center; font-weight:700; color:#1b5e20;">Passed</th>
        <th style="padding:9px 14px; text-align:center; font-weight:700; color:#b71c1c;">Failed</th>
        <th style="padding:9px 14px; text-align:center; font-weight:700; color:#555;">Skipped</th>
        <th style="padding:9px 14px; text-align:center; font-weight:700; color:#e65100;">Flaky</th>
      </tr>
      ${summaryRows}
      ${summaryTotals}
    </table>

    ${failures.length > 0 ? `
    <!-- Failure details -->
    <div style="font-size:14px; font-weight:700; color:#b71c1c; margin-bottom:16px;
                letter-spacing:0.5px; text-transform:uppercase; border-bottom:2px solid #d32f2f;
                padding-bottom:6px;">
      Failure Details  (${failures.length} ${failures.length === 1 ? 'failure' : 'failures'})
    </div>
    ${failureCards}
    ` : `
    <div style="background:#e8f5e9; border:1px solid #a5d6a7; border-radius:4px;
                padding:18px 20px; text-align:center;">
      <div style="font-size:15px; font-weight:700; color:#1b5e20;">All tests passed successfully.</div>
      <div style="font-size:13px; color:#555; margin-top:4px;">
        No failures detected in this run.
      </div>
    </div>`}

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f5f5f5; border-top:1px solid #e0e0e0;
                 padding:14px 28px; text-align:center;">
    <div style="font-size:12px; color:#777;">
      Automated report generated by Playwright E2E Test Suite
      ${RUN_URL ? `&nbsp;&nbsp;|&nbsp;&nbsp;
        <a href="${RUN_URL}" style="color:#1565c0; text-decoration:none;">
          View Full Run on GitHub Actions
        </a>` : ''}
    </div>
  </td></tr>

</table>
</td></tr>
</table>

</body>
</html>`;

process.stdout.write(html);
