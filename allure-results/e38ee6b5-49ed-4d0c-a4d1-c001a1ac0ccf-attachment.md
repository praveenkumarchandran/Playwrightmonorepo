# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\booking\setup\TNDIBooking.setup.js >> reach additionaldetails and save state
- Location: tests\e2e\booking\setup\TNDIBooking.setup.js:14:1

# Error details

```
TimeoutError: locator.waitFor: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('[id^="recentslot-"]').first() to be visible

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
    - generic [ref=e96]:
      - generic [ref=e97]:
        - paragraph [ref=e98]: Select Date
        - generic [ref=e99]:
          - button [disabled]:
            - img
          - generic [ref=e101]:
            - button "Mon 25 May" [ref=e105] [cursor=pointer]:
              - paragraph [ref=e106]: Mon
              - paragraph [ref=e107]: "25"
              - paragraph [ref=e108]: May
            - button "Tue 26 May" [ref=e112] [cursor=pointer]:
              - paragraph [ref=e113]: Tue
              - paragraph [ref=e114]: "26"
              - paragraph [ref=e115]: May
            - button "Fri 29 May" [ref=e119] [cursor=pointer]:
              - paragraph [ref=e120]: Fri
              - paragraph [ref=e121]: "29"
              - paragraph [ref=e122]: May
            - button "Mon 01 Jun" [ref=e126] [cursor=pointer]:
              - paragraph [ref=e127]: Mon
              - paragraph [ref=e128]: "01"
              - paragraph [ref=e129]: Jun
            - button "Tue 02 Jun" [ref=e133] [cursor=pointer]:
              - paragraph [ref=e134]: Tue
              - paragraph [ref=e135]: "02"
              - paragraph [ref=e136]: Jun
          - button [disabled]:
            - img
      - generic [ref=e137]:
        - paragraph [ref=e138]: Available Time Slots
        - generic [ref=e139]:
          - img [ref=e140]
          - generic [ref=e142]: Morning
        - generic [ref=e143]:
          - button "We will always try to assign an in-network provider first, where applicable, before applying the selected criteria" [ref=e144] [cursor=pointer]: 8:30 AM
          - button "We will always try to assign an in-network provider first, where applicable, before applying the selected criteria" [ref=e145] [cursor=pointer]: 9:30 AM
          - button "We will always try to assign an in-network provider first, where applicable, before applying the selected criteria" [ref=e146] [cursor=pointer]: 10:30 AM
          - button "We will always try to assign an in-network provider first, where applicable, before applying the selected criteria" [ref=e147] [cursor=pointer]: 11:30 AM
        - generic [ref=e148]:
          - img [ref=e149]
          - generic [ref=e151]: Afternoon
        - generic [ref=e152]:
          - button "We will always try to assign an in-network provider first, where applicable, before applying the selected criteria" [ref=e153] [cursor=pointer]: 1:30 PM
          - button "We will always try to assign an in-network provider first, where applicable, before applying the selected criteria" [ref=e154] [cursor=pointer]: 2:30 PM
          - button "We will always try to assign an in-network provider first, where applicable, before applying the selected criteria" [ref=e155] [cursor=pointer]: 3:30 PM
        - generic [ref=e156]:
          - paragraph [ref=e157]: "Appointment Type: Teleconsultation"
          - separator [ref=e158]
          - paragraph [ref=e159]: "Selected:"
        - generic [ref=e160]:
          - button "Continue" [disabled]
```

# Test source

```ts
  1   | // export class SlotPage {
  2   | //     constructor(page) {
  3   | //         this.page = page;
  4   | //     }
  5   | 
  6   | //  async clickAnySlot() {
  7   | //     const slot = this.page.locator('button:has-text("AM"), button:has-text("PM")').first();
  8   | 
  9   | //     await slot.waitFor({ state: 'visible' });
  10  | //     await slot.click();
  11  | 
  12  | //     console.log("Clicked first available slot");
  13  | // }
  14  | 
  15  | //     async continue() {
  16  | //         await this.page.click('button:has-text("Continue")');
  17  | //     }
  18  | // }
  19  | 
  20  | 
  21  | export class SlotPage {
  22  |     constructor(page) {
  23  |         this.page = page;
  24  | 
  25  |         // ── Filters (Clarus only — TNDI doesn't show these) ───────────────────
  26  |         this.locationInput = page.locator('input#appointment_location-select-box');
  27  |         this.appointmentReason = page.locator('input#appointment_servicetype-select-box');
  28  |         this.providerInput = page.locator('input#provider-select-box');
  29  | 
  30  |         // ── Slots ─────────────────────────────────────────────────────────────
  31  |         // All time slot buttons share id prefix "recentslot-"
  32  |         this.anySlot = page.locator('[id^="recentslot-"]').first();
  33  |         this.continueBtn = page.locator('button:has-text("Continue"), button:has-text("Next")').first();
  34  |     }
  35  | 
  36  |     // ── Private helper — shared MUI autocomplete select ───────────────────────
  37  |     async #selectOption(input, value) {
  38  |         await input.click();
  39  |         await input.clear();
  40  |         await input.pressSequentially(value, { delay: 50 });
  41  | 
  42  |         const option = this.page
  43  |             .locator('[role="option"]')
  44  |             .filter({ hasText: value })
  45  |             .first();
  46  | 
  47  |         await option.waitFor({ state: 'visible', timeout: 10_000 });
  48  |         await option.click();
  49  |         console.log(`✅ Selected: ${value}`);
  50  |     }
  51  | 
  52  |     // ── Public API ────────────────────────────────────────────────────────────
  53  | 
  54  |     /**
  55  |      * Select location filter (Clarus only)
  56  |      * @param {string} value  e.g. 'Minnetonka'
  57  |      */
  58  |     async selectLocation(value) {
  59  |         await this.#selectOption(this.locationInput, value);
  60  |     }
  61  | 
  62  |     /**
  63  |      * Select appointment reason filter (Clarus only)
  64  |      * @param {string} value  e.g. 'Skin Concern', 'Annual Exam'
  65  |      */
  66  |     async selectAppointmentReason(value) {
  67  |         await this.#selectOption(this.appointmentReason, value);
  68  |     }
  69  | 
  70  |     /**
  71  |      * Select provider filter (optional for both clients)
  72  |      * @param {string} value  e.g. 'Binh Vu', 'Jesse Ochoa'
  73  |      */
  74  |     async selectProvider(value) {
  75  |         await this.#selectOption(this.providerInput, value);
  76  |     }
  77  | 
  78  |     /**
  79  |      * Click the first available slot.
  80  |      * Works for both TNDI and Clarus — slots always use id^="recentslot-"
  81  |      */
  82  |     async clickAnySlot() {
  83  |         // ✅ increased timeout — slots load from API after page renders
> 84  |         await this.anySlot.waitFor({ state: 'visible', timeout: 30_000 });
      |                            ^ TimeoutError: locator.waitFor: Timeout 30000ms exceeded.
  85  |         await this.anySlot.click();
  86  |         console.log(`✅ Slot clicked: ${await this.anySlot.textContent()}`);
  87  |     }
  88  | 
  89  |     /**
  90  |      * Click a slot by a specific provider name (Clarus)
  91  |      * Expands the provider accordion first if needed.
  92  |      * @param {string} providerName  e.g. 'Binh Vu'
  93  |      */
  94  |     async clickSlotByProvider(providerName) {
  95  |         // Expand provider accordion if collapsed
  96  |         const accordion = this.page
  97  |             .locator('[role="button"]')
  98  |             .filter({ hasText: providerName })
  99  |             .first();
  100 | 
  101 |         const isExpanded = await accordion.getAttribute('aria-expanded').catch(() => null);
  102 |         if (isExpanded === 'false' || isExpanded === null) {
  103 |             await accordion.click();
  104 |         }
  105 | 
  106 |         // Click first slot under that provider
  107 |         const slot = this.page
  108 |             .locator('[id^="recentslot-"]')
  109 |             .filter({ hasText: new RegExp(providerName, 'i') })
  110 |             .first();
  111 | 
  112 |         await slot.waitFor({ state: 'visible', timeout: 10_000 });
  113 |         await slot.click();
  114 |         console.log(`✅ Slot clicked for provider: ${providerName}`);
  115 |     }
  116 | 
  117 |     async continue() {
  118 |         await this.continueBtn.click();
  119 |     }
  120 | }
```