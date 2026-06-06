# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\CVD\newPatient.spec.js >> Find Appointment — Basic Search filters >> No availability >> TC-FA-NA-03 — no provider cards shown when availability is empty
- Location: tests\e2e\shared\findAppointment.cases.js:59:13

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 1
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e7]:
        - img "logo" [ref=e9]
        - heading "301-220-8346" [level=6] [ref=e12]
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
      - paragraph [ref=e72]: Basic Search
      - separator [ref=e73]
      - generic [ref=e76]:
        - generic [ref=e77]: Location
        - generic [ref=e78]:
          - combobox "Location" [ref=e79]: Main Office
          - button "Open" [ref=e81] [cursor=pointer]:
            - img [ref=e82]
          - group:
            - generic: Location
      - separator [ref=e84]
      - generic [ref=e87]:
        - generic [ref=e88]: Appointment Reason
        - generic [ref=e89]:
          - combobox "Appointment Reason" [active] [ref=e90]: Consult
          - button "Open" [ref=e92] [cursor=pointer]:
            - img [ref=e93]
          - group:
            - generic: Appointment Reason
      - separator [ref=e95]
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
      - heading "Dr. Sonde Dr. Sonde Mon Jun 8 9:30 AM Mon Jun 8 10:30 AM Mon Jun 8 1:30 PM Show More" [level=3] [ref=e114]:
        - button "Dr. Sonde Dr. Sonde Mon Jun 8 9:30 AM Mon Jun 8 10:30 AM Mon Jun 8 1:30 PM Show More" [ref=e115]:
          - generic [ref=e118]:
            - img "Dr. Sonde" [ref=e120]
            - generic [ref=e121]:
              - paragraph [ref=e123]: Dr. Sonde
              - generic [ref=e124]:
                - button "Mon Jun 8 9:30 AM" [ref=e125] [cursor=pointer]:
                  - paragraph [ref=e126]: Mon Jun 8
                  - paragraph [ref=e127]: 9:30 AM
                - button "Mon Jun 8 10:30 AM" [ref=e128] [cursor=pointer]:
                  - paragraph [ref=e129]: Mon Jun 8
                  - paragraph [ref=e130]: 10:30 AM
                - button "Mon Jun 8 1:30 PM" [ref=e131] [cursor=pointer]:
                  - paragraph [ref=e132]: Mon Jun 8
                  - paragraph [ref=e133]: 1:30 PM
              - paragraph [ref=e134] [cursor=pointer]: Show More
      - heading "U Ultrasound This provider has no online availability. Please call our office to schedule with them." [level=3] [ref=e136]:
        - button "U Ultrasound This provider has no online availability. Please call our office to schedule with them." [ref=e137]:
          - generic [ref=e140]:
            - generic [ref=e141]: U
            - generic [ref=e142]:
              - paragraph [ref=e144]: Ultrasound
              - heading "This provider has no online availability. Please call our office to schedule with them." [level=6] [ref=e145]
      - separator [ref=e146]
```

# Test source

```ts
  1   | /**
  2   |  * Find Appointment page — Basic Search filter test cases
  3   |  *
  4   |  * Covers: Location / Service Type / Provider dropdowns, gray-option popups,
  5   |  * Provider Gender checkboxes, provider card visibility, and slot selection flow.
  6   |  *
  7   |  * @param {import('@playwright/test').TestType} test  from makeNewPatientFixtures()
  8   |  * @param {Function} expect
  9   |  * @param {object}  opts
  10  |  * @param {string}  opts.expectedServiceType    — service type chosen on the landing page
  11  |  * @param {'insurance'|'patientInfo'|'intake'} [opts.nextPageAfterSlot]
  12  |  *   Expected page after selecting a slot and clicking Continue.
  13  |  * @param {boolean} [opts.expectNoAvailability=false]
  14  |  *   When true, the page is expected to show a "no online availability" error
  15  |  *   instead of provider cards. Skips slot-interaction tests and verifies the message.
  16  |  */
  17  | export function runFindAppointmentCases(test, expect, opts = {}) {
  18  |     const {
  19  |         expectedServiceType,
  20  |         nextPageAfterSlot,
  21  |         hasProviderDropdown = true,   // false for Kronson which has only Location + Reason filters
  22  |         allServiceTypes     = [],     // all service options to test individually (Clarus, Hopemark)
  23  |     } = opts;
  24  | 
  25  |     // Helper — returns true when the page has no providers/slots and shows the
  26  |     // "no online availability" message. Used to skip or adjust assertions dynamically.
  27  |     // Any client can show this state when the staging server has no available slots.
  28  |     async function isNoAvailability(findAppointmentPage) {
  29  |         return findAppointmentPage.hasNoAvailabilityMessage();
  30  |     }
  31  | 
  32  |     test.describe('Find Appointment — Basic Search filters', () => {
  33  | 
  34  |         // ── No-availability state — dynamic, runs for ALL clients ─────────────
  35  |         // These tests pass gracefully when slots exist; verify the message when no slots.
  36  | 
  37  |         test.describe('No availability', () => {
  38  | 
  39  |             test('TC-FA-NA-01 — "no online availability" message appears when no slots exist', async ({ findAppointmentPage }) => {
  40  |                 const noAvail = await isNoAvailability(findAppointmentPage);
  41  |                 if (!noAvail) {
  42  |                     console.log('TC-FA-NA-01: Slots available — no-availability message not needed');
  43  |                     return; // graceful pass
  44  |                 }
  45  |                 await expect(
  46  |                     findAppointmentPage.page
  47  |                         .getByText(/no online availability|no availability/i).first()
  48  |                 ).toBeVisible({ timeout: 10_000 });
  49  |             });
  50  | 
  51  |             test('TC-FA-NA-02 — message directs patient to call the office', async ({ findAppointmentPage }) => {
  52  |                 const noAvail = await isNoAvailability(findAppointmentPage);
  53  |                 if (!noAvail) return; // graceful pass — message not needed when slots exist
  54  |                 await expect(
  55  |                     findAppointmentPage.page.getByText(/please call/i).first()
  56  |                 ).toBeVisible({ timeout: 10_000 });
  57  |             });
  58  | 
  59  |             test('TC-FA-NA-03 — no provider cards shown when availability is empty', async ({ findAppointmentPage }) => {
  60  |                 const noAvail = await isNoAvailability(findAppointmentPage);
  61  |                 if (!noAvail) return; // graceful pass — providers ARE expected when slots exist
  62  |                 const count = await findAppointmentPage.getProviderCardCount();
> 63  |                 expect(count).toBe(0);
      |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  64  |             });
  65  | 
  66  |         });
  67  | 
  68  |         // ── Positive ──────────────────────────────────────────────────────────
  69  | 
  70  |         test.describe('Filter dropdowns', () => {
  71  | 
  72  |             test('TC-FA-01 — Location and Service Type dropdowns are visible', async ({ findAppointmentPage }) => {
  73  |                 await expect(findAppointmentPage.locationDropdown).toBeVisible();
  74  |                 await expect(findAppointmentPage.serviceTypeDropdown).toBeVisible();
  75  |                 // Provider dropdown only exists on clients with 3-filter layout (not Kronson)
  76  |                 if (hasProviderDropdown) {
  77  |                     await expect(findAppointmentPage.providerDropdown).toBeVisible();
  78  |                 }
  79  |             });
  80  | 
  81  |             test('TC-FA-02 — Service Type matches the service selected on the landing page', async ({ findAppointmentPage }) => {
  82  |                 const value = await findAppointmentPage._getDropdownText(findAppointmentPage.serviceTypeDropdown);
  83  |                 // Escape regex special chars (e.g. Hopemark has parentheses in reason names)
  84  |                 const escaped = expectedServiceType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  85  |                 expect(value).toMatch(new RegExp(escaped, 'i'));
  86  |             });
  87  | 
  88  |             test('TC-FA-03 — Provider dropdown defaults to "Any Provider"', async ({ findAppointmentPage }) => {
  89  |                 if (!hasProviderDropdown) return; // Kronson has no Provider filter
  90  |                 const value = await findAppointmentPage._getDropdownText(findAppointmentPage.providerDropdown);
  91  |                 expect(value).toMatch(/any provider/i);
  92  |             });
  93  | 
  94  |         });
  95  | 
  96  |         // ── Provider cards ────────────────────────────────────────────────────
  97  | 
  98  |         test.describe('Provider cards', () => {
  99  | 
  100 |             test('TC-FA-04 — at least one provider card with slots is visible', async ({ findAppointmentPage }) => {
  101 |                 if (await isNoAvailability(findAppointmentPage)) return; // no slots — skip gracefully
  102 |                 const count = await findAppointmentPage.getProviderCardCount();
  103 |                 expect(count).toBeGreaterThan(0);
  104 |             });
  105 | 
  106 |         });
  107 | 
  108 |         // ── Provider Gender filter ─────────────────────────────────────────────
  109 | 
  110 |         test.describe('Provider Gender filter', () => {
  111 | 
  112 |             test('TC-FA-05 — Male and Female checkboxes are both checked by default', async ({ findAppointmentPage }) => {
  113 |                 if (await isNoAvailability(findAppointmentPage)) return;
  114 |                 await expect(findAppointmentPage.maleCheckbox).toBeChecked();
  115 |                 await expect(findAppointmentPage.femaleCheckbox).toBeChecked();
  116 |             });
  117 | 
  118 |             test('TC-FA-06 — unchecking Female filters provider cards', async ({ findAppointmentPage }) => {
  119 |                 if (await isNoAvailability(findAppointmentPage)) return;
  120 |                 const before = await findAppointmentPage.getProviderCardCount();
  121 |                 await findAppointmentPage.femaleCheckbox.uncheck({ force: true });
  122 |                 await findAppointmentPage.page.waitForTimeout(1_000);
  123 |                 const after = await findAppointmentPage.getProviderCardCount();
  124 |                 expect(after).toBeLessThanOrEqual(before);
  125 |             });
  126 | 
  127 |             test('TC-FA-07 — unchecking Male filters provider cards', async ({ findAppointmentPage }) => {
  128 |                 if (await isNoAvailability(findAppointmentPage)) return;
  129 |                 const before = await findAppointmentPage.getProviderCardCount();
  130 |                 await findAppointmentPage.maleCheckbox.uncheck({ force: true });
  131 |                 await findAppointmentPage.page.waitForTimeout(1_000);
  132 |                 const after = await findAppointmentPage.getProviderCardCount();
  133 |                 expect(after).toBeLessThanOrEqual(before);
  134 |             });
  135 | 
  136 |             test('TC-FA-08 — re-checking Female restores provider cards', async ({ findAppointmentPage }) => {
  137 |                 if (await isNoAvailability(findAppointmentPage)) return;
  138 |                 const before = await findAppointmentPage.getProviderCardCount();
  139 |                 await findAppointmentPage.femaleCheckbox.uncheck({ force: true });
  140 |                 await findAppointmentPage.page.waitForTimeout(800);
  141 |                 await findAppointmentPage.femaleCheckbox.check({ force: true });
  142 |                 await findAppointmentPage.showMoreLinks.first().waitFor({ state: 'visible', timeout: 10_000 });
  143 |                 const after = await findAppointmentPage.getProviderCardCount();
  144 |                 expect(after).toBe(before);
  145 |             });
  146 | 
  147 |             test('TC-FA-08b — unchecking the ONLY available gender shows no-availability message or zero cards', async ({ findAppointmentPage }) => {
  148 |                 // Edge case: if all providers are Female (e.g. Hopemark Virtual → Courtney Potempa only),
  149 |                 // unchecking Female → Male only → 0 providers OR "no online availability" message.
  150 |                 if (await isNoAvailability(findAppointmentPage)) return;
  151 |                 const before = await findAppointmentPage.getProviderCardCount();
  152 |                 if (before === 0) return;
  153 | 
  154 |                 await findAppointmentPage.femaleCheckbox.uncheck({ force: true });
  155 |                 await findAppointmentPage.page.waitForTimeout(1_500);
  156 | 
  157 |                 const afterCount = await findAppointmentPage.getProviderCardCount();
  158 |                 const noAvail   = await findAppointmentPage.hasNoAvailabilityMessage();
  159 | 
  160 |                 // Valid outcomes after unchecking Female:
  161 |                 //   - count dropped to 0 (only Female providers existed)
  162 |                 //   - no-availability message appears
  163 |                 //   - count stayed the same (no Female providers → Male-only filter had no effect)
```