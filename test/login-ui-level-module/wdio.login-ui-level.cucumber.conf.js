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
  specs: [path.resolve(__dirname, 'features', 'login.feature')],
  cucumberOpts: {
    require: [path.resolve(__dirname, 'step-definitions', 'login.steps.js')],
    timeout: 60000,
  },
};