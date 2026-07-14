/**
 * TEST CONTEXT UTILITIES
 *
 * Provides standardised console output so every test failure immediately shows:
 *  - Which client / URL / service failed
 *  - What step was being executed
 *  - What was expected vs what happened
 *  - Where to look for the root cause
 *
 * Usage in shared cases files:
 *   import { step, failMsg } from '../../utils/testContext.js';
 *
 *   test('TC-INS-13 — ...', async ({ insurancePage }) => {
 *       step('Selecting Self-pay insurance type');
 *       await insurancePage.selectSelfPay();
 *
 *       step('Clicking Continue to navigate to patient info');
 *       await insurancePage.continue();
 *
 *       await expect(insurancePage.page,
 *           failMsg('TC-INS-13', 'After Self-pay + Continue, URL must contain patientinfo.',
 *               'Root cause: Continue button may be disabled or server navigation timed out.',
 *               'Check: InsurancePage.continue() | insurance.cases.js:360')
 *       ).toHaveURL(/patientinfo|additionaldetails/i, { timeout: 30_000 });
 *   });
 */

/**
 * Log a test step to the console — shows progress through the test.
 * Makes it easy to see HOW FAR the test got before failing.
 *
 * @param {string} description - what this step does
 */
export function step(description) {
    console.log(`  → ${description}`);
}

/**
 * Build a clear failure message for expect() calls.
 * When the assertion fails, Playwright shows this message in the output.
 *
 * @param {string} testId     - e.g. "TC-INS-13"
 * @param {string} what       - what was being checked
 * @param {string} rootCause  - why it might fail + what to check
 * @param {string} where      - file:line or method name to investigate
 * @returns {string}
 */
export function failMsg(testId, what, rootCause, where) {
    return [
        `\n  ❌ ${testId} — ${what}`,
        `     Root cause : ${rootCause}`,
        `     Where      : ${where}`,
    ].join('\n');
}

/**
 * Print a section header before a group of related tests.
 * Helps separate test groups in long console output.
 *
 * @param {string} section - e.g. "Insurance type variants"
 */
export function sectionHeader(section) {
    console.log(`\n  ── ${section} ${'─'.repeat(Math.max(0, 44 - section.length))}`);
}
