# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\SINY\cosmetic.spec.js >> SINY Landing — gray service / location >> Path B — gray service → gray location → popup >> TC-LAND-S06 — selecting gray location shows unavailability popup
- Location: tests\e2e\shared\sinyLanding.cases.js:87:13

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[role="dialog"]').filter({ hasText: /not available/i })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('[role="dialog"]').filter({ hasText: /not available/i })

```

```yaml
- banner:
  - img "logo"
  - heading [level=6]
- paragraph: SINY Dermatology & Cosmetic Surgery
- paragraph: 7901 4th Ave,
- paragraph: Brooklyn, NY 11209
- heading [level=3]
- heading "What is your reason for scheduling?" [level=5]
- text: Location
- combobox "Location": SINY Dermatology 1000 Park Avenue
- button "Open"
- combobox "Visit reason": Cosmetic Procedure
- button "Open"
- combobox "Service Type": Botox treatment
- button "Open"
- heading "Have you visited us before?" [level=5]
- button "Existing Patient"
- button "New Patient"
- heading "Powered by" [level=6]
- img "MUlogo"
```

# Test source

```ts
  1   | /**
  2   |  * SINY Landing — gray service / location flow
  3   |  *
  4   |  * When an unavailable (gray) service type is selected, a Location dropdown
  5   |  * appears. Two paths from there:
  6   |  *
  7   |  *   Path A: gray service → valid location
  8   |  *           Service type options re-filter to show what is available at that
  9   |  *           location; New Patient button becomes active.
  10  |  *
  11  |  *   Path B: gray service → gray location
  12  |  *           "This service is currently not available" popup appears and can be
  13  |  *           dismissed with the X close button.
  14  |  *
  15  |  * Both SINY_COSMETIC and SINY_MEDICAL share this behaviour with different
  16  |  * reason types, so opts.reason lets each spec pick the right starting point.
  17  |  *
  18  |  * @param {import('@playwright/test').TestType} test
  19  |  * @param {Function} expect
  20  |  * @param {object}  [opts]
  21  |  * @param {string}  [opts.reason='Cosmetic Procedure']  Top-level reason to select
  22  |  */
  23  | export function runSINYLandingCases(test, expect, opts = {}) {
  24  |     const { reason = 'Cosmetic Procedure' } = opts;
  25  | 
  26  |     test.describe('SINY Landing — gray service / location', () => {
  27  | 
  28  |         // ── Setup assertions ──────────────────────────────────────────────────
  29  | 
  30  |         test('TC-LAND-S01 — selecting reason reveals service type dropdown', async ({ landingPage }) => {
  31  |             await landingPage._selectReason(reason);
  32  |             await expect(landingPage.serviceTypeDropdown).toBeVisible({ timeout: 10_000 });
  33  |         });
  34  | 
  35  |         test('TC-LAND-S02 — service type dropdown contains at least one gray option', async ({ landingPage }) => {
  36  |             await landingPage._selectReason(reason);
  37  |             await landingPage.serviceTypeDropdown.click();
  38  |             // Gray options are CSS-only — detected via computed color/opacity, not aria-disabled
  39  |             const grayText = await landingPage._findGrayOptionText();
  40  |             await landingPage.page.keyboard.press('Escape');
  41  |             expect(grayText).not.toBeNull();
  42  |         });
  43  | 
  44  |         // ── Path A: gray service → valid location → service list filters ──────
  45  | 
  46  |         test.describe('Path A — gray service → valid location', () => {
  47  | 
  48  |             test('TC-LAND-S03 — selecting gray service reveals Location dropdown', async ({ landingPage }) => {
  49  |                 await landingPage._selectReason(reason);
  50  |                 await landingPage._openServiceTypeAndSelectGray();
  51  |                 await expect(landingPage.locationDropdown).toBeVisible({ timeout: 10_000 });
  52  |             });
  53  | 
  54  |             test('TC-LAND-S04 — selecting valid location shows available service options', async ({ landingPage }) => {
  55  |                 await landingPage._selectReason(reason);
  56  |                 await landingPage._openServiceTypeAndSelectGray();
  57  |                 await landingPage._selectFirstValidLocation();
  58  | 
  59  |                 // Service type dropdown should still be present; open it and verify a valid option exists
  60  |                 await expect(landingPage.serviceTypeDropdown).toBeVisible({ timeout: 10_000 });
  61  |                 await landingPage.serviceTypeDropdown.click();
  62  |                 const validText = await landingPage._findValidOptionText();
  63  |                 await landingPage.page.keyboard.press('Escape');
  64  |                 expect(validText).not.toBeNull();
  65  |             });
  66  | 
  67  |             test('TC-LAND-S05 — New Patient button is active after valid location + service selection', async ({ landingPage }) => {
  68  |                 await landingPage._selectReason(reason);
  69  |                 await landingPage._openServiceTypeAndSelectGray();
  70  |                 await landingPage._selectFirstValidLocation();
  71  | 
  72  |                 // Pick first non-gray service from the now-filtered list
  73  |                 await landingPage.serviceTypeDropdown.click();
  74  |                 const validText = await landingPage._findValidOptionText();
  75  |                 if (!validText) throw new Error('No valid service option after location selection');
  76  |                 await landingPage.page.locator('[role="option"]').filter({ hasText: validText }).first().click();
  77  | 
  78  |                 await expect(landingPage.newPatientBtn).toBeVisible({ timeout: 10_000 });
  79  |                 await expect(landingPage.newPatientBtn).toBeEnabled();
  80  |             });
  81  |         });
  82  | 
  83  |         // ── Path B: gray service → gray location → unavailability popup ───────
  84  | 
  85  |         test.describe('Path B — gray service → gray location → popup', () => {
  86  | 
  87  |             test('TC-LAND-S06 — selecting gray location shows unavailability popup', async ({ landingPage }) => {
  88  |                 await landingPage._selectReason(reason);
  89  |                 await landingPage._openServiceTypeAndSelectGray();
  90  |                 await landingPage._openLocationAndSelectGray();
> 91  |                 await expect(landingPage.unavailabilityPopup).toBeVisible({ timeout: 10_000 });
      |                                                               ^ Error: expect(locator).toBeVisible() failed
  92  |             });
  93  | 
  94  |             test('TC-LAND-S07 — popup contains "not available" message', async ({ landingPage }) => {
  95  |                 await landingPage._selectReason(reason);
  96  |                 await landingPage._openServiceTypeAndSelectGray();
  97  |                 await landingPage._openLocationAndSelectGray();
  98  |                 await landingPage.unavailabilityPopup.waitFor({ state: 'visible', timeout: 10_000 });
  99  |                 await expect(landingPage.unavailabilityPopup).toContainText(/not available/i);
  100 |             });
  101 | 
  102 |             test('TC-LAND-S08 — unavailability popup closes with X button', async ({ landingPage }) => {
  103 |                 await landingPage._selectReason(reason);
  104 |                 await landingPage._openServiceTypeAndSelectGray();
  105 |                 await landingPage._openLocationAndSelectGray();
  106 |                 await landingPage.unavailabilityPopup.waitFor({ state: 'visible', timeout: 10_000 });
  107 |                 await landingPage.closeUnavailabilityPopup();
  108 |                 await expect(landingPage.unavailabilityPopup).toBeHidden({ timeout: 5_000 });
  109 |             });
  110 |         });
  111 |     });
  112 | }
  113 | 
```