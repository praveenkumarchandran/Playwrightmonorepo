# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\booking\setup\TNDIBooking.setup.js >> reach additionaldetails and save state
- Location: tests\e2e\booking\setup\TNDIBooking.setup.js:14:1

# Error details

```
Error: locator.click: Test ended.
Call log:
  - waiting for locator('input[placeholder="What symptoms are you experiencing?"]')

```

# Test source

```ts
  1  | export class IntakePage {
  2  |     constructor(page) {
  3  |         this.page = page;
  4  |     }
  5  | 
  6  |     async selectSymptoms() {
  7  |         // Wait for loader/spinner to disappear
  8  |         await this.page
  9  |             .locator('span.MuiCircularProgress-root')
  10 |             .first()
  11 |             .waitFor({ state: 'detached', timeout: 20000 })
  12 |             .catch(() => { });
  13 | 
  14 |         // Symptom dropdown input
  15 |         const input = this.page.locator(
  16 |             'input[placeholder="What symptoms are you experiencing?"]'
  17 |         );
  18 | 
  19 |         // Ensure visible
  20 |         await input.waitFor({ state: 'visible', timeout: 10000 });
  21 | 
  22 |         // Select Knee Pain
  23 |         await input.click();
  24 |         await input.fill('Knee');
  25 | 
  26 |         const kneeOption = this.page.locator(
  27 |             '.MuiAutocomplete-option:has-text("Knee Pain")'
  28 |         );
  29 | 
  30 |         await kneeOption.waitFor({ state: 'visible', timeout: 10000 });
  31 |         await kneeOption.click();
  32 | 
  33 |         // // Select Neck Pain
> 34 |         // await input.click();
     |                     ^ Error: locator.click: Test ended.
  35 |         // await input.fill('Neck');
  36 | 
  37 |         const neckOption = this.page.locator(
  38 |             '.MuiAutocomplete-option:has-text("Neck Pain")'
  39 |         );
  40 | 
  41 |         await neckOption.waitFor({ state: 'visible', timeout: 10000 });
  42 |         await neckOption.click();
  43 |     }
  44 | 
  45 |     async answerNoQuestions() {
  46 |         const noLabels = this.page.locator(
  47 |             '.MuiFormControlLabel-root:has-text("No")'
  48 |         );
  49 | 
  50 |         // Wait for at least one question to render before counting
  51 |         await noLabels.first().waitFor({ state: 'visible', timeout: 10_000 }).catch(() => { });
  52 | 
  53 |         const count = await noLabels.count();
  54 |         for (let i = 0; i < count; i++) {
  55 |             await noLabels.nth(i).click();
  56 |         }
  57 |     }
  58 | 
  59 |     async continue() {
  60 |         await this.page.click('button:has-text("Continue")');
  61 |     }
  62 | }
  63 | 
  64 | 
```