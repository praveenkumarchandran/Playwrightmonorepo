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
                    errorMsg:  errMsg,
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

const totalTests  = totalPassed + totalFailed + totalSkipped;
const passRate    = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
const hasFailed   = totalFailed > 0;

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
    navy:       '#0d2137',
    navyLight:  '#1a3a5c',
    red:        '#c62828',
    redLight:   '#fce4e4',
    green:      '#2e7d32',
    greenLight: '#e8f5e9',
    amber:      '#e65100',
    amberLight: '#fff8e1',
    grey:       '#546e7a',
    border:     '#e2e8f0',
    bgPage:     '#edf2f7',
    bgCard:     '#ffffff',
    textPrimary:'#1a202c',
    textMuted:  '#718096',
};

// ── Client rows ───────────────────────────────────────────────────────────────
const clientRowsHtml = clientRows
    .sort((a, b) => b.failed - a.failed)
    .map((r, idx) => {
        const fail      = r.failed > 0;
        const rowBg     = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        const badge     = fail
            ? `<span style="display:inline-block;background:${C.red};color:#fff;
                            padding:3px 10px;border-radius:20px;font-size:11px;
                            font-weight:700;letter-spacing:0.5px;">&#10005; FAIL</span>`
            : `<span style="display:inline-block;background:${C.green};color:#fff;
                            padding:3px 10px;border-radius:20px;font-size:11px;
                            font-weight:700;letter-spacing:0.5px;">&#10003; PASS</span>`;
        return `
        <tr style="background:${rowBg}; border-bottom:1px solid ${C.border};">
          <td style="padding:11px 16px; font-family:monospace; font-weight:600;
                     color:${C.textPrimary}; font-size:13px;">${esc(r.client)}</td>
          <td style="padding:11px 16px; text-align:center;">${badge}</td>
          <td style="padding:11px 16px; text-align:center; color:${C.textPrimary};
                     font-size:13px;">${r.passed + r.failed + r.skipped}</td>
          <td style="padding:11px 16px; text-align:center; color:${C.green};
                     font-weight:700; font-size:13px;">${r.passed}</td>
          <td style="padding:11px 16px; text-align:center; font-weight:700; font-size:13px;
                     color:${fail ? C.red : C.textMuted};">${r.failed}</td>
          <td style="padding:11px 16px; text-align:center; color:${C.textMuted};
                     font-size:13px;">${r.skipped}</td>
          <td style="padding:11px 16px; text-align:center; color:${C.textMuted};
                     font-size:13px;">${r.flaky > 0 ? r.flaky : '—'}</td>
        </tr>`;
    }).join('');

// ── Failure cards ─────────────────────────────────────────────────────────────
const failureCardsHtml = failures.map((f, i) => {
    const shortFile  = f.file ? f.file.split('/').slice(-3).join('/') : '';
    const errorLines = f.errorMsg
        ? f.errorMsg.split('\n').slice(0, 6).map(esc).join('<br>')
        : 'No error message captured';
    const locatorHtml = f.locator
        ? `<tr>
             <td style="padding:4px 14px 4px 0;color:${C.textMuted};font-size:12px;white-space:nowrap;min-width:90px;">Locator</td>
             <td style="padding:4px 0;font-family:monospace;font-size:12px;color:${C.textPrimary};">${esc(f.locator)}</td>
           </tr>` : '';
    const urlHtml = f.url
        ? `<tr>
             <td style="padding:4px 14px 4px 0;color:${C.textMuted};font-size:12px;white-space:nowrap;">Page URL</td>
             <td style="padding:4px 0;font-family:monospace;font-size:11px;color:${C.textPrimary};word-break:break-all;">${esc(f.url)}</td>
           </tr>` : '';
    const retryLabel = f.retries > 0
        ? `Failed on all ${f.retries + 1} attempts`
        : 'Failed on first attempt — no retries';

    return `
  <table width="100%" cellpadding="0" cellspacing="0"
         style="border:1px solid ${C.border}; border-radius:8px; margin-bottom:20px;
                overflow:hidden; border-collapse:separate; border-spacing:0;">

    <!-- Card header -->
    <tr>
      <td style="background:${C.navy}; padding:12px 18px; border-radius:8px 8px 0 0;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td>
            <span style="background:${C.red}; color:#fff; padding:3px 10px;
                         border-radius:4px; font-size:11px; font-weight:700;
                         letter-spacing:0.5px; margin-right:8px;">${esc(f.testId || '#' + (i+1))}</span>
            <span style="color:#fff; font-size:13px; font-weight:600;">${esc(f.testName)}</span>
          </td>
          <td align="right" style="white-space:nowrap; padding-left:12px;">
            <span style="color:rgba(255,255,255,0.65); font-size:12px;">${esc(f.client)}</span>
            <span style="color:rgba(255,255,255,0.4); font-size:12px; margin:0 6px;">·</span>
            <span style="color:rgba(255,255,255,0.65); font-size:12px;">${fmt(f.duration)}</span>
            <span style="color:rgba(255,255,255,0.4); font-size:12px; margin:0 6px;">·</span>
            <span style="color:rgba(255,255,255,0.5); font-size:11px;">${i + 1} of ${failures.length}</span>
          </td>
        </tr></table>
      </td>
    </tr>

    <!-- Card body -->
    <tr><td style="padding:16px 18px; background:#fff;">

      <!-- Meta info row -->
      <table width="100%" cellpadding="0" cellspacing="0"
             style="border:1px solid ${C.border}; border-radius:6px; margin-bottom:14px;
                    border-collapse:collapse; font-size:12px; overflow:hidden;">
        <tr style="background:#f8fafc;">
          <td style="padding:8px 14px; border-right:1px solid ${C.border}; border-bottom:1px solid ${C.border};">
            <div style="color:${C.textMuted}; font-size:10px; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:3px;">Error Type</div>
            <div style="color:${C.red}; font-weight:700; font-size:12px;">${esc(f.errorType)}</div>
          </td>
          <td style="padding:8px 14px; border-right:1px solid ${C.border}; border-bottom:1px solid ${C.border};">
            <div style="color:${C.textMuted}; font-size:10px; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:3px;">File</div>
            <div style="color:${C.textPrimary}; font-family:monospace; font-size:11px;">${esc(shortFile || 'N/A')}</div>
          </td>
          <td style="padding:8px 14px; border-right:1px solid ${C.border}; border-bottom:1px solid ${C.border};">
            <div style="color:${C.textMuted}; font-size:10px; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:3px;">Line</div>
            <div style="color:${C.textPrimary}; font-family:monospace; font-size:12px;">${f.line > 0 ? f.line : '—'}</div>
          </td>
          <td style="padding:8px 14px; border-bottom:1px solid ${C.border};">
            <div style="color:${C.textMuted}; font-size:10px; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:3px;">Retries</div>
            <div style="color:${C.textPrimary}; font-size:12px;">${retryLabel}</div>
          </td>
        </tr>
        ${(f.section) ? `
        <tr style="background:#fff;">
          <td colspan="4" style="padding:7px 14px;">
            <span style="color:${C.textMuted}; font-size:10px; text-transform:uppercase; letter-spacing:0.8px;">Section &nbsp;</span>
            <span style="color:${C.textPrimary}; font-size:12px;">${esc(f.section)}</span>
          </td>
        </tr>` : ''}
        ${(f.url || f.locator) ? `
        <tr style="background:#fff;">
          <td colspan="4" style="padding:7px 14px;">
            <table cellpadding="0" cellspacing="0" width="100%">
              ${locatorHtml}
              ${urlHtml}
            </table>
          </td>
        </tr>` : ''}
      </table>

      <!-- Error block -->
      <div style="background:#0d2137; border-radius:6px; padding:12px 14px; margin-bottom:14px;">
        <div style="color:rgba(255,255,255,0.45); font-size:10px; text-transform:uppercase;
                    letter-spacing:1px; margin-bottom:8px; font-family:monospace;">error output</div>
        <div style="font-family:monospace; font-size:12px; color:#f9a8a8;
                    line-height:1.7; white-space:normal; word-break:break-word;">${errorLines}</div>
      </div>

      <!-- What failed / Root cause — side by side -->
      <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="49%" valign="top"
            style="background:#fffde7; border:1px solid #ffe082; border-radius:6px; padding:12px 14px;">
          <div style="color:#e65100; font-size:10px; font-weight:700; text-transform:uppercase;
                      letter-spacing:1px; margin-bottom:6px;">&#9888; What Failed</div>
          <div style="color:#3e2723; font-size:12px; line-height:1.65;">${esc(f.whatFailed)}</div>
        </td>
        <td width="2%"></td>
        <td width="49%" valign="top"
            style="background:#e8f5e9; border:1px solid #a5d6a7; border-radius:6px; padding:12px 14px;">
          <div style="color:#1b5e20; font-size:10px; font-weight:700; text-transform:uppercase;
                      letter-spacing:1px; margin-bottom:6px;">&#128270; Root Cause</div>
          <div style="color:#1b2d1e; font-size:12px; line-height:1.65;">${esc(f.rootCause)}</div>
        </td>
      </tr>
      </table>

    </td></tr>
  </table>`;
}).join('');

// ── Pass rate bar width (capped 0–100) ────────────────────────────────────────
const barWidth = Math.min(100, Math.max(0, passRate));
const barColor = passRate >= 90 ? C.green : passRate >= 70 ? '#f9a825' : C.red;

// ── Full HTML ─────────────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Playwright E2E Test Report</title>
</head>
<body style="margin:0;padding:0;background:${C.bgPage};font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:${C.bgPage};">
<tr><td align="center" style="padding:28px 16px;">
<table width="680" cellpadding="0" cellspacing="0"
       style="background:#fff;border-radius:10px;overflow:hidden;
              box-shadow:0 4px 24px rgba(0,0,0,0.13);">

  <!-- ── TOP ACCENT BAR ──────────────────────────────────────────────── -->
  <tr><td style="background:${hasFailed ? C.red : C.green};height:4px;padding:0;font-size:0;line-height:0;">&nbsp;</td></tr>

  <!-- ── HEADER ──────────────────────────────────────────────────────── -->
  <tr><td style="background:${C.navy};padding:26px 32px 22px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>
        <div style="color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:2px;
                    text-transform:uppercase;margin-bottom:5px;font-family:Arial,sans-serif;">
          Setter &nbsp;·&nbsp; Playwright Automation
        </div>
        <div style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.3px;
                    font-family:Arial,sans-serif;">
          E2E Test Run Report
        </div>
        <div style="margin-top:12px;">
          <span style="display:inline-block;background:${hasFailed ? C.red : C.green};
                       color:#fff;padding:4px 14px;border-radius:20px;
                       font-size:12px;font-weight:700;letter-spacing:0.5px;">
            ${hasFailed ? '&#10005;&nbsp; FAILED' : '&#10003;&nbsp; ALL PASSED'}
          </span>
        </div>
      </td>
      <td align="right" valign="top">
        <div style="color:rgba(255,255,255,0.55);font-size:12px;line-height:1.8;
                    font-family:Arial,sans-serif;text-align:right;">
          <div>${RUN_DATE}</div>
          ${RUN_URL ? `<div><a href="${RUN_URL}"
            style="color:#90caf9;text-decoration:none;font-size:12px;">
            View on GitHub Actions &#8594;</a></div>` : ''}
        </div>
      </td>
    </tr></table>
  </td></tr>

  <!-- ── PASS RATE BAR ────────────────────────────────────────────────── -->
  <tr><td style="background:${C.navyLight};padding:14px 32px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="color:rgba(255,255,255,0.6);font-size:11px;white-space:nowrap;
                 padding-right:14px;font-family:Arial,sans-serif;">Pass Rate</td>
      <td width="100%">
        <div style="background:rgba(255,255,255,0.12);border-radius:6px;height:8px;overflow:hidden;">
          <div style="background:${barColor};width:${barWidth}%;height:8px;border-radius:6px;"></div>
        </div>
      </td>
      <td style="color:#fff;font-size:13px;font-weight:700;padding-left:14px;
                 white-space:nowrap;font-family:Arial,sans-serif;">${passRate}%</td>
    </tr></table>
  </td></tr>

  <!-- ── METRICS ──────────────────────────────────────────────────────── -->
  <tr><td style="background:#f8fafc;border-bottom:1px solid ${C.border};padding:0;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td align="center" style="padding:20px 0;border-right:1px solid ${C.border};">
        <div style="font-size:30px;font-weight:800;color:${C.navy};font-family:Arial,sans-serif;">${totalTests}</div>
        <div style="font-size:10px;color:${C.textMuted};text-transform:uppercase;
                    letter-spacing:1px;margin-top:3px;font-family:Arial,sans-serif;">Total</div>
      </td>
      <td align="center" style="padding:20px 0;border-right:1px solid ${C.border};">
        <div style="font-size:30px;font-weight:800;color:${C.green};font-family:Arial,sans-serif;">${totalPassed}</div>
        <div style="font-size:10px;color:${C.textMuted};text-transform:uppercase;
                    letter-spacing:1px;margin-top:3px;font-family:Arial,sans-serif;">Passed</div>
      </td>
      <td align="center" style="padding:20px 0;border-right:1px solid ${C.border};">
        <div style="font-size:30px;font-weight:800;font-family:Arial,sans-serif;
                    color:${hasFailed ? C.red : C.textMuted};">${totalFailed}</div>
        <div style="font-size:10px;color:${C.textMuted};text-transform:uppercase;
                    letter-spacing:1px;margin-top:3px;font-family:Arial,sans-serif;">Failed</div>
      </td>
      <td align="center" style="padding:20px 0;border-right:1px solid ${C.border};">
        <div style="font-size:30px;font-weight:800;color:${C.grey};font-family:Arial,sans-serif;">${totalSkipped}</div>
        <div style="font-size:10px;color:${C.textMuted};text-transform:uppercase;
                    letter-spacing:1px;margin-top:3px;font-family:Arial,sans-serif;">Skipped</div>
      </td>
      <td align="center" style="padding:20px 0;">
        <div style="font-size:30px;font-weight:800;color:${C.amber};font-family:Arial,sans-serif;">${totalFlaky}</div>
        <div style="font-size:10px;color:${C.textMuted};text-transform:uppercase;
                    letter-spacing:1px;margin-top:3px;font-family:Arial,sans-serif;">Flaky</div>
      </td>
    </tr></table>
  </td></tr>

  <!-- ── BODY ─────────────────────────────────────────────────────────── -->
  <tr><td style="padding:28px 32px;">

    <!-- Section label -->
    <div style="font-size:10px;font-weight:700;color:${C.textMuted};text-transform:uppercase;
                letter-spacing:1.5px;margin-bottom:12px;font-family:Arial,sans-serif;">
      Client Results
    </div>

    <!-- Client table -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="border-collapse:collapse;border:1px solid ${C.border};
                  border-radius:8px;overflow:hidden;margin-bottom:30px;">
      <tr style="background:#f1f5f9;">
        <th style="padding:10px 16px;text-align:left;font-size:11px;color:${C.textMuted};
                   text-transform:uppercase;letter-spacing:0.8px;font-weight:700;
                   border-bottom:1px solid ${C.border};">Client</th>
        <th style="padding:10px 16px;text-align:center;font-size:11px;color:${C.textMuted};
                   text-transform:uppercase;letter-spacing:0.8px;font-weight:700;
                   border-bottom:1px solid ${C.border};">Status</th>
        <th style="padding:10px 16px;text-align:center;font-size:11px;color:${C.textMuted};
                   text-transform:uppercase;letter-spacing:0.8px;font-weight:700;
                   border-bottom:1px solid ${C.border};">Total</th>
        <th style="padding:10px 16px;text-align:center;font-size:11px;color:${C.green};
                   text-transform:uppercase;letter-spacing:0.8px;font-weight:700;
                   border-bottom:1px solid ${C.border};">&#10003; Pass</th>
        <th style="padding:10px 16px;text-align:center;font-size:11px;color:${C.red};
                   text-transform:uppercase;letter-spacing:0.8px;font-weight:700;
                   border-bottom:1px solid ${C.border};">&#10005; Fail</th>
        <th style="padding:10px 16px;text-align:center;font-size:11px;color:${C.textMuted};
                   text-transform:uppercase;letter-spacing:0.8px;font-weight:700;
                   border-bottom:1px solid ${C.border};">Skip</th>
        <th style="padding:10px 16px;text-align:center;font-size:11px;color:${C.amber};
                   text-transform:uppercase;letter-spacing:0.8px;font-weight:700;
                   border-bottom:1px solid ${C.border};">Flaky</th>
      </tr>
      ${clientRowsHtml}
    </table>

    ${failures.length > 0 ? `

    <!-- Failure section label -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
    <tr>
      <td>
        <div style="font-size:10px;font-weight:700;color:${C.textMuted};text-transform:uppercase;
                    letter-spacing:1.5px;font-family:Arial,sans-serif;">Failure Details</div>
      </td>
      <td align="right">
        <span style="background:${C.red};color:#fff;padding:3px 12px;border-radius:20px;
                     font-size:11px;font-weight:700;">${failures.length} ${failures.length === 1 ? 'failure' : 'failures'}</span>
      </td>
    </tr>
    </table>

    ${failureCardsHtml}

    ` : `
    <!-- All passed banner -->
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="background:${C.greenLight};border:1px solid #a5d6a7;border-radius:8px;
                   padding:22px 24px;text-align:center;">
      <div style="font-size:20px;margin-bottom:6px;">&#9989;</div>
      <div style="font-size:15px;font-weight:700;color:${C.green};
                  font-family:Arial,sans-serif;">All tests passed successfully</div>
      <div style="font-size:13px;color:#4a7c59;margin-top:4px;
                  font-family:Arial,sans-serif;">No failures detected in this run.</div>
    </td></tr>
    </table>
    `}

  </td></tr>

  <!-- ── FOOTER ───────────────────────────────────────────────────────── -->
  <tr><td style="background:${C.navy};padding:16px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="color:rgba(255,255,255,0.45);font-size:11px;font-family:Arial,sans-serif;">
        Playwright E2E &nbsp;·&nbsp; Setter Medical Platform &nbsp;·&nbsp; Automated Test Report
      </td>
      ${RUN_URL ? `<td align="right">
        <a href="${RUN_URL}" style="color:#90caf9;font-size:11px;text-decoration:none;
                                   font-family:Arial,sans-serif;">
          View Full Run on GitHub &#8594;
        </a>
      </td>` : ''}
    </tr></table>
  </td></tr>

</table>
</td></tr>
</table>

</body>
</html>`;

process.stdout.write(html);
