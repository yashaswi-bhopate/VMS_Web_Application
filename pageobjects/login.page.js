'use strict';

const BasePage = require('./base.page');

class LoginPage extends BasePage {
  // replace with real id from Appium Inspector
  get usernameField() {
    return $('~username_input');
  }

  // replace with real id from Appium Inspector
  get passwordField() {
    return $('~password_input');
  }

  // replace with real id from Appium Inspector
  get loginButton() {
    return $('~login_button');
  }

  // replace with real id from Appium Inspector
  get errorMessage() {
    return $('~error_message');
  }

  // replace with real id from Appium Inspector
  get homeScreen() {
    return $('~home_screen');
  }

  async login(username, password) {
    await this.typeAndVerify(this.usernameField, username);
    await this.typeAndVerify(this.passwordField, password, { password: true });
    await this.tapWhenEnabled(this.loginButton, {
      artifactPrefix: 'login-button',
    });
  }

  async getErrorMessage() {
    return this.getText(this.errorMessage);
  }

  async isLoggedIn() {
    return this.isDisplayed(this.homeScreen);
  }
}

module.exports = new LoginPage();
