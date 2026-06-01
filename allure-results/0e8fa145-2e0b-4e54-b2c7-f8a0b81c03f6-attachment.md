# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: booking\create-appointment.spec.js >> Setter – Teleconsultation Booking (New Patient)
- Location: tests\e2e\booking\create-appointment.spec.js:87:1

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for locator('text=Teleconsultation').first()

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e5]:
    - generic [ref=e7]:
      - img "logo" [ref=e9]
      - heading "586-416-3472" [level=6] [ref=e12]
  - generic [ref=e15]:
    - generic [ref=e17]:
      - paragraph [ref=e18]: The Nerve and Disc Institute
      - generic [ref=e19]:
        - paragraph [ref=e20]: 24100 Drake Rd,
        - paragraph [ref=e21]: Farmington Hills MI 48335
    - generic [ref=e23]:
      - generic:
        - heading [level=3]
      - generic [ref=e24]:
        - heading "What is your reason for scheduling?" [level=5] [ref=e25]
        - generic [ref=e28]:
          - combobox "Visit reason" [ref=e29]: Teleconsultation
          - button "Open" [ref=e31] [cursor=pointer]:
            - img [ref=e32]
          - group
      - generic [ref=e34]:
        - heading "Have you visited us before?" [level=5] [ref=e35]
        - generic [ref=e36]:
          - button "Existing Patient" [ref=e37] [cursor=pointer]
          - button "New Patient" [ref=e38] [cursor=pointer]
      - generic [ref=e40]:
        - heading "Powered by" [level=6] [ref=e41]
        - img "MUlogo" [ref=e42]
```

# Test source

```ts
  65  | async function selectYesNo(page, questionTextPart, answer) {
  66  |     // Find the section containing the question, then click Yes/No within it
  67  |     const section = page.locator(`text=${questionTextPart}`).locator('../..');
  68  |     const answerBtn = section.locator(
  69  |         `button:has-text("${answer}"),
  70  |      [role="radio"]:has-text("${answer}"),
  71  |      label:has-text("${answer}")`
  72  |     ).first();
  73  | 
  74  |     if (await answerBtn.count() > 0) {
  75  |         await answerBtn.click();
  76  |         console.log(`✅ Selected "${answer}" for: ${questionTextPart}`);
  77  |     } else {
  78  |         // Fallback: find all No buttons and click them
  79  |         console.log(`⚠️  Could not find section for "${questionTextPart}", trying global fallback`);
  80  |     }
  81  |     await page.waitForTimeout(300);
  82  | }
  83  | 
  84  | // ════════════════════════════════════════════════════════════
  85  | //  MAIN TEST
  86  | // ════════════════════════════════════════════════════════════
  87  | test('Setter – Teleconsultation Booking (New Patient)', async ({ page }) => {
  88  |     test.setTimeout(120000); // 2 min timeout
  89  | 
  90  |     // ── STEP 0: Login ────────────────────────────────────────
  91  |     console.log('\n📌 STEP 0: Login');
  92  |     await page.goto('https://stage.setter.layline.live/login', {
  93  |         waitUntil: 'domcontentloaded',
  94  |     });
  95  |     await page.waitForSelector('input', { timeout: 15000 });
  96  | 
  97  |     // Fill email
  98  |     for (const sel of [
  99  |         'input[type="email"]',
  100 |         'input[name="email"]',
  101 |         'input[name="username"]',
  102 |         'input[placeholder*="email" i]',
  103 |     ]) {
  104 |         if ((await page.locator(sel).count()) > 0) {
  105 |             await page.fill(sel, 'bantony@layline.live');
  106 |             break;
  107 |         }
  108 |     }
  109 | 
  110 |     // Fill password
  111 |     await page.fill('input[type="password"]', 'Deepdive2@2!');
  112 | 
  113 |     // Submit
  114 |     for (const sel of [
  115 |         'button[type="submit"]',
  116 |         'button:has-text("Login")',
  117 |         'button:has-text("Sign in")',
  118 |         'button:has-text("Log in")',
  119 |     ]) {
  120 |         if ((await page.locator(sel).count()) > 0) {
  121 |             await page.click(sel);
  122 |             break;
  123 |         }
  124 |     }
  125 | 
  126 |     await page.waitForTimeout(3000);
  127 |     console.log('🌐 After login URL:', page.url());
  128 | 
  129 |     // ── STEP 1: Landing – Select Teleconsultation + New Patient ─
  130 |     console.log('\n📌 STEP 1: Landing Page');
  131 |     await page.goto(
  132 |         'https://stage.setter.layline.live/thenerveanddiscinstitute/1/thenerveanddiscinstitutefarmington/landing',
  133 |         { waitUntil: 'domcontentloaded', timeout: 30000 }
  134 |     );
  135 |     await page.waitForTimeout(2000);
  136 | 
  137 |     // Select "Teleconsultation" from dropdown
  138 |     // Try common dropdown triggers (div, button, select)
  139 |     const dropdownTriggerSelectors = [
  140 |         'select',
  141 |         '[class*="dropdown"] [class*="control"]',
  142 |         '[class*="select"] [class*="control"]',
  143 |         '[class*="Select"] [class*="indicator"]',
  144 |         '[role="combobox"]',
  145 |         'div[class*="dropdown"]',
  146 |     ];
  147 | 
  148 |     let dropdownFound = false;
  149 |     for (const sel of dropdownTriggerSelectors) {
  150 |         if ((await page.locator(sel).count()) > 0) {
  151 |             // Check if it's a native <select>
  152 |             const tag = await page.locator(sel).first().evaluate(el => el.tagName.toLowerCase());
  153 |             if (tag === 'select') {
  154 |                 await page.selectOption(sel, { label: 'Teleconsultation' });
  155 |                 console.log('✅ Selected Teleconsultation from native select');
  156 |             } else {
  157 |                 await selectDropdown(page, sel, 'Teleconsultation');
  158 |             }
  159 |             dropdownFound = true;
  160 |             break;
  161 |         }
  162 |     }
  163 |     if (!dropdownFound) {
  164 |         // Last resort: look for text "Teleconsultation" directly
> 165 |         await page.locator('text=Teleconsultation').first().click();
      |                                                             ^ Error: locator.click: Test timeout of 120000ms exceeded.
  166 |         console.log('✅ Clicked Teleconsultation directly');
  167 |     }
  168 | 
  169 |     await page.waitForTimeout(500);
  170 | 
  171 |     // Click "New Patient"
  172 |     await clickButton(page, 'New Patient');
  173 | 
  174 |     // ── STEP 2: Slot Selection – pick 2:30 PM + Continue ────────
  175 |     console.log('\n📌 STEP 2: Slot Selection');
  176 |     await page.waitForTimeout(2000);
  177 | 
  178 |     // Find the 2:30 PM slot button
  179 |     const slotBtn = page.locator(
  180 |         `button:has-text("2:30"),
  181 |      [role="button"]:has-text("2:30"),
  182 |      div[class*="slot"]:has-text("2:30"),
  183 |      span:has-text("2:30 PM"),
  184 |      td:has-text("2:30")`
  185 |     ).first();
  186 | 
  187 |     await slotBtn.waitFor({ timeout: 15000 });
  188 |     await slotBtn.click();
  189 |     console.log('✅ Selected slot: 2:30 PM');
  190 |     await page.waitForTimeout(500);
  191 | 
  192 |     await clickButton(page, 'Continue');
  193 | 
  194 |     // ── STEP 3: Symptoms – Knee Pain, Neck Pain + all No ────────
  195 |     console.log('\n📌 STEP 3: Symptoms / Medical Questions');
  196 |     await page.waitForTimeout(2000);
  197 | 
  198 |     // Multi-select dropdown for symptoms
  199 |     const symptomDropdownSelectors = [
  200 |         '[class*="multiselect"]',
  201 |         '[class*="multi-select"]',
  202 |         '[class*="MultiSelect"]',
  203 |         '[class*="select"] [class*="control"]',
  204 |         '[role="combobox"]',
  205 |     ];
  206 | 
  207 |     for (const sel of symptomDropdownSelectors) {
  208 |         if ((await page.locator(sel).count()) > 0) {
  209 |             await selectMultiOption(page, sel, 'Knee Pain');
  210 |             await page.waitForTimeout(400);
  211 |             await selectMultiOption(page, sel, 'Neck Pain');
  212 |             break;
  213 |         }
  214 |     }
  215 | 
  216 |     await page.waitForTimeout(500);
  217 | 
  218 |     // Click "No" for all remaining Yes/No questions
  219 |     // Strategy: find all visible "No" buttons/labels and click each
  220 |     const noButtons = page.locator(
  221 |         `button:has-text("No"),
  222 |      [role="radio"]:has-text("No"),
  223 |      label:has-text("No"),
  224 |      [class*="option"]:has-text("No")`
  225 |     );
  226 | 
  227 |     const noCount = await noButtons.count();
  228 |     console.log(`Found ${noCount} "No" options`);
  229 |     for (let i = 0; i < noCount; i++) {
  230 |         try {
  231 |             await noButtons.nth(i).click();
  232 |             await page.waitForTimeout(200);
  233 |         } catch {
  234 |             // skip if not interactable
  235 |         }
  236 |     }
  237 |     console.log('✅ Selected "No" for all remaining questions');
  238 | 
  239 |     await clickButton(page, 'Continue');
  240 | 
  241 |     // ── STEP 4: Insurance – Self Pay + Manually Enter + Other ───
  242 |     console.log('\n📌 STEP 4: Insurance Details');
  243 |     await page.waitForTimeout(2000);
  244 | 
  245 |     // Insurance Type dropdown → Self Pay
  246 |     const insuranceDropdownSelectors = [
  247 |         '[class*="insurance"] select',
  248 |         'select[name*="insurance" i]',
  249 |         '[class*="select"] [class*="control"]',
  250 |         '[role="combobox"]',
  251 |         'select',
  252 |     ];
  253 | 
  254 |     for (const sel of insuranceDropdownSelectors) {
  255 |         const count = await page.locator(sel).count();
  256 |         if (count > 0) {
  257 |             const tag = await page.locator(sel).first().evaluate(el => el.tagName.toLowerCase());
  258 |             if (tag === 'select') {
  259 |                 try {
  260 |                     await page.selectOption(sel, { label: 'Self Pay' });
  261 |                     console.log('✅ Selected Self Pay from native select');
  262 |                     break;
  263 |                 } catch {
  264 |                     continue;
  265 |                 }
```