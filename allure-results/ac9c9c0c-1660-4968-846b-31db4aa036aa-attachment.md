# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\booking\create-appointment.spec.js >> Date of Birth >> TC09 — fills DOB in MM/DD/YYYY format
- Location: tests\e2e\booking\shared\patientInfo.cases.js:95:9

# Error details

```
Test timeout of 30000ms exceeded while setting up "patientPage".
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.MuiFormControlLabel-root:has-text("No")').first()
    - locator resolved to <label class="MuiFormControlLabel-root MuiFormControlLabel-labelPlacementEnd css-1jaw3da">…</label>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <li tabindex="-1" role="option" id=":r16:-option-1" aria-selected="true" data-option-index="1" aria-disabled="false" class="MuiAutocomplete-option Mui-focused">…</li> from <div role="presentation" data-popper-placement="bottom" class="MuiPopper-root MuiAutocomplete-popper css-1mtsuo7">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <li tabindex="-1" role="option" id=":r16:-option-1" aria-selected="true" data-option-index="1" aria-disabled="false" class="MuiAutocomplete-option Mui-focused">…</li> from <div role="presentation" data-popper-placement="bottom" class="MuiPopper-root MuiAutocomplete-popper css-1mtsuo7">…</div> subtree intercepts pointer events
  - retrying click action
    - waiting 100ms

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
        - generic [ref=e93]:
          - generic [ref=e94]:
            - generic [ref=e95]: What symptoms are you experiencing?
            - generic [ref=e96]:
              - button "Knee Pain" [ref=e97]:
                - generic [ref=e98]: Knee Pain
                - img [ref=e99] [cursor=pointer]
              - button "Neck Pain" [ref=e101]:
                - generic [ref=e102]: Neck Pain
                - img [ref=e103] [cursor=pointer]
              - combobox "What symptoms are you experiencing?" [expanded] [active] [ref=e105]
              - generic [ref=e106]:
                - button "Clear" [ref=e107] [cursor=pointer]:
                  - img [ref=e108]
                - button "Close" [ref=e110] [cursor=pointer]:
                  - img [ref=e111]
              - group:
                - generic: What symptoms are you experiencing?
          - listbox "What symptoms are you experiencing?" [ref=e113]:
            - option "Lower Back Pain" [ref=e114] [cursor=pointer]:
              - generic [ref=e115]:
                - checkbox [ref=e116]
                - img [ref=e117]
              - text: Lower Back Pain
            - option "Neck Pain" [selected] [ref=e119] [cursor=pointer]:
              - generic [ref=e120]:
                - checkbox [checked] [ref=e121]
                - img [ref=e122]
              - text: Neck Pain
            - option "Knee Pain" [selected] [ref=e124] [cursor=pointer]:
              - generic [ref=e125]:
                - checkbox [checked] [ref=e126]
                - img [ref=e127]
              - text: Knee Pain
            - option "Nerve Pain" [ref=e129] [cursor=pointer]:
              - generic [ref=e130]:
                - checkbox [ref=e131]
                - img [ref=e132]
              - text: Nerve Pain
            - option "Pain in Legs/Arms/Feet" [ref=e134] [cursor=pointer]:
              - generic [ref=e135]:
                - checkbox [ref=e136]
                - img [ref=e137]
              - text: Pain in Legs/Arms/Feet
            - option "Numbness/Tingling" [ref=e139] [cursor=pointer]:
              - generic [ref=e140]:
                - checkbox [ref=e141]
                - img [ref=e142]
              - text: Numbness/Tingling
            - option "Other" [ref=e144] [cursor=pointer]:
              - generic [ref=e145]:
                - checkbox [ref=e146]
                - img [ref=e147]
              - text: Other
      - generic [ref=e149]:
        - paragraph [ref=e150]: Have you had surgery for this condition previously?
        - radiogroup [ref=e151]:
          - generic [ref=e152] [cursor=pointer]:
            - generic [ref=e153]:
              - radio "Yes" [ref=e154]
              - img [ref=e156]
            - generic [ref=e158]: "Yes"
          - generic [ref=e159] [cursor=pointer]:
            - generic [ref=e160]:
              - radio "No" [ref=e161]
              - img [ref=e163]
            - generic [ref=e165]: "No"
      - generic [ref=e166]:
        - paragraph [ref=e167]: Have you had an MRI for this condition within the last 3 years?
        - radiogroup [ref=e168]:
          - generic [ref=e169] [cursor=pointer]:
            - generic [ref=e170]:
              - radio "Yes" [ref=e171]
              - img [ref=e173]
            - generic [ref=e175]: "Yes"
          - generic [ref=e176] [cursor=pointer]:
            - generic [ref=e177]:
              - radio "No" [ref=e178]
              - img [ref=e180]
            - generic [ref=e182]: "No"
      - generic [ref=e183]:
        - paragraph [ref=e184]: Have you had a CT scan for this condition within the last 3 years?
        - radiogroup [ref=e185]:
          - generic [ref=e186] [cursor=pointer]:
            - generic [ref=e187]:
              - radio "Yes" [ref=e188]
              - img [ref=e190]
            - generic [ref=e192]: "Yes"
          - generic [ref=e193] [cursor=pointer]:
            - generic [ref=e194]:
              - radio "No" [ref=e195]
              - img [ref=e197]
            - generic [ref=e199]: "No"
      - generic [ref=e200]:
        - paragraph [ref=e201]: Have you had an X-ray for this condition within the last year?
        - radiogroup [ref=e202]:
          - generic [ref=e203] [cursor=pointer]:
            - generic [ref=e204]:
              - radio "Yes" [ref=e205]
              - img [ref=e207]
            - generic [ref=e209]: "Yes"
          - generic [ref=e210] [cursor=pointer]:
            - generic [ref=e211]:
              - radio "No" [ref=e212]
              - img [ref=e214]
            - generic [ref=e216]: "No"
      - generic [ref=e217]:
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
  8  |         await this.page.click(this.symptomInput);
  9  |         await this.page.fill(this.symptomInput, 'Knee');
  10 |         await this.page.click('.MuiAutocomplete-option:has-text("Knee Pain")');
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
> 24 |             await noLabels.nth(i).click();
     |                                   ^ Error: locator.click: Test timeout of 30000ms exceeded.
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