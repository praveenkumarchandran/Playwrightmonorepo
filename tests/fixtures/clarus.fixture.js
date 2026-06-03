/**
 * Clarus fixture — DEPRECATED.
 * Use makeNewPatientFixtures('CLARUS_DERM') from newPatient.fixture.js instead.
 * This file is kept only for the legacy clarus-appointment.spec.js e2e test.
 */

import { test as base } from '@playwright/test';
import { LandingPage } from '../../pages/LandingPage.js';
import { SlotPage } from '../../pages/SlotPage.js';
import { InsurancePage } from '../../pages/InsurancePage.js';
import { PatientInfoPage } from '../../pages/PatientInfoPage.js';

export const test = base.extend({
    patientPage: async ({ page }, use) => {
        const landing = new LandingPage(page);
        const slot = new SlotPage(page);
        const insurance = new InsurancePage(page);

        await landing.open('https://stage.setter.layline.live/clarusdermatology/1/minnetonka/landing');
        await landing.startNewPatient('Acne');

        await slot.selectLocation('Minnetonka');
        await slot.selectAppointmentReason('Acne');
        await slot.clickAnySlot();
        await slot.continue();

        // Clarus has NO intake page — go directly to insurance
        await insurance.selectSelfPay();
        await insurance.continue();

        await use(new PatientInfoPage(page));
    },
});

export { expect } from '@playwright/test';
