'use strict';

const BasePage = require('./base.page');
const vmsLoginPage = require('./vms-login.page');

class MobileOtpPage extends BasePage {
  get mobileNumberField() {
    return $('//*[@resource-id="vms_login_phone"]');
  }

  get countryCode() {
    return $('~+91');
  }

  get continueButton() {
    return $('~vms_login_continue');
  }

  get otpHeading() {
    return $('~OTP Verification');
  }

  get otpVerifyButton() {
    return $('//*[@content-desc="vms_otp_verify"]');
  }

  get resendControl() {
    return $('~Resend OTP');
  }

  get invalidOtpMessage() {
    return $('~Invalid OTP');
  }

  get otpBackButton() {
    return $('(//android.view.View[@clickable="true"])[1]');
  }

  get firstOtpDigit() {
    return $('//*[@resource-id="vms_otp_digit_0"]');
  }

  get dashboardGreeting() {
    return $('//*[starts-with(@content-desc, "Hi ")]');
  }

  async openLoginScreen() {
    await vmsLoginPage.openLoginScreen();
  }

  async enterMobileNumber(mobileNumber) {
    if (!/^\d*$/.test(mobileNumber)) {
      throw new Error('Mobile number input must contain digits only.');
    }

    await this.mobileNumberField.click();
    await browser.waitUntil(() => browser.isKeyboardShown(), {
      timeout: this.timeout,
      timeoutMsg: 'Numeric keyboard did not appear for the mobile number field',
    });
    await this.mobileNumberField.clearValue();

    for (const digit of mobileNumber) {
      await browser.execute('mobile: pressKey', {
        keycode: 7 + Number(digit),
      });
    }

    if (await browser.isKeyboardShown()) {
      await browser.hideKeyboard();
    }
  }

  async focusMobileNumberField() {
    await this.mobileNumberField.click();
    await browser.waitUntil(() => browser.isKeyboardShown(), {
      timeout: this.timeout,
      timeoutMsg: 'Numeric keyboard did not appear for the mobile number field',
    });
  }

  async isContinueEnabled() {
    return (await this.continueButton.getAttribute('enabled')) === 'true';
  }

  async attemptMobileNumberInput(input) {
    await this.mobileNumberField.click();
    await browser.waitUntil(() => browser.isKeyboardShown(), {
      timeout: this.timeout,
      timeoutMsg: 'Keyboard did not appear for the mobile number field',
    });
    await this.mobileNumberField.clearValue();
    await this.mobileNumberField.addValue(input);

    if (await browser.isKeyboardShown()) {
      await browser.hideKeyboard();
    }
  }

  async clearMobileNumber(digitCount) {
    await this.mobileNumberField.click();
    await browser.waitUntil(() => browser.isKeyboardShown(), {
      timeout: this.timeout,
      timeoutMsg: 'Keyboard did not appear for clearing the mobile number',
    });
    for (let remaining = digitCount; remaining > 0; remaining -= 1) {
      await browser.execute('mobile: pressKey', { keycode: 67 });
    }

    if (await browser.isKeyboardShown()) {
      await browser.hideKeyboard();
    }
  }

  async waitForMobileLoginScreen() {
    await this.mobileNumberField.waitForDisplayed({
      timeout: this.timeout,
      timeoutMsg: 'Mobile login screen did not appear',
    });
  }

  async tapContinue() {
    await this.continueButton.waitForEnabled({
      timeout: this.timeout,
      timeoutMsg: 'Continue did not enable for the entered mobile number',
    });

    const location = await this.continueButton.getLocation();
    const size = await this.continueButton.getSize();
    await browser.execute('mobile: clickGesture', {
      x: Math.round(location.x + size.width / 2),
      y: Math.round(location.y + size.height / 2),
    });
  }

  async waitForOtpScreen() {
    await this.otpHeading.waitForDisplayed({
      timeout: 20000,
      timeoutMsg: 'OTP verification screen did not appear after Continue',
    });
  }

  async areOtpDigitsEmpty() {
    return (await this.getOtpDigits()).every((digit) => digit === '');
  }

  async getOtpDigits() {
    await this.waitForOtpScreen();
    const digits = [];
    for (let digitIndex = 0; digitIndex < 6; digitIndex += 1) {
      const digitField = $(`//*[@resource-id="vms_otp_digit_${digitIndex}"]`);
      digits.push((await digitField.getAttribute('text')) || '');
    }

    return digits;
  }

  async isOtpVerifyEnabled() {
    await this.waitForOtpScreen();
    if (!(await this.otpVerifyButton.isExisting())) {
      return false;
    }

    return (await this.otpVerifyButton.getAttribute('enabled')) === 'true';
  }

  async enterOtpDigits(otpCode) {
    if (!/^\d{1,7}$/.test(otpCode)) {
      throw new Error('OTP input must contain between one and seven digits.');
    }

    await this.waitForVisible(this.firstOtpDigit);
    const location = await this.firstOtpDigit.getLocation();
    const size = await this.firstOtpDigit.getSize();
    await browser.execute('mobile: clickGesture', {
      x: Math.round(location.x + size.width / 2),
      y: Math.round(location.y + size.height / 2),
    });
    await browser.waitUntil(() => browser.isKeyboardShown(), {
      timeout: this.timeout,
      timeoutMsg: 'Numeric keyboard did not appear for OTP entry',
    });

    for (const digit of otpCode) {
      await browser.execute('mobile: pressKey', {
        keycode: 7 + Number(digit),
      });
    }

    if (await browser.isKeyboardShown()) {
      await browser.hideKeyboard();
    }
  }

  async tapOtpVerify() {
    await this.otpVerifyButton.waitForEnabled({
      timeout: this.timeout,
      timeoutMsg: 'OTP Verify did not enable after entering six digits',
    });
    const location = await this.otpVerifyButton.getLocation();
    const size = await this.otpVerifyButton.getSize();
    await browser.execute('mobile: clickGesture', {
      x: Math.round(location.x + size.width / 2),
      y: Math.round(location.y + size.height / 2),
    });
  }

  async clearOtpDigits() {
    await this.firstOtpDigit.click();
    await browser.waitUntil(() => browser.isKeyboardShown(), {
      timeout: this.timeout,
      timeoutMsg: 'Numeric keyboard did not appear to clear the OTP',
    });

    for (let remaining = 6; remaining > 0; remaining -= 1) {
      await browser.execute('mobile: pressKey', { keycode: 67 });
    }

    if (await browser.isKeyboardShown()) {
      await browser.hideKeyboard();
    }
  }

  async tapResendCode() {
    await this.resendControl.waitForEnabled({
      timeout: 5000,
      timeoutMsg: 'Resend control did not become enabled after the countdown',
    });
    await this.resendControl.click();
  }

  async tapOtpBackButton() {
    const location = await this.otpBackButton.getLocation();
    const size = await this.otpBackButton.getSize();
    await browser.execute('mobile: clickGesture', {
      x: Math.round(location.x + size.width / 2),
      y: Math.round(location.y + size.height / 2),
    });
  }

  async submitOtp(otpCode) {
    if (!/^\d{6}$/.test(otpCode)) {
      throw new Error('OTP_CODE must contain exactly six digits.');
    }

    await this.enterOtpDigits(otpCode);
    await this.tapOtpVerify();
  }

  async waitForDashboard() {
    await this.dashboardGreeting.waitForDisplayed({
      timeout: 30000,
      timeoutMsg: 'Dashboard did not appear after OTP verification',
    });
  }
}

module.exports = new MobileOtpPage();