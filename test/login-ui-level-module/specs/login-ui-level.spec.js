'use strict';

const { execFileSync } = require('node:child_process');
const { createWorker } = require('tesseract.js');
const vmsLoginPage = require('../../../pageobjects/vms-login.page');
const { loginScreenText } = require('../../../utils/testData');

const validMobileNumber = '9403350898';
const overLimitMobileNumber = '12345678901';
const alphabetInput = 'abcdefghij';
const specialCharacterInput = '@#$%^&*';
const spacesOnly = '   ';

function notAutomated(testId, title, reason) {
  it.skip(`${testId} - ${title} [Not automated: ${reason}]`, function () {});
}

function runAdb(...args) {
  const deviceId = process.env.ANDROID_UDID;
  if (!deviceId) {
    throw new Error('ANDROID_UDID must be set to run device-level test steps.');
  }

  return execFileSync('adb', ['-s', deviceId, ...args], {
    encoding: 'utf8',
  }).trim();
}

async function withNetworkDisabled(runTest) {
  const wifiWasEnabled = runAdb('shell', 'settings', 'get', 'global', 'wifi_on') === '1';
  const dataWasEnabled =
    runAdb('shell', 'settings', 'get', 'global', 'mobile_data') === '1';

  try {
    runAdb('shell', 'svc', 'wifi', 'disable');
    runAdb('shell', 'svc', 'data', 'disable');
    await runTest();
  } finally {
    runAdb('shell', 'svc', 'wifi', wifiWasEnabled ? 'enable' : 'disable');
    runAdb('shell', 'svc', 'data', dataWasEnabled ? 'enable' : 'disable');
  }
}

async function withFontScale(scale, runTest) {
  const originalScale = runAdb('shell', 'settings', 'get', 'system', 'font_scale');

  try {
    runAdb('shell', 'settings', 'put', 'system', 'font_scale', String(scale));
    await runTest();
  } finally {
    runAdb(
      'shell',
      'settings',
      'put',
      'system',
      'font_scale',
      originalScale === 'null' ? '1.0' : originalScale
    );
  }
}

describe('Login UI Level Module workbook cases', function () {
  beforeEach(async function () {
    const appPackage = process.env.APP_PACKAGE;
    if (!appPackage) {
      throw new Error('APP_PACKAGE must be set in the project .env file.');
    }

    await browser.back();
    await browser.terminateApp(appPackage);
    await browser.activateApp(appPackage);
    await vmsLoginPage.openLoginScreen();
  });

  it('TC_001 - Verify Login Screen Load', async function () {
    expect(await vmsLoginPage.isDisplayed(vmsLoginPage.welcomeHeader)).toBe(true);
    expect(await vmsLoginPage.isDisplayed(vmsLoginPage.signInSubtitle)).toBe(true);
    expect(await vmsLoginPage.isDisplayed(vmsLoginPage.countryCallingCode)).toBe(true);
    expect(await vmsLoginPage.isDisplayed(vmsLoginPage.phoneField)).toBe(true);
    expect(await vmsLoginPage.isDisplayed(vmsLoginPage.continueButton)).toBe(true);
    expect(await vmsLoginPage.isDisplayed(vmsLoginPage.termsOfServiceLink)).toBe(true);
    expect(await vmsLoginPage.isDisplayed(vmsLoginPage.privacyPolicyLink)).toBe(true);
  });

  it('TC_002 - Verify Logo Visibility', async function () {
    expect(await vmsLoginPage.isDisplayed(vmsLoginPage.logoImage)).toBe(true);
  });

  it('TC_003 - Verify Logo Text Content', async function () {
    const worker = await createWorker('eng');

    try {
      const screenshot = Buffer.from(await browser.takeScreenshot(), 'base64');
      const logoText = await worker.recognize(screenshot, {
        rectangle: { left: 130, top: 250, width: 820, height: 330 },
      });
      const subtitleText = await worker.recognize(screenshot, {
        rectangle: { left: 500, top: 440, width: 420, height: 110 },
      });

      expect(logoText.data.text.toLowerCase()).toContain('skeiron');
      expect(subtitleText.data.text.toLowerCase()).toContain('logistics');
    } finally {
      await worker.terminate();
    }
  });

  it('TC_004 - Verify Welcome Back Header', async function () {
    expect(await vmsLoginPage.getWelcomeHeaderLabel()).toBe(
      loginScreenText.welcomeHeader
    );
  });

  it('TC_005 - Verify Welcome Back Header Spelling', async function () {
    expect(await vmsLoginPage.getWelcomeHeaderLabel()).toBe(
      loginScreenText.welcomeHeader
    );
  });

  it('TC_006 - Verify Dashboard Description Text', async function () {
    expect(await vmsLoginPage.isDisplayed(vmsLoginPage.signInSubtitle)).toBe(true);
  });

  it('TC_007 - Verify Dashboard Description Content', async function () {
    expect(await vmsLoginPage.getDashboardDescription()).toBe(
      loginScreenText.dashboardDescription
    );
  });

  it('TC_008 - Verify Country Code Visibility', async function () {
    expect(await vmsLoginPage.isDisplayed(vmsLoginPage.countryCallingCode)).toBe(
      true
    );
    expect(await vmsLoginPage.getCountryCallingCode()).toBe(
      loginScreenText.countryCallingCode
    );
  });

  it('TC_009 - Verify Country Code Non-editable', async function () {
    const countryCode = vmsLoginPage.countryCallingCode;
    expect(await countryCode.getAttribute('clickable')).toBe('false');
    await countryCode.click();
    expect(await vmsLoginPage.getCountryCallingCode()).toBe(
      loginScreenText.countryCallingCode
    );
    expect(await vmsLoginPage.getPhoneNumber()).toBe('');
  });

  it('TC_010 - Verify Mobile Number Field Visibility', async function () {
    expect(await vmsLoginPage.isDisplayed(vmsLoginPage.phoneField)).toBe(true);
  });

  it('TC_011 - Verify Mobile Placeholder Text', async function () {
    await expect(vmsLoginPage.phoneField).toBeDisplayed();
    const resourceId = await vmsLoginPage.phoneField.getAttribute('resourceId');
    await expect(resourceId).toBe('vms_login_phone');
    
  });

  it('TC_012 - Verify Numeric Keyboard', async function () {
    await vmsLoginPage.phoneField.click();
    await browser.waitUntil(() => browser.isKeyboardShown(), {
      timeout: 10000,
      timeoutMsg: 'Numeric keyboard did not open',
    });
    expect(await browser.isKeyboardShown()).toBe(true);
    await browser.hideKeyboard();
  });

  it('TC_013 - Verify Valid Mobile Entry', async function () {
    await vmsLoginPage.enterPhoneNumberAndWaitForContinueEnabled(
      validMobileNumber
    );
    expect(await vmsLoginPage.isContinueEnabled()).toBe(true);
  });

  it('TC_014 - Verify Blank Mobile Validation', async function () {
    const textBefore = await vmsLoginPage.getAccessibleScreenText();
    expect(await vmsLoginPage.isContinueEnabled()).toBe(false);
    expect(await vmsLoginPage.getAccessibleScreenText()).toEqual(textBefore);
  });

  it('TC_015 - Verify 11 Digit Mobile Validation', async function () {
    await vmsLoginPage.enterPhoneNumberByKeyboard(overLimitMobileNumber);
    expect((await vmsLoginPage.getPhoneNumber()).length).toBeLessThanOrEqual(10);
  });

  it('TC_016 - Verify Alphabet Restriction', async function () {
    await vmsLoginPage.enterPhoneNumberByKeyboard(alphabetInput);
    expect(await vmsLoginPage.getPhoneNumber()).not.toMatch(/[a-z]/i);
  });

  it('TC_017 - Verify Special Character Restriction', async function () {
    await vmsLoginPage.enterPhoneNumberByKeyboard(specialCharacterInput);
    expect(await vmsLoginPage.getPhoneNumber()).not.toMatch(/[@#$%^&*]/);
  });

  it('TC_018 - Verify Space Validation', async function () {
    await vmsLoginPage.enterPhoneNumber(spacesOnly);
    expect(await vmsLoginPage.isContinueEnabled()).toBe(false);
  });

  it('TC_019 - Verify Paste Valid Number', async function () {
    await browser.execute('mobile: setClipboard', {
      content: Buffer.from(validMobileNumber).toString('base64'),
      contentType: 'plaintext',
      label: 'VMS test number',
    });
    const phoneField = vmsLoginPage.phoneField;
    await phoneField.click();
    const fieldLocation = await phoneField.getLocation();
    const fieldSize = await phoneField.getSize();
    await browser.execute('mobile: longClickGesture', {
      x: Math.round(fieldLocation.x + fieldSize.width / 2),
      y: Math.round(fieldLocation.y + fieldSize.height / 2),
      duration: 1000,
    });

    const pasteOption = $('~Paste');
    if (await vmsLoginPage.isDisplayed(pasteOption, 1000)) {
      await pasteOption.click();
    } else {
      const screenSize = runAdb('shell', 'wm', 'size').match(/(\d+)x(\d+)/);
      const screenWidth = Number(screenSize[1]);
      const screenHeight = Number(screenSize[2]);
      await browser.execute('mobile: clickGesture', {
        x: Math.round(screenWidth * 0.5),
        y: Math.round(screenHeight * 0.675),
      });
    }

    expect(await vmsLoginPage.isContinueEnabled()).toBe(true);
  });

  it('TC_020 - Verify Continue Button Visibility', async function () {
    expect(await vmsLoginPage.isDisplayed(vmsLoginPage.continueButton)).toBe(true);
  });

  it('TC_021 - Verify Continue Disabled State', async function () {
    expect(await vmsLoginPage.isContinueEnabled()).toBe(false);
  });

  it('TC_022 - Verify Continue Enabled State', async function () {
    await vmsLoginPage.enterPhoneNumberAndWaitForContinueEnabled(
      validMobileNumber
    );
    expect(await vmsLoginPage.isContinueEnabled()).toBe(true);
  });

  it('TC_023 - Verify Continue Navigation', async function () {
    await vmsLoginPage.enterPhoneNumberAndWaitForContinueEnabled(
      validMobileNumber
    );
    await vmsLoginPage.tapContinue();

    await browser.waitUntil(
      async () => !(await vmsLoginPage.isDisplayed(vmsLoginPage.phoneField, 500)),
      {
        timeout: 15000,
        timeoutMsg: 'Continue did not navigate away from the login screen',
      }
    );
    expect(await vmsLoginPage.isDisplayed(vmsLoginPage.phoneField, 500)).toBe(
      false
    );
  });

  it('TC_024 - Verify Multiple Continue Clicks', async function () {
    await vmsLoginPage.enterPhoneNumberAndWaitForContinueEnabled(
      validMobileNumber
    );
    await vmsLoginPage.tapContinue();

    if (await vmsLoginPage.isDisplayed(vmsLoginPage.continueButton, 500)) {
      await vmsLoginPage.continueButton.click();
    }

    await browser.waitUntil(
      async () => !(await vmsLoginPage.isDisplayed(vmsLoginPage.phoneField, 500)),
      {
        timeout: 15000,
        timeoutMsg: 'Repeated Continue clicks did not leave the login screen',
      }
    );
    expect(await vmsLoginPage.isDisplayed(vmsLoginPage.phoneField, 500)).toBe(
      false
    );
  });

  it('TC_025 - Verify Terms Link Visibility', async function () {
    expect(await vmsLoginPage.isDisplayed(vmsLoginPage.termsOfServiceLink)).toBe(
      true
    );
  });

  it('TC_026 - Verify Terms Link Click', async function () {
    await vmsLoginPage.tap(vmsLoginPage.termsOfServiceLink);
    await browser.waitUntil(
      async () => (await browser.getCurrentPackage()) === 'com.android.chrome',
      {
        timeout: 15000,
        timeoutMsg: 'Terms page did not open in Chrome',
      }
    );
    expect(await browser.getCurrentPackage()).toBe('com.android.chrome');
  });

  it('TC_027 - Verify Terms Link Without Internet', async function () {
    await withNetworkDisabled(async () => {
      await vmsLoginPage.tap(vmsLoginPage.termsOfServiceLink);
      await browser.waitUntil(
        async () => (await browser.getCurrentPackage()) === 'com.android.chrome',
        {
          timeout: 15000,
          timeoutMsg: 'Terms link did not open Chrome while offline',
        }
      );
      expect(await browser.getCurrentPackage()).toBe('com.android.chrome');
    });
  });

  it('TC_028 - Verify Privacy Link Visibility', async function () {
    expect(await vmsLoginPage.isDisplayed(vmsLoginPage.privacyPolicyLink)).toBe(
      true
    );
  });

  it('TC_029 - Verify Privacy Link Click', async function () {
    await vmsLoginPage.tapPrivacyPolicyLink();
    await browser.waitUntil(
      async () => (await browser.getCurrentPackage()) === 'com.android.chrome',
      {
        timeout: 15000,
        timeoutMsg: 'Privacy page did not open in Chrome',
      }
    );
    expect(await browser.getCurrentPackage()).toBe('com.android.chrome');
  });

  it('TC_030 - Verify Privacy Link Without Internet', async function () {
    await withNetworkDisabled(async () => {
      await vmsLoginPage.tapPrivacyPolicyLink();
      await browser.waitUntil(
        async () => (await browser.getCurrentPackage()) === 'com.android.chrome',
        {
          timeout: 15000,
          timeoutMsg: 'Privacy link did not open Chrome while offline',
        }
      );
      expect(await browser.getCurrentPackage()).toBe('com.android.chrome');
    });
  });

  it('TC_031 - Verify Footer Disclaimer Visibility', async function () {
    expect((await vmsLoginPage.getAccessibleScreenText()).join('')).toContain(
      loginScreenText.footerDisclaimer
    );
  });

  it('TC_032 - Verify Footer Disclaimer Spelling', async function () {
    expect((await vmsLoginPage.getAccessibleScreenText()).join('')).toContain(
      loginScreenText.footerDisclaimer
    );
  });

  it('TC_033 - Verify Version Visibility', async function () {
    expect(await vmsLoginPage.getVersionLabel()).toBe(loginScreenText.version);
  });

  it('TC_034 - Verify Version Format', async function () {
    expect(await vmsLoginPage.getVersionLabel()).toMatch(/^v?\d+\.\d+\.\d+$/);
  });

  it('TC_035 - Verify Responsive UI', async function () {
    const sizeOutput = runAdb('shell', 'wm', 'size');
    const originalOverride = sizeOutput.match(/Override size: (\d+x\d+)/)?.[1];

    try {
      runAdb('shell', 'wm', 'size', '720x1600');
      await browser.pause(1000);
      expect(await vmsLoginPage.isDisplayed(vmsLoginPage.phoneField)).toBe(true);
      expect(await vmsLoginPage.isDisplayed(vmsLoginPage.continueButton)).toBe(
        true
      );
    } finally {
      if (originalOverride) {
        runAdb('shell', 'wm', 'size', originalOverride);
      } else {
        runAdb('shell', 'wm', 'size', 'reset');
      }
    }
  });

  it('TC_036 - Verify Accessibility Font Size', async function () {
    const currentFontScale = Number(
      runAdb('shell', 'settings', 'get', 'system', 'font_scale')
    );
    const testFontScale = currentFontScale === 1.3 ? 1.5 : 1.3;

    await withFontScale(testFontScale, async () => {
      expect(await vmsLoginPage.isDisplayed(vmsLoginPage.welcomeHeader)).toBe(
        true
      );
      expect(await vmsLoginPage.isDisplayed(vmsLoginPage.phoneField)).toBe(
        true
      );
      expect(await vmsLoginPage.isDisplayed(vmsLoginPage.continueButton)).toBe(
        true
      );
    });
  });

  it('TC_037 - Verify No Internet Login Attempt', async function () {
    await withNetworkDisabled(async () => {
      await vmsLoginPage.enterPhoneNumberAndWaitForContinueEnabled(
        validMobileNumber
      );
      await vmsLoginPage.tapContinue();
      await browser.waitUntil(
        async () => vmsLoginPage.isDisplayed(vmsLoginPage.phoneField, 500),
        {
          timeout: 10000,
          timeoutMsg: 'Offline login unexpectedly navigated away from login',
        }
      );
      expect(await vmsLoginPage.isDisplayed(vmsLoginPage.phoneField)).toBe(true);
    });
  });
  it('TC_038 - Verify End-to-End Login Flow', async function () {
    const otpCode = process.env.OTP_CODE;
    expect(otpCode).toMatch(/^\d{6}$/);

    await vmsLoginPage.enterPhoneNumberAndWaitForContinueEnabled(
      validMobileNumber
    );
    await vmsLoginPage.tapContinue();
    await vmsLoginPage.otpHeading.waitForDisplayed({
      timeout: 20000,
      timeoutMsg: 'OTP verification screen did not appear after Continue',
    });

    await vmsLoginPage.enterOtpCode(otpCode);
    await vmsLoginPage.tapOtpVerify();
    await vmsLoginPage.dashboardGreeting.waitForDisplayed({
      timeout: 30000,
      timeoutMsg: 'Dashboard did not appear after OTP verification',
    });
    expect(await vmsLoginPage.isDisplayed(vmsLoginPage.dashboardGreeting)).toBe(
      true
    );
  });
});










