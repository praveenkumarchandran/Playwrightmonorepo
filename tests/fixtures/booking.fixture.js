import { test as base, expect } from '@playwright/test';
import { LandingPage } from '../../pages/LandingPage.js';
import { SlotPage } from '../../pages/SlotPage.js';
import { IntakePage } from '../../pages/IntakePage.js';
import { InsurancePage } from '../../pages/InsurancePage.js';
import { PatientInfoPage } from '../../pages/PatientInfoPage.js';

const LANDING_URL = 'https://stage.setter.layline.live/thenerveanddiscinstitute/1/thenerveanddiscinstitutefarmington/landing';

export const test = base.extend({

    // Test-scoped: each intake test gets a fresh page stopped at the intake step.
    intakePage: async ({ page }, use) => {
        const landing = new LandingPage(page);
        const slot = new SlotPage(page);

        await landing.open(LANDING_URL);
        await landing.startNewPatient('Teleconsultation');

        await slot.clickAnySlot();
        await slot.continue();

        const intake = new IntakePage(page);
        await intake.waitForLoad();

        await use(intake);
    },

    // Worker-scoped: full booking flow runs ONCE per worker.
    // All tests in the same worker share this page — no re-running the flow per test.
    patientPage: [async ({ browser }, use) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        const landing = new LandingPage(page);
        const slot = new SlotPage(page);
        const intake = new IntakePage(page);
        const insurance = new InsurancePage(page);

        await landing.open(LANDING_URL);
        await landing.startNewPatient('Teleconsultation');

        await slot.clickAnySlot();
        await slot.continue();

        await intake.selectSymptoms();
        await intake.answerNoQuestions();
        await intake.continue();

        await insurance.completeInsurance('Self-pay');

        await expect(page).toHaveURL(/additionaldetails/, { timeout: 30_000 });
        console.log('Worker fixture: reached additionaldetails — shared across all tests in this worker');

        await use(new PatientInfoPage(page));

        await context.close();
    }, { scope: 'worker' }],

});

export { expect } from '@playwright/test';