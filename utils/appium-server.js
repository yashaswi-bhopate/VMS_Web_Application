'use strict';

const { spawn } = require('node:child_process');

const appiumCli = require.resolve('appium');
const appium = spawn(process.execPath, [appiumCli, ...process.argv.slice(2)], {
  stdio: ['ignore', 'pipe', 'pipe'],
});

appium.stdout.pipe(process.stdout);
appium.stderr.pipe(process.stdout);

appium.on('error', (error) => {
  console.error(`Could not start Appium: ${error.message}`);
  process.exitCode = 1;
});

appium.on('exit', (code) => {
  process.exitCode = code ?? 1;
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => appium.kill(signal));
}
