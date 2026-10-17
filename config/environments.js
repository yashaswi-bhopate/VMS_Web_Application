'use strict';

const environments = {
  staging: {
    appPath:
      process.env.STAGING_APP_PATH ||
      process.env.APP_PATH ||
      './app/your-app.apk',
    appPackage:
      process.env.STAGING_APP_PACKAGE ||
      process.env.APP_PACKAGE ||
      'com.example.loginapp',
    appActivity:
      process.env.STAGING_APP_ACTIVITY ||
      process.env.APP_ACTIVITY ||
      '.MainActivity',
  },
  production: {
    appPath:
      process.env.PRODUCTION_APP_PATH ||
      process.env.APP_PATH ||
      './app/production.apk',
    appPackage:
      process.env.PRODUCTION_APP_PACKAGE ||
      process.env.APP_PACKAGE ||
      'com.example.loginapp',
    appActivity:
      process.env.PRODUCTION_APP_ACTIVITY ||
      process.env.APP_ACTIVITY ||
      '.MainActivity',
  },
};

const currentEnvironment = (process.env.ENV || 'staging').toLowerCase();
const selectedEnvironment = environments[currentEnvironment];

if (!selectedEnvironment) {
  throw new Error(
    `Unknown ENV "${currentEnvironment}". Use "staging" or "production".`
  );
}

module.exports = {
  currentEnvironment,
  environments,
  selectedEnvironment,
};
