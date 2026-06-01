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
Error: locator.scrollIntoViewIfNeeded: Test timeout of 180000ms exceeded.
Call log:
  - waiting for locator('div').filter({ hasText: /^State \*$/ }).first()

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
              - textbox "Date of Birth *" [ref=e106]:
                - /placeholder: MM/DD/YYYY
                - text: 01/15/1990
              - button "Choose date, selected date is Jan 15, 1990" [ref=e108] [cursor=pointer]:
                - img [ref=e109]
              - group:
                - generic: Date of Birth *
          - generic [ref=e112]:
            - combobox "Male" [ref=e113] [cursor=pointer]
            - textbox: Male
            - img
            - group
          - generic [ref=e115]:
            - generic [ref=e116]: Email *
            - generic [ref=e117]:
              - textbox "Email *" [ref=e118]: johndoe@example.com
              - group:
                - generic: Email *
          - generic [ref=e120]:
            - generic [ref=e121]: Phone *
            - generic [ref=e122]:
              - spinbutton "Phone *" [ref=e123]: "5551234567"
              - group:
                - generic: Phone *
        - generic [ref=e124]:
          - generic [ref=e126]:
            - generic [ref=e127]: Address1 *
            - generic [ref=e128]:
              - textbox "Address1 *" [ref=e129]: 123 Main St
              - group:
                - generic: Address1 *
          - generic [ref=e131]:
            - generic: Address2 (Optional)
            - generic [ref=e132]:
              - textbox "Address2 (Optional)" [ref=e133]
              - group:
                - generic: Address2 (Optional)
          - generic [ref=e135]:
            - generic [ref=e136]: City *
            - generic [ref=e137]:
              - textbox "City *" [ref=e138]: Farmington Hills
              - group:
                - generic: City *
          - generic [ref=e142]:
            - combobox "State *" [ref=e143]
            - button "Open" [ref=e145] [cursor=pointer]:
              - img [ref=e146]
            - group
          - generic [ref=e149]:
            - generic [ref=e150]: Home Zip *
            - generic [ref=e151]:
              - textbox "Home Zip *" [ref=e152]: "48335"
              - group:
                - generic: Home Zip *
          - generic [ref=e153]:
            - generic [ref=e155]:
              - generic [ref=e156]: How Did You Hear About Us? *
              - generic [ref=e157]:
                - combobox "How Did You Hear About Us? *" [ref=e158]: Doctor
                - button "Open" [ref=e160] [cursor=pointer]:
                  - img [ref=e161]
                - group:
                  - generic: How Did You Hear About Us? *
            - generic [ref=e164]:
              - generic [ref=e165]: Doctor Name *
              - generic [ref=e166]:
                - textbox "Doctor Name *" [active] [ref=e167]:
                  - /placeholder: Enter Doctor Name
                - group:
                  - generic: Doctor Name *
      - generic [ref=e168]:
        - generic [ref=e169] [cursor=pointer]:
          - checkbox [ref=e170]
          - img [ref=e171]
        - paragraph [ref=e173]: I give permission for the practice to contact me via SMS or email. I understand that I can opt out at any time.
      - button "Book Now" [ref=e175] [cursor=pointer]
```

# Test source

```ts
  11  |         this.address2 = page.locator('input[name*="address2"]');
  12  |         this.city = page.locator('input[name*="city"]');
  13  |         this.zip = page.locator('input[name*="homeZip"]');
  14  |         this.dob = page.locator('input[placeholder="MM/DD/YYYY"]');
  15  | 
  16  |         // ── Custom dropdowns (visible label text → container div) ─────────────
  17  |         // These are NOT native <select> — they're styled divs with a ▼ arrow.
  18  |         // We target the wrapper that contains the floating label text, then click it.
  19  |         this.genderDropdown = page.locator('div').filter({ hasText: /^Gender \*$/ }).first();
  20  |         this.stateDropdown = page.locator('div').filter({ hasText: /^State \*$/ }).first();
  21  |         this.referralDropdown = page.locator('div').filter({ hasText: /^How Did You Hear About Us\? \*$/ }).first();
  22  | 
  23  |         // ── Other ─────────────────────────────────────────────────────────────
  24  |         this.smsConsent = page.locator('input[type="checkbox"]').first();
  25  |         this.submitBtn = page.locator('button:has-text("Book Now")');
  26  |         this.doctorName = page.locator('input[placeholder="Enter Doctor Name"]');
  27  |     }
  28  | 
  29  |     // ── Private helpers ───────────────────────────────────────────────────────
  30  | 
  31  |     /**
  32  |      * Clicks a custom dropdown container, waits for options to appear,
  33  |      * optionally types to filter, then clicks the matching option.
  34  |      *
  35  |      * @param {import('@playwright/test').Locator} dropdownLocator
  36  |      * @param {string} value            option label to select
  37  |      * @param {boolean} [searchable]    true if dropdown has a type-to-filter input
  38  |      */
  39  |     async #pickDropdownOption(dropdownLocator, value, searchable = false) {
  40  |         await dropdownLocator.scrollIntoViewIfNeeded();
  41  |         await dropdownLocator.click();
  42  | 
  43  |         // Wait for any option to be visible before proceeding
  44  |         await this.page.waitForSelector(
  45  |             '[role="listbox"], [role="option"], li[role="option"]',
  46  |             { state: 'visible', timeout: 10_000 }
  47  |         );
  48  | 
  49  |         if (searchable) {
  50  |             // If the dropdown renders a search input after opening, type to filter
  51  |             const searchInput = this.page
  52  |                 .locator('[role="listbox"] input, [role="combobox"][aria-expanded="true"]')
  53  |                 .first();
  54  |             if (await searchInput.isVisible().catch(() => false)) {
  55  |                 await searchInput.fill(value);
  56  |                 await this.page.waitForTimeout(300); // let the list re-render
  57  |             }
  58  |         }
  59  | 
  60  |         const option = this.page
  61  |             .locator('[role="option"], li[role="option"]')
  62  |             .filter({ hasText: value })
  63  |             .first();
  64  | 
  65  |         await option.waitFor({ state: 'visible', timeout: 10_000 });
  66  |         await option.click();
  67  |     }
  68  | 
  69  |     // ── Public API ────────────────────────────────────────────────────────────
  70  | 
  71  |     async fillBasicInfo(data) {
  72  |         await this.firstName.fill(data.firstName);
  73  |         await this.lastName.fill(data.lastName);
  74  |         await this.email.fill(data.email);
  75  | 
  76  |         await this.phone.click();
  77  |         await this.phone.clear();
  78  |         await this.phone.fill(String(data.phone));
  79  | 
  80  |         await this.address.fill(data.address);
  81  |         if (data.address2) await this.address2.fill(data.address2);
  82  | 
  83  |         await this.city.fill(data.city);
  84  |         await this.zip.fill(String(data.zip));
  85  |     }
  86  | 
  87  |     async fillDOB(dob) {
  88  |         // Masked inputs reject programmatic fill() — simulate real keystrokes
  89  |         await this.dob.click();
  90  |         await this.dob.pressSequentially(dob.replace(/\D/g, ''), { delay: 80 });
  91  |     }
  92  | 
  93  |     /** @param {'Male'|'Female'|'Other'} value */
  94  |     async selectGender(value = 'Male') {
  95  |         await this.#pickDropdownOption(this.genderDropdown, value);
  96  |         console.log(`✅ Gender selected: ${value}`);
  97  |     }
  98  | 
  99  |     /**
  100 |      * Clicks the State dropdown, waits for the API response that loads the list,
  101 |      * then picks the matching option.
  102 |      * @param {string} value  e.g. 'Michigan'
  103 |      */
  104 |     async selectState(value = 'Michigan') {
  105 |         // Register the listener BEFORE the click that fires the request
  106 |         const stateResponsePromise = this.page.waitForResponse(
  107 |             res => res.url().includes('getStates') && res.status() === 200,
  108 |             { timeout: 15_000 }
  109 |         );
  110 | 
> 111 |         await this.stateDropdown.scrollIntoViewIfNeeded();
      |                                  ^ Error: locator.scrollIntoViewIfNeeded: Test timeout of 180000ms exceeded.
  112 |         await this.stateDropdown.click();
  113 |         await stateResponsePromise;
  114 |         console.log('✅ State options loaded');
  115 | 
  116 |         const option = this.page
  117 |             .locator('[role="option"], li[role="option"]')
  118 |             .filter({ hasText: value })
  119 |             .first();
  120 | 
  121 |         await option.waitFor({ state: 'visible', timeout: 10_000 });
  122 |         await option.click();
  123 |         console.log(`✅ State selected: ${value}`);
  124 |     }
  125 | 
  126 |     /** @param {string} value  e.g. 'Google', 'Friend', 'Doctor Referral' */
  127 |     async selectReferral(value) {
  128 |         await this.#pickDropdownOption(this.referralDropdown, value, true);
  129 |         console.log(`✅ Referral (How Did You Hear) selected: ${value}`);
  130 |     }
  131 | 
  132 |     /** Shown only when referral answer requires a doctor name */
  133 |     async selectReferralOther(value) {
  134 |         await this.doctorName.fill(value);
  135 |     }
  136 | 
  137 |     async checkSmsConsent() {
  138 |         if (!(await this.smsConsent.isChecked())) {
  139 |             await this.smsConsent.check();
  140 |         }
  141 |         console.log('✅ SMS consent checked');
  142 |     }
  143 | 
  144 |     async submit() {
  145 |         await this.submitBtn.click();
  146 |     }
  147 | 
  148 |     // ── Convenience: fill the whole page in one call ──────────────────────────
  149 | 
  150 |     /**
  151 |      * @example
  152 |      * await patientPage.fillAll({
  153 |      *   basicInfo: {
  154 |      *     firstName: 'John',   lastName: 'Doe',
  155 |      *     email: 'john@example.com',  phone: '5551234567',
  156 |      *     address: '123 Main St',     city: 'Farmington Hills',  zip: '48335'
  157 |      *   },
  158 |      *   dob:        '01151990',   // MMDDYYYY — digits only
  159 |      *   gender:     'Male',
  160 |      *   state:      'Michigan',
  161 |      *   referral:   'Google',
  162 |      *   smsConsent: true,
  163 |      * });
  164 |      */
  165 |     async fillAll({ basicInfo, dob, gender, state, referral, referralOther, smsConsent } = {}) {
  166 |         if (basicInfo) await this.fillBasicInfo(basicInfo);
  167 |         if (dob) await this.fillDOB(dob);
  168 |         if (gender) await this.selectGender(gender);
  169 |         if (state) await this.selectState(state);
  170 |         if (referral) await this.selectReferral(referral);
  171 |         if (referralOther) await this.selectReferralOther(referralOther);
  172 |         if (smsConsent) await this.checkSmsConsent();
  173 |     }
  174 | }
```