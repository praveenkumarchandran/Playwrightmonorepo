# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\TNDI\newPatient.spec.js >> Slot Picker — date strip + time slots >> Date strip >> TC-SP-04 — date strip with clickable date buttons is visible
- Location: tests\e2e\shared\slotPicker.cases.js:56:13

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button').filter({ hasText: /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/i }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('button').filter({ hasText: /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/i }).first()

```

```yaml
- banner:
  - img "logo"
  - heading "586-416-3472" [level=6]
- button "1":
  - paragraph: "1"
- paragraph: Location
- button "2":
  - paragraph: "2"
- paragraph: Choose Date & Time
- button "3":
  - paragraph: "3"
- paragraph: Intake Questions
- button "4":
  - paragraph: "4"
- paragraph: Add Insurance
- button "5":
  - paragraph: "5"
- paragraph: Add Info
- paragraph: Change Filters
- separator
- text: Location
- combobox "Location": The Nerve and Disc Institute Farmington
- button "Open"
- separator
- text: Appointment Reason
- combobox "Appointment Reason": Teleconsultation
- button "Open"
- separator
- paragraph: Select Date
- button [disabled]:
  - img
- button "Fri 05 Jun":
  - paragraph: Fri
  - paragraph: "05"
  - paragraph: Jun
- button "Mon 08 Jun":
  - paragraph: Mon
  - paragraph: "08"
  - paragraph: Jun
- button "Tue 09 Jun":
  - paragraph: Tue
  - paragraph: "09"
  - paragraph: Jun
- button "Fri 12 Jun":
  - paragraph: Fri
  - paragraph: "12"
  - paragraph: Jun
- button "Mon 15 Jun":
  - paragraph: Mon
  - paragraph: "15"
  - paragraph: Jun
- button "Tue 16 Jun":
  - paragraph: Tue
  - paragraph: "16"
  - paragraph: Jun
- button [disabled]:
  - img
- paragraph: Available Time Slots
- img
- text: Morning
- button "We will always try to assign an in-network provider first, where applicable, before applying the selected criteria": 8:30 AM
- button "We will always try to assign an in-network provider first, where applicable, before applying the selected criteria": 9:30 AM
- button "We will always try to assign an in-network provider first, where applicable, before applying the selected criteria": 10:30 AM
- button "We will always try to assign an in-network provider first, where applicable, before applying the selected criteria": 11:30 AM
- img
- text: Afternoon
- button "We will always try to assign an in-network provider first, where applicable, before applying the selected criteria": 1:30 PM
- button "We will always try to assign an in-network provider first, where applicable, before applying the selected criteria": 2:30 PM
- paragraph: "Appointment Type: Teleconsultation"
- separator
- paragraph: "Selected:"
- button "Continue" [disabled]
```

# Test source

```ts
  1   | /**
  2   |  * SLOT PICKER PAGE TEST CASES
  3   |  *
  4   |  * For clients that use the flat date-strip + time-slot layout (e.g. TNDI).
  5   |  * This is DISTINCT from the provider-card layout (SINY, Clarus) which is covered
  6   |  * by findAppointment.cases.js.
  7   |  *
  8   |  * TNDI find-appointment page layout:
  9   |  *   Left: "Change Filters" panel — Location dropdown + Appointment Reason dropdown
  10  |  *   Right: Date strip (date buttons) → "Available Time Slots" grid (time buttons)
  11  |  *          → after selection: "Selected: Friday Jun 05 2026 @ 9:30 AM" confirmation bar
  12  |  *          → Continue button
  13  |  *
  14  |  * @param {import('@playwright/test').TestType} test
  15  |  * @param {Function} expect
  16  |  * @param {object}  opts
  17  |  * @param {string}  opts.expectedReason        — reason shown in the Appointment Reason filter (e.g. 'Teleconsultation')
  18  |  * @param {string}  [opts.nextPageAfterSlot]   — 'intake' | 'insurance' | 'patientInfo'
  19  |  * @param {string}  [opts.appointmentTypeSummaryText] — text shown in "Appointment Type: X" bar (defaults to expectedReason)
  20  |  */
  21  | export function runSlotPickerCases(test, expect, opts = {}) {
  22  |     const {
  23  |         expectedReason = '',
  24  |         nextPageAfterSlot = null,
  25  |         appointmentTypeSummaryText = null,
  26  |     } = opts;
  27  | 
  28  |     const expectedSummaryType = appointmentTypeSummaryText ?? expectedReason;
  29  | 
  30  |     test.describe('Slot Picker — date strip + time slots', () => {
  31  | 
  32  |         // ── 1. FILTER PANEL ───────────────────────────────────────────────────
  33  | 
  34  |         test.describe('Change Filters panel', () => {
  35  | 
  36  |             test('TC-SP-01 — "Change Filters" heading is visible', async ({ findAppointmentPage }) => {
  37  |                 await expect(findAppointmentPage.page.getByText('Change Filters')).toBeVisible({ timeout: 10_000 });
  38  |             });
  39  | 
  40  |             test('TC-SP-02 — Location dropdown is visible', async ({ findAppointmentPage }) => {
  41  |                 await expect(findAppointmentPage.locationDropdown).toBeVisible({ timeout: 10_000 });
  42  |             });
  43  | 
  44  |             test('TC-SP-03 — Appointment Reason shows the expected reason', async ({ findAppointmentPage }) => {
  45  |                 const reason = findAppointmentPage.page
  46  |                     .getByText(expectedReason, { exact: false }).first();
  47  |                 await expect(reason).toBeVisible({ timeout: 10_000 });
  48  |             });
  49  | 
  50  |         });
  51  | 
  52  |         // ── 2. DATE STRIP ─────────────────────────────────────────────────────
  53  | 
  54  |         test.describe('Date strip', () => {
  55  | 
  56  |             test('TC-SP-04 — date strip with clickable date buttons is visible', async ({ findAppointmentPage }) => {
  57  |                 // Date buttons show day + date + month (e.g. "Fri / 05 / Jun")
  58  |                 const dateBtn = findAppointmentPage.page
  59  |                     .locator('button')
  60  |                     .filter({ hasText: /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/i })
  61  |                     .first();
> 62  |                 await expect(dateBtn).toBeVisible({ timeout: 10_000 });
      |                                       ^ Error: expect(locator).toBeVisible() failed
  63  |             });
  64  | 
  65  |             test('TC-SP-05 — at least one date is pre-selected (highlighted)', async ({ findAppointmentPage }) => {
  66  |                 // The first available date is auto-selected on page load
  67  |                 const selectedDate = findAppointmentPage.page
  68  |                     .locator('button')
  69  |                     .filter({ hasText: /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/i })
  70  |                     .first();
  71  |                 await expect(selectedDate).toBeVisible({ timeout: 10_000 });
  72  |             });
  73  | 
  74  |         });
  75  | 
  76  |         // ── 3. TIME SLOTS ─────────────────────────────────────────────────────
  77  | 
  78  |         test.describe('Available Time Slots', () => {
  79  | 
  80  |             test('TC-SP-06 — "Available Time Slots" heading is visible', async ({ findAppointmentPage }) => {
  81  |                 await expect(
  82  |                     findAppointmentPage.page.getByText('Available Time Slots')
  83  |                 ).toBeVisible({ timeout: 10_000 });
  84  |             });
  85  | 
  86  |             test('TC-SP-07 — at least one time slot button is visible', async ({ findAppointmentPage }) => {
  87  |                 const slotBtn = findAppointmentPage.page
  88  |                     .locator('button')
  89  |                     .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
  90  |                     .first();
  91  |                 await expect(slotBtn).toBeVisible({ timeout: 10_000 });
  92  |             });
  93  | 
  94  |             test('TC-SP-08 — clicking a time slot shows the "Selected:" confirmation bar', async ({ findAppointmentPage }) => {
  95  |                 const slotBtn = findAppointmentPage.page
  96  |                     .locator('button')
  97  |                     .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
  98  |                     .first();
  99  |                 await slotBtn.click();
  100 |                 // Confirmation bar: "Appointment Type: Teleconsultation | Selected: Fri Jun 05 2026 @ 9:30 AM"
  101 |                 const selectedBar = findAppointmentPage.page
  102 |                     .getByText(/Selected:/i).first();
  103 |                 await expect(selectedBar).toBeVisible({ timeout: 10_000 });
  104 |             });
  105 | 
  106 |             if (expectedSummaryType) {
  107 |                 test(`TC-SP-09 — confirmation bar shows "Appointment Type: ${expectedSummaryType}"`, async ({ findAppointmentPage }) => {
  108 |                     const slotBtn = findAppointmentPage.page
  109 |                         .locator('button')
  110 |                         .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
  111 |                         .first();
  112 |                     await slotBtn.click();
  113 |                     await expect(
  114 |                         findAppointmentPage.page.getByText(expectedSummaryType, { exact: false }).first()
  115 |                     ).toBeVisible({ timeout: 5_000 });
  116 |                 });
  117 |             }
  118 | 
  119 |             test('TC-SP-10 — Continue button appears after slot selection', async ({ findAppointmentPage }) => {
  120 |                 const slotBtn = findAppointmentPage.page
  121 |                     .locator('button')
  122 |                     .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
  123 |                     .first();
  124 |                 await slotBtn.click();
  125 |                 const continueBtn = findAppointmentPage.page
  126 |                     .locator('button:has-text("Continue"), button:has-text("Next")').first();
  127 |                 await expect(continueBtn).toBeVisible({ timeout: 10_000 });
  128 |             });
  129 | 
  130 |         });
  131 | 
  132 |         // ── 4. NAVIGATION ─────────────────────────────────────────────────────
  133 | 
  134 |         if (nextPageAfterSlot) {
  135 |             test('TC-SP-11 — clicking Continue after slot selection navigates to the expected next page', async ({ findAppointmentPage }) => {
  136 |                 const slotBtn = findAppointmentPage.page
  137 |                     .locator('button')
  138 |                     .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
  139 |                     .first();
  140 |                 await slotBtn.click();
  141 |                 const continueBtn = findAppointmentPage.page
  142 |                     .locator('button:has-text("Continue"), button:has-text("Next")').first();
  143 |                 await continueBtn.waitFor({ state: 'visible', timeout: 10_000 });
  144 |                 await continueBtn.click();
  145 | 
  146 |                 if (nextPageAfterSlot === 'intake') {
  147 |                     await findAppointmentPage.page.waitForURL(
  148 |                         url => url.toString().includes('intake'),
  149 |                         { timeout: 15_000 }
  150 |                     );
  151 |                 } else if (nextPageAfterSlot === 'insurance') {
  152 |                     await findAppointmentPage.page.waitForURL(
  153 |                         url => url.toString().includes('insurance'),
  154 |                         { timeout: 15_000 }
  155 |                     );
  156 |                 } else if (nextPageAfterSlot === 'patientInfo') {
  157 |                     await expect(
  158 |                         findAppointmentPage.page.locator('input[name*="firstName"]').first()
  159 |                     ).toBeVisible({ timeout: 15_000 });
  160 |                 }
  161 |             });
  162 | 
```