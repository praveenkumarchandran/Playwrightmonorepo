# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: booking\create-appointment.spec.js >> Setter Booking Flow (POM)
- Location: tests\e2e\booking\create-appointment.spec.js:10:1

# Error details

```
Error: locator.click: Test ended.
Call log:
  - waiting for locator('input[placeholder*="Gender"], input[name*="gender"], input[id*="gender"]')
    - locator resolved to <input value="" name="gender" tabindex="-1" aria-hidden="true" aria-invalid="false" class="MuiSelect-nativeInput css-1k3x8v3"/>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div id="gender" tabindex="0" role="combobox" aria-controls=":r17:" aria-expanded="false" aria-haspopup="listbox" aria-labelledby="gender" class="MuiSelect-select MuiSelect-outlined MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall css-11r3v4">…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div id="gender" tabindex="0" role="combobox" aria-controls=":r17:" aria-expanded="false" aria-haspopup="listbox" aria-labelledby="gender" class="MuiSelect-select MuiSelect-outlined MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall css-11r3v4">…</div> intercepts pointer events
    - retrying click action
      - waiting 100ms
    59 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div id="gender" tabindex="0" role="combobox" aria-controls=":r17:" aria-expanded="false" aria-haspopup="listbox" aria-labelledby="gender" class="MuiSelect-select MuiSelect-outlined MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall css-11r3v4">…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div aria-hidden="true" class="MuiBackdrop-root MuiBackdrop-invisible MuiModal-backdrop css-121trqk"></div> from <div id="menu-gender" role="presentation" class="MuiPopover-root MuiMenu-root MuiModal-root css-1sucic7">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <div aria-hidden="true" class="MuiBackdrop-root MuiBackdrop-invisible MuiModal-backdrop css-121trqk"></div> from <div id="menu-gender" aria-hidden="true" role="presentation" class="MuiPopover-root MuiMenu-root MuiModal-root css-1sucic7">…</div> subtree intercepts pointer events
  5 × retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div id="gender" tabindex="0" role="combobox" aria-controls=":r17:" aria-expanded="false" aria-haspopup="listbox" aria-labelledby="gender" class="MuiSelect-select MuiSelect-outlined MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall css-11r3v4">Male</div> intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is not stable
  8 × retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div id="gender" tabindex="0" role="combobox" aria-controls=":r17:" aria-expanded="false" aria-haspopup="listbox" aria-labelledby="gender" class="MuiSelect-select MuiSelect-outlined MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall css-11r3v4">Male</div> intercepts pointer events
  - retrying click action
    - waiting 500ms

```

# Test source

```ts
  1  | export class PatientInfoPage {
  2  |     constructor(page) {
  3  |         this.page = page;
  4  |     }
  5  | 
  6  |     async fillBasicInfo(data) {
  7  |         await this.page.fill('input[name*="firstName"]', data.firstName);
  8  |         await this.page.fill('input[name*="lastName"]', data.lastName);
  9  |         await this.page.fill('input[name="email"]', data.email);
  10 |         await this.page.fill('input[type="number"]', data.phone);
  11 |         await this.page.fill('input[name*="address1"]', data.address);
  12 |         await this.page.fill('input[name*="city"]', data.city);
  13 |         await this.page.fill('input[name*="homeZip"]', data.zip);
  14 |     }
  15 | 
  16 |     async fillDOB(dob) {
  17 |         const input = this.page.locator('input[placeholder="MM/DD/YYYY"]');
  18 |         await input.fill(dob);
  19 |     }
  20 |     async selectGender(value = "Male") {
  21 | 
  22 |         const input = this.page.locator('input[placeholder*="Gender"], input[name*="gender"], input[id*="gender"]');
  23 | 
> 24 |         await input.click();
     |                     ^ Error: locator.click: Test ended.
  25 | 
  26 |         await this.page.waitForSelector('[role="option"]', { timeout: 10000 });
  27 | 
  28 |         await this.page.locator(`[role="option"]:has-text("${value}")`).first().click();
  29 | 
  30 |         console.log(`✅ Gender selected: ${value}`);
  31 |     }
  32 | 
  33 |     async selectState(value = "MI") {
  34 | 
  35 |         await this.page.click('#state-select-box');
  36 | 
  37 |         await this.page.waitForSelector('[role="option"]', { timeout: 10000 });
  38 | 
  39 |         await this.page.locator(`[role="option"]:has-text("${value}")`).first().click();
  40 | 
  41 |         console.log(`✅ State selected: ${value}`);
  42 |     }
  43 | 
  44 |     async selectReferral(value) {
  45 | 
  46 |         const input = this.page.locator('#referral-select-box');
  47 | 
  48 |         await input.click();
  49 | 
  50 |         await this.page.waitForSelector('[role="option"]', { timeout: 10000 });
  51 | 
  52 |         await this.page.locator(`[role="option"]:has-text("${value}")`).first().click();
  53 | 
  54 |         console.log(`✅ Referral selected: ${value}`);
  55 |     }
  56 | 
  57 |     async selectReferralOther(value) {
  58 |         const nameInput = this.page.locator('input[placeholder="Enter Doctor Name"]');
  59 |         await nameInput.fill(value);
  60 |     }
  61 | 
  62 |     async submit() {
  63 |         await this.page.click('button:has-text("Book Now")');
  64 |     }
  65 | }
  66 | 
```