# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\booking\create-appointment.spec.js >> Date of Birth >> TC09 — fills DOB in MM/DD/YYYY format
- Location: tests\e2e\booking\shared\patientInfo.cases.js:95:9

# Error details

```
Test timeout of 30000ms exceeded while setting up "patientPage".
```

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /additionaldetails/
Received string:  "https://stage.setter.layline.live/thenerveanddiscinstitute/1/thenerveanddiscinstitutefarmington/landing"

Call log:
  - Expect "toHaveURL" with timeout 30000ms
    43 × unexpected value "https://stage.setter.layline.live/thenerveanddiscinstitute/1/thenerveanddiscinstitutefarmington/landing"

```

```yaml
- banner:
  - img "logo"
  - heading "586-416-3472" [level=6]
- paragraph: The Nerve and Disc Institute
- paragraph: 24100 Drake Rd,
- paragraph: Farmington Hills MI 48335
- heading [level=3]
- heading "What is your reason for scheduling?" [level=5]
- combobox "Visit reason": Teleconsultation
- button "Open"
- heading "Have you visited us before?" [level=5]
- button "Existing Patient"
- button "New Patient"
- heading "Powered by" [level=6]
- img "MUlogo"
```

# Test source

```ts
  1  | import { test as base, expect } from '@playwright/test';
  2  | import { PatientInfoPage } from '../../pages/PatientInfoPage.js';
  3  | 
  4  | const ADDITIONAL_DETAILS_URL = 'https://stage.setter.layline.live/thenerveanddiscinstitute/1/thenerveanddiscinstitutefarmington/additionaldetails';
  5  | 
  6  | export const test = base.extend({
  7  | 
  8  |     patientPage: async ({ page }, use) => {
  9  |         // The booking project storageState already has a session at additionaldetails
  10 |         // (saved by booking-setup). Navigate there directly — no need to redo steps 1–4.
  11 |         await page.goto(ADDITIONAL_DETAILS_URL, { waitUntil: 'networkidle' });
> 12 |         await expect(page).toHaveURL(/additionaldetails/, { timeout: 30_000 });
     |                            ^ Error: expect(page).toHaveURL(expected) failed
  13 |         console.log('Fixture: reached', page.url());
  14 | 
  15 |         await use(new PatientInfoPage(page));
  16 |     },
  17 | });
  18 | 
  19 | export { expect } from '@playwright/test';
  20 | 
```