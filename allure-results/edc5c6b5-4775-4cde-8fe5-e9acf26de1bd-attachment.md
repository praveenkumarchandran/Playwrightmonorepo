# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: booking\create-appointment.spec.js >> Setter – Teleconsultation Booking (New Patient)
- Location: tests\e2e\booking\create-appointment.spec.js:9:1

# Error details

```
Test timeout of 180000ms exceeded.
```

```
Error: locator.click: Test timeout of 180000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Continue")')
    - locator resolved to <button disabled tabindex="-1" type="button" lineargradient="1" class="MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-colorPrimary Mui-disabled MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-colorPrimary css-aqvl0h">Continue</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
      - waiting 100ms
    283 × waiting for element to be visible, enabled and stable
        - element is not enabled
      - retrying click action
        - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e7]:
        - img "logo" [ref=e9]
        - heading "586-416-3472" [level=6] [ref=e12]
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
    - generic [ref=e69]:
      - heading "Your Appointment" [level=5] [ref=e70]
      - generic [ref=e71]:
        - generic [ref=e72]:
          - heading "Location" [level=6] [ref=e73]
          - paragraph [ref=e75]: The Nerve and Disc Institute Farmington
        - generic [ref=e76]:
          - heading "Location Address" [level=6] [ref=e77]
          - paragraph [ref=e79]: 24100 Drake Rd, MI 48335
        - generic [ref=e80]:
          - heading "Appointment Time" [level=6] [ref=e81]
          - paragraph [ref=e83]: 2:30 PM, Fri May 22, 2026
        - generic [ref=e84]:
          - heading "Appointment Type" [level=6] [ref=e85]
          - paragraph [ref=e87]: Teleconsultation
    - generic [ref=e89]:
      - heading "Intake Questions" [level=5] [ref=e90]
      - generic [ref=e91]:
        - paragraph [ref=e92]: What symptoms are you experiencing?
        - generic [ref=e94]:
          - generic [ref=e95]: What symptoms are you experiencing?
          - generic [ref=e96]:
            - button "Neck Pain" [ref=e97]:
              - generic [ref=e98]: Neck Pain
              - img [ref=e99] [cursor=pointer]
            - combobox "What symptoms are you experiencing?" [active] [ref=e101]
            - generic [ref=e102]:
              - button "Clear" [ref=e103] [cursor=pointer]:
                - img [ref=e104]
              - button "Open" [ref=e106] [cursor=pointer]:
                - img [ref=e107]
            - group:
              - generic: What symptoms are you experiencing?
      - generic [ref=e109]:
        - paragraph [ref=e110]: Have you had surgery for this condition previously?
        - radiogroup [ref=e111]:
          - generic [ref=e112] [cursor=pointer]:
            - generic [ref=e113]:
              - radio "Yes" [ref=e114]
              - img [ref=e116]
            - generic [ref=e118]: "Yes"
          - generic [ref=e119] [cursor=pointer]:
            - generic [ref=e120]:
              - radio "No" [ref=e121]
              - img [ref=e123]
            - generic [ref=e125]: "No"
      - generic [ref=e126]:
        - paragraph [ref=e127]: Have you had an MRI for this condition within the last 3 years?
        - radiogroup [ref=e128]:
          - generic [ref=e129] [cursor=pointer]:
            - generic [ref=e130]:
              - radio "Yes" [ref=e131]
              - img [ref=e133]
            - generic [ref=e135]: "Yes"
          - generic [ref=e136] [cursor=pointer]:
            - generic [ref=e137]:
              - radio "No" [ref=e138]
              - img [ref=e140]
            - generic [ref=e142]: "No"
      - generic [ref=e143]:
        - paragraph [ref=e144]: Have you had a CT scan for this condition within the last 3 years?
        - radiogroup [ref=e145]:
          - generic [ref=e146] [cursor=pointer]:
            - generic [ref=e147]:
              - radio "Yes" [ref=e148]
              - img [ref=e150]
            - generic [ref=e152]: "Yes"
          - generic [ref=e153] [cursor=pointer]:
            - generic [ref=e154]:
              - radio "No" [ref=e155]
              - img [ref=e157]
            - generic [ref=e159]: "No"
      - generic [ref=e160]:
        - paragraph [ref=e161]: Have you had an X-ray for this condition within the last year?
        - radiogroup [ref=e162]:
          - generic [ref=e163] [cursor=pointer]:
            - generic [ref=e164]:
              - radio "Yes" [ref=e165]
              - img [ref=e167]
            - generic [ref=e169]: "Yes"
          - generic [ref=e170] [cursor=pointer]:
            - generic [ref=e171]:
              - radio "No" [ref=e172]
              - img [ref=e174]
            - generic [ref=e176]: "No"
      - generic [ref=e177]:
        - button "Continue" [disabled]
```

# Test source

```ts
  89  |         for (const sel of [
  90  |             '[class*="slot"]:has-text("2:30")',
  91  |             '[class*="time"]:has-text("2:30")',
  92  |             '[class*="chip"]:has-text("2:30")',
  93  |             '[class*="card"]:has-text("2:30")',
  94  |             '[class*="item"]:has-text("2:30")',
  95  |             'div:has-text("2:30 PM"):not(:has(div))',  // leaf div with text
  96  |             'span:has-text("2:30 PM")',
  97  |             'td:has-text("2:30")',
  98  |             'li:has-text("2:30")',
  99  |         ]) {
  100 |             const el = page.locator(sel).first();
  101 |             if ((await el.count()) > 0 && await el.isVisible()) {
  102 |                 await el.scrollIntoViewIfNeeded();
  103 |                 await el.click();
  104 |                 console.log(`✅ Clicked slot via: ${sel}`);
  105 |                 slotClicked = true;
  106 |                 break;
  107 |             }
  108 |         }
  109 |     }
  110 | 
  111 |     if (!slotClicked) {
  112 |         await page.screenshot({ path: 'step2-slot-error.png', fullPage: true });
  113 |         // Log full page text for debugging
  114 |         const pageText = await page.locator('body').innerText();
  115 |         console.log('📄 Page text (first 2000 chars):\n', pageText.substring(0, 2000));
  116 |         throw new Error('❌ Could not find 2:30 PM slot. Check step2-slots.png and console output.');
  117 |     }
  118 | 
  119 |     await page.waitForTimeout(500);
  120 | 
  121 |     // Click Continue
  122 |     await page.locator('button:has-text("Continue")').waitFor({ timeout: 10000 });
  123 |     await page.locator('button:has-text("Continue")').click();
  124 |     console.log('✅ Clicked: Continue');
  125 | 
  126 |     // ── STEP 3: Symptoms ──────────────────────────────────────────
  127 |     console.log('\n📌 STEP 3: Symptoms');
  128 |     await page.waitForTimeout(2500);
  129 |     await page.screenshot({ path: 'step3-symptoms.png', fullPage: true });
  130 | 
  131 |     // Log all interactive elements for debugging
  132 |     const step3Btns = await page.locator('button').allTextContents();
  133 |     console.log('🔵 Step 3 buttons:', JSON.stringify(step3Btns));
  134 | 
  135 |     // Open multi-select for symptoms
  136 |     for (const sel of [
  137 |         '[class*="multiselect"]',
  138 |         '[class*="multi-select"]',
  139 |         '[class*="select__control"]',
  140 |         '[class*="select__value-container"]',
  141 |         '[role="combobox"]',
  142 |         'div[class*="Select"]',
  143 |         'div[class*="select"]',
  144 |     ]) {
  145 |         const el = page.locator(sel).first();
  146 |         if ((await el.count()) > 0 && await el.isVisible()) {
  147 |             await el.click();
  148 |             console.log(`✅ Opened dropdown: ${sel}`);
  149 |             await page.waitForTimeout(600);
  150 |             break;
  151 |         }
  152 |     }
  153 | 
  154 |     // Select Knee Pain
  155 |     await clickDropdownOption(page, 'Knee Pain');
  156 |     await page.waitForTimeout(300);
  157 | 
  158 |     // Re-open and select Neck Pain
  159 |     for (const sel of [
  160 |         '[class*="multiselect"]', '[class*="multi-select"]',
  161 |         '[class*="select__control"]', '[role="combobox"]', 'div[class*="select"]',
  162 |     ]) {
  163 |         const el = page.locator(sel).first();
  164 |         if ((await el.count()) > 0 && await el.isVisible()) {
  165 |             await el.click();
  166 |             await page.waitForTimeout(400);
  167 |             break;
  168 |         }
  169 |     }
  170 |     await clickDropdownOption(page, 'Neck Pain');
  171 |     await page.keyboard.press('Escape');
  172 |     await page.waitForTimeout(500);
  173 | 
  174 |     // Click No for all yes/no questions
  175 |     const noButtons = page.locator('button:has-text("No")');
  176 |     const noCount = await noButtons.count();
  177 |     console.log(`ℹ️  Found ${noCount} "No" buttons`);
  178 |     for (let i = 0; i < noCount; i++) {
  179 |         try {
  180 |             if (await noButtons.nth(i).isVisible()) {
  181 |                 await noButtons.nth(i).click();
  182 |                 await page.waitForTimeout(200);
  183 |                 console.log(`✅ Clicked No #${i + 1}`);
  184 |             }
  185 |         } catch { /* skip */ }
  186 |     }
  187 | 
  188 |     await page.waitForTimeout(500);
> 189 |     await page.locator('button:has-text("Continue")').click();
      |                                                       ^ Error: locator.click: Test timeout of 180000ms exceeded.
  190 |     console.log('✅ Clicked: Continue');
  191 | 
  192 |     // ── STEP 4: Insurance ─────────────────────────────────────────
  193 |     console.log('\n📌 STEP 4: Insurance');
  194 |     await page.waitForTimeout(2500);
  195 |     await page.screenshot({ path: 'step4-insurance.png', fullPage: true });
  196 | 
  197 |     // Select Self Pay
  198 |     await selectDropdownOption(page, 'Self Pay');
  199 |     await page.waitForTimeout(500);
  200 | 
  201 |     // Click Manually Enter Details
  202 |     await page.locator('button:has-text("Manually Enter Details")').click();
  203 |     console.log('✅ Clicked: Manually Enter Details');
  204 |     await page.waitForTimeout(1000);
  205 | 
  206 |     // Select Other from insurance plan dropdown
  207 |     await selectDropdownOption(page, 'Other');
  208 |     await page.waitForTimeout(500);
  209 | 
  210 |     // Type 12 in Other Insurance Plan field
  211 |     let otherFilled = false;
  212 |     for (const sel of [
  213 |         'input[placeholder*="other" i]', 'input[name*="other" i]',
  214 |         'input[placeholder*="plan" i]', 'input[name*="plan" i]',
  215 |     ]) {
  216 |         const el = page.locator(sel).first();
  217 |         if ((await el.count()) > 0 && await el.isVisible()) {
  218 |             await el.fill('12');
  219 |             console.log(`✅ Typed "12" in: ${sel}`);
  220 |             otherFilled = true;
  221 |             break;
  222 |         }
  223 |     }
  224 |     if (!otherFilled) {
  225 |         for (const inp of await page.locator('input[type="text"]:visible').all()) {
  226 |             if (!(await inp.inputValue())) {
  227 |                 await inp.fill('12');
  228 |                 console.log('✅ Typed "12" in fallback input');
  229 |                 break;
  230 |             }
  231 |         }
  232 |     }
  233 | 
  234 |     await page.waitForTimeout(500);
  235 |     await page.locator('button:has-text("Next")').click();
  236 |     console.log('✅ Clicked: Next');
  237 | 
  238 |     // ── STEP 5: Additional Information ───────────────────────────
  239 |     console.log('\n📌 STEP 5: Additional Information');
  240 |     await page.waitForTimeout(2500);
  241 |     await page.screenshot({ path: 'step5-addinfo.png', fullPage: true });
  242 | 
  243 |     const fieldMap = [
  244 |         { selectors: ['input[name*="first" i]', 'input[placeholder*="first" i]'], value: 'John' },
  245 |         { selectors: ['input[name*="last" i]', 'input[placeholder*="last" i]'], value: 'Doe' },
  246 |         { selectors: ['input[type="email"]', 'input[name*="email" i]'], value: 'johndoe@example.com' },
  247 |         { selectors: ['input[type="tel"]', 'input[name*="phone" i]', 'input[placeholder*="phone" i]'], value: '5551234567' },
  248 |         { selectors: ['input[type="date"]', 'input[name*="dob" i]', 'input[name*="birth" i]'], value: '1990-01-15' },
  249 |         { selectors: ['input[name*="address" i]', 'input[placeholder*="address" i]'], value: '123 Main St' },
  250 |         { selectors: ['input[name*="city" i]', 'input[placeholder*="city" i]'], value: 'Farmington Hills' },
  251 |         { selectors: ['input[name*="state" i]', 'input[placeholder*="state" i]'], value: 'MI' },
  252 |         { selectors: ['input[name*="zip" i]', 'input[placeholder*="zip" i]'], value: '48335' },
  253 |     ];
  254 | 
  255 |     for (const { selectors, value } of fieldMap) {
  256 |         for (const sel of selectors) {
  257 |             const el = page.locator(sel).first();
  258 |             if ((await el.count()) > 0 && await el.isVisible()) {
  259 |                 await el.fill(value);
  260 |                 console.log(`✅ ${sel} → "${value}"`);
  261 |                 break;
  262 |             }
  263 |         }
  264 |     }
  265 | 
  266 |     // Fill any remaining empty inputs
  267 |     for (const inp of await page.locator('input[type="text"]:visible, input:not([type]):visible').all()) {
  268 |         try { if (!(await inp.inputValue())) await inp.fill('N/A'); } catch { /* readonly */ }
  269 |     }
  270 |     for (const ta of await page.locator('textarea:visible').all()) {
  271 |         if (!(await ta.inputValue())) await ta.fill('No additional notes.');
  272 |     }
  273 |     for (const sel of await page.locator('select:visible').all()) {
  274 |         if (!(await sel.inputValue())) await sel.selectOption({ index: 1 }).catch(() => { });
  275 |     }
  276 | 
  277 |     await page.waitForTimeout(500);
  278 |     await page.screenshot({ path: 'step5-before-booknow.png', fullPage: true });
  279 | 
  280 |     await page.locator('button:has-text("Book Now")').click();
  281 |     console.log('✅ Clicked: Book Now');
  282 | 
  283 |     await page.waitForTimeout(3000);
  284 |     await page.screenshot({ path: 'step5-complete.png', fullPage: true });
  285 |     console.log('\n🌐 Final URL:', page.url());
  286 |     console.log('🎉 Booking complete!');
  287 | });
  288 | 
  289 | // ── Helper: click option in any open dropdown ─────────────────
```