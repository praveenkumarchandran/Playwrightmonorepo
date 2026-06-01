# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\booking\ClarusDerm\clarus-appointment.spec.js >> Setter Booking Flow for ClarusDerm
- Location: tests\e2e\booking\ClarusDerm\clarus-appointment.spec.js:9:1

# Error details

```
Error: page.click: Test ended.
Call log:
  - waiting for locator('.MuiAutocomplete-option:has-text("Knee Pain")')

```

# Test source

```ts
  1  | export class IntakePage {
  2  |     constructor(page) {
  3  |         this.page = page;
  4  |         this.symptomInput = 'input[aria-autocomplete="list"]';
  5  |     }
  6  | 
  7  |     async selectSymptoms() {
  8  |         await this.page.click(this.symptomInput);
  9  |         await this.page.fill(this.symptomInput, 'Knee');
> 10 |         await this.page.click('.MuiAutocomplete-option:has-text("Knee Pain")');
     |                         ^ Error: page.click: Test ended.
  11 | 
  12 |         await this.page.click(this.symptomInput);
  13 |         await this.page.fill(this.symptomInput, 'Neck');
  14 |         await this.page.click('.MuiAutocomplete-option:has-text("Neck Pain")');
  15 |     }
  16 | 
  17 |     async answerNoQuestions() {
  18 |         const noLabels = this.page.locator(
  19 |             '.MuiFormControlLabel-root:has-text("No")'
  20 |         );
  21 | 
  22 |         const count = await noLabels.count();
  23 |         for (let i = 0; i < count; i++) {
  24 |             await noLabels.nth(i).click();
  25 |         }
  26 |     }
  27 | 
  28 |     async continue() {
  29 |         await this.page.click('button:has-text("Continue")');
  30 |     }
  31 | }
  32 | 
  33 | 
```