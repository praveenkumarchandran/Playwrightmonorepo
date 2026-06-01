import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import { LandingPage } from '../../../../pages/LandingPage.js';
import { SlotPage } from '../../../../pages/SlotPage.js';
import { IntakePage } from '../../../../pages/IntakePage.js';
import { InsurancePage } from '../../../../pages/InsurancePage.js';

setup.setTimeout(120_000);

const STATE_FILE = 'tests/.auth/booking-state.json';

setup('Reach additionaldetails and save state', async ({ page }) => {

    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });

    const landing = new LandingPage(page);
    const slot = new SlotPage(page);
    const intake = new IntakePage(page);
    const insurance = new InsurancePage(page);

    // ── Landing ───────────────────────────────────────────────────────────────
    await landing.open(
        'https://stage.setter.layline.live/thenerveanddiscinstitute/1/thenerveanddiscinstitutefarmington/landing'
    );
    await landing.startNewPatient('Teleconsultation');

    // ── Slot ──────────────────────────────────────────────────────────────────
    await slot.clickAnySlot();
    await slot.continue();

    // ── Intake ────────────────────────────────────────────────────────────────
    await intake.selectSymptoms();
    await intake.answerNoQuestions();
    await intake.continue();

    // ── Insurance ─────────────────────────────────────────────────────────────
    await insurance.selectInsuranceType('Self-pay');
    // await insurance.manualEntry();
    // await insurance.selectPlan();
    // await insurance.fillPlanDetails();
    await insurance.continue();

    // ── Confirm we reached PatientInfo (additionaldetails) ───────────────────
    await expect(page).toHaveURL(/additionaldetails/, { timeout: 30_000 });
    console.log('Reached additionaldetails page');

    // Save cookies + localStorage so all booking tests can skip steps 1–4
    await page.context().storageState({ path: STATE_FILE });
    console.log(`State saved → ${STATE_FILE}`);
});