'use strict';

const assert = require('node:assert/strict');
const { Given, When, Then } = require('@wdio/cucumber-framework');
const { selectedEnvironment } = require('../../../config/environments');
const vmsLoginPage = require('../../../pageobjects/vms-login.page');

Given('the VMS login screen is open', async function () {
  await browser.back();
  await browser.terminateApp(selectedEnvironment.appPackage);
  await browser.activateApp(selectedEnvironment.appPackage);
  await vmsLoginPage.openLoginScreen();
});

Then('the login page controls are visible', async function () {
  const controls = [
    vmsLoginPage.welcomeHeader,
    vmsLoginPage.phoneField,
    vmsLoginPage.continueButton,
    vmsLoginPage.termsOfServiceLink,
    vmsLoginPage.privacyPolicyLink,
  ];

  for (const control of controls) {
    assert.equal(await vmsLoginPage.isDisplayed(control), true);
  }
});

Then('the country code is {string}', async function (countryCode) {
  assert.equal(await vmsLoginPage.getCountryCallingCode(), countryCode);
});

Then('Continue is disabled', async function () {
  assert.equal(await vmsLoginPage.isContinueEnabled(), false);
});

When('I enter mobile number {string}', async function (mobileNumber) {
  await vmsLoginPage.enterPhoneNumberAndWaitForContinueEnabled(mobileNumber);
});

When('I tap Continue', async function () {
  await vmsLoginPage.tapContinue();
});

Then('the OTP verification screen is displayed', async function () {
  await vmsLoginPage.otpHeading.waitForDisplayed({
    timeout: 20000,
    timeoutMsg: 'OTP verification screen did not appear after Continue',
  });
});

When('I submit the configured OTP', async function () {
  const otpCode = process.env.OTP_CODE;
  assert.match(otpCode || '', /^\d{6}$/, 'Set a six-digit OTP_CODE in .env');
  await vmsLoginPage.enterOtpCode(otpCode);
  await vmsLoginPage.tapOtpVerify();
});

Then('the VMS dashboard is displayed', async function () {
  await vmsLoginPage.dashboardGreeting.waitForDisplayed({
    timeout: 30000,
    timeoutMsg: 'Dashboard did not appear after OTP verification',
  });
});