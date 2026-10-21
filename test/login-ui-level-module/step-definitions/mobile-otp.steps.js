'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createWorker } = require('tesseract.js');
const { After, AfterStep, Given, When, Then } = require('@wdio/cucumber-framework');
const selectedEnvironment = require('../../../config/environments').selectedEnvironment;
const mobileOtpPage = require('../../../pageobjects/mobile-otp.page');
const { mobileOtpTestData, getConfiguredOtpCode } = require('../../../utils/testData');

async function readScreenshotText(rectangle) {
  const screenshot = Buffer.from(await browser.takeScreenshot(), 'base64');
  const worker = await createWorker('eng');

  try {
    const options = rectangle ? { rectangle } : {};
    return (await worker.recognize(screenshot, options)).data.text;
  } finally {
    await worker.terminate();
  }
}

async function readOtpDigits() {
  await mobileOtpPage.waitForOtpScreen();
  const boxes = [];
  for (let digitIndex = 0; digitIndex < 6; digitIndex += 1) {
    const box = $(`//*[@resource-id="vms_otp_digit_${digitIndex}"]`);
    boxes.push({ location: await box.getLocation(), size: await box.getSize() });
  }

  const left = Math.min(...boxes.map(({ location }) => location.x));
  const top = Math.min(...boxes.map(({ location }) => location.y));
  const right = Math.max(...boxes.map(({ location, size }) => location.x + size.width));
  const bottom = Math.max(...boxes.map(({ location, size }) => location.y + size.height));
  return (await readScreenshotText({
    left: Math.round(left),
    top: Math.round(top),
    width: Math.round(right - left),
    height: Math.round(bottom - top),
  })).replace(/\D/g, '');
}

async function readMobileNumberDigits() {
  const field = mobileOtpPage.mobileNumberField;
  const location = await field.getLocation();
  const size = await field.getSize();
  return (await readScreenshotText({
    left: Math.round(location.x),
    top: Math.round(location.y),
    width: Math.round(size.width),
    height: Math.round(size.height),
  })).replace(/\D/g, '');
}

AfterStep(function ({ pickleStep }) {
  this.lastStepName = pickleStep.text;
});

After(async function ({ pickle }) {
  try {
    const scenarioName = pickle.name.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '');
    const stepName = (this.lastStepName || 'final-state')
      .replace(/[^a-z0-9-_]+/gi, '-')
      .replace(/^-|-$/g, '');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const evidenceDirectory = path.resolve(__dirname, '../../../screenshots/mobile-otp');
    const screenshotPath = path.join(
      evidenceDirectory,
      `${scenarioName}--${stepName}--${timestamp}.png`
    );
    const screenshot = Buffer.from(await browser.takeScreenshot(), 'base64');

    fs.mkdirSync(evidenceDirectory, { recursive: true });
    fs.writeFileSync(screenshotPath, screenshot);
    await this.attach(`${pickle.name}\nFinal step: ${this.lastStepName}`, 'text/plain');
    await this.attach(screenshot, 'image/png');
    console.log(`Mobile OTP evidence saved: ${screenshotPath}`);
  } catch (error) {
    console.warn(`Could not save mobile OTP screenshot evidence: ${error.message}`);
  }
});

Given('the mobile login screen is open', async function () {
  await browser.back();
  await browser.terminateApp(selectedEnvironment.appPackage);
  await browser.activateApp(selectedEnvironment.appPackage);
  await mobileOtpPage.openLoginScreen();
});

Then('the country code is {string}', async function (countryCode) {
  assert.equal(await mobileOtpPage.countryCode.getAttribute('content-desc'), countryCode);
});

Then('the configured country code is displayed', async function () {
  assert.equal(
    await mobileOtpPage.countryCode.getAttribute('content-desc'),
    mobileOtpTestData.countryCode
  );
});

Then('Continue is disabled', async function () {
  assert.equal(await mobileOtpPage.isContinueEnabled(), false);
});

Then('the mobile number field contains exactly 10 digits', async function () {
  assert.equal((await readMobileNumberDigits()).length, 10);
});

Then('the mobile number field contains no digits', async function () {
  await mobileOtpPage.countryCode.click();
  assert.equal(await readMobileNumberDigits(), '');
});

When('I enter mobile number {string}', async function (mobileNumber) {
  await mobileOtpPage.enterMobileNumber(mobileNumber);
});

When('I attempt to enter mobile number {string}', async function (input) {
  await mobileOtpPage.attemptMobileNumberInput(input);
});

When('I enter the valid mobile test number', async function () {
  await mobileOtpPage.enterMobileNumber(mobileOtpTestData.validMobileNumber);
});

When('I enter an incomplete mobile test number', async function () {
  await mobileOtpPage.enterMobileNumber(mobileOtpTestData.incompleteMobileNumber);
});

When('I enter an overlength mobile test number', async function () {
  await mobileOtpPage.enterMobileNumber(mobileOtpTestData.overLimitMobileNumber);
});

When('I focus the mobile number field', async function () {
  await mobileOtpPage.focusMobileNumberField();
});

When('I clear the mobile number', async function () {
  await mobileOtpPage.clearMobileNumber(mobileOtpTestData.validMobileNumber.length);
});

Then('the keyboard for entry is displayed', async function () {
  assert.equal(await browser.isKeyboardShown(), true);
});

Then('Continue is enabled', async function () {
  assert.equal(await mobileOtpPage.isContinueEnabled(), true);
});

When('I tap Continue', async function () {
  await mobileOtpPage.tapContinue();
});

Then('the OTP verification screen is displayed', async function () {
  await mobileOtpPage.waitForOtpScreen();
});

When('I enter a partial OTP', async function () {
  await mobileOtpPage.enterOtpDigits(mobileOtpTestData.partialOtp);
});

When('I enter OTP digits {string}', async function (otpCode) {
  await mobileOtpPage.enterOtpDigits(otpCode);
});

Then('all OTP digit fields are empty', async function () {
  assert.equal(await mobileOtpPage.areOtpDigitsEmpty(), true);
});

Then('the OTP resend countdown is displayed', async function () {
  await mobileOtpPage.waitForOtpScreen();

  if (await browser.isKeyboardShown()) {
    await browser.hideKeyboard();
  }

  const screenText = (await readScreenshotText()).replace(/\s+/g, ' ');
  assert.match(screenText, /resend code in\s+\d+\s*s/i);
});

When('I wait until the resend countdown expires', async function () {
  if (await browser.isKeyboardShown()) {
    await browser.hideKeyboard();
  }

  await mobileOtpPage.resendControl.waitForEnabled({
    timeout: 75000,
    timeoutMsg: 'Resend control did not enable after the cooldown',
  });
});

Then('the resend control is enabled', async function () {
  await mobileOtpPage.resendControl.waitForDisplayed({ timeout: 5000 });
  assert.equal(await mobileOtpPage.resendControl.getAttribute('enabled'), 'true');
});

When('I tap resend code', async function () {
  await mobileOtpPage.tapResendCode();
});

Then('exactly six OTP digits are displayed', async function () {
  assert.equal(await readOtpDigits(), '123456');
});

Then('OTP Verify is disabled', async function () {
  assert.equal(await mobileOtpPage.isOtpVerifyEnabled(), false);
});

Then('OTP Verify is enabled', async function () {
  assert.equal(await mobileOtpPage.isOtpVerifyEnabled(), true);
});

Then('the invalid OTP message is displayed', async function () {
  await mobileOtpPage.invalidOtpMessage.waitForDisplayed({
    timeout: 10000,
    timeoutMsg: 'Invalid OTP feedback was not displayed',
  });
});

When('I tap OTP Verify', async function () {
  await mobileOtpPage.tapOtpVerify();
});

When('I submit an incorrect OTP', async function () {
  const otpCode = mobileOtpTestData.invalidOtp;
  assert.match(otpCode, /^\d{6}$/);
  await mobileOtpPage.enterOtpDigits(otpCode);
  await mobileOtpPage.tapOtpVerify();
  await browser.pause(3000);
});

When('I submit the incorrect OTP three times', async function () {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (attempt > 0) {
      await mobileOtpPage.clearOtpDigits();
    }

    await mobileOtpPage.enterOtpDigits(mobileOtpTestData.invalidOtp);
    await mobileOtpPage.tapOtpVerify();
    await mobileOtpPage.invalidOtpMessage.waitForDisplayed({
      timeout: 10000,
      timeoutMsg: `Invalid OTP feedback was not displayed for attempt ${attempt + 1}`,
    });
  }
});

Then('the OTP verification screen remains displayed', async function () {
  assert.equal(await mobileOtpPage.otpHeading.isDisplayed(), true);
});

Then('the VMS dashboard is not displayed', async function () {
  assert.equal(await mobileOtpPage.dashboardGreeting.isDisplayed(), false);
});

When('I tap the OTP back control', async function () {
  await mobileOtpPage.tapOtpBackButton();
});

Then('the mobile login screen is displayed', async function () {
  await mobileOtpPage.waitForMobileLoginScreen();
});

When('I submit the configured OTP', async function () {
  await mobileOtpPage.submitOtp(getConfiguredOtpCode());
});

Then('the VMS dashboard is displayed', async function () {
  await mobileOtpPage.waitForDashboard();
});