# Appium Login Automation Framework

A starter Android UI automation project using Appium 2, UiAutomator2, WebdriverIO, and Mocha. Place the target APK in `app/`, then update the sample package, activity, accessibility IDs, credentials, and expected messages to match that app.

## Prerequisites

- Node.js 16 or newer and npm.
- Java JDK supported by your Android SDK installation.
- Android Studio with Android SDK Platform-Tools, Build-Tools, and an Android emulator image installed.
- An Android emulator or device visible to ADB. The default device name is `emulator-5554`.
- `ANDROID_HOME` set to the Android SDK directory, with `platform-tools`, `emulator`, and the relevant `build-tools` directory on `PATH`. `ANDROID_SDK_ROOT` may also be set for tools that use it.
- Appium 2 and the UiAutomator2 driver. The project installs Appium locally and installs the driver automatically during `npm install` through its `postinstall` script.
- Optional: `appium-doctor` for checking the local Android/Appium setup.

Check Node and ADB, and verify that the emulator is connected:

```powershell
node --version
npm --version
adb devices
```

Install the optional diagnostic tool and run its Android checks:

```powershell
npm install --global appium-doctor
appium-doctor --android
```

## Install

From this directory, copy the environment template and install dependencies. `npm install` also installs the Appium UiAutomator2 driver.

```powershell
Copy-Item .env.example .env
npm install
```

Put your APK at the path configured by `STAGING_APP_PATH` or `PRODUCTION_APP_PATH` in `.env`. By default, staging uses `app/your-app.apk` and production uses `app/production.apk`. The optional `APP_PATH` value overrides the selected build path. APK files are intentionally excluded from Git.

Update `APP_PACKAGE` and `APP_ACTIVITY` in `.env` with the identifiers for your APK. The `com.example.loginapp` and `.MainActivity` values are examples only.

## Find Package And Activity

Use the Android SDK `aapt` utility. Replace `<version>` with an installed Build-Tools version:

```powershell
$aapt = "$env:ANDROID_HOME\build-tools\<version>\aapt.exe"
& $aapt dump badging .\app\your-app.apk | Select-String "package:|launchable-activity:"
```

The output contains the package name and launchable activity. For example, `package: name='com.example.app'` maps to `APP_PACKAGE=com.example.app`; `launchable-activity: name='com.example.app.MainActivity'` maps to `APP_ACTIVITY=.MainActivity`.

If the activity is not listed, inspect the APK manifest or ask the app developer for its launch activity.

## Get Locators With Appium Inspector

1. Start the emulator and confirm it appears in `adb devices`.
2. Start an Appium server for Inspector in a separate PowerShell window:

   ```powershell
   Set-Location .\appium-login-framework
   npx appium --address 127.0.0.1 --port 4723
   ```

3. In Appium Inspector, connect to `http://127.0.0.1:4723` and start a session with the Android capabilities used by this project: `platformName=Android`, `appium:automationName=UiAutomator2`, `appium:deviceName=emulator-5554`, the APK path, package, and activity.
4. Select each login control in the Inspector hierarchy. Prefer an accessibility ID where the app exposes one. Replace the sample selectors and locator comments in `pageobjects/login.page.js` with the real identifiers. Add or update the error and logged-in screen selectors as needed.

The test runner starts its own Appium service when you run `npm test`; stop the manually started server before running tests if it is using port 4723.

## Run Tests

Start the emulator before running a command. From the project directory:

```powershell
npm test
npm run test:staging
npm run test:prod
```

`npm test` uses `ENV` from `.env` (staging by default). The other scripts explicitly select staging or production. Edit `.env` to set build paths and app identifiers; environment-specific values such as `STAGING_APP_PATH`, `PRODUCTION_APP_PATH`, `STAGING_APP_PACKAGE`, and `PRODUCTION_APP_ACTIVITY` are supported. The test runner uses the Mocha framework and spec reporter, allows 60 seconds per test, and saves failure screenshots under `screenshots/`.

The sample credentials and expected UI messages are in `utils/testData.js`. Replace them with credentials reserved for automation and the exact messages your app displays. Do not use real user credentials.

## Add A Page Object And Spec

1. Add a page object under `pageobjects/` and extend `BasePage` to reuse `tap`, `type`, `getText`, `isDisplayed`, and `waitForVisible`.
2. Put locators in getters and obtain their identifiers from Appium Inspector.
3. Add a spec under `test/specs/` using Mocha `describe`/`it` blocks. Import test accounts and expected values from `utils/testData.js`; keep credentials out of the spec.
4. Run the narrow spec or the full suite with `npm test`.

## Troubleshooting Checklist

- Confirm `node --version` is 16 or newer and `npm install` completed successfully.
- Confirm `ANDROID_HOME` points to the SDK and `adb` is available on `PATH`.
- Run `adb devices`; make sure the emulator is booted and its state is `device`, not `offline` or `unauthorized`.
- Confirm the requested device name matches `adb devices` and `DEVICE_NAME` in `.env`.
- Confirm the APK exists at the selected build path and that package/activity values match the APK.
- Confirm the UiAutomator2 driver is installed with `npx appium driver list --installed`.
- Make sure port 4723 is free before starting the test runner; stop any Appium server started manually for Inspector.
- If element lookups time out, re-check accessibility IDs and visibility in Appium Inspector. Update the sample IDs and expected messages to match the app.
- If a test fails, inspect the screenshot saved under `screenshots/` along with the spec reporter output.
