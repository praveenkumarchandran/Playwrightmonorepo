import { expect } from '@playwright/test';

export class LoginPage {
    constructor(page) {
        this.page = page;

        // Locators (more stable than placeholders)
        this.email = page.locator('input[type="email"], input[name="email"]');
        this.password = page.locator('input[type="password"]');
        this.loginBtn = page.getByRole('button', { name: /sign in/i });
    }

    async goto() {
        await this.page.goto('https://stage.setter.layline.live/login', {
            waitUntil: 'domcontentloaded'
        });

        await this.page.waitForSelector('input[type="password"]');
    }

    async login(email, pass) {
        console.log(`🔐 Logging in as: ${email}`);

        await this.email.fill(email);
        await this.password.fill(pass);

        // Promise all prevents race condition (VERY IMPORTANT in pro code)
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'networkidle' }),
            this.loginBtn.click()
        ]);

        // Validation (CRITICAL)
        await expect(this.page).not.toHaveURL(/login/);

        console.log('✅ Login successful');
    }

    async isLoggedIn() {
        return !(await this.page.url()).includes('/login');
    }
}