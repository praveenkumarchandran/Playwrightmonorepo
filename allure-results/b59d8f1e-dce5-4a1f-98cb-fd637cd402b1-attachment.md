# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\ClarusDerm\newPatient.spec.js >> Landing page >> Service type navigation from landing >> TC-LAND-SVC — selecting "Acne" and clicking New Patient reaches find appointment
- Location: tests\e2e\shared\landing.cases.js:141:21

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
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
        - generic: Provider
        - generic [ref=e89]:
          - combobox "Provider" [ref=e90]
          - button "Open" [ref=e92] [cursor=pointer]:
            - img [ref=e93]
          - group:
            - generic: Provider
      - separator [ref=e95]
      - generic [ref=e96]:
        - paragraph [ref=e97]: Provider Gender
        - generic [ref=e98]:
          - generic [ref=e99]:
            - generic [ref=e100] [cursor=pointer]:
              - checkbox [checked] [ref=e101]
              - img [ref=e102]
            - paragraph [ref=e104]: Male
          - generic [ref=e105]:
            - generic [ref=e106] [cursor=pointer]:
              - checkbox [checked] [ref=e107]
              - img [ref=e108]
            - paragraph [ref=e110]: Female
    - generic [ref=e113]:
      - progressbar [ref=e114]:
        - img [ref=e115]
      - heading "Loading..." [level=6] [ref=e117]
```

# Test source

```ts
  71  |             test('TC-LAND-05 — Existing Patient button is enabled after reason selection', async ({ landingPage }) => {
  72  |                 await landingPage._selectReason(reason);
  73  |                 await expect(landingPage.existingPatientBtn).toBeEnabled({ timeout: 5_000 });
  74  |             });
  75  | 
  76  |         });
  77  | 
  78  |         // ── 3. NAVIGATION ─────────────────────────────────────────────────────
  79  | 
  80  |         test.describe('Navigation', () => {
  81  | 
  82  |             test('TC-LAND-06 — clicking New Patient after selecting reason navigates away from landing', async ({ landingPage }) => {
  83  |                 const urlBefore = landingPage.page.url();
  84  |                 await landingPage._selectReason(reason);
  85  |                 await landingPage.newPatientBtn.click();
  86  |                 // Allow time for navigation and any post-click popup to appear
  87  |                 await landingPage.page.waitForTimeout(2_000);
  88  |                 // URL must have changed OR a popup appeared (we're no longer on the bare landing)
  89  |                 const urlAfter = landingPage.page.url();
  90  |                 const popupVisible = await landingPage.page
  91  |                     .locator('[role="dialog"]').isVisible({ timeout: 1_000 }).catch(() => false);
  92  |                 expect(urlAfter !== urlBefore || popupVisible).toBe(true);
  93  |             });
  94  | 
  95  |         });
  96  | 
  97  |         // ── 4. NEGATIVE ───────────────────────────────────────────────────────
  98  | 
  99  |         test.describe('Negative', () => {
  100 | 
  101 |             test('TC-LAND-07 — reason dropdown search returns results for the configured reason', async ({ landingPage }) => {
  102 |                 const hasAuto = await landingPage.reasonAutocomplete
  103 |                     .isVisible({ timeout: 3_000 }).catch(() => false);
  104 | 
  105 |                 if (!hasAuto) return; // MUI Select clients: skip text-search check
  106 | 
  107 |                 await landingPage.reasonAutocomplete.click();
  108 |                 await landingPage.reasonAutocomplete.fill(reason.substring(0, 3));
  109 |                 await expect(
  110 |                     landingPage.page.locator('[role="option"]').first()
  111 |                 ).toBeVisible({ timeout: 10_000 });
  112 |                 await landingPage.page.keyboard.press('Escape');
  113 |             });
  114 | 
  115 |             test('TC-LAND-08 — invalid search text shows no matching options', async ({ landingPage }) => {
  116 |                 const hasAuto = await landingPage.reasonAutocomplete
  117 |                     .isVisible({ timeout: 3_000 }).catch(() => false);
  118 | 
  119 |                 if (!hasAuto) return; // MUI Select clients: skip text-search check
  120 | 
  121 |                 await landingPage.reasonAutocomplete.click();
  122 |                 await landingPage.reasonAutocomplete.fill('zzzzinvalidreason9999');
  123 |                 await expect(
  124 |                     landingPage.page.locator('[role="option"]')
  125 |                 ).toHaveCount(0, { timeout: 5_000 });
  126 |                 await landingPage.page.keyboard.press('Escape');
  127 |             });
  128 | 
  129 |         });
  130 | 
  131 |         // ── 5. ALL SERVICE TYPES — end-to-end from landing ───────────────────
  132 |         // For clients with multiple service options, each service is selected on the
  133 |         // landing page → New Patient clicked → findappointment page verified.
  134 |         // Tests that each service navigates correctly and shows either providers
  135 |         // OR the "no online availability" message.
  136 | 
  137 |         if (allServiceTypes.length > 1) {
  138 |             test.describe('Service type navigation from landing', () => {
  139 | 
  140 |                 allServiceTypes.forEach(service => {
  141 |                     test(`TC-LAND-SVC — selecting "${service}" and clicking New Patient reaches find appointment`, async ({ landingPage }) => {
  142 |                         // Select the service reason on landing page
  143 |                         await landingPage._selectReason(service);
  144 |                         await landingPage.newPatientBtn.waitFor({ state: 'visible', timeout: 10_000 });
  145 |                         await landingPage.newPatientBtn.click();
  146 | 
  147 |                         // Wait for findappointment URL
  148 |                         await landingPage.page.waitForURL(
  149 |                             url => url.toString().includes('findappointment'),
  150 |                             { timeout: 20_000 }
  151 |                         );
  152 | 
  153 |                         // Wait for page content to render
  154 |                         await landingPage.page.waitForFunction(
  155 |                             () => document.body.innerText.includes('Show More') ||
  156 |                                   /no online availability|no availability|please call/i.test(document.body.innerText) ||
  157 |                                   document.body.innerText.includes('Basic Search') ||
  158 |                                   document.body.innerText.includes('Available Time Slots'),
  159 |                             { timeout: 20_000 }
  160 |                         ).catch(() => {});
  161 | 
  162 |                         // Verify: providers visible OR no-availability message
  163 |                         const hasShowMore = await landingPage.page
  164 |                             .getByText(/^Show More$/).count() > 0;
  165 |                         const hasTimeSlots = await landingPage.page
  166 |                             .locator('button').filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i }).count() > 0;
  167 |                         const noAvail = /no online availability|no availability|please call/i.test(
  168 |                             await landingPage.page.evaluate(() => document.body.innerText)
  169 |                         );
  170 | 
> 171 |                         expect(hasShowMore || hasTimeSlots || noAvail).toBe(true);
      |                                                                        ^ Error: expect(received).toBe(expected) // Object.is equality
  172 | 
  173 |                         if (hasShowMore || hasTimeSlots) {
  174 |                             console.log(`"${service}": providers/slots visible on findappointment ✓`);
  175 |                         } else {
  176 |                             console.log(`"${service}": no-availability message shown ✓`);
  177 |                         }
  178 |                     });
  179 |                 });
  180 | 
  181 |             });
  182 |         }
  183 | 
  184 |         // ── 6. HEADER PHONE NUMBER ────────────────────────────────────────────
  185 |         // Every client shows a phone number in the page header (top-right corner).
  186 |         // Confirms the correct client config is loaded.
  187 | 
  188 |         if (phoneNumber) {
  189 |             test('TC-LAND-12 — header phone number is visible and correct', async ({ landingPage }) => {
  190 |                 await expect(
  191 |                     landingPage.page.getByText(phoneNumber, { exact: false }).first()
  192 |                 ).toBeVisible({ timeout: 10_000 });
  193 |             });
  194 |         }
  195 | 
  196 |         // ── 7. LOCATION INFO PANEL (URL-based) ───────────────────────────────
  197 |         // Confirmed for Clarus and SINY:
  198 |         //   Slug URL  (e.g. /minnetonka/landing): left info panel visible with clinic name
  199 |         //   /any/ URL (e.g. /any/landing)       : no info panel — just the form
  200 | 
  201 |         if (locationName && anyUrl) {
  202 |             test.describe('Location info panel', () => {
  203 | 
  204 |                 test('TC-LAND-09 — slug URL shows the location info panel with clinic name', async ({ landingPage }) => {
  205 |                     const infoPanel = landingPage.page.getByText(locationName, { exact: false }).first();
  206 |                     await expect(infoPanel).toBeVisible({ timeout: 10_000 });
  207 |                 });
  208 | 
  209 |                 test('TC-LAND-10 — /any/ URL hides the location info panel', async ({ landingPage }) => {
  210 |                     await landingPage.page.goto(anyUrl, { waitUntil: 'networkidle' });
  211 |                     const infoPanel = landingPage.page.getByText(locationName, { exact: false }).first();
  212 |                     await expect(infoPanel).not.toBeVisible({ timeout: 5_000 });
  213 |                 });
  214 | 
  215 |                 test('TC-LAND-11 — /any/ URL still shows the reason form and patient buttons', async ({ landingPage }) => {
  216 |                     await landingPage.page.goto(anyUrl, { waitUntil: 'networkidle' });
  217 |                     await expect(landingPage.newPatientBtn).toBeVisible({ timeout: 10_000 });
  218 |                     await expect(landingPage.existingPatientBtn).toBeVisible({ timeout: 10_000 });
  219 |                 });
  220 | 
  221 |             });
  222 |         }
  223 | 
  224 |     });
  225 | }
  226 | 
```