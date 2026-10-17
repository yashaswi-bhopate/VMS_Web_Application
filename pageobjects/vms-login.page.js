'use strict';

const BasePage = require('./base.page');

class VmsLoginPage extends BasePage {
  get onboardingLoginButton() {
    return $('~Login');
  }

  get welcomeHeader() {
    return $('~Welcome Back');
  }

  get logoImage() {
    return $('android.widget.ImageView');
  }

  get phoneField() {
    return $('//*[@resource-id="vms_login_phone"]');
  }

  get otpHeading() {
    return $('~OTP Verification');
  }

  get otpVerifyButton() {
    return $('~vms_otp_verify');
  }

  get dashboardGreeting() {
    return $('//*[starts-with(@content-desc, "Hi ")]');
  }

  get profileButton() {
    return $('//android.widget.ImageView[starts-with(@content-desc, "Hi ")]/android.view.View[@clickable="true" and string-length(@content-desc)=2]');
  }

  get logoutButton() {
    return $('~Logout');
  }

  get countryCallingCode() {
    return $('~+91');
  }

  get continueButton() {
    return $('~vms_login_continue');
  }

  get signInSubtitle() {
    return $('~Sign in to access your VMS dashboard');
  }

  get termsOfServiceLink() {
    return $('~Terms of Service');
  }

  get privacyPolicyLink() {
    return $('~Privacy Policy');
  }

  get versionLabel() {
    return $('~v2.0.4');
  }

  get notificationPermissionDenyButton() {
    return $('id=com.android.permissioncontroller:id/permission_deny_button');
  }

  async openLoginScreen() {
    if (await this.isDisplayed(this.notificationPermissionDenyButton, 2000)) {
      await this.tap(this.notificationPermissionDenyButton);
    }

    if (await this.isDisplayed(this.dashboardGreeting, 1000)) {
      await this.tap(this.profileButton);
      for (
        let scrollAttempt = 0;
        scrollAttempt < 4 && !(await this.isDisplayed(this.logoutButton, 500));
        scrollAttempt += 1
      ) {
        await browser.execute('mobile: scrollGesture', {
          left: 100,
          top: 300,
          width: 880,
          height: 1700,
          direction: 'down',
          percent: 0.8,
        });
      }
      await this.tap(this.logoutButton);
    }

    await browser.waitUntil(
      async () =>
        (await this.isDisplayed(this.phoneField, 500)) ||
        (await this.isDisplayed(this.welcomeHeader, 500)) ||
        (await this.isDisplayed(this.onboardingLoginButton, 500)),
      {
        timeout: this.timeout,
        timeoutMsg: 'Neither the VMS login screen nor onboarding Login appeared',
      }
    );

    const loginScreenAlreadyOpen =
      (await this.isDisplayed(this.phoneField, 2000)) ||
      (await this.isDisplayed(this.welcomeHeader, 2000));

    if (!loginScreenAlreadyOpen) {
      await this.tap(this.onboardingLoginButton);
    }

    await this.waitForVisible(this.phoneField);
  }

  async getWelcomeHeaderLabel() {
    await this.waitForVisible(this.welcomeHeader);
    return this.welcomeHeader.getAttribute('content-desc');
  }

  async getDashboardDescription() {
    await this.waitForVisible(this.signInSubtitle);
    return this.signInSubtitle.getAttribute('content-desc');
  }

  async getCountryCallingCode() {
    await this.waitForVisible(this.countryCallingCode);
    return this.countryCallingCode.getAttribute('content-desc');
  }

  async getVersionLabel() {
    await this.waitForVisible(this.versionLabel);
    return this.versionLabel.getAttribute('content-desc');
  }

  async getPhoneNumber() {
    return this.phoneField.getAttribute('text');
  }

  async debugPhoneFieldDom() {
    let phoneField = $('~vms_login_phone');

    if (!(await phoneField.isExisting())) {
      phoneField = $('//*[@resource-id="vms_login_phone"]');
    }

    await phoneField.waitForDisplayed({ timeout: this.timeout });

    const attributes = {};
    for (const name of ['text', 'hint', 'content-desc', 'resource-id']) {
      attributes[name] = await phoneField.getAttribute(name);
    }

    console.log('Phone field attributes:', JSON.stringify(attributes, null, 2));
    console.log('Full page source:\n', await browser.getPageSource());

    return attributes;
  }

  async enterPhoneNumber(phoneNumber) {
    await this.type(this.phoneField, phoneNumber);
    return this.getPhoneNumber();
  }

  async enterPhoneNumberAndWaitForContinueEnabled(phoneNumber) {
    await this.phoneField.click();
    await browser.waitUntil(() => browser.isKeyboardShown(), {
      timeout: this.timeout,
      timeoutMsg: 'Keyboard did not appear after focusing the phone field',
    });
    await this.phoneField.clearValue();

    for (const digit of phoneNumber) {
      await browser.execute('mobile: pressKey', {
        keycode: 7 + Number(digit),
      });
    }

    await browser.pause(500);

    if (await browser.isKeyboardShown()) {
      await browser.hideKeyboard();
    }

    await this.continueButton.waitForEnabled({
      timeout: this.timeout,
      timeoutMsg: 'Continue button did not enable after entering a valid number',
    });
  }

  async enterPhoneNumberByKeyboard(phoneNumber) {
    return this.typeByKeyboard(this.phoneField, phoneNumber);
  }

  async tapContinue() {
    await this.continueButton.waitForEnabled({
      timeout: this.timeout,
      timeoutMsg: 'Continue button did not become enabled before tapping',
    });

    const location = await this.continueButton.getLocation();
    const size = await this.continueButton.getSize();
    await browser.execute('mobile: clickGesture', {
      x: Math.round(location.x + size.width / 2),
      y: Math.round(location.y + size.height / 2),
    });
  }

  async tapPrivacyPolicyLink() {
    const link = this.privacyPolicyLink;
    await this.waitForVisible(link);

    const location = await link.getLocation();
    const size = await link.getSize();
    await browser.execute('mobile: clickGesture', {
      x: Math.round(location.x + size.width * 0.91),
      y: Math.round(location.y + size.height * 0.25),
    });
  }

  async enterOtpCode(otpCode) {
    if (!/^\d{6}$/.test(otpCode)) {
      throw new Error('OTP_CODE must contain exactly six digits.');
    }

    const firstDigit = $('//*[@resource-id="vms_otp_digit_0"]');
    await this.waitForVisible(firstDigit);
    const location = await firstDigit.getLocation();
    const size = await firstDigit.getSize();
    await browser.execute('mobile: clickGesture', {
      x: Math.round(location.x + size.width / 2),
      y: Math.round(location.y + size.height / 2),
    });

    for (const digit of otpCode) {
      await browser.execute('mobile: pressKey', {
        keycode: 7 + Number(digit),
      });
    }
  }

  async tapOtpVerify() {
    await this.otpVerifyButton.waitForEnabled({
      timeout: this.timeout,
      timeoutMsg: 'OTP verify button did not become enabled',
    });

    const location = await this.otpVerifyButton.getLocation();
    const size = await this.otpVerifyButton.getSize();
    await browser.execute('mobile: clickGesture', {
      x: Math.round(location.x + size.width / 2),
      y: Math.round(location.y + size.height / 2),
    });
  }

  async isContinueEnabled() {
    return (await this.continueButton.getAttribute('enabled')) === 'true';
  }

  async getAccessibleScreenText() {
    const pageSource = await browser.getPageSource();
    const screenWithoutPhoneValue = pageSource
      .split('\n')
      .filter((line) => !line.includes('resource-id="vms_login_phone"'))
      .join('\n');

    return Array.from(
      screenWithoutPhoneValue.matchAll(/(?:text|content-desc)="([^"]+)"/g),
      (match) => match[1]
    );
  }
}

module.exports = new VmsLoginPage();
