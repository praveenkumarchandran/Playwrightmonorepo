# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: booking\create-appointment.spec.js >> Setter Booking Flow (POM)
- Location: tests\e2e\booking\create-appointment.spec.js:10:1

# Error details

```
Test timeout of 180000ms exceeded.
```

```
Error: locator.click: Test timeout of 180000ms exceeded.
Call log:
  - waiting for locator('input[name*="gender"]')
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
    278 × waiting for element to be visible, enabled and stable
        - element is visible, enabled and stable
        - scrolling into view if needed
        - done scrolling
        - <div id="gender" tabindex="0" role="combobox" aria-controls=":r17:" aria-expanded="false" aria-haspopup="listbox" aria-labelledby="gender" class="MuiSelect-select MuiSelect-outlined MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall css-11r3v4">…</div> intercepts pointer events
      - retrying click action
        - waiting 500ms
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e7]:
        - img "logo" [ref=e9]
        - heading "586-416-3472" [level=6] [ref=e12]
    - generic [ref=e16]:
      - generic [ref=e18]:
        - button "1" [ref=e20] [cursor=pointer]:
          - paragraph [ref=e21]: "1"
        - paragraph [ref=e24]: Location
      - generic [ref=e28]:
        - button "2" [ref=e30] [cursor=pointer]:
          - paragraph [ref=e31]: "2"
        - paragraph [ref=e34]: Choose Date & Time
      - generic [ref=e38]:
        - button "3" [ref=e40] [cursor=pointer]:
          - paragraph [ref=e41]: "3"
        - paragraph [ref=e44]: Intake Questions
      - generic [ref=e48]:
        - button "4" [ref=e50] [cursor=pointer]:
          - paragraph [ref=e51]: "4"
        - paragraph [ref=e54]: Add Insurance
      - generic [ref=e58]:
        - button "5" [ref=e60] [cursor=pointer]:
          - paragraph [ref=e61]: "5"
        - paragraph [ref=e64]: Add Info
  - generic [ref=e67]:
    - generic [ref=e69]:
      - heading "Your Appointment" [level=5] [ref=e70]
      - generic [ref=e71]:
        - generic [ref=e72]:
          - heading "Location" [level=6] [ref=e73]
          - paragraph [ref=e75]: The Nerve and Disc Institute Farmington
        - generic [ref=e76]:
          - heading "Location Address" [level=6] [ref=e77]
          - paragraph [ref=e79]: 24100 Drake Rd, MI 48335
        - generic [ref=e80]:
          - heading "Appointment Time" [level=6] [ref=e81]
          - paragraph [ref=e83]: 8:30 AM, Fri May 22, 2026
        - generic [ref=e84]:
          - heading "Appointment Type" [level=6] [ref=e85]
          - paragraph [ref=e87]: Teleconsultation
    - generic [ref=e89]:
      - generic [ref=e90]:
        - generic [ref=e91]:
          - generic [ref=e93]:
            - generic [ref=e94]: First Name *
            - generic [ref=e95]:
              - textbox "First Name *" [ref=e96]: John
              - group:
                - generic: First Name *
          - generic [ref=e98]:
            - generic [ref=e99]: Last Name *
            - generic [ref=e100]:
              - textbox "Last Name *" [ref=e101]: Doe
              - group:
                - generic: Last Name *
          - generic [ref=e103]:
            - generic [ref=e104]: Date of Birth *
            - generic [ref=e105]:
              - textbox "Date of Birth *" [active] [ref=e106]:
                - /placeholder: MM/DD/YYYY
                - text: 01/15/1990
              - button "Choose date, selected date is Jan 15, 1990" [ref=e108] [cursor=pointer]:
                - img [ref=e109]
              - group:
                - generic: Date of Birth *
          - generic [ref=e112]:
            - combobox "Gender *" [ref=e113] [cursor=pointer]:
              - paragraph [ref=e114]: Gender *
            - textbox
            - img
            - group
          - generic [ref=e116]:
            - generic [ref=e117]: Email *
            - generic [ref=e118]:
              - textbox "Email *" [ref=e119]: johndoe@example.com
              - group:
                - generic: Email *
          - generic [ref=e121]:
            - generic [ref=e122]: Phone *
            - generic [ref=e123]:
              - spinbutton "Phone *" [ref=e124]: "5551234567"
              - group:
                - generic: Phone *
        - generic [ref=e125]:
          - generic [ref=e127]:
            - generic [ref=e128]: Address1 *
            - generic [ref=e129]:
              - textbox "Address1 *" [ref=e130]: 123 Main St
              - group:
                - generic: Address1 *
          - generic [ref=e132]:
            - generic: Address2 (Optional)
            - generic [ref=e133]:
              - textbox "Address2 (Optional)" [ref=e134]
              - group:
                - generic: Address2 (Optional)
          - generic [ref=e136]:
            - generic [ref=e137]: City *
            - generic [ref=e138]:
              - textbox "City *" [ref=e139]: Farmington Hills
              - group:
                - generic: City *
          - generic [ref=e143]:
            - combobox "State *" [ref=e144]
            - button "Open" [ref=e146] [cursor=pointer]:
              - img [ref=e147]
            - group
          - generic [ref=e150]:
            - generic [ref=e151]: Home Zip *
            - generic [ref=e152]:
              - textbox "Home Zip *" [ref=e153]: "48335"
              - group:
                - generic: Home Zip *
          - generic [ref=e156]:
            - generic: How Did You Hear About Us? *
            - generic [ref=e157]:
              - combobox "How Did You Hear About Us? *" [ref=e158]
              - button "Open" [ref=e160] [cursor=pointer]:
                - img [ref=e161]
              - group:
                - generic: How Did You Hear About Us? *
      - generic [ref=e163]:
        - generic [ref=e164] [cursor=pointer]:
          - checkbox [ref=e165]
          - img [ref=e166]
        - paragraph [ref=e168]: I give permission for the practice to contact me via SMS or email. I understand that I can opt out at any time.
      - button "Book Now" [ref=e170] [cursor=pointer]
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
  20 | 
  21 |     async selectGender(value = "Male") {
  22 | 
  23 |         const genderInput = this.page.locator('input[name*="gender"]');
  24 | 
> 25 |         await genderInput.click();
     |                           ^ Error: locator.click: Test timeout of 180000ms exceeded.
  26 |         await genderInput.fill(value);
  27 | 
  28 |         await this.page.waitForSelector('[role="option"]');
  29 | 
  30 |         await this.page.locator(`[role="option"]:has-text("${value}")`).click();
  31 | 
  32 |         console.log(`✅ Gender selected: ${value}`);
  33 |     }
  34 | 
  35 |     async selectState(value = "MI") {
  36 | 
  37 |         await this.page.click('#state-select-box');
  38 | 
  39 |         const option = this.page.locator(`[role="option"]:has-text("${value}")`);
  40 | 
  41 |         await option.first().waitFor({ state: 'visible' });
  42 | 
  43 |         await option.first().click();
  44 | 
  45 |         console.log(`✅ State selected: ${value}`);
  46 |     }
  47 | 
  48 |     async selectReferral(value) {
  49 | 
  50 |         const input = this.page.locator('#referral-select-box');
  51 | 
  52 |         await input.click();
  53 | 
  54 |         const option = this.page.locator(`[role="option"]:has-text("${value}")`);
  55 | 
  56 |         await option.first().waitFor({ state: 'visible', timeout: 10000 });
  57 | 
  58 |         await option.first().click();
  59 | 
  60 |         console.log(`✅ Referral selected: ${value}`);
  61 |     }
  62 | 
  63 |     async selectReferralOther(value) {
  64 |         const nameInput = this.page.locator('input[placeholder="Enter Doctor Name"]');
  65 |         await nameInput.fill(value);
  66 |     }
  67 | 
  68 |     async submit() {
  69 |         await this.page.click('button:has-text("Book Now")');
  70 |     }
  71 | }
  72 | 
```