# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\TNDI\newPatient.spec.js >> Page refresh mid-flow >> TC-REF-04 — after refresh on patient info, app shows form or landing (no broken state)
- Location: tests\e2e\shared\pageRefresh.cases.js:48:9

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
          - paragraph [ref=e83]: 8:30 AM, Tue Jun 9, 2026
        - generic [ref=e84]:
          - heading "Appointment Type" [level=6] [ref=e85]
          - paragraph [ref=e87]: Teleconsultation
    - generic [ref=e89]:
      - generic [ref=e90]:
        - generic [ref=e91]:
          - generic [ref=e93]:
            - generic: First Name *
            - generic [ref=e94]:
              - textbox "First Name *" [ref=e95]
              - group:
                - generic: First Name *
          - generic [ref=e97]:
            - generic: Last Name *
            - generic [ref=e98]:
              - textbox "Last Name *" [ref=e99]
              - group:
                - generic: Last Name *
          - generic [ref=e101]:
            - generic: Date of Birth *
            - generic [ref=e102]:
              - textbox "Date of Birth *" [ref=e103]:
                - /placeholder: MM/DD/YYYY
              - button "Choose date" [ref=e105] [cursor=pointer]:
                - img [ref=e106]
              - group:
                - generic: Date of Birth *
          - generic [ref=e109]:
            - combobox "Gender *" [ref=e110] [cursor=pointer]:
              - paragraph [ref=e111]: Gender *
            - textbox
            - img
            - group
          - generic [ref=e113]:
            - generic: Email *
            - generic [ref=e114]:
              - textbox "Email *" [ref=e115]
              - group:
                - generic: Email *
          - generic [ref=e117]:
            - generic: Phone *
            - generic [ref=e118]:
              - spinbutton "Phone *" [ref=e119]
              - group:
                - generic: Phone *
        - generic [ref=e120]:
          - generic [ref=e122]:
            - generic: Address1 *
            - generic [ref=e123]:
              - textbox "Address1 *" [ref=e124]
              - group:
                - generic: Address1 *
          - generic [ref=e126]:
            - generic: Address2 (Optional)
            - generic [ref=e127]:
              - textbox "Address2 (Optional)" [ref=e128]
              - group:
                - generic: Address2 (Optional)
          - generic [ref=e130]:
            - generic: City *
            - generic [ref=e131]:
              - textbox "City *" [ref=e132]
              - group:
                - generic: City *
          - generic [ref=e136]:
            - combobox "State *" [ref=e137]
            - button "Open" [ref=e139] [cursor=pointer]:
              - img [ref=e140]
            - group
          - generic [ref=e143]:
            - generic: Home Zip *
            - generic [ref=e144]:
              - textbox "Home Zip *" [ref=e145]
              - group:
                - generic: Home Zip *
          - generic [ref=e148]:
            - generic: How Did You Hear About Us? *
            - generic [ref=e149]:
              - combobox "How Did You Hear About Us? *" [ref=e150]
              - button "Open" [ref=e152] [cursor=pointer]:
                - img [ref=e153]
              - group:
                - generic: How Did You Hear About Us? *
      - generic [ref=e155]:
        - generic [ref=e156] [cursor=pointer]:
          - checkbox [ref=e157]
          - img [ref=e158]
        - paragraph [ref=e160]: I give permission for the practice to contact me via SMS or email. I understand that I can opt out at any time.
      - button "Book Now" [ref=e162] [cursor=pointer]
```

# Test source

```ts
  1  | /**
  2  |  * PAGE REFRESH MID-FLOW TESTS
  3  |  *
  4  |  * Verifies that refreshing the browser mid-booking does not crash the app.
  5  |  * The app may either stay on the current page (session persists) or redirect
  6  |  * to landing (session reset) — both are acceptable. A blank page or JS error is not.
  7  |  *
  8  |  * @param {object} opts
  9  |  * @param {boolean} [opts.hasInsurance=true]  — client has an insurance step
  10 |  */
  11 | export function runPageRefreshCases(test, expect, opts = {}) {
  12 |     const { hasInsurance = true } = opts;
  13 | 
  14 |     test.describe('Page refresh mid-flow', () => {
  15 | 
  16 |         // ── Insurance page ─────────────────────────────────────────────────────
  17 |         if (hasInsurance) {
  18 | 
  19 |             test('TC-REF-01 — refresh on insurance page does not crash the app', async ({ insurancePage }) => {
  20 |                 await insurancePage.page.reload({ waitUntil: 'networkidle' });
  21 |                 // Must not be a blank or error page
  22 |                 const count = await insurancePage.page.locator('button, input, h1, h2, h3').count();
  23 |                 expect(count).toBeGreaterThan(0);
  24 |             });
  25 | 
  26 |             test('TC-REF-02 — after refresh on insurance page, app shows form or landing (no broken state)', async ({ insurancePage }) => {
  27 |                 await insurancePage.page.reload({ waitUntil: 'networkidle' });
  28 |                 const url = insurancePage.page.url();
  29 |                 // Either stayed on insurance/findappointment OR redirected to landing — both OK
  30 |                 const isOnExpectedPage =
  31 |                     url.includes('insurance') ||
  32 |                     url.includes('findappointment') ||
  33 |                     url.includes('landing') ||
  34 |                     url.includes('intake');
  35 |                 expect(isOnExpectedPage).toBe(true);
  36 |             });
  37 | 
  38 |         }
  39 | 
  40 |         // ── Patient info page ──────────────────────────────────────────────────
  41 | 
  42 |         test('TC-REF-03 — refresh on patient info page does not crash the app', async ({ patientInfoPage }) => {
  43 |             await patientInfoPage.page.reload({ waitUntil: 'networkidle' });
  44 |             const count = await patientInfoPage.page.locator('button, input, h1, h2, h3').count();
  45 |             expect(count).toBeGreaterThan(0);
  46 |         });
  47 | 
  48 |         test('TC-REF-04 — after refresh on patient info, app shows form or landing (no broken state)', async ({ patientInfoPage }) => {
  49 |             await patientInfoPage.page.reload({ waitUntil: 'networkidle' });
  50 |             const url = patientInfoPage.page.url();
  51 |             const isOnExpectedPage =
  52 |                 url.includes('patientinfo') ||
  53 |                 url.includes('insurance') ||
  54 |                 url.includes('landing') ||
  55 |                 url.includes('intake') ||
  56 |                 url.includes('findappointment');
> 57 |             expect(isOnExpectedPage).toBe(true);
     |                                      ^ Error: expect(received).toBe(expected) // Object.is equality
  58 |         });
  59 | 
  60 |         test('TC-REF-05 — patient info page reloaded once is still navigable (no JS crash)', async ({ patientInfoPage }) => {
  61 |             await patientInfoPage.page.reload({ waitUntil: 'networkidle' });
  62 |             // Check no uncaught JS error by verifying at least one interactive element exists
  63 |             const hasInteractiveElement = await patientInfoPage.page
  64 |                 .locator('button:not([disabled]), input, a[href]')
  65 |                 .first()
  66 |                 .isVisible({ timeout: 10_000 })
  67 |                 .catch(() => false);
  68 |             expect(hasInteractiveElement).toBe(true);
  69 |         });
  70 | 
  71 |     });
  72 | }
  73 | 
```