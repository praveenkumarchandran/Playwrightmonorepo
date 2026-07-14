import { chromium } from '@playwright/test';
import { promises as fs } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function globalSetup() {
    console.log('Start with global setup');
    console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);

    const browser = await chromium.launch({ headless: true });

    let context, page, postLoginUrl;
    const MAX_ATTEMPTS = 3;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        context = await browser.newContext();
        page    = await context.newPage();

        await page.goto('https://stage.setter.layline.live/login');
        await page.getByPlaceholder('Email').fill(process.env.ADMIN_EMAIL);
        await page.getByPlaceholder('Password').fill(process.env.ADMIN_PASSWORD);
        await page.getByRole('button', { name: 'Sign In' }).click();

        try {
            // The portal redirects away from /login on success.
            await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 60_000 });
            postLoginUrl = page.url();
            console.log(`Login succeeded on attempt ${attempt}. Post-login URL:`, postLoginUrl);
            break;
        } catch (err) {
            console.log(`Login attempt ${attempt}/${MAX_ATTEMPTS} timed out: ${err.message}`);
            await context.close();
            if (attempt === MAX_ATTEMPTS) throw new Error(`Admin login failed after ${MAX_ATTEMPTS} attempts`);
            await new Promise(r => setTimeout(r, 5_000));
        }
    }

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