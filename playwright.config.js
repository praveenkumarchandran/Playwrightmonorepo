import { defineConfig } from '@playwright/test';

export default defineConfig({
    globalSetup: './global-setup.js',

    reporter: [
        ['list'],
        ['allure-playwright'],
    ],

    // Global test timeout — individual steps have their own timeouts via waitFor / expect.
    timeout: 30_000,

    expect: {
        // Default assertion timeout — kept short to catch flaky locators fast.
        timeout: 8_000,
    },

    use: {
        baseURL: 'https://stage.setter.layline.live',
        headless: true,

        // Action timeout: how long a single click/fill/press can take.
        actionTimeout: 15_000,
        // Navigation timeout: how long page.goto / waitForNavigation can take.
        navigationTimeout: 45_000,

        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        // video: 'retain-on-failure',
    },

    projects: [

        // ── TNDI ─────────────────────────────────────────────────────────────
        // Full flow: Landing → Slot → Intake → Insurance → PatientInfo
        {
            name: 'tndi',
            testDir: './tests/e2e/clients/TNDI',
            timeout: 120_000,
            workers: 1,
        },

        // ── Clarus Dermatology ────────────────────────────────────────────────
        // Flow: Landing → SlotFilter → Slot → Insurance → PatientInfo (no intake)
        {
            name: 'clarus',
            testDir: './tests/e2e/clients/ClarusDerm',
            timeout: 120_000,
        },

        // ── SINY Dermatology (Medical) ────────────────────────────────────────
        // Unique: Landing → SlotFilter → Intake → Slot → Insurance → PatientInfo
        {
            name: 'siny-medical',
            testDir: './tests/e2e/clients/SINY',
            testMatch: /medical\.spec\.js/,
            timeout: 120_000,
            workers: 2,  // 2 parallel workers — each runs its own booking session
        },

        // ── SINY Dermatology (Cosmetic) ───────────────────────────────────────
        // Flow: Landing → SlotFilter → Intake → Slot → PatientInfo (no insurance)
        {
            name: 'siny-cosmetic',
            testDir: './tests/e2e/clients/SINY',
            testMatch: /cosmetic\.spec\.js/,
            timeout: 120_000,
            workers: 2,
        },

        // ── Hopemark Health ───────────────────────────────────────────────────
        // Flow: Landing → SlotFilter → Slot → Intake → Insurance → PatientInfo
        {
            name: 'hopemark',
            testDir: './tests/e2e/clients/Hopemark',
            timeout: 120_000,
            workers: 1,
        },

        // ── Freedman ENT ──────────────────────────────────────────────────────
        // Flow: Landing → SlotFilter → Slot → Insurance → PatientInfo (no intake)
        {
            name: 'freedman',
            testDir: './tests/e2e/clients/Freedman',
            timeout: 120_000,
        },

        // ── Kronson Vein Institute ─────────────────────────────────────────────
        // Flow: Landing → SlotFilter → Slot → Intake → Insurance → PatientInfo
        {
            name: 'kronson',
            testDir: './tests/e2e/clients/Kronson',
            timeout: 120_000,
            workers: 1,
        },

        // ── CVD ───────────────────────────────────────────────────────────────
        // Flow: Landing → SlotFilter → Slot → Insurance → PatientInfo (no intake)
        {
            name: 'cvd',
            testDir: './tests/e2e/clients/CVD',
            timeout: 120_000,
        },

        // ── Admin ─────────────────────────────────────────────────────────────
        {
            name: 'admin',
            testDir: './tests/e2e/admin',
            use: {
                storageState: 'tests/.auth/admin-state.json',
            },
        },

    ],

    // webServer is only needed for LOCAL development (when running a local frontend).
    // In CI the tests hit https://stage.setter.layline.live directly — no local server needed.
    ...(process.env.CI ? {} : {
        webServer: {
            command: 'npm run dev --prefix frontend',
            url: 'https://stage.setter.layline.live',
            reuseExistingServer: true,
        },
    }),
});
