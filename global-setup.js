import { chromium } from '@playwright/test';
import { promises as fs } from 'fs';
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

    await page.getByRole('button', { name: 'Sign In' }).click();
    // Wait for the login redirect to complete before capturing cookies.
    // The portal redirects away from /login on success — any other URL means auth succeeded.
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 60_000 });
    const postLoginUrl = page.url();
    console.log('Post-login URL:', postLoginUrl);

    await context.storageState({ path: 'admin-auth.json' });

    // Strip persist:adminLogin so the SPA uses URL-based routing in tests
    // instead of redirecting to the admin account's last-used client.
    const state = JSON.parse(await fs.readFile('admin-auth.json', 'utf8'));
    for (const origin of state.origins ?? []) {
        origin.localStorage = (origin.localStorage ?? []).filter(
            item => item.name !== 'persist:adminLogin',
        );
    }

    // Derive the scheduler fallback URL from the post-login redirect.
    // e.g. /admin/sinydermatology/1/patients → /admin/sinydermatology/1/managescheduler
    const m = postLoginUrl.match(/\/admin\/([^/]+)\/(\d+)/);
    const fallbackSchedulerUrl = m ? `/admin/${m[1]}/${m[2]}/managescheduler` : null;
    if (fallbackSchedulerUrl && !fallbackSchedulerUrl.includes('/admin//')) {
        state._adminFallbackSchedulerUrl = fallbackSchedulerUrl;
        console.log('Admin fallback scheduler URL:', fallbackSchedulerUrl);
    } else {
        console.log('Warning: could not derive admin fallback scheduler URL from:', postLoginUrl);
    }

    await fs.writeFile('admin-auth.json', JSON.stringify(state, null, 2));

    await browser.close();

    console.log('Login stored to admin-auth.json (persist:adminLogin stripped)');
}

export default globalSetup;