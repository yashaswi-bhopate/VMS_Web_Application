'use strict';

const credentials = {
  valid: {
    username: 'test.user@example.com',
    password: 'ReplaceWithValidPassword',
  },
  invalidPassword: {
    username: 'test.user@example.com',
    password: 'ReplaceWithInvalidPassword',
  },
  empty: {
    username: '',
    password: '',
  },
};

const expectedMessages = {
  invalidCredentials: 'Invalid username or password',
  emptyFields: 'Username and password are required',
};

const loginScreenText = {
  welcomeHeader: 'Welcome Back',
  dashboardDescription: 'Sign in to access your VMS dashboard',
  countryCallingCode: '+91',
  footerDisclaimer:
    'By continuing, you agree to our Terms of Service and Privacy Policy. Your data is protected with enterprise-grade security.',
  version: 'v2.0.4',
};

module.exports = {
  credentials,
  expectedMessages,
  loginScreenText,
};
