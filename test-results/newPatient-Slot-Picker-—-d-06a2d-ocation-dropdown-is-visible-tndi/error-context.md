# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\TNDI\newPatient.spec.js >> Slot Picker — date strip + time slots >> Change Filters panel >> TC-SP-02 — Location dropdown is visible
- Location: tests\e2e\shared\slotPicker.cases.js:40:13

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "https://stage.setter.layline.live/thenerveanddiscinstitute/1/thenerveanddiscinstitutefarmington/landing", waiting until "networkidle"

```

```
Error: browserContext.close: Test ended.
Browser logs:

<launching> C:\Users\Praveen\AppData\Local\ms-playwright\chromium_headless_shell-1223\chrome-headless-shell-win64\chrome-headless-shell.exe --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-edgeupdater --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=C:\Users\Praveen\AppData\Local\Temp\playwright_chromiumdev_profile-iOAUbz --remote-debugging-pipe --no-startup-window
<launched> pid=21652
[pid=21652][err] [0604/155553.723:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155556.284:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155556.286:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155600.482:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155602.745:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155602.746:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155605.866:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155607.895:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155607.897:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155612.620:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155614.916:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155614.916:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155618.469:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155620.262:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155620.262:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155624.378:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155627.660:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155627.661:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155633.049:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155635.051:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155635.051:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155638.219:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155640.323:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155640.323:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155643.688:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155645.479:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155645.479:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155649.191:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155650.635:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155650.635:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155653.958:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155655.926:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155655.927:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155658.217:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155703.927:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155705.984:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155705.984:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155708.455:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155714.046:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155715.738:INFO:CONSOLE:2] "Request canceled: Request canceled: New request made.", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155715.738:INFO:CONSOLE:2] "[object Object]", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
[pid=21652][err] [0604/155735.512:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
```