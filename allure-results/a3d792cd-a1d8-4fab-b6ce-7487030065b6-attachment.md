# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\booking\setup\TNDIBooking.setup.js >> reach additionaldetails and save state
- Location: tests\e2e\booking\setup\TNDIBooking.setup.js:14:1

# Error details

```
Error: locator.pressSequentially: text: expected string, got undefined
```

# Page snapshot

```yaml
- generic [ref=e1]:
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
            - combobox "Visit reason" [active] [ref=e29]
            - progressbar [ref=e30]:
              - img [ref=e31]
            - button "Close" [ref=e34] [cursor=pointer]:
              - img [ref=e35]
            - group
        - generic [ref=e37]:
          - heading "Have you visited us before?" [level=5] [ref=e38]
          - generic [ref=e39]:
            - button "Existing Patient" [ref=e40] [cursor=pointer]
            - button "New Patient" [ref=e41] [cursor=pointer]
        - generic [ref=e43]:
          - heading "Powered by" [level=6] [ref=e44]
          - img "MUlogo" [ref=e45]
  - generic [ref=e47]: Loading…
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
  12 |     async startNewPatient(reasonType) {
  13 |         // Reason must be selected BEFORE clicking New Patient
  14 |         await this.reasonDropdown.waitFor({ state: 'visible', timeout: 10_000 });
  15 |         await this.reasonDropdown.click();
> 16 |         await this.reasonDropdown.pressSequentially(reasonType, { delay: 50 });
     |                                   ^ Error: locator.pressSequentially: text: expected string, got undefined
  17 |         const option = this.page.locator('[role="option"]').filter({ hasText: reasonType }).first();
  18 |         await option.waitFor({ state: 'visible', timeout: 10_000 });
  19 |         await option.click();
  20 |         console.log(`Reason selected: ${reasonType}`);
  21 | 
  22 |         await this.newPatientBtn.waitFor({ state: 'visible', timeout: 10_000 });
  23 |         await this.newPatientBtn.click();
  24 | 
  25 |         await this.page.waitForLoadState('networkidle', { timeout: 30_000 });
  26 |     }
  27 | }
```