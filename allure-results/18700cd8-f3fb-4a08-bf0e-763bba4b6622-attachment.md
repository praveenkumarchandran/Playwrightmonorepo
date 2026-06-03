# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\SINY\cosmetic.spec.js >> SINY Landing — gray service / location >> Negative — valid service skips location step >> TC-LAND-S10 — New Patient button is disabled before any service is selected
- Location: tests\e2e\shared\sinyLanding.cases.js:144:13

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e5]:
    - generic [ref=e7]:
      - img "logo" [ref=e9]
      - heading "718-491-5800" [level=6] [ref=e12]
  - generic [ref=e15]:
    - generic [ref=e17]:
      - paragraph [ref=e18]: SINY Dermatology & Cosmetic Surgery
      - generic [ref=e19]:
        - paragraph [ref=e20]: 7901 4th Ave,
        - paragraph [ref=e21]: Brooklyn, NY 11209
    - generic [ref=e23]:
      - generic:
        - heading [level=3]
      - generic [ref=e24]:
        - heading "What is your reason for scheduling?" [level=5] [ref=e25]
        - generic [ref=e28]:
          - combobox "Visit reason" [active] [ref=e29]: Cosmetic Procedure
          - button "Open" [ref=e31] [cursor=pointer]:
            - img [ref=e32]
          - group
        - generic [ref=e37]:
          - combobox "Service Type" [ref=e38]
          - button "Open" [ref=e40] [cursor=pointer]:
            - img [ref=e41]
          - group
      - generic [ref=e43]:
        - heading "Have you visited us before?" [level=5] [ref=e44]
        - generic [ref=e45]:
          - button "Existing Patient" [ref=e46] [cursor=pointer]
          - button "New Patient" [ref=e47] [cursor=pointer]
      - generic [ref=e49]:
        - heading "Powered by" [level=6] [ref=e50]
        - img "MUlogo" [ref=e51]
```

# Test source

```ts
  50  |         });
  51  | 
  52  |         test('TC-LAND-S02 — service type dropdown contains at least one gray option', async ({ landingPage }) => {
  53  |             await landingPage._selectReason(reason);
  54  |             await landingPage.serviceTypeDropdown.click();
  55  |             // Gray options are CSS-only — detected via computed color/opacity, not aria-disabled
  56  |             const grayText = await landingPage._findGrayOptionText();
  57  |             await landingPage.page.keyboard.press('Escape');
  58  |             expect(grayText).not.toBeNull();
  59  |         });
  60  | 
  61  |         // ── Path A: gray service → valid location → service list filters ──────
  62  | 
  63  |         test.describe('Path A — gray service → valid location', () => {
  64  | 
  65  |             test('TC-LAND-S03 — selecting gray service reveals Location dropdown', async ({ landingPage }) => {
  66  |                 await landingPage._selectReason(reason);
  67  |                 await landingPage._openServiceTypeAndSelectGray();
  68  |                 await expect(landingPage.locationDropdown).toBeVisible({ timeout: 10_000 });
  69  |             });
  70  | 
  71  |             test('TC-LAND-S04 — selecting valid location shows available service options', async ({ landingPage }) => {
  72  |                 await landingPage._selectReason(reason);
  73  |                 await landingPage._openServiceTypeAndSelectGray();
  74  |                 await landingPage._selectFirstValidLocation();
  75  | 
  76  |                 // Service type dropdown should still be present; open it and verify a valid option exists
  77  |                 await expect(landingPage.serviceTypeDropdown).toBeVisible({ timeout: 10_000 });
  78  |                 await landingPage.serviceTypeDropdown.click();
  79  |                 const validText = await landingPage._findValidOptionText();
  80  |                 await landingPage.page.keyboard.press('Escape');
  81  |                 expect(validText).not.toBeNull();
  82  |             });
  83  | 
  84  |             test('TC-LAND-S05 — New Patient button is active after valid location + service selection', async ({ landingPage }) => {
  85  |                 await landingPage._selectReason(reason);
  86  |                 await landingPage._openServiceTypeAndSelectGray();
  87  |                 await landingPage._selectFirstValidLocation();
  88  | 
  89  |                 // Pick first non-gray service from the now-filtered list
  90  |                 await landingPage.serviceTypeDropdown.click();
  91  |                 const validText = await landingPage._findValidOptionText();
  92  |                 if (!validText) throw new Error('No valid service option after location selection');
  93  |                 await landingPage.page.locator('[role="option"]').filter({ hasText: validText }).first().click();
  94  | 
  95  |                 await expect(landingPage.newPatientBtn).toBeVisible({ timeout: 10_000 });
  96  |                 await expect(landingPage.newPatientBtn).toBeEnabled();
  97  |             });
  98  |         });
  99  | 
  100 |         // ── Path B: gray service → location appears → switch to popup service → popup
  101 |         // Flow:
  102 |         //   1. select gray service  → Location dropdown appears (same as TC-LAND-S03)
  103 |         //   2. re-open service type → select popupService (e.g. "Sclerotherapy")
  104 |         //   3. popup appears because that service has no available slots
  105 |         //
  106 |         // Only runs when opts.popupService is provided.
  107 | 
  108 |         if (popupService) {
  109 |             test.describe(`Path B — gray service → "${popupService}" → unavailability popup`, () => {
  110 | 
  111 |                 test('TC-LAND-S06 — selecting popup service after gray service shows popup', async ({ landingPage }) => {
  112 |                     await pathBSetup(landingPage);
  113 |                     await expect(landingPage.unavailabilityPopup).toBeVisible({ timeout: 10_000 });
  114 |                 });
  115 | 
  116 |                 test('TC-LAND-S07 — popup contains "not available" message', async ({ landingPage }) => {
  117 |                     await pathBSetup(landingPage);
  118 |                     await landingPage.unavailabilityPopup.waitFor({ state: 'visible', timeout: 10_000 });
  119 |                     await expect(landingPage.unavailabilityPopup).toContainText(/not available/i);
  120 |                 });
  121 | 
  122 |                 test('TC-LAND-S08 — popup closes with X button', async ({ landingPage }) => {
  123 |                     await pathBSetup(landingPage);
  124 |                     await landingPage.unavailabilityPopup.waitFor({ state: 'visible', timeout: 10_000 });
  125 |                     await landingPage.closeUnavailabilityPopup();
  126 |                     await expect(landingPage.unavailabilityPopup).toBeHidden({ timeout: 5_000 });
  127 |                 });
  128 |             });
  129 |         }
  130 | 
  131 |         // ── Negative cases ────────────────────────────────────────────────────
  132 | 
  133 |         test.describe('Negative — valid service skips location step', () => {
  134 | 
  135 |             test('TC-LAND-S09 — selecting a valid service does NOT show Location dropdown', async ({ landingPage }) => {
  136 |                 await landingPage._selectReason(reason);
  137 |                 await landingPage._openServiceTypeAndSelectValid();
  138 |                 const locationVisible = await landingPage.locationDropdown
  139 |                     .isVisible({ timeout: 3_000 })
  140 |                     .catch(() => false);
  141 |                 expect(locationVisible).toBe(false);
  142 |             });
  143 | 
  144 |             test('TC-LAND-S10 — New Patient button is disabled before any service is selected', async ({ landingPage }) => {
  145 |                 await landingPage._selectReason(reason);
  146 |                 await expect(landingPage.serviceTypeDropdown).toBeVisible({ timeout: 10_000 });
  147 |                 const isDisabled = await landingPage.newPatientBtn.evaluate(
  148 |                     btn => btn.disabled || btn.getAttribute('aria-disabled') === 'true'
  149 |                 );
> 150 |                 expect(isDisabled).toBe(true);
      |                                    ^ Error: expect(received).toBe(expected) // Object.is equality
  151 |             });
  152 |         });
  153 | 
  154 |         // ── Edge cases ────────────────────────────────────────────────────────
  155 | 
  156 |         test.describe('Edge cases', () => {
  157 | 
  158 |             if (popupService) {
  159 |                 test('TC-LAND-S11 — after closing popup, selecting valid service re-enables New Patient', async ({ landingPage }) => {
  160 |                     await pathBSetup(landingPage);
  161 |                     await landingPage.unavailabilityPopup.waitFor({ state: 'visible', timeout: 10_000 });
  162 |                     await landingPage.closeUnavailabilityPopup();
  163 |                     // After dismissing, user can pick a valid service and proceed
  164 |                     await landingPage._openServiceTypeAndSelectValid();
  165 |                     await expect(landingPage.newPatientBtn).toBeEnabled({ timeout: 5_000 });
  166 |                 });
  167 |             }
  168 | 
  169 |             test('TC-LAND-S12 — service type dropdown resets when reason changes', async ({ landingPage }) => {
  170 |                 await landingPage._selectReason(reason);
  171 |                 await landingPage._openServiceTypeAndSelectValid();
  172 |                 // Re-open the reason dropdown and pick the same reason again
  173 |                 // Service type value should reset (back to placeholder)
  174 |                 await landingPage.reasonSelect.click();
  175 |                 const option = landingPage.page.locator('[role="option"], li[role="option"]')
  176 |                     .filter({ hasText: reason }).first();
  177 |                 await option.waitFor({ state: 'visible', timeout: 10_000 });
  178 |                 await option.click();
  179 |                 // Service type combobox should be back to its empty/placeholder state
  180 |                 const serviceValue = await landingPage.serviceTypeDropdown
  181 |                     .evaluate(el => el.value ?? el.textContent?.trim() ?? '');
  182 |                 expect(serviceValue).toBe('');
  183 |             });
  184 |         });
  185 |     });
  186 | }
  187 | 
```