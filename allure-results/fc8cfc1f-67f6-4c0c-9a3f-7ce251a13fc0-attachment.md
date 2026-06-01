# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\booking\setup\TNDIBooking.setup.js >> reach additionaldetails and save state
- Location: tests\e2e\booking\setup\TNDIBooking.setup.js:14:1

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: page.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Continue")')
    - locator resolved to <button disabled tabindex="-1" type="button" lineargradient="1" class="MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-colorPrimary Mui-disabled MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-colorPrimary css-aqvl0h">Continue</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
      - waiting 100ms
    164 × waiting for element to be visible, enabled and stable
        - element is not enabled
      - retrying click action
        - waiting 500ms

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
          - paragraph [ref=e83]: 8:30 AM, Fri May 29, 2026
        - generic [ref=e84]:
          - heading "Appointment Type" [level=6] [ref=e85]
          - paragraph [ref=e87]: Teleconsultation
    - generic [ref=e89]:
      - heading "Intake Questions" [level=5] [ref=e90]
      - generic [ref=e91]:
        - paragraph [ref=e92]: What symptoms are you experiencing?
        - generic [ref=e94]:
          - generic: What symptoms are you experiencing?
          - generic [ref=e95]:
            - combobox "What symptoms are you experiencing?" [ref=e96]
            - button "Open" [ref=e98] [cursor=pointer]:
              - img [ref=e99]
            - group:
              - generic: What symptoms are you experiencing?
      - generic [ref=e101]:
        - paragraph [ref=e102]: Have you had surgery for this condition previously?
        - radiogroup [ref=e103]:
          - generic [ref=e104] [cursor=pointer]:
            - generic [ref=e105]:
              - radio "Yes" [ref=e106]
              - img [ref=e108]
            - generic [ref=e110]: "Yes"
          - generic [ref=e111] [cursor=pointer]:
            - generic [ref=e112]:
              - radio "No" [checked] [ref=e113]
              - generic [ref=e114]:
                - img [ref=e115]
                - img [ref=e117]
            - generic [ref=e119]: "No"
      - generic [ref=e120]:
        - paragraph [ref=e121]: Have you had an MRI for this condition within the last 3 years?
        - radiogroup [ref=e122]:
          - generic [ref=e123] [cursor=pointer]:
            - generic [ref=e124]:
              - radio "Yes" [ref=e125]
              - img [ref=e127]
            - generic [ref=e129]: "Yes"
          - generic [ref=e130] [cursor=pointer]:
            - generic [ref=e131]:
              - radio "No" [checked] [ref=e132]
              - generic [ref=e133]:
                - img [ref=e134]
                - img [ref=e136]
            - generic [ref=e138]: "No"
      - generic [ref=e139]:
        - paragraph [ref=e140]: Have you had a CT scan for this condition within the last 3 years?
        - radiogroup [ref=e141]:
          - generic [ref=e142] [cursor=pointer]:
            - generic [ref=e143]:
              - radio "Yes" [ref=e144]
              - img [ref=e146]
            - generic [ref=e148]: "Yes"
          - generic [ref=e149] [cursor=pointer]:
            - generic [ref=e150]:
              - radio "No" [checked] [ref=e151]
              - generic [ref=e152]:
                - img [ref=e153]
                - img [ref=e155]
            - generic [ref=e157]: "No"
      - generic [ref=e158]:
        - paragraph [ref=e159]: Have you had an X-ray for this condition within the last year?
        - radiogroup [ref=e160]:
          - generic [ref=e161] [cursor=pointer]:
            - generic [ref=e162]:
              - radio "Yes" [ref=e163]
              - img [ref=e165]
            - generic [ref=e167]: "Yes"
          - generic [ref=e168] [cursor=pointer]:
            - generic [ref=e169]:
              - radio "No" [checked] [active] [ref=e170]
              - generic [ref=e171]:
                - img [ref=e172]
                - img [ref=e174]
            - generic [ref=e176]: "No"
      - generic [ref=e177]:
        - button "Continue" [disabled]
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
  8  |         // Wait for intake questions to finish loading (spinner gone)
  9  |         await this.page.locator('span.MuiCircularProgress-root')
  10 |             .first()
  11 |             .waitFor({ state: 'detached', timeout: 20_000 })
  12 |             .catch(() => {});
  13 | 
  14 |         // Teleconsultation and some appointment types have no symptom autocomplete
  15 |         const input = this.page.locator(this.symptomInput);
  16 |         if (!(await input.isVisible({ timeout: 10_000 }).catch(() => false))) return;
  17 | 
  18 |         await input.click();
  19 |         await this.page.fill(this.symptomInput, 'Knee');
  20 |         await this.page.click('.MuiAutocomplete-option:has-text("Knee Pain")');
  21 | 
  22 |         await input.click();
  23 |         await this.page.fill(this.symptomInput, 'Neck');
  24 |         await this.page.click('.MuiAutocomplete-option:has-text("Neck Pain")');
  25 |     }
  26 | 
  27 |     async answerNoQuestions() {
  28 |         const noLabels = this.page.locator(
  29 |             '.MuiFormControlLabel-root:has-text("No")'
  30 |         );
  31 | 
  32 |         // Wait for at least one question to render before counting
  33 |         await noLabels.first().waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  34 | 
  35 |         const count = await noLabels.count();
  36 |         for (let i = 0; i < count; i++) {
  37 |             await noLabels.nth(i).click();
  38 |         }
  39 |     }
  40 | 
  41 |     async continue() {
> 42 |         await this.page.click('button:has-text("Continue")');
     |                         ^ Error: page.click: Test timeout of 120000ms exceeded.
  43 |     }
  44 | }
  45 | 
  46 | 
```