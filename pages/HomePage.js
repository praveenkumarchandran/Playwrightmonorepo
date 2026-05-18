import { expect } from '@playwright/test';

export class HomePage {
    constructor(page) {
        this.page = page;
    }

    async open() {
        await this.page.goto('/');
    }

    async checkTitle() {
        await expect(this.page).toHaveTitle(/frontend/);
    }
}