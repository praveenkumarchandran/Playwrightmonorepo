# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: booking\create-appointment.spec.js >> Setter Booking Flow (POM)
- Location: tests\e2e\booking\create-appointment.spec.js:10:1

# Error details

```
Error: Slot 2:30 PM not found
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
    - generic [ref=e70]:
      - paragraph [ref=e72]: Change Filters
      - separator [ref=e73]
      - generic [ref=e76]:
        - generic [ref=e77]: Location
        - generic [ref=e78]:
          - combobox "Location" [ref=e79]: The Nerve and Disc Institute Farmington
          - button "Open" [ref=e81] [cursor=pointer]:
            - img [ref=e82]
          - group:
            - generic: Location
      - separator [ref=e84]
      - generic [ref=e87]:
        - generic [ref=e88]: Appointment Reason
        - generic [ref=e89]:
          - combobox "Appointment Reason" [ref=e90]: Teleconsultation
          - button "Open" [ref=e92] [cursor=pointer]:
            - img [ref=e93]
          - group:
            - generic: Appointment Reason
      - separator [ref=e95]
    - generic [ref=e98]:
      - progressbar [ref=e99]:
        - img [ref=e100]
      - heading "Loading..." [level=6] [ref=e102]
```

# Test source

```ts
  1  | export class SlotPage {
  2  |     constructor(page) {
  3  |         this.page = page;
  4  |     }
  5  | 
  6  |     async selectSlot(time = "2:30 PM") {
  7  |         const buttons = await this.page.locator('button').all();
  8  | 
  9  |         for (const btn of buttons) {
  10 |             const txt = (await btn.textContent() || '').trim();
  11 |             if (txt.includes(time)) {
  12 |                 await btn.click();
  13 |                 return;
  14 |             }
  15 |         }
  16 | 
> 17 |         throw new Error(`Slot ${time} not found`);
     |               ^ Error: Slot 2:30 PM not found
  18 |     }
  19 | 
  20 |     async continue() {
  21 |         await this.page.click('button:has-text("Continue")');
  22 |     }
  23 | }
  24 | 
```