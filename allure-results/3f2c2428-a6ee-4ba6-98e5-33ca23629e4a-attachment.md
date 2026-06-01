# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\booking\setup\TNDIBooking.setup.js >> reach additionaldetails and save state
- Location: tests\e2e\booking\setup\TNDIBooking.setup.js:14:1

# Error details

```
Error: page.waitForURL: Target page, context or browser has been closed
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Test source

```ts
  1  | export class LandingPage {
  2  |     constructor(page) {
  3  |         this.page = page;
  4  |         this.newPatientBtn = page.locator('button#newPatient-button');
  5  |         this.reasonDropdown = page.locator('input#serviceType-select-box');
  6  |     }
  7  | 
  8  |     async open(url) {
  9  |         await this.page.goto(url, { waitUntil: 'networkidle' });
  10 |     }
  11 | 
  12 |     async startNewPatient(reasonType = null) {
  13 |         if (reasonType) {
  14 |             await this.reasonDropdown.click();
  15 |             await this.reasonDropdown.pressSequentially(reasonType, { delay: 50 });
  16 |             const option = this.page.locator('[role="option"]').filter({ hasText: reasonType }).first();
  17 |             await option.waitFor({ state: 'visible', timeout: 10_000 });
  18 |             await option.click();
  19 |             console.log(`Reason selected: ${reasonType}`);
  20 |         }
  21 | 
  22 |         await this.newPatientBtn.click();
  23 | 
  24 |         await this.page.waitForTimeout(20000);
  25 |         console.log('URL after New Patient click:', this.page.url());
  26 | 
> 27 |         await this.page.waitForURL(/findappointment/, { timeout: 15_000 });
     |                         ^ Error: page.waitForURL: Target page, context or browser has been closed
  28 |         console.log('Navigated to find appointment page');
  29 |     }
  30 | }
```