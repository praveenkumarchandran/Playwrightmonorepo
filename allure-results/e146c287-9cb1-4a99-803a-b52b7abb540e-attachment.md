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
Error: page.fill: Test timeout of 180000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]')

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
              - textbox "Last Name *" [active] [ref=e101]: Doe
              - group:
                - generic: Last Name *
          - generic [ref=e103]:
            - generic: Date of Birth *
            - generic [ref=e104]:
              - textbox "Date of Birth *" [ref=e105]:
                - /placeholder: MM/DD/YYYY
              - button "Choose date" [ref=e107] [cursor=pointer]:
                - img [ref=e108]
              - group:
                - generic: Date of Birth *
          - generic [ref=e111]:
            - combobox "Gender *" [ref=e112] [cursor=pointer]:
              - paragraph [ref=e113]: Gender *
            - textbox
            - img
            - group
          - generic [ref=e115]:
            - generic: Email *
            - generic [ref=e116]:
              - textbox "Email *" [ref=e117]
              - group:
                - generic: Email *
          - generic [ref=e119]:
            - generic: Phone *
            - generic [ref=e120]:
              - spinbutton "Phone *" [ref=e121]
              - group:
                - generic: Phone *
        - generic [ref=e122]:
          - generic [ref=e124]:
            - generic: Address1 *
            - generic [ref=e125]:
              - textbox "Address1 *" [ref=e126]
              - group:
                - generic: Address1 *
          - generic [ref=e128]:
            - generic: Address2 (Optional)
            - generic [ref=e129]:
              - textbox "Address2 (Optional)" [ref=e130]
              - group:
                - generic: Address2 (Optional)
          - generic [ref=e132]:
            - generic: City *
            - generic [ref=e133]:
              - textbox "City *" [ref=e134]
              - group:
                - generic: City *
          - generic [ref=e138]:
            - combobox "State *" [ref=e139]
            - button "Open" [ref=e141] [cursor=pointer]:
              - img [ref=e142]
            - group
          - generic [ref=e145]:
            - generic: Home Zip *
            - generic [ref=e146]:
              - textbox "Home Zip *" [ref=e147]
              - group:
                - generic: Home Zip *
          - generic [ref=e150]:
            - generic: How Did You Hear About Us? *
            - generic [ref=e151]:
              - combobox "How Did You Hear About Us? *" [ref=e152]
              - button "Open" [ref=e154] [cursor=pointer]:
                - img [ref=e155]
              - group:
                - generic: How Did You Hear About Us? *
      - generic [ref=e157]:
        - generic [ref=e158] [cursor=pointer]:
          - checkbox [ref=e159]
          - img [ref=e160]
        - paragraph [ref=e162]: I give permission for the practice to contact me via SMS or email. I understand that I can opt out at any time.
      - button "Book Now" [ref=e164] [cursor=pointer]
```

# Test source

```ts
  1  | export class PatientInfoPage {
  2  |     constructor(page) {
  3  |         this.page = page;
  4  |     }
  5  | 
  6  |     async fillBasicInfo(data) {
  7  |         await this.page.fill('input[name*="first"]', data.firstName);
  8  |         await this.page.fill('input[name*="last"]', data.lastName);
> 9  |         await this.page.fill('input[type="email"]', data.email);
     |                         ^ Error: page.fill: Test timeout of 180000ms exceeded.
  10 |         await this.page.fill('input[type="tel"]', data.phone);
  11 |         await this.page.fill('input[name*="address"]', data.address);
  12 |         await this.page.fill('input[name*="city"]', data.city);
  13 |         await this.page.fill('input[name*="zip"]', data.zip);
  14 |     }
  15 | 
  16 |     async fillDOB(dob) {
  17 |         const input = this.page.locator('input[placeholder="MM/DD/YYYY"]');
  18 |         await input.fill(dob);
  19 |     }
  20 | 
  21 |     async selectGender(value = "Male") {
  22 |         await this.page.click('label:has-text("Gender") ~ div');
  23 |         await this.page.click(`[role="option"]:has-text("${value}")`);
  24 |     }
  25 | 
  26 |     async selectState(value = "MI") {
  27 |         await this.page.click('label:has-text("State") ~ div');
  28 |         await this.page.click(`[role="option"]:has-text("${value}")`);
  29 |     }
  30 | 
  31 |     async submit() {
  32 |         await this.page.click('button:has-text("Book Now")');
  33 |     }
  34 | }
  35 | 
```