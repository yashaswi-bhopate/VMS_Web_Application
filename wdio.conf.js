'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const { selectedEnvironment } = require('./config/environments');

function getAndroidUdid() {
  if (process.env.ANDROID_UDID) {
    return process.env.ANDROID_UDID;
  }

  let devicesOutput;
  try {
    devicesOutput = execFileSync('adb', ['devices'], { encoding: 'utf8' });
  } catch (error) {
    throw new Error(
      `Could not run "adb devices". Ensure Android platform-tools are installed and adb is on PATH. ${error.message}`
    );
  }

  const wirelessDevice = devicesOutput
    .split(/\r?\n/)
    .map((line) =>
      line.match(
        /^((?:\d{1,3}\.){3}\d{1,3}:\d+|adb-[^\s]+\._adb-tls-connect\._tcp)\s+device(?:\s|$)/
      )
    )
    .find(Boolean);

  const connectedDevice = wirelessDevice || devicesOutput
    .split(/\r?\n/)
    .map((line) => line.match(/^([^\s]+)\s+device(?:\s|$)/))
    .find(Boolean);

  if (!connectedDevice) {
    throw new Error(
      'No connected Android device found in "adb devices". Connect a device or set ANDROID_UDID.'
    );
  }

  return connectedDevice[1];
}

const androidUdid = getAndroidUdid();

exports.config = {
  runner: 'local',
  specs: ['./test/login-ui-level-module/specs/**/*.spec.js'],
  maxInstances: 1,
  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'OnePlus 11R 5G',
      'appium:udid': androidUdid,
      'appium:platformVersion': '16',
      'appium:app': path.resolve(__dirname, selectedEnvironment.appPath),
      'appium:appPackage': selectedEnvironment.appPackage,
      'appium:appActivity': selectedEnvironment.appActivity,
      'appium:noReset': true,
      'appium:forceAppLaunch': true,
      'appium:autoGrantPermissions': true,
      'appium:newCommandTimeout': 600,
      'appium:adbExecTimeout': 120000,
      'appium:uiautomator2ServerInstallTimeout': 120000,
      'appium:uiautomator2ServerLaunchTimeout': 120000,
      'appium:androidInstallTimeout': 180000,
      'appium:disableWindowAnimation': true,
      'appium:ignoreHiddenApiPolicyError': true,
    },
  ],
  logLevel: 'info',
  bail: 0,
  baseUrl: '',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: [
    [
      'appium',
      {
        command: 'node utils/appium-server.js',
        args: {
          address: '127.0.0.1',
          port: 4723,
        },
      },
    ],
  ],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
  afterTest: async function (test, context, result) {
    if (!result.error) {
      return;
    }

    const screenshotsDirectory = path.resolve(__dirname, 'screenshots');
    const safeTitle = test.title.replace(/[^a-z0-9-_]+/gi, '-');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(
      screenshotsDirectory,
      `${safeTitle}-${timestamp}.png`
    );

    try {
      fs.mkdirSync(screenshotsDirectory, { recursive: true });
      await browser.saveScreenshot(screenshotPath);
      console.log(`Failure screenshot saved: ${screenshotPath}`);
    } catch (screenshotError) {
      console.warn(`Could not save failure screenshot: ${screenshotError.message}`);
    }

    const sourcePath = path.join(
      screenshotsDirectory,
      `${safeTitle}-${timestamp}.xml`
    );
    try {
      fs.writeFileSync(sourcePath, await browser.getPageSource(), 'utf8');
      console.log(`Failure page source saved: ${sourcePath}`);
    } catch (sourceError) {
      console.warn(`Could not save failure page source: ${sourceError.message}`);
    }
  },
};
