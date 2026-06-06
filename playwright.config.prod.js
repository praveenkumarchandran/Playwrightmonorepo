/**
 * PRODUCTION config — duplicate slot checker only.
 *
 * Run:
 *   PowerShell:
 *     $env:SETTER_BASE_URL="https://setter.layline.live"
 *     npx playwright test --config=playwright.config.prod.js
 *
 *   Bash (CI):
 *     SETTER_BASE_URL=https://setter.layline.live npx playwright test --config=playwright.config.prod.js
 */

import { defineConfig } from '@playwright/test';

export default defineConfig({
    testMatch: '**/production/**/*.spec.js',

    timeout:  600_000,   // 10 min — SINY Cosmetic has 5 services × multiple locations
    workers:  4,        // 4 clients checked in parallel
    retries:  1,

    reporter: [
        ['list'],
        ['json', { outputFile: 'prod-results/results.json' }],
    ],

    use: {
        headless:          true,
        actionTimeout:     15_000,
        navigationTimeout: 60_000,
        screenshot:        'only-on-failure',
        trace:             'on-first-retry',
    },

    projects: [
        { name: 'prod-slot-check' },
    ],
});
