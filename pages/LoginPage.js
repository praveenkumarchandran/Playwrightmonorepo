import { expect } from '@playwright/test';

export class LoginPage {
    constructor(page) {
        this.page = page;
    }

    async open() {
        await this.page.goto('/login');
    }

    async login(email, password) {
        await this.page.fill('input[type="email"]', email);
        await this.page.fill('input[type="password"]', password);
        await this.page.click('button[type="submit"]');
    }

    async verifyLoginSuccess() {
        // your app shows alert OR stays on same page
        await expect(this.page.locator('h2')).toHaveText('Login Page');
    }
}