# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\SINY\cosmetic.spec.js >> SINY Landing — gray service / location >> Edge cases >> TC-LAND-S12 — changing reason updates service type options
- Location: tests\e2e\shared\sinyLanding.cases.js:167:13

# Error details

```
Error: locator.fill: Error: strict mode violation: locator('input#serviceType-select-box') resolved to 2 elements:
    1) <input type="text" role="combobox" autocomplete="off" spellcheck="false" aria-invalid="false" aria-expanded="false" autocapitalize="none" aria-autocomplete="list" placeholder="Visit reason" value="Cosmetic Procedure" id="serviceType-select-box" data-gtm-form-interact-field-id="0" class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall MuiInputBase-inputAdornedEnd MuiAutocomplete-input MuiAutocomplete-inputFocused css-gzuv0n"/> aka getByRole('combobox', { name: 'Visit reason' })
    2) <input value="" type="text" role="combobox" autocomplete="off" spellcheck="false" aria-invalid="false" aria-expanded="false" autocapitalize="none" aria-autocomplete="list" placeholder="Service Type" id="serviceType-select-box" class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall MuiInputBase-inputAdornedEnd MuiAutocomplete-input MuiAutocomplete-inputFocused css-gzuv0n"/> aka getByRole('combobox', { name: 'Service Type' })

Call log:
  - waiting for locator('input#serviceType-select-box')

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
          - combobox "Visit reason" [ref=e29]: Cosmetic Procedure
          - button "Open" [ref=e31] [cursor=pointer]:
            - img [ref=e32]
          - group
        - generic [ref=e37]:
          - combobox "Service Type" [active] [ref=e38]
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
  144 |             test('TC-LAND-S10 — service type combobox has no pre-selected value on load', async ({ landingPage }) => {
  145 |                 await landingPage._selectReason(reason);
  146 |                 await expect(landingPage.serviceTypeDropdown).toBeVisible({ timeout: 10_000 });
  147 |                 const value = await landingPage.serviceTypeDropdown.inputValue();
  148 |                 expect(value).toBe('');
  149 |             });
  150 |         });
  151 | 
  152 |         // ── Edge cases ────────────────────────────────────────────────────────
  153 | 
  154 |         test.describe('Edge cases', () => {
  155 | 
  156 |             if (popupService) {
  157 |                 test('TC-LAND-S11 — after closing popup, selecting valid service re-enables New Patient', async ({ landingPage }) => {
  158 |                     await pathBSetup(landingPage);
  159 |                     await landingPage.unavailabilityPopup.waitFor({ state: 'visible', timeout: 10_000 });
  160 |                     await landingPage.closeUnavailabilityPopup();
  161 |                     // After dismissing, user can pick a valid service and proceed
  162 |                     await landingPage._openServiceTypeAndSelectValid();
  163 |                     await expect(landingPage.newPatientBtn).toBeEnabled({ timeout: 5_000 });
  164 |                 });
  165 |             }
  166 | 
  167 |             test('TC-LAND-S12 — changing reason updates service type options', async ({ landingPage }) => {
  168 |                 // Capture first service option under the initial reason
  169 |                 await landingPage._selectReason(reason);
  170 |                 await landingPage.serviceTypeDropdown.click();
  171 |                 await landingPage.page.locator('[role="listbox"]').waitFor({ state: 'visible', timeout: 10_000 });
  172 |                 const initialOption = (
  173 |                     await landingPage.page.locator('[role="option"]').first().textContent() ?? ''
  174 |                 ).trim();
  175 |                 await landingPage.page.keyboard.press('Escape');
  176 | 
  177 |                 // Switch to an alternate reason using the same autocomplete input
  178 |                 const altReason = reason === 'Cosmetic Procedure' ? 'Skin Problem' : 'Cosmetic Procedure';
> 179 |                 await landingPage.reasonAutocomplete.fill(altReason);
      |                                                      ^ Error: locator.fill: Error: strict mode violation: locator('input#serviceType-select-box') resolved to 2 elements:
  180 |                 const altOpt = landingPage.page.locator('[role="option"]')
  181 |                     .filter({ hasText: altReason }).first();
  182 |                 await altOpt.waitFor({ state: 'visible', timeout: 10_000 });
  183 |                 await altOpt.click();
  184 | 
  185 |                 // First service option under the new reason should differ
  186 |                 await landingPage.serviceTypeDropdown.click();
  187 |                 await landingPage.page.locator('[role="listbox"]').waitFor({ state: 'visible', timeout: 10_000 });
  188 |                 const newOption = (
  189 |                     await landingPage.page.locator('[role="option"]').first().textContent() ?? ''
  190 |                 ).trim();
  191 |                 await landingPage.page.keyboard.press('Escape');
  192 | 
  193 |                 expect(newOption).not.toBe(initialOption);
  194 |             });
  195 |         });
  196 |     });
  197 | }
  198 | 
```