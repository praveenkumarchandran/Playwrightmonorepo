# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\SINY\cosmetic.spec.js >> Existing Patient — identity search >> Form fields >> TC-EP-01 — identity form is visible with all three fields
- Location: tests\e2e\shared\existingPatient.cases.js:22:13

# Error details

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for getByLabel('First Name') to be visible

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
        - generic [ref=e27]:
          - generic [ref=e28]:
            - combobox "Visit reason" [ref=e29]
            - button "Open" [ref=e31] [cursor=pointer]:
              - img [ref=e32]
            - group
          - paragraph [ref=e34]: Please select a service type
      - generic [ref=e35]:
        - heading "Have you visited us before?" [level=5] [ref=e36]
        - generic [ref=e37]:
          - button "Existing Patient" [active] [ref=e38] [cursor=pointer]: Existing Patient
          - button "New Patient" [ref=e39] [cursor=pointer]
      - generic [ref=e41]:
        - heading "Powered by" [level=6] [ref=e42]
        - img "MUlogo" [ref=e43]
```

# Test source

```ts
  1  | export class ExistingPatientPage {
  2  |     constructor(page) {
  3  |         this.page = page;
  4  |         // MUI floating-label inputs — matched via aria label, not placeholder
  5  |         this.firstNameInput = page.getByLabel('First Name');
  6  |         this.lastNameInput  = page.getByLabel('Last Name');
  7  |         this.dobInput       = page.getByLabel('Date of Birth');
  8  |         this.findBtn        = page.locator('button:has-text("Find Appointment")');
  9  |         // Inline field-level validation errors shown when submitting empty fields
  10 |         this.validationError = page.locator(':text-matches("to proceed", "i")');
  11 |     }
  12 | 
  13 |     async waitForLoad() {
> 14 |         await this.firstNameInput.waitFor({ state: 'visible', timeout: 15_000 });
     |                                   ^ TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
  15 |     }
  16 | 
  17 |     async fill(firstName, lastName, dob) {
  18 |         await this.firstNameInput.fill(firstName);
  19 |         await this.lastNameInput.fill(lastName);
  20 |         // DOB may be a MUI date picker — click first to focus, then fill
  21 |         await this.dobInput.click();
  22 |         await this.dobInput.fill(dob);
  23 |     }
  24 | 
  25 |     async findAppointment() {
  26 |         await this.findBtn.waitFor({ state: 'visible', timeout: 10_000 });
  27 |         await this.findBtn.click();
  28 |         await this.page.waitForLoadState('networkidle', { timeout: 30_000 });
  29 |     }
  30 | 
  31 |     async search(firstName, lastName, dob) {
  32 |         await this.waitForLoad();
  33 |         await this.fill(firstName, lastName, dob);
  34 |         await this.findAppointment();
  35 |     }
  36 | }
  37 | 
```