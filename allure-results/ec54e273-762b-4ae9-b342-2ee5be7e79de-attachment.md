# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\clients\SINY\medical.spec.js >> SINY Landing — gray service / location >> All top-level reasons from landing >> TC-LAND-S16 — "Hair Loss" → New Patient navigates away from landing
- Location: tests\e2e\shared\sinyLanding.cases.js:238:17

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "https://stage.setter.layline.live/sinydermatology/1/sinydermatologybayridge/landing", waiting until "networkidle"

```

```
Error: browserContext.close: Test ended.
Browser logs:

<launching> C:\Users\Praveen\AppData\Local\ms-playwright\chromium_headless_shell-1223\chrome-headless-shell-win64\chrome-headless-shell.exe --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-edgeupdater --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=C:\Users\Praveen\AppData\Local\Temp\playwright_chromiumdev_profile-F1UFz2 --remote-debugging-pipe --no-startup-window
<launched> pid=27484
[pid=27484][err] [0604/122404.930:INFO:CONSOLE:2] "url stage", source: https://stage.setter.layline.live/static/js/main.70c977b9.js (2)
```