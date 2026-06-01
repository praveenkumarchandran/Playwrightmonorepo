import { defineConfig } from '@playwright/test';

export default defineConfig({
    globalSetup: './global-setup.js',

    reporter: [
        ['list'],
        ['allure-playwright']
    ],

    timeout: 30000,

    use: {
        baseURL: 'https://stage.setter.layline.live',
        headless: true,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        // video: 'retain-on-failure',
    },

    projects: [

        // ── Booking setup — runs ONLY before booking tests ────────────────────
        {
            name: 'booking-setup',
            testDir: './tests/e2e/booking/setup',
            testMatch: /TNDIBooking\.setup\.js/,
        },

        // ── Booking tests — depend on booking-setup ───────────────────────────
        {
            name: 'booking',
            testDir: './tests/e2e/booking',
            testIgnore: [/setup/, /ClarusDerm/],
            dependencies: ['booking-setup'],
            timeout: 120_000,
            workers: 1,
            use: {
                storageState: 'tests/.auth/booking-state.json',
            },
        },

        // ── Clarus tests — no setup, fixture handles full flow ────────────────
        {
            name: 'clarus',
            testDir: './tests/e2e/booking/ClarusDerm',
        },

        // ── Admin tests — NO dependency on booking-setup ─────────────────────
        {
            name: 'admin',
            testDir: './tests/e2e/admin',
            use: {
                storageState: 'tests/.auth/admin-state.json',
            },
        },

        // ── Other tests — no setup dependency ────────────────────────────────
        {
            name: 'general',
            testDir: './tests/e2e/general',
        },
    ],

    webServer: {
        command: 'npm run dev --prefix frontend',
        url: 'https://stage.setter.layline.live',
        reuseExistingServer: !process.env.CI,
    },
});