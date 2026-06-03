# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\SINY\cosmetic.spec.js >> Find Appointment — Basic Search filters >> Provider Gender filter >> TC-FA-06 — unchecking Female filters provider cards
- Location: tests\e2e\shared\findAppointment.cases.js:59:13

# Error details

```
Error: locator.uncheck: Test ended.
Call log:
  - waiting for getByLabel('Female')

```

# Test source

```ts
  1   | /**
  2   |  * Find Appointment page — Basic Search filter test cases
  3   |  *
  4   |  * Covers: Location / Service Type / Provider dropdowns, gray-option popups,
  5   |  * Provider Gender checkboxes, and provider card visibility.
  6   |  *
  7   |  * @param {import('@playwright/test').TestType} test  from makeNewPatientFixtures()
  8   |  * @param {Function} expect
  9   |  * @param {object}  opts
  10  |  * @param {string}  opts.expectedServiceType  — service type chosen on the landing page
  11  |  */
  12  | export function runFindAppointmentCases(test, expect, opts = {}) {
  13  |     const { expectedServiceType } = opts;
  14  | 
  15  |     test.describe('Find Appointment — Basic Search filters', () => {
  16  | 
  17  |         // ── Positive ──────────────────────────────────────────────────────────
  18  | 
  19  |         test.describe('Filter dropdowns', () => {
  20  | 
  21  |             test('TC-FA-01 — Location, Service Type and Provider dropdowns are visible', async ({ findAppointmentPage }) => {
  22  |                 await expect(findAppointmentPage.locationDropdown).toBeVisible();
  23  |                 await expect(findAppointmentPage.serviceTypeDropdown).toBeVisible();
  24  |                 await expect(findAppointmentPage.providerDropdown).toBeVisible();
  25  |             });
  26  | 
  27  |             test('TC-FA-02 — Service Type matches the service selected on the landing page', async ({ findAppointmentPage }) => {
  28  |                 const value = await findAppointmentPage.serviceTypeDropdown.textContent();
  29  |                 expect(value).toMatch(new RegExp(expectedServiceType, 'i'));
  30  |             });
  31  | 
  32  |             test('TC-FA-03 — Provider dropdown defaults to "Any Provider"', async ({ findAppointmentPage }) => {
  33  |                 const value = await findAppointmentPage.providerDropdown.textContent();
  34  |                 expect(value).toMatch(/any provider/i);
  35  |             });
  36  | 
  37  |         });
  38  | 
  39  |         // ── Provider cards ────────────────────────────────────────────────────
  40  | 
  41  |         test.describe('Provider cards', () => {
  42  | 
  43  |             test('TC-FA-04 — at least one provider card with slots is visible', async ({ findAppointmentPage }) => {
  44  |                 const count = await findAppointmentPage.getProviderCardCount();
  45  |                 expect(count).toBeGreaterThan(0);
  46  |             });
  47  | 
  48  |         });
  49  | 
  50  |         // ── Provider Gender filter ─────────────────────────────────────────────
  51  | 
  52  |         test.describe('Provider Gender filter', () => {
  53  | 
  54  |             test('TC-FA-05 — Male and Female checkboxes are both checked by default', async ({ findAppointmentPage }) => {
  55  |                 await expect(findAppointmentPage.maleCheckbox).toBeChecked();
  56  |                 await expect(findAppointmentPage.femaleCheckbox).toBeChecked();
  57  |             });
  58  | 
  59  |             test('TC-FA-06 — unchecking Female filters provider cards', async ({ findAppointmentPage }) => {
  60  |                 const before = await findAppointmentPage.getProviderCardCount();
> 61  |                 await findAppointmentPage.femaleCheckbox.uncheck();
      |                                                          ^ Error: locator.uncheck: Test ended.
  62  |                 await findAppointmentPage.page.waitForTimeout(1_000);
  63  |                 const after = await findAppointmentPage.getProviderCardCount();
  64  |                 expect(after).toBeLessThanOrEqual(before);
  65  |             });
  66  | 
  67  |             test('TC-FA-07 — unchecking Male filters provider cards', async ({ findAppointmentPage }) => {
  68  |                 const before = await findAppointmentPage.getProviderCardCount();
  69  |                 await findAppointmentPage.maleCheckbox.uncheck();
  70  |                 await findAppointmentPage.page.waitForTimeout(1_000);
  71  |                 const after = await findAppointmentPage.getProviderCardCount();
  72  |                 expect(after).toBeLessThanOrEqual(before);
  73  |             });
  74  | 
  75  |             test('TC-FA-08 — re-checking Female restores provider cards', async ({ findAppointmentPage }) => {
  76  |                 const before = await findAppointmentPage.getProviderCardCount();
  77  |                 await findAppointmentPage.femaleCheckbox.uncheck();
  78  |                 await findAppointmentPage.femaleCheckbox.check();
  79  |                 await findAppointmentPage.page.waitForTimeout(1_000);
  80  |                 const after = await findAppointmentPage.getProviderCardCount();
  81  |                 expect(after).toBe(before);
  82  |             });
  83  | 
  84  |             test('TC-FA-09 — unchecking both Male and Female shows no provider cards', async ({ findAppointmentPage }) => {
  85  |                 await findAppointmentPage.maleCheckbox.uncheck();
  86  |                 await findAppointmentPage.femaleCheckbox.uncheck();
  87  |                 await findAppointmentPage.page.waitForTimeout(1_000);
  88  |                 const count = await findAppointmentPage.getProviderCardCount();
  89  |                 expect(count).toBe(0);
  90  |             });
  91  | 
  92  |         });
  93  | 
  94  |         // ── Negative — gray option popups ─────────────────────────────────────
  95  | 
  96  |         test.describe('Unavailability popups', () => {
  97  | 
  98  |             test('TC-FA-10 — selecting a gray location shows "not available" popup', async ({ findAppointmentPage }) => {
  99  |                 await findAppointmentPage.triggerGrayOption(findAppointmentPage.locationDropdown);
  100 |                 await expect(findAppointmentPage.popup).toBeVisible({ timeout: 8_000 });
  101 |                 await expect(findAppointmentPage.popup).toContainText(/not available/i);
  102 |             });
  103 | 
  104 |             test('TC-FA-11 — selecting a gray provider shows unavailability popup', async ({ findAppointmentPage }) => {
  105 |                 await findAppointmentPage.triggerGrayOption(findAppointmentPage.providerDropdown);
  106 |                 await expect(findAppointmentPage.popup).toBeVisible({ timeout: 8_000 });
  107 |                 await expect(findAppointmentPage.popup).toContainText(/does not offer|not available/i);
  108 |             });
  109 | 
  110 |             test('TC-FA-12 — popup has a close button that dismisses it', async ({ findAppointmentPage }) => {
  111 |                 await findAppointmentPage.triggerGrayOption(findAppointmentPage.locationDropdown);
  112 |                 await expect(findAppointmentPage.popup).toBeVisible({ timeout: 8_000 });
  113 |                 await findAppointmentPage.closePopup();
  114 |                 await expect(findAppointmentPage.popup).not.toBeVisible({ timeout: 5_000 });
  115 |             });
  116 | 
  117 |         });
  118 | 
  119 |         // ── Edge cases ────────────────────────────────────────────────────────
  120 | 
  121 |         test.describe('Edge cases', () => {
  122 | 
  123 |             test('TC-FA-13 — dismissing gray location popup keeps Service Type unchanged', async ({ findAppointmentPage }) => {
  124 |                 const serviceBefore = await findAppointmentPage.serviceTypeDropdown.textContent();
  125 |                 await findAppointmentPage.triggerGrayOption(findAppointmentPage.locationDropdown);
  126 |                 await findAppointmentPage.closePopup();
  127 |                 const serviceAfter = await findAppointmentPage.serviceTypeDropdown.textContent();
  128 |                 expect(serviceAfter).toBe(serviceBefore);
  129 |             });
  130 | 
  131 |             test('TC-FA-14 — dismissing gray provider popup keeps provider filter on "Any Provider"', async ({ findAppointmentPage }) => {
  132 |                 await findAppointmentPage.triggerGrayOption(findAppointmentPage.providerDropdown);
  133 |                 await findAppointmentPage.closePopup();
  134 |                 const value = await findAppointmentPage.providerDropdown.textContent();
  135 |                 expect(value).toMatch(/any provider/i);
  136 |             });
  137 | 
  138 |         });
  139 |     });
  140 | }
  141 | 
```