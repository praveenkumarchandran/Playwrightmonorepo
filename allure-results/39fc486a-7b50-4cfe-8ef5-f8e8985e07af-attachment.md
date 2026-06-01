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
  - waiting for locator('.MuiAutocomplete-option:has-text("Self Pay")').first()

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
      - generic [ref=e90]:
        - heading "Insurance Policy" [level=5] [ref=e91]
        - generic [ref=e92]:
          - generic [ref=e93]:
            - generic [ref=e94]: Insurance Type
            - generic [ref=e95]:
              - combobox "Insurance Type" [expanded] [active] [ref=e96]: Self
              - button "Close" [ref=e98] [cursor=pointer]:
                - img [ref=e99]
              - group:
                - generic: Insurance Type
          - listbox "Insurance Type" [ref=e101]:
            - option "Self-pay" [ref=e102] [cursor=pointer]
        - paragraph [ref=e103]: How would you like to provide your insurance details?
        - generic [ref=e104]:
          - button "Take Picture of Card" [ref=e106] [cursor=pointer]:
            - img [ref=e108]
            - text: Take Picture of Card
          - button "Manually Enter Details" [ref=e111] [cursor=pointer]:
            - img [ref=e113]
            - text: Manually Enter Details
        - generic [ref=e118]:
          - generic [ref=e119]:
            - paragraph [ref=e120]: Front of Insurance card
            - generic [ref=e122] [cursor=pointer]:
              - img [ref=e123]
              - paragraph [ref=e125]: Select file to upload
              - paragraph [ref=e126]: Or drag and drop it here
          - generic [ref=e127]:
            - paragraph [ref=e128]: Back of Insurance card
            - generic [ref=e130] [cursor=pointer]:
              - img [ref=e131]
              - paragraph [ref=e133]: Select file to upload
              - paragraph [ref=e134]: Or drag and drop it here
      - button "Next" [ref=e136] [cursor=pointer]: Next
```

# Test source

```ts
  55  |             await btn.scrollIntoViewIfNeeded();
  56  |             await btn.click();
  57  |             console.log(`✅ Slot: "${txt}"`);
  58  |             slotClicked = true;
  59  |             break;
  60  |         }
  61  |     }
  62  |     if (!slotClicked) {
  63  |         for (const sel of ['[class*="slot"]:has-text("2:30")', '[class*="chip"]:has-text("2:30")', 'div:has-text("2:30 PM"):not(:has(div))', 'span:has-text("2:30 PM")', 'td:has-text("2:30")']) {
  64  |             const el = page.locator(sel).first();
  65  |             if ((await el.count()) > 0 && await el.isVisible()) {
  66  |                 await el.scrollIntoViewIfNeeded(); await el.click();
  67  |                 console.log(`✅ Slot via: ${sel}`); slotClicked = true; break;
  68  |             }
  69  |         }
  70  |     }
  71  |     if (!slotClicked) throw new Error('❌ 2:30 PM slot not found. Check step2-slots.png');
  72  | 
  73  |     await page.waitForTimeout(500);
  74  |     await page.locator('button:has-text("Continue")').click();
  75  |     console.log('✅ Clicked: Continue');
  76  | 
  77  |     // ── STEP 3: Intake Questions ──────────────────────────────────
  78  |     console.log('\n📌 STEP 3: Intake Questions');
  79  |     await page.waitForTimeout(2500);
  80  |     await page.screenshot({ path: 'step3-intake.png', fullPage: true });
  81  | 
  82  |     // ── 3a. Select Knee Pain + Neck Pain from MUI Autocomplete ────
  83  |     // Open the symptom autocomplete input and type to filter
  84  |     const symptomInput = page.locator('input[aria-autocomplete="list"]').first();
  85  |     await symptomInput.waitFor({ timeout: 10000 });
  86  | 
  87  |     // Select Knee Pain
  88  |     await symptomInput.click();
  89  |     await page.waitForTimeout(400);
  90  |     await symptomInput.fill('Knee');
  91  |     await page.waitForTimeout(500);
  92  |     await page.locator('.MuiAutocomplete-option:has-text("Knee Pain")').first().click();
  93  |     console.log('✅ Selected: Knee Pain');
  94  |     await page.waitForTimeout(400);
  95  | 
  96  |     // Select Neck Pain — click input again (chip input stays open)
  97  |     await symptomInput.click();
  98  |     await symptomInput.fill('Neck');
  99  |     await page.waitForTimeout(500);
  100 |     await page.locator('.MuiAutocomplete-option:has-text("Neck Pain")').first().click();
  101 |     console.log('✅ Selected: Neck Pain');
  102 | 
  103 |     // Close dropdown
  104 |     await page.keyboard.press('Escape');
  105 |     await page.waitForTimeout(400);
  106 |     await page.screenshot({ path: 'step3-symptoms-done.png', fullPage: true });
  107 | 
  108 |     // ── 3b. Answer all Yes/No questions with "No" (MUI Radio) ─────
  109 |     // MUI Radio: clicking the label works reliably
  110 |     const noLabels = page.locator('.MuiFormControlLabel-root:has(.MuiFormControlLabel-label:text-is("No"))');
  111 |     const noCount = await noLabels.count();
  112 |     console.log(`ℹ️  Found ${noCount} "No" radio labels`);
  113 |     for (let i = 0; i < noCount; i++) {
  114 |         try {
  115 |             if (await noLabels.nth(i).isVisible()) {
  116 |                 await noLabels.nth(i).click();
  117 |                 await page.waitForTimeout(200);
  118 |                 console.log(`✅ No #${i + 1}`);
  119 |             }
  120 |         } catch { /* skip */ }
  121 |     }
  122 | 
  123 |     // Fallback: target radio inputs by value
  124 |     const noRadios = page.locator('input[type="radio"]').filter({ hasText: 'No' });
  125 |     if ((await noRadios.count()) === 0) {
  126 |         // Try clicking all radio inputs that are the SECOND in each group (typically "No")
  127 |         const allRadios = page.locator('input[type="radio"]');
  128 |         const total = await allRadios.count();
  129 |         // Click every even-indexed radio (index 1, 3, 5 ... = second in each pair = "No")
  130 |         for (let i = 1; i < total; i += 2) {
  131 |             try { await allRadios.nth(i).click({ force: true }); await page.waitForTimeout(150); } catch { /* skip */ }
  132 |         }
  133 |     }
  134 | 
  135 |     await page.waitForTimeout(600);
  136 |     await page.screenshot({ path: 'step3-no-answered.png', fullPage: true });
  137 | 
  138 |     // Wait for Continue to become enabled
  139 |     await page.locator('button:has-text("Continue"):not([disabled])').waitFor({ timeout: 15000 });
  140 |     await page.locator('button:has-text("Continue"):not([disabled])').click();
  141 |     console.log('✅ Clicked: Continue');
  142 | 
  143 |     // ── STEP 4: Insurance ─────────────────────────────────────────
  144 |     console.log('\n📌 STEP 4: Insurance');
  145 |     await page.waitForTimeout(2500);
  146 |     await page.screenshot({ path: 'step4-insurance.png', fullPage: true });
  147 | 
  148 |     // The insurance type dropdown ID is "insurance-select-box" (from error log)
  149 |     // It's a MUI Autocomplete — click input, clear, type "Self Pay", select
  150 |     const insuranceInput = page.locator('#insurance-select-box');
  151 |     if ((await insuranceInput.count()) > 0) {
  152 |         await insuranceInput.click();
  153 |         await insuranceInput.fill('Self');
  154 |         await page.waitForTimeout(500);
> 155 |         await page.locator('.MuiAutocomplete-option:has-text("Self Pay")').first().click();
      |                                                                                    ^ Error: locator.click: Test timeout of 180000ms exceeded.
  156 |         console.log('✅ Selected: Self Pay');
  157 |     } else {
  158 |         // Fallback: click the dropdown container
  159 |         await page.locator('[class*="MuiSelect"], [role="combobox"]').first().click();
  160 |         await page.waitForTimeout(400);
  161 |         await page.locator('.MuiAutocomplete-option:has-text("Self Pay"), [role="option"]:has-text("Self Pay"), li:has-text("Self Pay")').first().click();
  162 |         console.log('✅ Selected Self Pay (fallback)');
  163 |     }
  164 | 
  165 |     // Close any open popper before clicking button
  166 |     await page.keyboard.press('Escape');
  167 |     await page.waitForTimeout(500);
  168 | 
  169 |     // Click "Manually Enter Details"
  170 |     await page.locator('button:has-text("Manually Enter Details")').waitFor({ timeout: 10000 });
  171 |     await page.locator('button:has-text("Manually Enter Details")').click();
  172 |     console.log('✅ Clicked: Manually Enter Details');
  173 |     await page.waitForTimeout(1500);
  174 |     await page.screenshot({ path: 'step4-manual-details.png', fullPage: true });
  175 | 
  176 |     // Insurance plan dropdown → select "Other"
  177 |     // After clicking Manually Enter Details, new fields appear
  178 |     const insurancePlanInput = page.locator('input[aria-autocomplete="list"]').last();
  179 |     if ((await insurancePlanInput.count()) > 0) {
  180 |         await insurancePlanInput.click();
  181 |         await insurancePlanInput.fill('Other');
  182 |         await page.waitForTimeout(500);
  183 |         await page.locator('.MuiAutocomplete-option:has-text("Other")').first().click();
  184 |         console.log('✅ Selected: Other (insurance plan)');
  185 |     } else {
  186 |         await page.locator('[role="combobox"]').last().click();
  187 |         await page.waitForTimeout(400);
  188 |         await page.locator('[role="option"]:has-text("Other"), li:has-text("Other")').first().click();
  189 |         console.log('✅ Selected: Other (fallback)');
  190 |     }
  191 | 
  192 |     // Close dropdown
  193 |     await page.keyboard.press('Escape');
  194 |     await page.waitForTimeout(500);
  195 |     await page.screenshot({ path: 'step4-other-selected.png', fullPage: true });
  196 | 
  197 |     // Type "12" in the Other Insurance Plan text field (appears after selecting Other)
  198 |     let otherFilled = false;
  199 |     for (const sel of [
  200 |         'input[placeholder*="other" i]', 'input[name*="other" i]',
  201 |         'input[placeholder*="plan" i]', 'input[name*="plan" i]',
  202 |         'input[label*="other" i]',
  203 |     ]) {
  204 |         const el = page.locator(sel).first();
  205 |         if ((await el.count()) > 0 && await el.isVisible()) {
  206 |             await el.fill('12');
  207 |             console.log(`✅ Typed "12" in: ${sel}`);
  208 |             otherFilled = true;
  209 |             break;
  210 |         }
  211 |     }
  212 |     if (!otherFilled) {
  213 |         // Find the newest visible empty text input (appeared after selecting Other)
  214 |         const inputs = await page.locator('input[type="text"]:visible').all();
  215 |         for (const inp of inputs) {
  216 |             if (!(await inp.inputValue())) {
  217 |                 await inp.fill('12');
  218 |                 console.log('✅ Typed "12" in fallback input');
  219 |                 otherFilled = true;
  220 |                 break;
  221 |             }
  222 |         }
  223 |     }
  224 | 
  225 |     await page.waitForTimeout(500);
  226 |     await page.locator('button:has-text("Next")').click();
  227 |     console.log('✅ Clicked: Next');
  228 | 
  229 |     // ── STEP 5: Additional Information ───────────────────────────
  230 |     console.log('\n📌 STEP 5: Additional Information');
  231 |     await page.waitForTimeout(2500);
  232 |     await page.screenshot({ path: 'step5-addinfo.png', fullPage: true });
  233 | 
  234 |     // Log all input names/placeholders for debugging
  235 |     const inputLabels = await page.locator('input:visible').evaluateAll(els =>
  236 |         els.map(e => ({ name: e.name, placeholder: e.placeholder, type: e.type, id: e.id }))
  237 |     );
  238 |     console.log('🔵 Visible inputs:', JSON.stringify(inputLabels, null, 2));
  239 | 
  240 |     const fieldMap = [
  241 |         { selectors: ['input[name*="first" i]', 'input[placeholder*="first" i]', 'input[id*="first" i]'], value: 'John' },
  242 |         { selectors: ['input[name*="last" i]', 'input[placeholder*="last" i]', 'input[id*="last" i]'], value: 'Doe' },
  243 |         { selectors: ['input[type="email"]', 'input[name*="email" i]', 'input[id*="email" i]'], value: 'johndoe@example.com' },
  244 |         { selectors: ['input[type="tel"]', 'input[name*="phone" i]', 'input[id*="phone" i]'], value: '5551234567' },
  245 |         { selectors: ['input[type="date"]', 'input[name*="dob" i]', 'input[name*="birth" i]'], value: '1990-01-15' },
  246 |         { selectors: ['input[name*="address" i]', 'input[placeholder*="address" i]', 'input[id*="address" i]'], value: '123 Main St' },
  247 |         { selectors: ['input[name*="city" i]', 'input[placeholder*="city" i]', 'input[id*="city" i]'], value: 'Farmington Hills' },
  248 |         { selectors: ['input[name*="state" i]', 'input[placeholder*="state" i]', 'input[id*="state" i]'], value: 'MI' },
  249 |         { selectors: ['input[name*="zip" i]', 'input[placeholder*="zip" i]', 'input[id*="zip" i]'], value: '48335' },
  250 |     ];
  251 | 
  252 |     for (const { selectors, value } of fieldMap) {
  253 |         for (const sel of selectors) {
  254 |             const el = page.locator(sel).first();
  255 |             if ((await el.count()) > 0 && await el.isVisible()) {
```