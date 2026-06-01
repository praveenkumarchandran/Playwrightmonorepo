# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\booking\ClarusDerm\clarus-appointment.spec.js >> Setter Booking Flow for ClarusDerm
- Location: tests\e2e\booking\ClarusDerm\clarus-appointment.spec.js:9:1

# Error details

```
TimeoutError: locator.waitFor: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('button.MuiButton-outlined').filter({ hasText: /Mon|Tue|Wed|Thu|Fri|Sat|Sun/ }).first() to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e7]:
        - img "logo" [ref=e9]
        - heading "877-408-2431" [level=6] [ref=e12]
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
        - paragraph [ref=e44]: Add Insurance
      - generic [ref=e48]:
        - button "4" [ref=e50] [cursor=pointer]:
          - paragraph [ref=e51]: "4"
        - paragraph [ref=e54]: Add Info
  - generic [ref=e57]:
    - generic [ref=e60]:
      - paragraph [ref=e62]: Basic Search
      - separator [ref=e63]
      - generic [ref=e66]:
        - generic [ref=e67]: Location
        - generic [ref=e68]:
          - combobox "Location" [ref=e69]: Minnetonka
          - button "Open" [ref=e71] [cursor=pointer]:
            - img [ref=e72]
          - group:
            - generic: Location
      - separator [ref=e74]
      - generic [ref=e77]:
        - generic [ref=e78]: Appointment Reason
        - generic [ref=e79]:
          - combobox "Appointment Reason" [ref=e80]: Acne
          - button "Open" [ref=e82] [cursor=pointer]:
            - img [ref=e83]
          - group:
            - generic: Appointment Reason
      - separator [ref=e85]
      - generic [ref=e88]:
        - generic [ref=e89]: Provider
        - generic [ref=e90]:
          - combobox "Provider" [ref=e91]: Any Provider
          - button "Open" [ref=e93] [cursor=pointer]:
            - img [ref=e94]
          - group:
            - generic: Provider
      - separator [ref=e96]
      - generic [ref=e97]:
        - paragraph [ref=e98]: Provider Gender
        - generic [ref=e99]:
          - generic [ref=e100]:
            - generic [ref=e101] [cursor=pointer]:
              - checkbox [checked] [ref=e102]
              - img [ref=e103]
            - paragraph [ref=e105]: Male
          - generic [ref=e106]:
            - generic [ref=e107] [cursor=pointer]:
              - checkbox [checked] [ref=e108]
              - img [ref=e109]
            - paragraph [ref=e111]: Female
    - generic [ref=e112]:
      - heading "Binh Vu Binh Vu Thu Aug 6 8:10 AM Thu Aug 6 8:20 AM Thu Aug 6 8:30 AM Show More" [level=3] [ref=e114]:
        - button "Binh Vu Binh Vu Thu Aug 6 8:10 AM Thu Aug 6 8:20 AM Thu Aug 6 8:30 AM Show More" [ref=e115]:
          - generic [ref=e118]:
            - img "Binh Vu" [ref=e120]
            - generic [ref=e121]:
              - paragraph [ref=e123]: Binh Vu
              - generic [ref=e124]:
                - button "Thu Aug 6 8:10 AM" [ref=e125] [cursor=pointer]:
                  - paragraph [ref=e126]: Thu Aug 6
                  - paragraph [ref=e127]: 8:10 AM
                - button "Thu Aug 6 8:20 AM" [ref=e128] [cursor=pointer]:
                  - paragraph [ref=e129]: Thu Aug 6
                  - paragraph [ref=e130]: 8:20 AM
                - button "Thu Aug 6 8:30 AM" [ref=e131] [cursor=pointer]:
                  - paragraph [ref=e132]: Thu Aug 6
                  - paragraph [ref=e133]: 8:30 AM
              - paragraph [ref=e134] [cursor=pointer]: Show More
      - heading "J Jesse Ochoa Thu Jun 25 12:30 PM Thu Jul 23 9:00 AM Thu Jul 23 9:45 AM Show More" [level=3] [ref=e136]:
        - button "J Jesse Ochoa Thu Jun 25 12:30 PM Thu Jul 23 9:00 AM Thu Jul 23 9:45 AM Show More" [ref=e137]:
          - generic [ref=e140]:
            - generic [ref=e141]: J
            - generic [ref=e142]:
              - paragraph [ref=e144]: Jesse Ochoa
              - generic [ref=e145]:
                - button "Thu Jun 25 12:30 PM" [ref=e146] [cursor=pointer]:
                  - paragraph [ref=e147]: Thu Jun 25
                  - paragraph [ref=e148]: 12:30 PM
                - button "Thu Jul 23 9:00 AM" [ref=e149] [cursor=pointer]:
                  - paragraph [ref=e150]: Thu Jul 23
                  - paragraph [ref=e151]: 9:00 AM
                - button "Thu Jul 23 9:45 AM" [ref=e152] [cursor=pointer]:
                  - paragraph [ref=e153]: Thu Jul 23
                  - paragraph [ref=e154]: 9:45 AM
              - paragraph [ref=e155] [cursor=pointer]: Show More
      - separator [ref=e156]
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
  25  |         // ── Filters (Clarus only) ─────────────────────────────────────────────
  26  |         this.locationInput = page.locator('input#appointment_location-select-box');
  27  |         this.appointmentReason = page.locator('input#appointment_servicetype-select-box');
  28  |         this.providerInput = page.locator('input#provider-select-box');
  29  | 
  30  |         // ── TNDI — date strip + time buttons ──────────────────────────────────
  31  |         this.tndiDateBtn = page.locator('button.MuiButton-outlined')
  32  |             .filter({ hasText: /Mon|Tue|Wed|Thu|Fri|Sat|Sun/ }).first();
  33  |         this.tndiTimeBtn = page.locator('button.MuiButton-outlined')
  34  |             .filter({ hasText: /AM|PM/ }).first();
  35  | 
  36  |         // ── Clarus — recentslot- id buttons ───────────────────────────────────
  37  |         this.clarusSlot = page.locator('[id^="recentslot-"]').first();
  38  | 
  39  |         this.continueBtn = page.locator('button:has-text("Continue"), button:has-text("Next")').first();
  40  |     }
  41  | 
  42  |     async #selectOption(input, value) {
  43  |         await input.click();
  44  |         await input.clear();
  45  |         await input.pressSequentially(value, { delay: 50 });
  46  | 
  47  |         const option = this.page
  48  |             .locator('[role="option"]')
  49  |             .filter({ hasText: value })
  50  |             .first();
  51  | 
  52  |         await option.waitFor({ state: 'visible', timeout: 10_000 });
  53  |         await option.click();
  54  |         console.log(`✅ Selected: ${value}`);
  55  |     }
  56  | 
  57  |     async selectLocation(value) {
  58  |         await this.#selectOption(this.locationInput, value);
  59  |     }
  60  | 
  61  |     async selectAppointmentReason(value) {
  62  |         await this.#selectOption(this.appointmentReason, value);
  63  |     }
  64  | 
  65  |     async selectProvider(value) {
  66  |         await this.#selectOption(this.providerInput, value);
  67  |     }
  68  | 
  69  |     /**
  70  |      * Auto-detects TNDI vs Clarus:
  71  |      * Clarus → clicks first recentslot- button
  72  |      * TNDI   → clicks first available date then first time slot
  73  |      */
  74  |     async clickAnySlot() {
  75  |         const isClarusSlot = await this.clarusSlot
  76  |             .isVisible({ timeout: 5_000 })
  77  |             .catch(() => false);
  78  | 
  79  |         if (isClarusSlot) {
  80  |             await this.clarusSlot.waitFor({ state: 'visible', timeout: 30_000 });
  81  |             await this.clarusSlot.click();
  82  |             console.log(`✅ Clarus slot clicked`);
  83  |         } else {
  84  |             // TNDI — click date first then time
> 85  |             await this.tndiDateBtn.waitFor({ state: 'visible', timeout: 30_000 });
      |                                    ^ TimeoutError: locator.waitFor: Timeout 30000ms exceeded.
  86  |             await this.tndiDateBtn.click();
  87  |             console.log(`✅ TNDI date clicked`);
  88  | 
  89  |             await this.tndiTimeBtn.waitFor({ state: 'visible', timeout: 15_000 });
  90  |             await this.tndiTimeBtn.click();
  91  |             console.log(`✅ TNDI time clicked`);
  92  |         }
  93  |     }
  94  | 
  95  |     async clickSlotByProvider(providerName) {
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
  106 |         const slot = this.page
  107 |             .locator('[id^="recentslot-"]')
  108 |             .filter({ hasText: new RegExp(providerName, 'i') })
  109 |             .first();
  110 | 
  111 |         await slot.waitFor({ state: 'visible', timeout: 10_000 });
  112 |         await slot.click();
  113 |         console.log(`✅ Slot clicked for provider: ${providerName}`);
  114 |     }
  115 | 
  116 |     async continue() {
  117 |         await this.continueBtn.waitFor({ state: 'visible', timeout: 10_000 });
  118 |         await this.continueBtn.click();
  119 |     }
  120 | }
```