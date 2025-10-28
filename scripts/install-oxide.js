#!/usr/bin/env node
const { execSync } = require('node:child_process');

if (process.platform !== 'win32') {
  process.exit(0);
}

try {
  execSync('npm install --no-save @tailwindcss/oxide-win32-x64-msvc', {
    stdio: 'ignore',
  });
} catch (error) {
  console.warn('Optional install of @tailwindcss/oxide-win32-x64-msvc failed:', error.message);
}
