# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\TNDI\newPatient.spec.js >> Appointment summary panel — insurance page >> TC-APPT-06 — "Location" label is visible in the summary panel
- Location: tests\e2e\shared\appointmentSummary.cases.js:88:13

# Error details

```
TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('[role="option"]').filter({ hasText: 'Teleconsultation' }).first() to be visible

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
            - combobox "Visit reason" [active] [ref=e29]: Teleconsultationtation
            - button "Close" [ref=e31] [cursor=pointer]:
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
  - generic [ref=e43]: No options
```

# Test source

```ts
  20  |         this.locationDropdown = page.getByRole('combobox', { name: /^location$/i });
  21  |         // "Service not available" dialog shown when gray service + gray location are both chosen
  22  |         this.unavailabilityPopup = page.locator('[role="dialog"]').filter({
  23  |             hasText: /not available/i,
  24  |         });
  25  |     }
  26  | 
  27  |     async open(url) {
  28  |         await this.page.goto(url, { waitUntil: 'networkidle' });
  29  |         // Extra guard: SPAs can keep showing "Loading..." after networkidle fires.
  30  |         // Wait until the reason dropdown OR the New Patient button actually renders.
  31  |         // This protects ALL fixtures that call runFlow (findAppointmentPage, stepperPage, etc.)
  32  |         await this.page.waitForSelector(
  33  |             'button#newPatient-button, input#serviceType-select-box, [role="combobox"]',
  34  |             { timeout: 30_000 }
  35  |         );
  36  |     }
  37  | 
  38  |     /**
  39  |      * Select the visit reason (and service type if provided) then click Existing Patient.
  40  |      * Automatically dismisses any popup that appears after the click (e.g. SINY
  41  |      * "Consultation Required" for cosmetic services, "Consultation Fee Notice" for
  42  |      * cosmetic consultations). Works across all services without per-client config.
  43  |      *
  44  |      * @param {string} reasonType
  45  |      * @param {object} [opts]
  46  |      * @param {string} [opts.serviceType]        — second-level dropdown (SINY only)
  47  |      * @param {string} [opts.landingPopupAction] — preferred dismiss button; if omitted,
  48  |      *                                             falls back through common labels automatically
  49  |      */
  50  |     async startExistingPatient(reasonType, opts = {}) {
  51  |         await this._selectReason(reasonType);
  52  | 
  53  |         if (opts.serviceType) {
  54  |             await this._selectServiceType(opts.serviceType);
  55  |         }
  56  | 
  57  |         await this.existingPatientBtn.waitFor({ state: 'visible', timeout: 10_000 });
  58  |         await this.existingPatientBtn.click();
  59  | 
  60  |         // Auto-dismiss any popup that appears — handles all SINY service types
  61  |         await this._autoDismissPopup(opts.landingPopupAction);
  62  | 
  63  |         await this.page.waitForLoadState('networkidle', { timeout: 30_000 });
  64  |     }
  65  | 
  66  |     /**
  67  |      * Dismiss whatever popup appears after a button click, if any.
  68  |      * Tries `preferredButton` first, then falls back through common dismiss labels.
  69  |      * Safe to call even when no popup appears — exits silently.
  70  |      *
  71  |      * Covers:
  72  |      *   "Consultation Required"   → "Schedule Procedure" / "Cosmetic Consultation"
  73  |      *   "Consultation Fee Notice" → "Continue"
  74  |      *   Generic dialogs           → "OK" / "Close"
  75  |      *
  76  |      * @param {string|null} preferredButton — try this label first (from client config)
  77  |      */
  78  |     async _autoDismissPopup(preferredButton = null) {
  79  |         const dialog = this.page.locator('[role="dialog"], [class*="MuiDialog-paper"]');
  80  |         const isVisible = await dialog.isVisible({ timeout: 3_000 }).catch(() => false);
  81  |         if (!isVisible) return;
  82  | 
  83  |         const candidates = [
  84  |             preferredButton,
  85  |             'Schedule Procedure',  // SINY cosmetic "Consultation Required" popup
  86  |             'Continue',            // SINY "Consultation Fee Notice" popup
  87  |             'OK',
  88  |             'Close',
  89  |         ].filter(Boolean);
  90  | 
  91  |         for (const label of candidates) {
  92  |             const btn = dialog.locator(`button:has-text("${label}")`);
  93  |             const visible = await btn.isVisible({ timeout: 1_000 }).catch(() => false);
  94  |             if (visible) {
  95  |                 await btn.click();
  96  |                 console.log(`Popup dismissed via "${label}"`);
  97  |                 await this.page.waitForLoadState('networkidle', { timeout: 15_000 });
  98  |                 return;
  99  |             }
  100 |         }
  101 | 
  102 |         console.warn('Popup appeared but no known dismiss button was found');
  103 |     }
  104 | 
  105 |     /**
  106 |      * @param {string} reasonType
  107 |      * @param {object} [opts]
  108 |      * @param {string} [opts.serviceType]        — SINY: sub-service dropdown value (e.g. 'Botox treatment')
  109 |      * @param {string} [opts.landingPopupAction] — button label to click in any post-New-Patient popup
  110 |      */
  111 |     async startNewPatient(reasonType, opts = {}) {
  112 |         const hasAutocomplete = await this.reasonAutocomplete
  113 |             .isVisible({ timeout: 3_000 })
  114 |             .catch(() => false);
  115 | 
  116 |         if (hasAutocomplete) {
  117 |             await this.reasonAutocomplete.click();
  118 |             await this.reasonAutocomplete.pressSequentially(reasonType, { delay: 20 });
  119 |             const option = this.page.locator('[role="option"]').filter({ hasText: reasonType }).first();
> 120 |             await option.waitFor({ state: 'visible', timeout: 10_000 });
      |                          ^ TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
  121 |             await option.click();
  122 |         } else {
  123 |             // MUI Select style (Hopemark, SINY)
  124 |             await this.reasonSelect.waitFor({ state: 'visible', timeout: 10_000 });
  125 |             await this.reasonSelect.click();
  126 |             const option = this.page.locator('[role="option"], li[role="option"]')
  127 |                 .filter({ hasText: reasonType }).first();
  128 |             await option.waitFor({ state: 'visible', timeout: 10_000 });
  129 |             await option.click();
  130 |         }
  131 |         console.log(`Reason selected: ${reasonType}`);
  132 | 
  133 |         // SINY: second-level service type dropdown appears after reason selection
  134 |         if (opts.serviceType) {
  135 |             await this._selectServiceType(opts.serviceType);
  136 |         }
  137 | 
  138 |         await this.newPatientBtn.waitFor({ state: 'visible', timeout: 10_000 });
  139 |         await this.newPatientBtn.click();
  140 | 
  141 |         // Dismiss any post-click popup (SINY fee notice or consultation-required dialog)
  142 |         if (opts.landingPopupAction) {
  143 |             await this._dismissPopup(opts.landingPopupAction);
  144 |         } else {
  145 |             // Auto-dismiss "Continue" popup if it appears unexpectedly
  146 |             await this._dismissPopup('Continue');
  147 |         }
  148 | 
  149 |         await this.page.waitForLoadState('networkidle', { timeout: 30_000 });
  150 |     }
  151 | 
  152 |     // Select a value from the service-type sub-dropdown (appears after reason selection on SINY)
  153 |     async _selectServiceType(serviceType) {
  154 |         await this.serviceTypeDropdown.waitFor({ state: 'visible', timeout: 10_000 });
  155 |         await this.serviceTypeDropdown.click();
  156 | 
  157 |         const option = this.page.locator('[role="option"], li[role="option"]')
  158 |             .filter({ hasText: serviceType }).first();
  159 |         await option.waitFor({ state: 'visible', timeout: 10_000 });
  160 |         await option.click();
  161 |         console.log(`Service type selected: ${serviceType}`);
  162 |     }
  163 | 
  164 |     // Select only the reason (no service type, no New Patient click) — used by gray-flow tests.
  165 |     async _selectReason(reasonType) {
  166 |         const hasAutocomplete = await this.reasonAutocomplete
  167 |             .isVisible({ timeout: 3_000 })
  168 |             .catch(() => false);
  169 | 
  170 |         if (hasAutocomplete) {
  171 |             await this.reasonAutocomplete.click();
  172 |             await this.reasonAutocomplete.pressSequentially(reasonType, { delay: 20 });
  173 |             const option = this.page.locator('[role="option"]').filter({ hasText: reasonType }).first();
  174 |             await option.waitFor({ state: 'visible', timeout: 10_000 });
  175 |             await option.click();
  176 |         } else {
  177 |             await this.reasonSelect.waitFor({ state: 'visible', timeout: 10_000 });
  178 |             await this.reasonSelect.click();
  179 |             const option = this.page.locator('[role="option"], li[role="option"]')
  180 |                 .filter({ hasText: reasonType }).first();
  181 |             await option.waitFor({ state: 'visible', timeout: 10_000 });
  182 |             await option.click();
  183 |         }
  184 |         console.log(`Reason selected: ${reasonType}`);
  185 |     }
  186 | 
  187 |     // Returns the text of the first visually-gray option in the currently-open listbox.
  188 |     // SINY does NOT use aria-disabled — unavailable options are identified by computed
  189 |     // text color (gray/muted) or reduced opacity rather than DOM attributes.
  190 |     async _findGrayOptionText() {
  191 |         const listbox = this.page.locator('[role="listbox"]');
  192 |         await listbox.waitFor({ state: 'visible', timeout: 10_000 });
  193 |         return listbox.evaluate(lb => {
  194 |             for (const el of lb.querySelectorAll('[role="option"]')) {
  195 |                 const { color, opacity } = window.getComputedStyle(el);
  196 |                 // Reduced opacity (MUI disabled pattern: 0.38)
  197 |                 if (parseFloat(opacity) < 0.8) return el.textContent?.trim() ?? null;
  198 |                 const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  199 |                 if (!m) continue;
  200 |                 const [r, g, b, a] = [+m[1], +m[2], +m[3], +(m[4] ?? '1')];
  201 |                 // Low-alpha color (e.g. rgba(0,0,0,0.38)) or actual gray RGB
  202 |                 if (a < 0.6 || (r > 80 && g > 80 && b > 80 && Math.abs(r - g) < 50 && Math.abs(g - b) < 50)) {
  203 |                     return el.textContent?.trim() ?? null;
  204 |                 }
  205 |             }
  206 |             return null;
  207 |         });
  208 |     }
  209 | 
  210 |     // Returns the text of the first non-gray option in the currently-open listbox.
  211 |     async _findValidOptionText() {
  212 |         const listbox = this.page.locator('[role="listbox"]');
  213 |         await listbox.waitFor({ state: 'visible', timeout: 10_000 });
  214 |         return listbox.evaluate(lb => {
  215 |             const isGray = el => {
  216 |                 const { color, opacity } = window.getComputedStyle(el);
  217 |                 if (parseFloat(opacity) < 0.8) return true;
  218 |                 const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  219 |                 if (!m) return false;
  220 |                 const [r, g, b, a] = [+m[1], +m[2], +m[3], +(m[4] ?? '1')];
```