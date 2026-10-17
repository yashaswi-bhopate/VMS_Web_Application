'use strict';

const path = require('node:path');
const { config } = require('../../wdio.conf');

exports.config = {
  ...config,
  protocol: 'http',
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  services: [],
  specs: [path.resolve(__dirname, 'specs', 'login-ui-level.spec.js')],
};