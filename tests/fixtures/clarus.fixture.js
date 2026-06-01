// ── Clarus fixture (location + reason + provider filters) ────────────────────
// tests/fixtures/clarus.fixture.js

import { test as base } from '@playwright/test';
import { LandingPage } from '../../pages/LandingPage.js';
import { SlotPage } from '../../pages/SlotPage.js';
import { IntakePage } from '../../pages/IntakePage.js';
import { InsurancePage } from '../../pages/InsurancePage.js';
import { PatientInfoPage } from '../../pages/PatientInfoPage.js';

export const test = base.extend({
    patientPage: async ({ page }, use) => {
        const landing = new LandingPage(page);
        const slot = new SlotPage(page);
        const intake = new IntakePage(page);
        const insurance = new InsurancePage(page);

        // Landing — pass reason type for Clarus dropdown
        await landing.open('https://stage.setter.layline.live/clarusdermatology/1/minnetonka/landing');
        await landing.startNewPatient('Acne'); // ← update with real reason

        // Slot — select filters first, then click a slot
        await slot.selectLocation('Minnetonka');
        await slot.selectAppointmentReason('Acne'); // ← update with real reason
        await slot.clickAnySlot();
        await slot.continue();

        // Intake
        await intake.selectSymptoms();
        await intake.answerNoQuestions();
        await intake.continue();

        // Insurance
        await insurance.selectSelfPay();
        await insurance.manualEntry();
        await insurance.selectPlan();
        await insurance.fillPlanDetails();
        await insurance.continue();

        await use(new PatientInfoPage(page));
    },
});

export { expect } from '@playwright/test';