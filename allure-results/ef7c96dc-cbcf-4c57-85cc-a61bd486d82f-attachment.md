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
    122 × waiting for element to be visible, enabled and stable
        - element is visible, enabled and stable
        - scrolling into view if needed
        - done scrolling
        - <div id="gender" tabindex="0" role="combobox" aria-controls=":r17:" aria-expanded="false" aria-haspopup="listbox" aria-labelledby="gender" class="MuiSelect-select MuiSelect-outlined MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall css-11r3v4">…</div> intercepts pointer events
      - retrying click action
        - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e5]:
    - generic [ref=e7]:
      - img "logo" [ref=e9]
      - heading "586-416-3472" [level=6] [ref=e12]
  - generic [ref=e15]:
    - generic [ref=e17]:
      - paragraph [ref=e18]: The Nerve and Disc Institute
      - generic [ref=e19]:
        - paragraph [ref=e20]: 24100 Drake Rd,
        - paragraph [ref=e21]: Farmington Hills MI 48335
    - generic [ref=e23]:
      - generic:
        - heading [level=3]
      - generic [ref=e24]:
        - heading "What is your reason for scheduling?" [level=5] [ref=e25]
        - generic [ref=e28]:
          - combobox "Visit reason" [ref=e29]: Teleconsultation
          - button "Open" [ref=e31] [cursor=pointer]:
            - img [ref=e32]
          - group
      - generic [ref=e34]:
        - heading "Have you visited us before?" [level=5] [ref=e35]
        - generic [ref=e36]:
          - button "Existing Patient" [ref=e37] [cursor=pointer]
          - button "New Patient" [ref=e38] [cursor=pointer]
      - generic [ref=e40]:
        - heading "Powered by" [level=6] [ref=e41]
        - img "MUlogo" [ref=e42]
```

# Test source

```ts
  1   | export class PatientInfoPage {
  2   |     constructor(page) {
  3   |         this.page = page;
  4   |     }
  5   | 
  6   |     async fillBasicInfo(data) {
  7   |         await this.page.fill('input[name*="firstName"]', data.firstName);
  8   |         await this.page.fill('input[name*="lastName"]', data.lastName);
  9   |         await this.page.fill('input[name="email"]', data.email);
  10  |         await this.page.fill('input[type="number"]', data.phone);
  11  |         await this.page.fill('input[name*="address1"]', data.address);
  12  |         await this.page.fill('input[name*="city"]', data.city);
  13  |         await this.page.fill('input[name*="homeZip"]', data.zip);
  14  |     }
  15  | 
  16  |     async fillDOB(dob) {
  17  |         const input = this.page.locator('input[placeholder="MM/DD/YYYY"]');
  18  |         await input.fill(dob);
  19  |     }
  20  |     async selectGender(value = "Male") {
  21  | 
  22  |         const input = this.page.locator('input[placeholder*="Gender"], input[name*="gender"], input[id*="gender"]');
  23  | 
> 24  |         await input.click();
      |                     ^ Error: locator.click: Test ended.
  25  | 
  26  |         await this.page.waitForSelector('[role="option"]', { timeout: 10000 });
  27  | 
  28  |         await this.page.locator(`[role="option"]:has-text("${value}")`).first().click();
  29  | 
  30  |         console.log(`✅ Gender selected: ${value}`);
  31  |     }
  32  | 
  33  |     async selectState(value = "MI") {
  34  | 
  35  |         const input = this.page.locator('#state-select-box');
  36  | 
  37  |         // open dropdown
  38  |         await input.click();
  39  | 
  40  |         // wait for API response
  41  |         const Stateresponse = await this.page.waitForResponse(res =>
  42  |             res.url().includes('getStates') &&
  43  |             res.status() === 200
  44  |         );
  45  | 
  46  |         console.log('State options loaded', Stateresponse.json());
  47  | 
  48  |         // type value
  49  |         await input.fill(value);
  50  | 
  51  |         // wait for option render
  52  |         const option = this.page.locator(`[role="option"]:has-text("${value}")`);
  53  | 
  54  |         await option.waitFor({
  55  |             state: 'visible',
  56  |             timeout: 10000
  57  |         });
  58  | 
  59  |         // click option
  60  |         await option.click();
  61  | 
  62  |         console.log(`State selected: ${value}`);
  63  |     }
  64  | 
  65  | 
  66  | 
  67  |     async selectReferral(value) {
  68  | 
  69  |         const input = this.page.locator('#referral-select-box');
  70  | 
  71  |         // click input
  72  |         await input.click();
  73  | 
  74  |         // clear existing value
  75  |         await input.clear();
  76  | 
  77  |         // type slowly like real user
  78  |         await input.pressSequentially(value);
  79  | 
  80  |         // wait for dropdown option
  81  |         const option = this.page.locator('li[role="option"]', {
  82  |             hasText: value
  83  |         });
  84  | 
  85  |         await option.waitFor({
  86  |             state: 'visible',
  87  |             timeout: 10000
  88  |         });
  89  | 
  90  |         // click matching option
  91  |         await option.first().click();
  92  | 
  93  |         console.log(`Referral selected: ${value}`);
  94  |     }
  95  | 
  96  |     async selectReferralOther(value) {
  97  |         const nameInput = this.page.locator('input[placeholder="Enter Doctor Name"]');
  98  |         await nameInput.fill(value);
  99  |     }
  100 | 
  101 |     async submit() {
  102 |         await this.page.click('button:has-text("Book Now")');
  103 |     }
  104 | }
  105 | 
```