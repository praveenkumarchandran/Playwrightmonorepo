# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\ClarusDerm\newPatient.spec.js >> Find Appointment — Basic Search filters >> Slot selection >> TC-FA-17 — "Your Appointment" summary on the next page shows the selected provider and appointment type
- Location: tests\e2e\shared\findAppointment.cases.js:207:13

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('JJesse OchoaThu Jul 239:00 AMThu Jul 239:45 AMThu Jul 2311:00 AMShow More').first()
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByText('JJesse OchoaThu Jul 239:00 AMThu Jul 239:45 AMThu Jul 2311:00 AMShow More').first()

```

```yaml
- banner:
  - img "logo"
  - heading "877-408-2431" [level=6]
- button "1":
  - paragraph: "1"
- paragraph: Location
- button "2":
  - paragraph: "2"
- paragraph: Choose Date & Time
- button "3":
  - paragraph: "3"
- paragraph: Add Insurance
- button "4":
  - paragraph: "4"
- paragraph: Add Info
- heading "Your Appointment" [level=5]
- text: p
- heading "Jesse Ochoa" [level=5]
- separator
- heading "Appointment Time" [level=6]
- paragraph: 9:00 AM, Thu Jul 23, 2026
- heading "Appointment Type" [level=6]
- paragraph: Acne
- heading "Insurance Policy" [level=5]
- text: Insurance Type
- combobox "Insurance Type"
- button "Open"
- button "Next"
```

# Test source

```ts
  126 |                 if (!gray) gray = await findAppointmentPage.triggerGrayOption(findAppointmentPage.providerDropdown);
  127 |                 if (!gray) return; // no gray options available for this client
  128 |                 await expect(findAppointmentPage.popup).toBeVisible({ timeout: 8_000 });
  129 |                 await findAppointmentPage.closePopup();
  130 |                 await expect(findAppointmentPage.popup).not.toBeVisible({ timeout: 5_000 });
  131 |             });
  132 | 
  133 |         });
  134 | 
  135 |         // ── Edge cases ────────────────────────────────────────────────────────
  136 | 
  137 |         test.describe('Edge cases', () => {
  138 | 
  139 |             test('TC-FA-13 — dismissing gray location popup keeps Service Type unchanged', async ({ findAppointmentPage }) => {
  140 |                 const serviceBefore = await findAppointmentPage._getDropdownText(findAppointmentPage.serviceTypeDropdown);
  141 |                 const gray = await findAppointmentPage.triggerGrayOption(findAppointmentPage.locationDropdown);
  142 |                 if (!gray) return; // no gray locations — nothing to dismiss
  143 |                 await findAppointmentPage.closePopup();
  144 |                 const serviceAfter = await findAppointmentPage._getDropdownText(findAppointmentPage.serviceTypeDropdown);
  145 |                 expect(serviceAfter).toBe(serviceBefore);
  146 |             });
  147 | 
  148 |             test('TC-FA-14 — dismissing gray provider popup keeps provider filter on "Any Provider"', async ({ findAppointmentPage }) => {
  149 |                 const gray = await findAppointmentPage.triggerGrayOption(findAppointmentPage.providerDropdown);
  150 |                 if (!gray) return; // no gray providers
  151 |                 await findAppointmentPage.closePopup();
  152 |                 const value = await findAppointmentPage._getDropdownText(findAppointmentPage.providerDropdown);
  153 |                 expect(value).toMatch(/any provider/i);
  154 |             });
  155 | 
  156 |         });
  157 | 
  158 |         // ── Slot selection ────────────────────────────────────────────────────
  159 |         // Screenshots confirmed the DOM layout:
  160 |         //   Before Show More: each provider card shows 3 inline slots —
  161 |         //     buttons with both date + time text ("Thu Jun 4 / 9:20 AM").
  162 |         //   After  Show More: a "More Slots" section expands below the card with:
  163 |         //     • a scrollable Dates strip  (buttons like "Thu Jun 4", "Fri Jun 5")
  164 |         //     • an Available Slots grid   (pure time-only buttons: "9:20 AM", "9:30 AM" …)
  165 |         //     "Show More" text changes to "Show Less".
  166 | 
  167 |         test.describe('Slot selection', () => {
  168 | 
  169 |             test('TC-FA-15 — Show More expands into a "More Slots" section with available time buttons', async ({ findAppointmentPage }) => {
  170 |                 await findAppointmentPage.clickShowMore(0);
  171 |                 // "More Slots" heading must be visible
  172 |                 await expect(findAppointmentPage.page.getByText('More Slots')).toBeVisible({ timeout: 8_000 });
  173 |                 // At least one pure time-only button ("9:20 AM") must appear in Available Slots
  174 |                 const timeBtn = findAppointmentPage.page
  175 |                     .locator('button')
  176 |                     .filter({ hasText: /^\d{1,2}:\d{2}\s*(AM|PM)$/i })
  177 |                     .first();
  178 |                 await expect(timeBtn).toBeVisible({ timeout: 5_000 });
  179 |             });
  180 | 
  181 |             test('TC-FA-16 — selecting a slot and clicking Continue navigates to the expected next page', async ({ findAppointmentPage }) => {
  182 |                 await findAppointmentPage.clickShowMore(0);
  183 |                 await findAppointmentPage.clickFirstSlot();
  184 |                 await findAppointmentPage.clickContinue();
  185 | 
  186 |                 if (nextPageAfterSlot === 'insurance') {
  187 |                     // Insurance page — use URL since insurance input style varies by client:
  188 |                     // autocomplete (#insurance-select-box) for TNDI/Clarus, MUI Select for SINY
  189 |                     await findAppointmentPage.page.waitForURL(
  190 |                         url => url.toString().includes('insurance'),
  191 |                         { timeout: 15_000 }
  192 |                     );
  193 |                 } else if (nextPageAfterSlot === 'patientInfo') {
  194 |                     // Patient Info page — firstName input present on all clients
  195 |                     await expect(
  196 |                         findAppointmentPage.page.locator('input[name*="firstName"]').first()
  197 |                     ).toBeVisible({ timeout: 15_000 });
  198 |                 } else {
  199 |                     // nextPageAfterSlot not specified — verify navigation away from findappointment
  200 |                     await findAppointmentPage.page.waitForURL(
  201 |                         url => !url.toString().includes('findappointment'),
  202 |                         { timeout: 15_000 }
  203 |                     );
  204 |                 }
  205 |             });
  206 | 
  207 |             test('TC-FA-17 — "Your Appointment" summary on the next page shows the selected provider and appointment type', async ({ findAppointmentPage }) => {
  208 |                 // Capture provider name from card 0 BEFORE interacting
  209 |                 const providerName = await findAppointmentPage.getProviderName(0);
  210 | 
  211 |                 await findAppointmentPage.clickShowMore(0);
  212 |                 await findAppointmentPage.clickFirstSlot();
  213 |                 await findAppointmentPage.clickContinue();
  214 | 
  215 |                 // Use a single long timeout on the first assertion — it naturally waits for
  216 |                 // both navigation AND the page to render the summary panel.
  217 |                 // Avoids fragile waitForURL / waitForLoadState which can race.
  218 |                 await expect(
  219 |                     findAppointmentPage.page.getByText(/Your Appointment/i).first()
  220 |                 ).toBeVisible({ timeout: 30_000 });
  221 | 
  222 |                 // Once the heading is visible the rest loads quickly
  223 |                 if (providerName) {
  224 |                     await expect(
  225 |                         findAppointmentPage.page.getByText(providerName, { exact: false }).first()
> 226 |                     ).toBeVisible({ timeout: 8_000 });
      |                       ^ Error: expect(locator).toBeVisible() failed
  227 |                     console.log(`Provider "${providerName}" confirmed in appointment summary`);
  228 |                 }
  229 | 
  230 |                 await expect(
  231 |                     findAppointmentPage.page.getByText(/Appointment Type/i).first()
  232 |                 ).toBeVisible({ timeout: 5_000 });
  233 | 
  234 |                 await expect(
  235 |                     findAppointmentPage.page.getByText(/Appointment Time/i).first()
  236 |                 ).toBeVisible({ timeout: 5_000 });
  237 |             });
  238 | 
  239 |         });
  240 | 
  241 |     });
  242 | }
  243 | 
```