# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\ClarusDerm\newPatient.spec.js >> Landing page >> Location info panel >> TC-LAND-11 — /any/ URL still shows the reason form and patient buttons
- Location: tests\e2e\shared\landing.cases.js:217:17

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "https://stage.setter.layline.live/clarusdermatology/1/any/landing", waiting until "networkidle"

```

```
Error: browserContext.close: Target page, context or browser has been closed
```