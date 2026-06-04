# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\SINY\cosmetic.spec.js >> SINY Landing — gray service / location >> All top-level reasons from landing >> TC-LAND-S16 — "Hair Loss" → New Patient navigates away from landing
- Location: tests\e2e\shared\sinyLanding.cases.js:238:17

# Error details

```
Error: expect(locator).not.toBeVisible() failed

Locator:  getByText('What is your reason for scheduling?')
Expected: not visible
Received: visible
Timeout:  10000ms

Call log:
  - Expect "not toBeVisible" with timeout 10000ms
  - waiting for getByText('What is your reason for scheduling?')
    23 × locator resolved to <h5 class="MuiTypography-root MuiTypography-h5 css-hpyzz9">What is your reason for scheduling?</h5>
       - unexpected value "visible"

```

```yaml
- heading "What is your reason for scheduling?" [level=5]
```

# Test source

```ts
  148 |                 await landingPage._openServiceTypeAndSelectValid();
  149 |                 const locationVisible = await landingPage.locationDropdown
  150 |                     .isVisible({ timeout: 3_000 })
  151 |                     .catch(() => false);
  152 |                 expect(locationVisible).toBe(false);
  153 |             });
  154 | 
  155 |             test('TC-LAND-S10 — service type combobox has no pre-selected value on load', async ({ landingPage }) => {
  156 |                 await landingPage._selectReason(reason);
  157 |                 await expect(landingPage.serviceTypeDropdown).toBeVisible({ timeout: 10_000 });
  158 |                 const value = await landingPage.serviceTypeDropdown.inputValue();
  159 |                 expect(value).toBe('');
  160 |             });
  161 |         });
  162 | 
  163 |         // ── Edge cases ────────────────────────────────────────────────────────
  164 | 
  165 |         test.describe('Edge cases', () => {
  166 | 
  167 |             if (popupService) {
  168 |                 test('TC-LAND-S11 — after closing popup, selecting valid service re-enables New Patient', async ({ landingPage }) => {
  169 |                     await pathBSetup(landingPage);
  170 |                     await landingPage.unavailabilityPopup.waitFor({ state: 'visible', timeout: 10_000 });
  171 |                     await landingPage.closeUnavailabilityPopup();
  172 |                     // After dismissing, user can pick a valid service and proceed
  173 |                     await landingPage._openServiceTypeAndSelectValid();
  174 |                     await expect(landingPage.newPatientBtn).toBeEnabled({ timeout: 5_000 });
  175 |                 });
  176 |             }
  177 | 
  178 |             test('TC-LAND-S12 — changing reason resets the service type selection', async ({ landingPage }) => {
  179 |                 // Select a valid service so the field has a non-empty value
  180 |                 await landingPage._selectReason(reason);
  181 |                 await landingPage._openServiceTypeAndSelectValid();
  182 |                 const before = await landingPage.serviceTypeDropdown.inputValue();
  183 |                 expect(before).not.toBe('');
  184 | 
  185 |                 // Change to an alternate reason — use accessible-name selector to avoid the
  186 |                 // strict-mode violation when both inputs share id="serviceType-select-box"
  187 |                 const altReason = reason === 'Cosmetic Procedure' ? 'Skin Problem' : 'Cosmetic Procedure';
  188 |                 const reasonInput = landingPage.page.getByRole('combobox', { name: /visit reason/i });
  189 |                 await reasonInput.fill(altReason);
  190 |                 await landingPage.page.locator('[role="option"]')
  191 |                     .filter({ hasText: altReason }).first()
  192 |                     .waitFor({ state: 'visible', timeout: 10_000 });
  193 |                 await landingPage.page.locator('[role="option"]')
  194 |                     .filter({ hasText: altReason }).first().click();
  195 | 
  196 |                 // Service type must reset to empty after reason change.
  197 |                 // Use toHaveValue with timeout instead of immediately reading — CI is slower.
  198 |                 await expect(landingPage.serviceTypeDropdown).toHaveValue('', { timeout: 8_000 });
  199 |             });
  200 |         });
  201 | 
  202 |         // ── URL-based layout — info panel visibility ──────────────────────────
  203 |         // Screenshots confirmed two layouts:
  204 |         //   Slug URL (/sinydermatologybayridge/landing): left info card visible
  205 |         //     showing clinic name + address alongside the form card.
  206 |         //   /any/ URL (/any/landing): no info card — just the centered form card.
  207 | 
  208 |         // ── Header phone number ───────────────────────────────────────────────
  209 | 
  210 |         if (phoneNumber) {
  211 |             test('TC-LAND-S12 — header phone number is visible and correct', async ({ landingPage }) => {
  212 |                 await expect(
  213 |                     landingPage.page.getByText(phoneNumber, { exact: false }).first()
  214 |                 ).toBeVisible({ timeout: 10_000 });
  215 |             });
  216 |         }
  217 | 
  218 |         // ── All service types from landing ────────────────────────────────────
  219 |         // SINY flow: Landing → reason selection → New Patient → INTAKE (not findappointment directly)
  220 |         // For each top-level reason: verify clicking New Patient reaches the intake page.
  221 |         // Special case: "Telehealth" shows an inline error + disabled buttons (no navigation).
  222 |         //
  223 |         // Confirmed from screenshots:
  224 |         //   Direct (no sub-service): Cosmetic Consultation, Hair Loss, Routine Skin Screening
  225 |         //   Sub-service needed:      Cosmetic Procedure, Skin Problem
  226 |         //   Blocked (error + disabled): Telehealth
  227 | 
  228 |         test.describe('All top-level reasons from landing', () => {
  229 | 
  230 |             // ── Reasons that navigate directly (no sub-service sub-dropdown) ──
  231 |             const directReasons = [
  232 |                 'Cosmetic Consultation',
  233 |                 'Hair Loss',
  234 |                 'Routine Skin Screening',
  235 |             ];
  236 | 
  237 |             directReasons.forEach(svc => {
  238 |                 test(`TC-LAND-S16 — "${svc}" → New Patient navigates away from landing`, async ({ landingPage }) => {
  239 |                     // startNewPatient handles: reason selection → popup dismissal → click → networkidle
  240 |                     // This is more reliable than manually clicking buttons one by one
  241 |                     await landingPage.startNewPatient(svc, {
  242 |                         serviceType:        null,
  243 |                         landingPopupAction: null,  // auto-dismisses any popup
  244 |                     });
  245 |                     // Verify we are no longer on the landing page
  246 |                     await expect(
  247 |                         landingPage.page.getByText('What is your reason for scheduling?')
> 248 |                     ).not.toBeVisible({ timeout: 10_000 });
      |                           ^ Error: expect(locator).not.toBeVisible() failed
  249 |                     console.log(`"${svc}": navigated away from landing ✓  (url: ${landingPage.page.url()})`);
  250 |                 });
  251 |             });
  252 | 
  253 |             // ── Telehealth — blocked on landing page ──────────────────────────
  254 |             // Shows error: "Telehealth appointments cannot be booked online at this time."
  255 |             // New Patient and Existing Patient buttons become DISABLED.
  256 | 
  257 |             test('TC-LAND-S17 — "Telehealth" shows an error message on the landing page', async ({ landingPage }) => {
  258 |                 await landingPage._selectReason('Telehealth');
  259 |                 await expect(
  260 |                     landingPage.page.getByText(/cannot be booked online/i).first()
  261 |                 ).toBeVisible({ timeout: 10_000 });
  262 |                 console.log('Telehealth: error message "cannot be booked online" confirmed ✓');
  263 |             });
  264 | 
  265 |             test('TC-LAND-S18 — "Telehealth" disables the New Patient and Existing Patient buttons', async ({ landingPage }) => {
  266 |                 await landingPage._selectReason('Telehealth');
  267 |                 // Buttons become disabled/grayed after selecting Telehealth
  268 |                 const npBtn = landingPage.newPatientBtn;
  269 |                 await npBtn.waitFor({ state: 'visible', timeout: 10_000 });
  270 |                 const isDisabled = await npBtn.evaluate(btn =>
  271 |                     btn.disabled ||
  272 |                     btn.getAttribute('aria-disabled') === 'true' ||
  273 |                     window.getComputedStyle(btn).opacity < '0.7'
  274 |                 );
  275 |                 expect(isDisabled).toBe(true);
  276 |                 console.log('Telehealth: New Patient button is disabled ✓');
  277 |             });
  278 | 
  279 |             // ── Skin Problem sub-services (Acne=available, Rash=available, others=gray) ──
  280 |             const skinProblemServices = ['Acne', 'Rash'];
  281 |             skinProblemServices.forEach(sub => {
  282 |                 test(`TC-LAND-S19 — "Skin Problem → ${sub}" navigates away from landing`, async ({ landingPage }) => {
  283 |                     await landingPage.startNewPatient('Skin Problem', {
  284 |                         serviceType:        sub,   // picks the sub-service (Acne, Rash)
  285 |                         landingPopupAction: null,
  286 |                     });
  287 |                     await expect(
  288 |                         landingPage.page.getByText('What is your reason for scheduling?')
  289 |                     ).not.toBeVisible({ timeout: 10_000 });
  290 |                     console.log(`"Skin Problem → ${sub}": navigated away from landing ✓  (url: ${landingPage.page.url()})`);
  291 |                 });
  292 |             });
  293 | 
  294 |             // ── Cosmetic Procedure sub-services ──────────────────────────────
  295 |             const cosmeticServices = ['Botox treatment', 'Laser hair Removal', 'Chemical Peel', 'Filler Treatment', 'Tattoo Removal'];
  296 |             cosmeticServices.forEach(sub => {
  297 |                 test(`TC-LAND-S20 — "Cosmetic Procedure → ${sub}" navigates away from landing`, async ({ landingPage }) => {
  298 |                     // 'Schedule Procedure' dismisses the "Consultation Required" popup
  299 |                     await landingPage.startNewPatient('Cosmetic Procedure', {
  300 |                         serviceType:        sub,
  301 |                         landingPopupAction: 'Schedule Procedure',
  302 |                     });
  303 |                     await expect(
  304 |                         landingPage.page.getByText('What is your reason for scheduling?')
  305 |                     ).not.toBeVisible({ timeout: 10_000 });
  306 |                     console.log(`"Cosmetic Procedure → ${sub}": navigated away from landing ✓  (url: ${landingPage.page.url()})`);
  307 | 
  308 |                 });
  309 |             });
  310 | 
  311 |         });
  312 | 
  313 |         if (locationName && anyUrl) {
  314 |             test.describe('Location info panel', () => {
  315 | 
  316 |                 test('TC-LAND-S13 — slug URL shows the location info panel with the clinic name', async ({ landingPage }) => {
  317 |                     // The fixture already navigated to the slug URL — info panel must be visible
  318 |                     const infoPanel = landingPage.page.getByText(locationName, { exact: false }).first();
  319 |                     await expect(infoPanel).toBeVisible({ timeout: 10_000 });
  320 |                 });
  321 | 
  322 |                 test('TC-LAND-S14 — /any/ URL hides the location info panel', async ({ landingPage }) => {
  323 |                     // Navigate to the /any/ variant — no location slug → no info panel
  324 |                     await landingPage.page.goto(anyUrl, { waitUntil: 'networkidle' });
  325 |                     const infoPanel = landingPage.page.getByText(locationName, { exact: false }).first();
  326 |                     await expect(infoPanel).not.toBeVisible({ timeout: 5_000 });
  327 |                 });
  328 | 
  329 |                 test('TC-LAND-S15 — /any/ URL still shows the form (reason dropdown and patient buttons)', async ({ landingPage }) => {
  330 |                     await landingPage.page.goto(anyUrl, { waitUntil: 'networkidle' });
  331 |                     // The form card is always present regardless of URL
  332 |                     await expect(landingPage.newPatientBtn).toBeVisible({ timeout: 10_000 });
  333 |                     await expect(landingPage.existingPatientBtn).toBeVisible({ timeout: 10_000 });
  334 |                 });
  335 | 
  336 |             });
  337 |         }
  338 | 
  339 |     });
  340 | }
  341 | 
```