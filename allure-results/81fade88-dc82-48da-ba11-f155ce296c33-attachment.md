# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\booking\setup\TNDIBooking.setup.js >> reach additionaldetails and save state
- Location: tests\e2e\booking\setup\TNDIBooking.setup.js:14:1

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
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
        - generic [ref=e27]:
          - generic [ref=e28]:
            - combobox "Visit reason" [ref=e29]: Teleconsultation
            - button "Open" [ref=e31] [cursor=pointer]:
              - img [ref=e32]
            - group
          - paragraph [ref=e34]: Please select a service type
      - generic [ref=e35]:
        - heading "Have you visited us before?" [level=5] [ref=e36]
        - generic [ref=e37]:
          - button "Existing Patient" [ref=e38] [cursor=pointer]
          - button "New Patient" [active] [ref=e39] [cursor=pointer]: New Patient
      - generic [ref=e41]:
        - heading "Powered by" [level=6] [ref=e42]
        - img "MUlogo" [ref=e43]
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
  19 |             console.log(`✅ Reason selected: ${reasonType}`);
  20 |         }
  21 | 
  22 |         await this.newPatientBtn.click();
  23 | 
  24 |         // ✅ log the actual URL before waiting
  25 |         await this.page.waitForTimeout(2000);
  26 |         console.log('📍 URL after New Patient click:', this.page.url());
  27 | 
> 28 |         await this.page.waitForURL(/findappointment/, { timeout: 15_000 });
     |                         ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  29 |         console.log('✅ Navigated to find appointment page');
  30 |     }
  31 | }
```