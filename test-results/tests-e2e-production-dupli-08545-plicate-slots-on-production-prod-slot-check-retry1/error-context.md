# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\production\duplicateSlots.spec.js >> [SINY Dermatology — Cosmetic] No duplicate slots on production
- Location: tests\e2e\production\duplicateSlots.spec.js:102:5

# Error details

```
Test timeout of 600000ms exceeded.
```

```
Error: page.waitForTimeout: Target page, context or browser has been closed
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e7]:
        - img "logo" [ref=e9]
        - generic:
          - generic:
            - heading [level=6]
    - generic [ref=e13]:
      - generic [ref=e15]:
        - button "1" [ref=e17] [cursor=pointer]:
          - paragraph [ref=e18]: "1"
        - paragraph [ref=e21]: Location
      - generic [ref=e25]:
        - button "2" [ref=e27] [cursor=pointer]:
          - paragraph [ref=e28]: "2"
        - paragraph [ref=e31]: Intake Questions
      - generic [ref=e35]:
        - button "3" [ref=e37] [cursor=pointer]:
          - paragraph [ref=e38]: "3"
        - paragraph [ref=e41]: Choose Date & Time
      - generic [ref=e45]:
        - button "4" [ref=e47] [cursor=pointer]:
          - paragraph [ref=e48]: "4"
        - paragraph [ref=e51]: Add Info
  - generic [ref=e54]:
    - generic [ref=e57]:
      - paragraph [ref=e59]: Basic Search
      - separator [ref=e60]
      - generic [ref=e63]:
        - generic [ref=e64]: Location
        - generic [ref=e65]:
          - combobox "Location" [active] [ref=e66]: SINY Dermatology West Village
          - button "Open" [ref=e68] [cursor=pointer]:
            - img [ref=e69]
          - group:
            - generic: Location
      - separator [ref=e71]
      - generic [ref=e74]:
        - generic [ref=e75]: Service Type
        - generic [ref=e76]:
          - combobox "Service Type" [ref=e77]: Botox Treatment
          - button "Open" [ref=e79] [cursor=pointer]:
            - img [ref=e80]
          - group:
            - generic: Service Type
      - separator [ref=e82]
      - separator [ref=e83]
      - generic [ref=e84]:
        - paragraph [ref=e85]: Provider Gender
        - generic [ref=e86]:
          - generic [ref=e87]:
            - generic [ref=e88] [cursor=pointer]:
              - checkbox [checked] [ref=e89]
              - img [ref=e90]
            - paragraph [ref=e92]: Male
          - generic [ref=e93]:
            - generic [ref=e94] [cursor=pointer]:
              - checkbox [checked] [ref=e95]
              - img [ref=e96]
            - paragraph [ref=e98]: Female
    - generic [ref=e99]:
      - heading "Ronald Brancaccio Ronald Brancaccio Mon Jun 22 10:40 AM Mon Jun 22 10:50 AM Mon Jun 22 11:30 AM Show More" [level=3] [ref=e101]:
        - button "Ronald Brancaccio Ronald Brancaccio Mon Jun 22 10:40 AM Mon Jun 22 10:50 AM Mon Jun 22 11:30 AM Show More" [ref=e102]:
          - generic [ref=e105]:
            - img "Ronald Brancaccio" [ref=e107]
            - generic [ref=e108]:
              - paragraph [ref=e110]: Ronald Brancaccio
              - generic [ref=e111]:
                - button "Mon Jun 22 10:40 AM" [ref=e112] [cursor=pointer]:
                  - paragraph [ref=e113]: Mon Jun 22
                  - paragraph [ref=e114]: 10:40 AM
                - button "Mon Jun 22 10:50 AM" [ref=e115] [cursor=pointer]:
                  - paragraph [ref=e116]: Mon Jun 22
                  - paragraph [ref=e117]: 10:50 AM
                - button "Mon Jun 22 11:30 AM" [ref=e118] [cursor=pointer]:
                  - paragraph [ref=e119]: Mon Jun 22
                  - paragraph [ref=e120]: 11:30 AM
              - paragraph [ref=e121] [cursor=pointer]: Show More
      - heading "Jessica Dowling Jessica Dowling Tue Jun 9 8:00 AM Tue Jun 9 10:10 AM Tue Jun 9 3:10 PM Show More" [level=3] [ref=e123]:
        - button "Jessica Dowling Jessica Dowling Tue Jun 9 8:00 AM Tue Jun 9 10:10 AM Tue Jun 9 3:10 PM Show More" [ref=e124]:
          - generic [ref=e127]:
            - img "Jessica Dowling" [ref=e129]
            - generic [ref=e130]:
              - paragraph [ref=e132]: Jessica Dowling
              - generic [ref=e133]:
                - button "Tue Jun 9 8:00 AM" [ref=e134] [cursor=pointer]:
                  - paragraph [ref=e135]: Tue Jun 9
                  - paragraph [ref=e136]: 8:00 AM
                - button "Tue Jun 9 10:10 AM" [ref=e137] [cursor=pointer]:
                  - paragraph [ref=e138]: Tue Jun 9
                  - paragraph [ref=e139]: 10:10 AM
                - button "Tue Jun 9 3:10 PM" [ref=e140] [cursor=pointer]:
                  - paragraph [ref=e141]: Tue Jun 9
                  - paragraph [ref=e142]: 3:10 PM
              - paragraph [ref=e143] [cursor=pointer]: Show More
      - separator [ref=e144]
```

# Test source

```ts
  132 |         try {
  133 |             const firstSvc = services[0];
  134 |             const landing  = new LandingPage(page);
  135 |             await landing.open(prodLandingUrl);
  136 |             await landing.startNewPatient(firstSvc.reason, {
  137 |                 serviceType:        firstSvc.serviceType ?? null,
  138 |                 landingPopupAction: firstSvc.popup ?? null,
  139 |             });
  140 | 
  141 |             if (hasIntake) {
  142 |                 await Promise.race([
  143 |                     page.waitForURL(u => u.toString().includes('findappointment'), { timeout: 20_000 }),
  144 |                     page.waitForURL(u => u.toString().includes('intake'),          { timeout: 20_000 }),
  145 |                 ]).catch(() => {});
  146 |                 if (page.url().includes('intake')) {
  147 |                     const intake = new IntakePage(page);
  148 |                     await intake.waitForLoad();
  149 |                     await intake.continue();
  150 |                 }
  151 |             }
  152 | 
  153 |             await page.waitForURL(u => u.toString().includes('findappointment'), { timeout: 25_000 }).catch(() => {});
  154 |             await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  155 |             await page.waitForTimeout(1_000); // ensure all initial API calls complete
  156 |             onFindAppt = page.url().includes('findappointment');
  157 |         } catch (e) {
  158 |             console.log(`[${cfg.name}] Navigation failed: ${e.message.split('\n')[0]}`);
  159 |         } finally {
  160 |             page.off('request', credListener);
  161 |         }
  162 | 
  163 |         if (!onFindAppt || !credentials?.sessionId) {
  164 |             console.log(`[${cfg.name}] ⚠️  Could not establish session (sessionId: ${credentials?.sessionId ?? 'none'})`);
  165 |             return;
  166 |         }
  167 | 
  168 |         console.log(`[${cfg.name}] Session established — sessionId: ${credentials.sessionId.substring(0, 10)}...`);
  169 | 
  170 |         // ── 3. Discover all locations from the UI dropdown ───────────────────
  171 |         const slotPg = new SlotPage(page);
  172 |         let allLocations = [];
  173 |         try {
  174 |             // Try autocomplete style (SINY, Clarus, TNDI)
  175 |             const locAuto = page.locator('input#appointment_location-select-box');
  176 |             if (await locAuto.isVisible({ timeout: 3_000 }).catch(() => false)) {
  177 |                 await locAuto.click();
  178 |                 await page.waitForTimeout(400);
  179 |                 const opts = await page.locator('[role="option"]').allTextContents();
  180 |                 await page.keyboard.press('Escape').catch(() => {});
  181 |                 allLocations = opts.map(o => o.trim()).filter(Boolean);
  182 |             }
  183 | 
  184 |             // Try MUI Select style (Hopemark — Location is a ▼ dropdown, not autocomplete)
  185 |             if (allLocations.length === 0) {
  186 |                 const locSelect = page.locator('[class*="MuiFormControl"]')
  187 |                     .filter({ has: page.locator('label:has-text("Location")') })
  188 |                     .locator('[role="combobox"], .MuiSelect-select')
  189 |                     .first();
  190 |                 if (await locSelect.isVisible({ timeout: 3_000 }).catch(() => false)) {
  191 |                     await locSelect.click();
  192 |                     await page.waitForTimeout(400);
  193 |                     const opts = await page.locator('[role="option"]').allTextContents();
  194 |                     await page.keyboard.press('Escape').catch(() => {});
  195 |                     await page.waitForTimeout(200);
  196 |                     allLocations = opts.map(o => o.trim()).filter(Boolean);
  197 |                 }
  198 |             }
  199 |         } catch { /* no location dropdown */ }
  200 |         if (allLocations.length === 0) allLocations = [null];
  201 |         console.log(`[${cfg.name}] Locations (${allLocations.length}): ${allLocations.join(', ') || 'pre-set'}`);
  202 | 
  203 |         // ── 4. For each location × service: get appointmenttypeid then call API
  204 |         const { startDate, endDate } = getDateRange();
  205 | 
  206 |         for (const loc of allLocations) {
  207 |             for (const svc of services) {
  208 |                 const label = svc.serviceType ?? svc.filterReason;
  209 | 
  210 |                 // Apply UI filter to make the page call getProviders with the right appointmenttypeid
  211 |                 // We capture that call's URL to extract appointmenttypeid
  212 |                 let appointmenttypeid = null;
  213 |                 let capturedDeptId    = credentials.departmentid;
  214 | 
  215 |                 const apptTypeListener = (req) => {
  216 |                     if (!req.url().includes('/getProviders') && !req.url().includes('/getAllProviders')) return;
  217 |                     try {
  218 |                         const url = new URL(req.url());
  219 |                         appointmenttypeid = url.searchParams.get('appointmenttypeid');
  220 |                         capturedDeptId    = url.searchParams.get('departmentid') ?? capturedDeptId;
  221 |                     } catch {}
  222 |                 };
  223 |                 page.on('request', apptTypeListener);
  224 | 
  225 |                 try {
  226 |                     if (loc) {
  227 |                         await slotPg.selectLocation(loc).catch(() => {});
  228 |                         await page.waitForTimeout(400);
  229 |                     }
  230 |                     await slotPg.selectAppointmentReason(svc.filterReason).catch(() => {});
  231 |                     await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
> 232 |                     await page.waitForTimeout(300);
      |                                ^ Error: page.waitForTimeout: Target page, context or browser has been closed
  233 |                 } finally {
  234 |                     page.off('request', apptTypeListener);
  235 |                 }
  236 | 
  237 |                 // If re-selecting the service didn't trigger a new API call,
  238 |                 // fall back to the initial appointmenttypeid.
  239 |                 // This covers two cases:
  240 |                 //   1. First service already active on page load (no re-query needed)
  241 |                 //   2. Same appointmenttypeid as first service (e.g. Rash shares type with Acne)
  242 |                 //      → API call for this service would return identical slots anyway
  243 |                 if (!appointmenttypeid && credentials.initialApptTypeId) {
  244 |                     appointmenttypeid = credentials.initialApptTypeId;
  245 |                     console.log(`  [${loc ?? 'pre-set'}] ${label}: shares appointmenttypeid=${appointmenttypeid} with initial service`);
  246 |                 }
  247 | 
  248 |                 if (!appointmenttypeid) {
  249 |                     console.log(`  [${loc ?? 'pre-set'}] ${label}: ⚠️  Could not get appointmenttypeid — skipping`);
  250 |                     continue;
  251 |                 }
  252 | 
  253 |                 // ── 5. Call the API directly with full 6-month date range ─────
  254 |                 console.log(`  [${loc ?? 'pre-set'}] ${label}: calling API (appointmenttypeid=${appointmenttypeid})...`);
  255 | 
  256 |                 const apiUrl = new URL(`${API_BASE}/getProviders`);
  257 |                 apiUrl.searchParams.set('sessionId',            credentials.sessionId);
  258 |                 apiUrl.searchParams.set('path',                 credentials.path);
  259 |                 apiUrl.searchParams.set('appointmenttypeid',    appointmenttypeid);
  260 |                 apiUrl.searchParams.set('departmentid',         capturedDeptId);
  261 |                 apiUrl.searchParams.set('clientId',             credentials.clientId);
  262 |                 apiUrl.searchParams.set('locationTimezone',     credentials.locationTimezone);
  263 |                 apiUrl.searchParams.set('providerWithoutCapacity', 'No');
  264 |                 apiUrl.searchParams.set('sortBy',               'mostCapacity');
  265 |                 apiUrl.searchParams.set('isExistingPatient',    'false');
  266 |                 apiUrl.searchParams.set('startDate',            startDate);
  267 |                 apiUrl.searchParams.set('endDate',              endDate);
  268 | 
  269 |                 let apiSlots = [];
  270 |                 try {
  271 |                     const data = await page.evaluate(
  272 |                         async ({ url, auth }) => {
  273 |                             const resp = await fetch(url, {
  274 |                                 headers: {
  275 |                                     'authorization': auth,
  276 |                                     'accept': 'application/json, text/plain, */*',
  277 |                                 },
  278 |                             });
  279 |                             return resp.ok ? resp.json() : null;
  280 |                         },
  281 |                         { url: apiUrl.toString(), auth: credentials.authorization }
  282 |                     );
  283 | 
  284 |                     if (data) {
  285 |                         collectSlots(data, apiSlots);
  286 |                         console.log(`  [${loc ?? 'pre-set'}] ${label}: ${apiSlots.length} slots from API`);
  287 |                     } else {
  288 |                         console.log(`  [${loc ?? 'pre-set'}] ${label}: ⚠️  API returned no data`);
  289 |                     }
  290 |                 } catch (e) {
  291 |                     console.log(`  [${loc ?? 'pre-set'}] ${label}: ⚠️  API call failed — ${e.message.split('\n')[0]}`);
  292 |                 }
  293 | 
  294 |                 if (apiSlots.length === 0) continue;
  295 | 
  296 |                 // ── 6. Log providers × dates × slots ─────────────────────────
  297 |                 const byProv = new Map();
  298 |                 for (const s of apiSlots) {
  299 |                     const prov = s._providerName ?? s.locationName ?? 'Unknown';
  300 |                     if (!byProv.has(prov)) byProv.set(prov, new Map());
  301 |                     if (!byProv.get(prov).has(s.date)) byProv.get(prov).set(s.date, []);
  302 |                     byProv.get(prov).get(s.date).push(s.starttime);
  303 |                 }
  304 |                 for (const [prov, byDate] of byProv) {
  305 |                     console.log(`    Provider: ${prov}`);
  306 |                     for (const [date, times] of byDate) {
  307 |                         console.log(`      ${date}: ${times.join(', ')} (${times.length})`);
  308 |                     }
  309 |                 }
  310 | 
  311 |                 // ── 7. Check for real duplicates in THIS API response ─────────
  312 |                 findDuplicatesInSlots(apiSlots, `${cfg.name} / ${loc ?? 'pre-set'} / ${label}`, allDuplicates);
  313 |             }
  314 |         }
  315 | 
  316 |         // ── 8. Report ─────────────────────────────────────────────────────────
  317 |         const unique = [...new Set(allDuplicates)];
  318 |         if (unique.length > 0) {
  319 |             const report  = unique.map(d => `  • ${d}`).join('\n');
  320 |             const message = [
  321 |                 ``,
  322 |                 `╔══════════════════════════════════════════════════════════╗`,
  323 |                 `║          ⚠️  DUPLICATE SLOTS DETECTED ON PRODUCTION       ║`,
  324 |                 `╚══════════════════════════════════════════════════════════╝`,
  325 |                 ``,
  326 |                 `  Client   : ${cfg.name}`,
  327 |                 `  URL      : ${prodLandingUrl.replace('/landing', '/findappointment')}`,
  328 |                 ``,
  329 |                 `  Duplicates (same slot inserted twice for same provider+location+service):`,
  330 |                 report,
  331 |                 ``,
  332 |                 `  Root cause : Talend slot generation job ran twice or overlapped`,
```