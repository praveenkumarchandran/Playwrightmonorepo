# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\booking\ClarusDerm\clarus-appointment.spec.js >> Setter Booking Flow for ClarusDerm
- Location: tests\e2e\booking\ClarusDerm\clarus-appointment.spec.js:9:1

# Error details

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[id^="recentslot-"]').first() to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e5]:
    - generic [ref=e7]:
      - img "logo" [ref=e9]
      - heading "877-408-2431" [level=6] [ref=e12]
  - generic [ref=e15]:
    - generic [ref=e17]:
      - paragraph [ref=e18]: Clarus Dermatology
      - generic [ref=e19]:
        - paragraph [ref=e20]: "15450 MN-7 #225,"
        - paragraph [ref=e21]: Minnetonka, MN 55345
    - generic [ref=e23]:
      - generic:
        - heading [level=3]
      - generic [ref=e24]:
        - heading "What is your reason for scheduling?" [level=5] [ref=e25]
        - generic [ref=e28]:
          - combobox "Visit reason" [active] [ref=e29]: Acne
          - button "Open" [ref=e31] [cursor=pointer]:
            - img [ref=e32]
          - group
      - generic [ref=e34]:
        - heading "Have you visited us before?" [level=5] [ref=e35]
        - generic [ref=e36]:
          - button "Existing Patient" [ref=e37] [cursor=pointer]
          - button "New Patient" [ref=e38] [cursor=pointer]: New Patient
      - generic [ref=e40]:
        - heading "Powered by" [level=6] [ref=e41]
        - img "MUlogo" [ref=e42]
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
> 83  |         await this.anySlot.waitFor({ state: 'visible', timeout: 15_000 });
      |                            ^ TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
  84  |         await this.anySlot.click();
  85  |         console.log(`✅ Slot clicked: ${await this.anySlot.textContent()}`);
  86  |     }
  87  | 
  88  |     /**
  89  |      * Click a slot by a specific provider name (Clarus)
  90  |      * Expands the provider accordion first if needed.
  91  |      * @param {string} providerName  e.g. 'Binh Vu'
  92  |      */
  93  |     async clickSlotByProvider(providerName) {
  94  |         // Expand provider accordion if collapsed
  95  |         const accordion = this.page
  96  |             .locator('[role="button"]')
  97  |             .filter({ hasText: providerName })
  98  |             .first();
  99  | 
  100 |         const isExpanded = await accordion.getAttribute('aria-expanded').catch(() => null);
  101 |         if (isExpanded === 'false' || isExpanded === null) {
  102 |             await accordion.click();
  103 |         }
  104 | 
  105 |         // Click first slot under that provider
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
  117 |         await this.continueBtn.click();
  118 |     }
  119 | }
```