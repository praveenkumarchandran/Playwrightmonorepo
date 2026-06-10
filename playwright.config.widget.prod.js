/**
 * SINY Widget — Production config
 *
 * Runs widget tests against production: setter.layline.live
 * Safe tests only — no actual bookings are submitted (Book Now is never clicked).
 *
 * Run manually:
 *   npx playwright test --config=playwright.config.widget.prod.js
 *
 * CI: runs automatically via .github/workflows/widget-check.yaml
 */

import { defineConfig } from '@playwright/test';

// Always force production URL when this config is used — overrides .env file
process.env.SETTER_BASE_URL = 'https://setter.layline.live';

export default defineConfig({
    testMatch: '**/widget/sinyWidget.spec.js',

    timeout:  240_000,   // 4 min per test — prod may be slower than staging
    workers:  2,
    retries:  1,
    fullyParallel: true,

    reporter: [
        ['list'],
        ['json', { outputFile: 'prod-results/widget-results.json' }],
    ],

    use: {
        headless:          true,
        actionTimeout:     20_000,
        navigationTimeout: 60_000,
        screenshot:        'only-on-failure',
        trace:             'on-first-retry',
    },

    projects: [
        { name: 'prod-widget-check' },
    ],
});
