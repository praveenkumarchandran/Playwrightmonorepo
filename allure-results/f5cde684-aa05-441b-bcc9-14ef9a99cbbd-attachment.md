# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\SINY\cosmetic.spec.js >> Appointment summary panel — patient info page >> TC-APPT-PI-PN-01 — Provider name is visible in the "Your Appointment" panel
- Location: tests\e2e\shared\appointmentSummary.cases.js:162:13

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('b, strong').filter({ hasText: /^[A-Z][a-z]/ }).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('b, strong').filter({ hasText: /^[A-Z][a-z]/ }).first()

```

```yaml
- banner:
  - img "logo"
  - heading "718-491-5800" [level=6]
- button "1":
  - paragraph: "1"
- paragraph: Location
- button "2":
  - paragraph: "2"
- paragraph: Intake Questions
- button "3":
  - paragraph: "3"
- paragraph: Choose Date & Time
- button "4":
  - paragraph: "4"
- paragraph: Add Info
- heading "Your Appointment" [level=5]
- img "provider"
- heading "Arthur Haughey" [level=5]
- separator
- heading "Appointment Time" [level=6]
- paragraph: 9:20 AM, Thu Jun 4, 2026
- heading "Appointment Type" [level=6]
- paragraph: Cosmetic Procedure
- text: First Name *
- textbox "First Name *"
- text: Last Name *
- textbox "Last Name *"
- text: Date of Birth *
- textbox "Date of Birth *":
  - /placeholder: MM/DD/YYYY
- button "Choose date"
- combobox "Gender *":
  - paragraph: Gender *
- text: Email *
- textbox "Email *"
- text: Phone *
- spinbutton "Phone *"
- text: Address1 *
- textbox "Address1 *"
- text: Address2 (Optional)
- textbox "Address2 (Optional)"
- text: City *
- textbox "City *"
- combobox "State *"
- button "Open"
- text: Home Zip *
- textbox "Home Zip *"
- checkbox
- paragraph: I give permission for the practice to contact me via SMS or email. I understand that I can opt out at any time.
- button "Book Now"
```

# Test source

```ts
  73  |                     .first();
  74  |                 const isVisible = await providerName.isVisible({ timeout: 5_000 }).catch(() => false);
  75  |                 if (isVisible) {
  76  |                     const name = await providerName.textContent();
  77  |                     expect(name?.trim().length).toBeGreaterThan(0);
  78  |                 } else {
  79  |                     // Fallback: look for any bold text between "Your Appointment" and "Appointment Time"
  80  |                     const boldText = insurancePage.page
  81  |                         .locator('b, strong').filter({ hasText: /^[A-Z][a-z]/ }).first();
  82  |                     await expect(boldText).toBeVisible({ timeout: 5_000 });
  83  |                 }
  84  |             });
  85  |         }
  86  | 
  87  |         // Location and Address tests only run when the client shows clinic info in the panel.
  88  |         // TNDI-style: shows Location + Location Address (clinic-based panel)
  89  |         // SINY/Clarus-style: shows provider photo + name instead (no Location label)
  90  | 
  91  |         if (expectedLocation) {
  92  |             test('TC-APPT-06 — "Location" label is visible in the summary panel', async ({ insurancePage }) => {
  93  |                 await expect(
  94  |                     insurancePage.page.getByText('Location', { exact: true }).first()
  95  |                 ).toBeVisible({ timeout: 10_000 });
  96  |             });
  97  | 
  98  |             test(`TC-APPT-07 — Location value shows "${expectedLocation}"`, async ({ insurancePage }) => {
  99  |                 await expect(
  100 |                     insurancePage.page.getByText(expectedLocation, { exact: false }).first()
  101 |                 ).toBeVisible({ timeout: 10_000 });
  102 |             });
  103 |         }
  104 | 
  105 |         if (expectedAddress) {
  106 |             test('TC-APPT-08 — "Location Address" label is visible in the summary panel', async ({ insurancePage }) => {
  107 |                 await expect(
  108 |                     insurancePage.page.getByText(/Location Address/i).first()
  109 |                 ).toBeVisible({ timeout: 10_000 });
  110 |             });
  111 | 
  112 |             test(`TC-APPT-09 — Location Address value shows "${expectedAddress}"`, async ({ insurancePage }) => {
  113 |                 await expect(
  114 |                     insurancePage.page.getByText(expectedAddress, { exact: false }).first()
  115 |                 ).toBeVisible({ timeout: 10_000 });
  116 |             });
  117 |         }
  118 | 
  119 |     });
  120 | }
  121 | 
  122 | // ── Patient info page variant ─────────────────────────────────────────────────
  123 | 
  124 | export function runPatientPageSummaryCases(test, expect, opts = {}) {
  125 |     const {
  126 |         expectedAppointmentType = null,
  127 |         expectedLocation        = null,
  128 |         expectedAddress         = null,
  129 |         hasProviderName         = false,
  130 |     } = opts;
  131 | 
  132 |     test.describe('Appointment summary panel — patient info page', () => {
  133 | 
  134 |         test('TC-APPT-PI-01 — "Your Appointment" heading is visible', async ({ patientPage }) => {
  135 |             await expect(patientPage.summaryHeading).toBeVisible({ timeout: 10_000 });
  136 |         });
  137 | 
  138 |         test('TC-APPT-PI-02 — "Appointment Time" label is visible', async ({ patientPage }) => {
  139 |             await expect(patientPage.summaryApptTime).toBeVisible({ timeout: 10_000 });
  140 |         });
  141 | 
  142 |         test('TC-APPT-PI-03 — "Appointment Type" label is visible', async ({ patientPage }) => {
  143 |             await expect(patientPage.summaryApptType).toBeVisible({ timeout: 10_000 });
  144 |         });
  145 | 
  146 |         test('TC-APPT-PI-04 — Appointment Time value shows a real time (AM/PM)', async ({ patientPage }) => {
  147 |             await expect(patientPage.summaryApptTime).toBeVisible({ timeout: 10_000 });
  148 |             await expect(
  149 |                 patientPage.page.getByText(/\d{1,2}:\d{2}\s*(AM|PM)/i).first()
  150 |             ).toBeVisible({ timeout: 10_000 });
  151 |         });
  152 | 
  153 |         if (expectedAppointmentType) {
  154 |             test(`TC-APPT-PI-05 — Appointment Type shows "${expectedAppointmentType}"`, async ({ patientPage }) => {
  155 |                 await expect(
  156 |                     patientPage.page.getByText(expectedAppointmentType, { exact: false }).first()
  157 |                 ).toBeVisible({ timeout: 10_000 });
  158 |             });
  159 |         }
  160 | 
  161 |         if (hasProviderName) {
  162 |             test('TC-APPT-PI-PN-01 — Provider name is visible in the "Your Appointment" panel', async ({ patientPage }) => {
  163 |                 const providerName = patientPage.page
  164 |                     .locator('[class*="appointment"] h3, [class*="appointment"] h4, [class*="appointment"] h5, [class*="appointment"] h6, [class*="appointment"] strong')
  165 |                     .first();
  166 |                 const isVisible = await providerName.isVisible({ timeout: 5_000 }).catch(() => false);
  167 |                 if (isVisible) {
  168 |                     const name = await providerName.textContent();
  169 |                     expect(name?.trim().length).toBeGreaterThan(0);
  170 |                 } else {
  171 |                     const boldText = patientPage.page
  172 |                         .locator('b, strong').filter({ hasText: /^[A-Z][a-z]/ }).first();
> 173 |                     await expect(boldText).toBeVisible({ timeout: 5_000 });
      |                                            ^ Error: expect(locator).toBeVisible() failed
  174 |                 }
  175 |             });
  176 |         }
  177 | 
  178 |         if (expectedLocation) {
  179 |             test('TC-APPT-PI-06 — "Location" label is visible in the summary panel', async ({ patientPage }) => {
  180 |                 await expect(
  181 |                     patientPage.page.getByText('Location', { exact: true }).first()
  182 |                 ).toBeVisible({ timeout: 10_000 });
  183 |             });
  184 | 
  185 |             test(`TC-APPT-PI-07 — Location value shows "${expectedLocation}"`, async ({ patientPage }) => {
  186 |                 await expect(
  187 |                     patientPage.page.getByText(expectedLocation, { exact: false }).first()
  188 |                 ).toBeVisible({ timeout: 10_000 });
  189 |             });
  190 |         }
  191 | 
  192 |         if (expectedAddress) {
  193 |             test('TC-APPT-PI-08 — "Location Address" label is visible in the summary panel', async ({ patientPage }) => {
  194 |                 await expect(
  195 |                     patientPage.page.getByText(/Location Address/i).first()
  196 |                 ).toBeVisible({ timeout: 10_000 });
  197 |             });
  198 | 
  199 |             test(`TC-APPT-PI-09 — Location Address value shows "${expectedAddress}"`, async ({ patientPage }) => {
  200 |                 await expect(
  201 |                     patientPage.page.getByText(expectedAddress, { exact: false }).first()
  202 |                 ).toBeVisible({ timeout: 10_000 });
  203 |             });
  204 |         }
  205 | 
  206 |     });
  207 | }
  208 | 
```