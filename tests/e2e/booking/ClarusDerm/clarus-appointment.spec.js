import { test, expect } from '@playwright/test';

import { LandingPage } from '../../../../pages/LandingPage';
import { SlotPage } from '../../../../pages/SlotPage';
import { IntakePage } from '../../../../pages/IntakePage';
import { InsurancePage } from '../../../../pages/InsurancePage';
import { PatientInfoPage } from '../../../../pages/PatientInfoPage';

test('Setter Booking Flow for ClarusDerm', async ({ page }) => {

    test.setTimeout(180000);

    const landing = new LandingPage(page);
    const slot = new SlotPage(page);
    const intake = new IntakePage(page);
    const insurance = new InsurancePage(page);
    const patient = new PatientInfoPage(page);

    // LANDING
    await landing.open('https://stage.setter.layline.live/clarusdermatology/1/minnetonka/landing');
    await landing.startNewPatient('Acne');

    // SLOT — Clarus requires filters before slots render
    await slot.selectLocation('Minnetonka');
    await slot.selectAppointmentReason('Acne');
    await slot.clickAnySlot();
    await slot.continue();

    // // INTAKE
    // await intake.selectSymptoms();
    // await intake.answerNoQuestions();
    // await intake.continue();

    // INSURANCE
    await insurance.selectSelfPay();
    // await insurance.manualEntry();
    // await insurance.selectPlan();
    // await insurance.fillPlanDetails();
    await insurance.continue();

    // PATIENT INFO
    await patient.fillBasicInfo({
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        phone: "5551234567",
        address: "123 Main St",
        city: "Farmington Hills",
        zip: "48335"
    });

    await patient.fillDOB("01151990");
    await patient.selectGender("Male");
    await patient.selectState("MI-Michigan");
    await patient.checkSmsConsent();

    // await patient.submit();

    // const response = await page.waitForResponse(res =>
    //     res.url().includes('bookAppointment') &&
    //     res.request().method() === 'PUT'
    // );

    // expect(response.status()).toBe(201);
});