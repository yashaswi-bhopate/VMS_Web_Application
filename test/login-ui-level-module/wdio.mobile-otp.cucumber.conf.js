'use strict';

const path = require('node:path');
const { config } = require('../../wdio.conf');

exports.config = {
  ...config,
  protocol: 'http',
  hostname: '127.0.0.1',
  port: 4724,
  path: '/',
  services: [],
  framework: 'cucumber',
  specs: [path.resolve(__dirname, 'features', 'mobile-otp.feature')],
  cucumberOpts: {
    require: [path.resolve(__dirname, 'step-definitions', 'mobile-otp.steps.js')],
    timeout: 90000,
  },
};