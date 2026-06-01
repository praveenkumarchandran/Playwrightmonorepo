import { chromium } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

async function globalSetup() {
    console.log('Start with global setup');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://stage.setter.layline.live/login');

    await page.getByPlaceholder('Email').fill(process.env.ADMIN_EMAIL);
    await page.getByPlaceholder('Password').fill(process.env.ADMIN_PASSWORD);

    console.log(process.env.ADMIN_EMAIL);
    console.log(process.env.ADMIN_PASSWORD);

    await Promise.all([
        // page.waitForURL('**/patients', { timeout: 20000 }), // adjust if needed
        page.getByRole('button', { name: 'Sign In' }).click()
    ]);

    await context.storageState({ path: 'admin-auth.json' });

    await browser.close();

    console.log('Login stored to admin-auth.json');
}

export default globalSetup;