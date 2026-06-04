# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\SINY\medical.spec.js >> Existing Patient — identity search >> Negative — incomplete form >> TC-EP-12 — submitting with only DOB shows validation errors
- Location: tests\e2e\shared\existingPatient.cases.js:99:13

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "https://stage.setter.layline.live/sinydermatology/1/sinydermatologybayridge/landing", waiting until "networkidle"

```

```
Error: browserContext.close: Test ended.
Browser logs:

<launching> C:\Users\Praveen\AppData\Local\ms-playwright\chromium_headless_shell-1223\chrome-headless-shell-win64\chrome-headless-shell.exe --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-edgeupdater --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=C:\Users\Praveen\AppData\Local\Temp\playwright_chromiumdev_profile-IDtp9M --remote-debugging-pipe --no-startup-window
<launched> pid=6272
[pid=6272][err] [0604/155553.948:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155556.942:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155556.942:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155604.292:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155606.076:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155606.077:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155613.201:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155615.603:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155615.603:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155623.116:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155624.996:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155624.997:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155631.826:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155634.077:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155634.078:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155640.133:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155642.215:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155642.215:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155649.186:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155651.338:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155651.339:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155657.338:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155659.824:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155659.824:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155708.134:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155710.324:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155710.324:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155717.253:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155719.215:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155719.215:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155725.685:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155727.494:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155727.494:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155733.034:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155734.607:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=6272][err] [0604/155734.607:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
```