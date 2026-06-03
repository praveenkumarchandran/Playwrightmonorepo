# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\SINY\cosmetic.spec.js >> Existing Patient — identity search >> New Patient button — from identity page >> TC-NP-02 — clicking New Patient redirects to the find appointment page
- Location: tests\e2e\shared\existingPatient.cases.js:145:13

# Error details

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for locator('button:has-text("New Patient")')

```

```
Error: browserContext.close: Target page, context or browser has been closed
```