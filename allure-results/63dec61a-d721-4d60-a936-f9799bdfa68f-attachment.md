# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\SINY\cosmetic.spec.js >> SINY Landing — gray service / location >> Path A — gray service → valid location >> TC-LAND-S03 — selecting gray service reveals Location dropdown
- Location: tests\e2e\shared\sinyLanding.cases.js:49:13

# Error details

```
TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('li[aria-disabled="true"][role="option"], [role="option"].Mui-disabled').first() to be visible

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
        - generic [ref=e35]:
          - generic [ref=e37]:
            - combobox "Service Type" [expanded] [active] [ref=e38]
            - button "Close" [ref=e40] [cursor=pointer]:
              - img [ref=e41]
            - group
          - listbox [ref=e43]:
            - option "Botox treatment" [ref=e44] [cursor=pointer]
            - option "Laser hair Removal" [ref=e45] [cursor=pointer]
            - option "Chemical Peel" [ref=e46] [cursor=pointer]
            - option "Laser skin treatment" [ref=e47] [cursor=pointer]
            - option "Filler Treatment" [ref=e48] [cursor=pointer]
            - option "Microneedling" [ref=e49] [cursor=pointer]
            - option "Tattoo Removal" [ref=e50] [cursor=pointer]
            - option "Body Sculpting Treatment(Non-surgical)" [ref=e51] [cursor=pointer]
            - option "Intense Pulsed Light (IPL)" [ref=e52] [cursor=pointer]
            - option "Other - Cosmetic procedure" [ref=e53] [cursor=pointer]
            - option "Sclerotherapy" [ref=e54] [cursor=pointer]
      - generic [ref=e55]:
        - heading "Have you visited us before?" [level=5] [ref=e56]
        - generic [ref=e57]:
          - button "Existing Patient" [ref=e58] [cursor=pointer]
          - button "New Patient" [ref=e59] [cursor=pointer]
      - generic [ref=e61]:
        - heading "Powered by" [level=6] [ref=e62]
        - img "MUlogo" [ref=e63]
```

# Test source

```ts
  19  |         this.unavailabilityPopup = page.locator('[role="dialog"]').filter({
  20  |             hasText: /not available/i,
  21  |         });
  22  |     }
  23  | 
  24  |     async open(url) {
  25  |         await this.page.goto(url, { waitUntil: 'networkidle' });
  26  |     }
  27  | 
  28  |     /**
  29  |      * @param {string} reasonType
  30  |      * @param {object} [opts]
  31  |      * @param {string} [opts.serviceType]        — SINY: sub-service dropdown value (e.g. 'Botox treatment')
  32  |      * @param {string} [opts.landingPopupAction] — button label to click in any post-New-Patient popup
  33  |      */
  34  |     async startNewPatient(reasonType, opts = {}) {
  35  |         const hasAutocomplete = await this.reasonAutocomplete
  36  |             .isVisible({ timeout: 3_000 })
  37  |             .catch(() => false);
  38  | 
  39  |         if (hasAutocomplete) {
  40  |             await this.reasonAutocomplete.click();
  41  |             await this.reasonAutocomplete.pressSequentially(reasonType, { delay: 50 });
  42  |             const option = this.page.locator('[role="option"]').filter({ hasText: reasonType }).first();
  43  |             await option.waitFor({ state: 'visible', timeout: 10_000 });
  44  |             await option.click();
  45  |         } else {
  46  |             // MUI Select style (Hopemark, SINY)
  47  |             await this.reasonSelect.waitFor({ state: 'visible', timeout: 10_000 });
  48  |             await this.reasonSelect.click();
  49  |             const option = this.page.locator('[role="option"], li[role="option"]')
  50  |                 .filter({ hasText: reasonType }).first();
  51  |             await option.waitFor({ state: 'visible', timeout: 10_000 });
  52  |             await option.click();
  53  |         }
  54  |         console.log(`Reason selected: ${reasonType}`);
  55  | 
  56  |         // SINY: second-level service type dropdown appears after reason selection
  57  |         if (opts.serviceType) {
  58  |             await this._selectServiceType(opts.serviceType);
  59  |         }
  60  | 
  61  |         await this.newPatientBtn.waitFor({ state: 'visible', timeout: 10_000 });
  62  |         await this.newPatientBtn.click();
  63  | 
  64  |         // Dismiss any post-click popup (SINY fee notice or consultation-required dialog)
  65  |         if (opts.landingPopupAction) {
  66  |             await this._dismissPopup(opts.landingPopupAction);
  67  |         } else {
  68  |             // Auto-dismiss "Continue" popup if it appears unexpectedly
  69  |             await this._dismissPopup('Continue');
  70  |         }
  71  | 
  72  |         await this.page.waitForLoadState('networkidle', { timeout: 30_000 });
  73  |     }
  74  | 
  75  |     // Select a value from the service-type sub-dropdown (appears after reason selection on SINY)
  76  |     async _selectServiceType(serviceType) {
  77  |         await this.serviceTypeDropdown.waitFor({ state: 'visible', timeout: 10_000 });
  78  |         await this.serviceTypeDropdown.click();
  79  | 
  80  |         const option = this.page.locator('[role="option"], li[role="option"]')
  81  |             .filter({ hasText: serviceType }).first();
  82  |         await option.waitFor({ state: 'visible', timeout: 10_000 });
  83  |         await option.click();
  84  |         console.log(`Service type selected: ${serviceType}`);
  85  |     }
  86  | 
  87  |     // Select only the reason (no service type, no New Patient click) — used by gray-flow tests.
  88  |     async _selectReason(reasonType) {
  89  |         const hasAutocomplete = await this.reasonAutocomplete
  90  |             .isVisible({ timeout: 3_000 })
  91  |             .catch(() => false);
  92  | 
  93  |         if (hasAutocomplete) {
  94  |             await this.reasonAutocomplete.click();
  95  |             await this.reasonAutocomplete.pressSequentially(reasonType, { delay: 50 });
  96  |             const option = this.page.locator('[role="option"]').filter({ hasText: reasonType }).first();
  97  |             await option.waitFor({ state: 'visible', timeout: 10_000 });
  98  |             await option.click();
  99  |         } else {
  100 |             await this.reasonSelect.waitFor({ state: 'visible', timeout: 10_000 });
  101 |             await this.reasonSelect.click();
  102 |             const option = this.page.locator('[role="option"], li[role="option"]')
  103 |                 .filter({ hasText: reasonType }).first();
  104 |             await option.waitFor({ state: 'visible', timeout: 10_000 });
  105 |             await option.click();
  106 |         }
  107 |         console.log(`Reason selected: ${reasonType}`);
  108 |     }
  109 | 
  110 |     // Open service-type dropdown and click the first gray/disabled option.
  111 |     // MUI marks unavailable items with aria-disabled="true"; force-click bypasses
  112 |     // Playwright's actionability guard so the app's own click handler can fire.
  113 |     async _openServiceTypeAndSelectGray() {
  114 |         await this.serviceTypeDropdown.waitFor({ state: 'visible', timeout: 10_000 });
  115 |         await this.serviceTypeDropdown.click();
  116 |         const grayOption = this.page
  117 |             .locator('li[aria-disabled="true"][role="option"], [role="option"].Mui-disabled')
  118 |             .first();
> 119 |         await grayOption.waitFor({ state: 'visible', timeout: 10_000 });
      |                          ^ TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
  120 |         const text = (await grayOption.textContent() ?? '').trim();
  121 |         await grayOption.click({ force: true });
  122 |         console.log(`Gray service selected: ${text}`);
  123 |         return text;
  124 |     }
  125 | 
  126 |     // Open Location dropdown and select the first non-disabled option.
  127 |     async _selectFirstValidLocation() {
  128 |         await this.locationDropdown.waitFor({ state: 'visible', timeout: 10_000 });
  129 |         await this.locationDropdown.click();
  130 |         const validOption = this.page
  131 |             .locator('[role="option"]:not([aria-disabled="true"]):not(.Mui-disabled)')
  132 |             .first();
  133 |         await validOption.waitFor({ state: 'visible', timeout: 10_000 });
  134 |         const text = (await validOption.textContent() ?? '').trim();
  135 |         await validOption.click();
  136 |         console.log(`Valid location selected: ${text}`);
  137 |         return text;
  138 |     }
  139 | 
  140 |     // Open Location dropdown and force-click the first gray/disabled option.
  141 |     async _openLocationAndSelectGray() {
  142 |         await this.locationDropdown.waitFor({ state: 'visible', timeout: 10_000 });
  143 |         await this.locationDropdown.click();
  144 |         const grayOption = this.page
  145 |             .locator('li[aria-disabled="true"][role="option"], [role="option"].Mui-disabled')
  146 |             .first();
  147 |         await grayOption.waitFor({ state: 'visible', timeout: 10_000 });
  148 |         const text = (await grayOption.textContent() ?? '').trim();
  149 |         await grayOption.click({ force: true });
  150 |         console.log(`Gray location selected: ${text}`);
  151 |         return text;
  152 |     }
  153 | 
  154 |     // Close the "service not available" dialog using its X / close button.
  155 |     async closeUnavailabilityPopup() {
  156 |         const closeBtn = this.unavailabilityPopup
  157 |             .locator('button[aria-label="close"], button[aria-label="Close"], .MuiIconButton-root')
  158 |             .first();
  159 |         await closeBtn.click();
  160 |     }
  161 | 
  162 |     // Click a button inside any visible dialog/modal (fee notice, consultation required, etc.)
  163 |     async _dismissPopup(buttonLabel) {
  164 |         const dialog = this.page.locator('[role="dialog"], [class*="MuiDialog-paper"]');
  165 |         const isVisible = await dialog.isVisible({ timeout: 3_000 }).catch(() => false);
  166 |         if (!isVisible) return;
  167 | 
  168 |         const btn = dialog.locator(`button:has-text("${buttonLabel}")`);
  169 |         const btnVisible = await btn.isVisible({ timeout: 3_000 }).catch(() => false);
  170 |         if (!btnVisible) return;
  171 | 
  172 |         await btn.click();
  173 |         console.log(`Popup dismissed via "${buttonLabel}"`);
  174 |         await this.page.waitForLoadState('networkidle', { timeout: 15_000 });
  175 |     }
  176 | }
```