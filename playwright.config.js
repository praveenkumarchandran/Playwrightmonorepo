import { defineConfig } from '@playwright/test';

export default defineConfig({
    globalSetup: './global-setup.js',

    reporter: [
        ['list'],
        ['allure-playwright'],
        ['json', { outputFile: 'test-results/results.json' }],  // parsed by email-report script
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
        // retries: 1 — each insurance/patient page test runs its own full flow;
        // after many sequential flows the staging server can get slow
        {
            name: 'tndi',
            testDir: './tests/e2e/clients/TNDI',
            timeout: 120_000,
            workers: 1,
            retries: 1,
        },

        // ── Clarus Dermatology ────────────────────────────────────────────────
        // Flow: Landing → SlotFilter → Slot → Insurance → PatientInfo (no intake)
        // workers: 1 — sequential to avoid slot conflicts and slow-server race conditions
        {
            name: 'clarus',
            testDir: './tests/e2e/clients/ClarusDerm',
            timeout: 120_000,
            workers: 1,
            retries: 1,
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
        // workers: 1 — cosmetic has fewer providers/slots; parallel workers caused conflicts
        {
            name: 'siny-cosmetic',
            testDir: './tests/e2e/clients/SINY',
            testMatch: /cosmetic\.spec\.js/,
            timeout: 120_000,
            workers: 1,
        },

        // ── Hopemark Health ───────────────────────────────────────────────────
        // Flow: Landing → SlotFilter → Slot → Intake → Insurance → PatientInfo
        // retries: 1 — staging server occasionally returns "Oops! Something went wrong"
        {
            name: 'hopemark',
            testDir: './tests/e2e/clients/Hopemark',
            timeout: 120_000,
            workers: 1,
            retries: 1,
        },

        // ── Freedman ENT ──────────────────────────────────────────────────────
        // Flow: Landing → SlotFilter → Slot → Insurance → PatientInfo (no intake)
        {
            name: 'freedman',
            testDir: './tests/e2e/clients/Freedman',
            timeout: 120_000,
            retries: 1,
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
            retries: 1,
        },

        // ── SINY Widget (staging) ─────────────────────────────────────────────
        // Flow: Widget (filters + calendar + slot) → Intake → Insurance → Add Info
        // workers: 1 — 50+ tests call completeWidgetToInsurance; even workers: 2 caused
        // APPT04-06 to race with other describe blocks booking the same first slot (9:20 AM),
        // leaving the loser with an empty session on the insurance page.
        {
            name: 'siny-widget-stage',
            testDir: './tests/e2e/widget',
            testMatch: /sinyWidget\.spec\.js/,
            timeout: 240_000,   // 4 min — full flow + slow locations need extra time
            fullyParallel: true,
            workers: 2,
            retries: 1,
            use: {
                actionTimeout: 25_000,  // Florida/Forest Hills dropdowns can be slow on staging
            },
        },

        // ── SINY Widget (production) ──────────────────────────────────────────
        {
            name: 'siny-widget-prod',
            testDir: './tests/e2e/widget',
            testMatch: /sinyWidget\.spec\.js/,
            timeout: 300_000,   // 5 min — production can be slower than staging
            fullyParallel: true,
            workers: 1,
            retries: 1,
            use: {
                actionTimeout: 30_000,
            },
            env: { SETTER_BASE_URL: 'https://setter.layline.live' },
        },

        // ── Clarus Widget ─────────────────────────────────────────────────────
        // Flow: Widget (Patient Type + Location + Service Type + Calendar) → Insurance → Add Info
        // No intake step. Insurance uses MUI Select with Self-pay pre-selected.
        {
            name: 'clarus-widget',
            testDir: './tests/e2e/widget',
            testMatch: /clarusWidget\.spec\.js/,
            timeout: 240_000,
            fullyParallel: true,
            retries: 0,
            use: {
                actionTimeout: 25_000,
            },
        },

        // ── Hopemark Widget (PRODUCTION) ──────────────────────────────────────
        // Widget: https://setter.layline.live/hopemarkhealth/1/oakbrook/widget?widgetId=2
        // Embedded at: hopemarkheath.com/outpatient-psychiatry-clinic/oak-brook/#schedule
        // Dropdowns: Patient Type | Visit Reason  (no Location, no calendar)
        // Slots: combined date+time card buttons + Show More
        // Flow: Widget → (slot + Schedule Appointment | Show More → FA) → Intake → Insurance → Add Info
        // workers: 1 — the production widget always surfaces the SAME first slot
        // (appointmentid=52268996, 8:00 AM Wed Jul 8). Two concurrent workers would
        // both commit insurance for the same appointmentid, causing a server conflict
        // and a waitForURL timeout on the second worker. Sequential is the only safe option.
        {
            name: 'hopemark-widget',
            testDir: './tests/e2e/widget',
            testMatch: /hopemarkWidget\.spec\.js/,
            timeout: 300_000,   // 5 min — widget + intake + insurance chain is long
            fullyParallel: true,
            workers: 1,
            retries: 1,
            use: {
                baseURL: 'https://setter.layline.live',  // production
                actionTimeout: 30_000,
            },
        },

        // ── Admin ─────────────────────────────────────────────────────────────
        {
            name: 'admin',
            testDir: './tests/e2e/admin',
            timeout: 60_000,
            workers: 1,
            use: {
                storageState: 'admin-auth.json',
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
