'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

class BasePage {
  constructor(timeout = 10000) {
    this.timeout = timeout;
  }

  async waitForVisible(element, timeout = this.timeout) {
    await element.waitForDisplayed({
      timeout,
      timeoutMsg: 'Expected element to become visible before the timeout',
    });
    return element;
  }

  async tap(element) {
    await this.waitForVisible(element);
    await element.click();
  }

  async type(element, value) {
    await this.waitForVisible(element);
    await element.clearValue();
    await element.setValue(value);
  }

  async typeByKeyboard(element, value) {
    await this.waitForVisible(element);
    await element.click();
    await browser.waitUntil(() => browser.isKeyboardShown(), {
      timeout: this.timeout,
      timeoutMsg: 'Keyboard did not appear after focusing the field',
    });
    await element.clearValue();
    await element.addValue(value);
    const acceptedValue = await element.getAttribute('text');

    if (await browser.isKeyboardShown()) {
      await browser.hideKeyboard();
    }

    return acceptedValue;
  }

  async typeAndVerify(element, value, { password = false } = {}) {
    await this.waitForVisible(element);
    await element.click();
    await browser.waitUntil(() => browser.isKeyboardShown(), {
      timeout: this.timeout,
      timeoutMsg: 'Keyboard did not appear after focusing the field',
    });
    await element.clearValue();
    await element.setValue(value);

    const passwordAttribute = await element.getAttribute('password');
    const isPassword =
      password ||
      String(passwordAttribute).toLowerCase() === 'true';
    let acceptedValue;

    if (!isPassword) {
      acceptedValue = await element.getAttribute('text');
      if (!acceptedValue) {
        const valueAttribute = await element.getAttribute('value');
        if (valueAttribute) {
          acceptedValue = valueAttribute;
        }
      }
      if (acceptedValue === null || acceptedValue === undefined) {
        throw new Error('Could not read the entered value back from the field.');
      }
    }

    if (await browser.isKeyboardShown()) {
      await browser.hideKeyboard();
    }

    if (!isPassword && String(acceptedValue) !== String(value)) {
      throw new Error(
        `Field value was not accepted. Expected "${value}" but received "${acceptedValue}".`
      );
    }

    return acceptedValue;
  }

  async tapWhenEnabled(
    element,
    { timeout = this.timeout, artifactPrefix = 'disabled-button' } = {}
  ) {
    try {
      await element.waitForEnabled({
        timeout,
        timeoutMsg: `Button did not become enabled within ${timeout}ms`,
      });
    } catch (error) {
      const screenshotsDirectory = path.resolve(__dirname, '../screenshots');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const safePrefix = artifactPrefix.replace(/[^a-z0-9-_]+/gi, '-');
      const screenshotPath = path.join(
        screenshotsDirectory,
        `${safePrefix}-${timestamp}.png`
      );
      const sourcePath = path.join(
        screenshotsDirectory,
        `${safePrefix}-${timestamp}.xml`
      );
      const artifactPaths = [];

      await fs.mkdir(screenshotsDirectory, { recursive: true });
      try {
        await browser.saveScreenshot(screenshotPath);
        artifactPaths.push(screenshotPath);
      } catch (screenshotError) {
        artifactPaths.push(`screenshot unavailable: ${screenshotError.message}`);
      }
      try {
        await fs.writeFile(sourcePath, await browser.getPageSource(), 'utf8');
        artifactPaths.push(sourcePath);
      } catch (sourceError) {
        artifactPaths.push(`page source unavailable: ${sourceError.message}`);
      }

      throw new Error(
        `Button did not become enabled within ${timeout}ms. ${artifactPaths.join('; ')}`
      );
    }

    await element.click();
  }

  async getText(element) {
    await this.waitForVisible(element);
    return element.getText();
  }

  async isDisplayed(element, timeout = this.timeout) {
    try {
      await this.waitForVisible(element, timeout);
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = BasePage;
