#!/usr/bin/env node
/**
 * Unit tests for semantic PostCSS toolchain verification (no ripgrep dependency).
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const VERIFY = join(ROOT, 'scripts/verify-toolchain-postcss.mjs');
const CHECK = join(ROOT, 'scripts/check-toolchain-boundary.sh');

function runVerify(args = []) {
  return execFileSync('node', [VERIFY, ...args], { encoding: 'utf8', cwd: ROOT });
}

function runCheck(env = {}) {
  return execFileSync('bash', [CHECK], {
    encoding: 'utf8',
    cwd: ROOT,
    env: { ...process.env, ...env, PATH: process.env.PATH },
  });
}

const json = JSON.parse(runVerify(['--json']));
assert.equal(json.vitePostcss, join(ROOT, 'postcss.config.js'));
assert.equal(json.vitestPostcss, join(ROOT, 'postcss.config.js'));
assert.equal(json.repoPostcssBlocked, true);
console.log('OK: effective Vite/Vitest PostCSS resolve to AIO postcss.config.js');

const human = runVerify([]);
assert.match(human, /Vite effective PostCSS/);
assert.match(human, /Vitest effective PostCSS/);
console.log('OK: human-readable verify output');

const checkOut = runCheck({ PATH: '/usr/local/bin:/usr/bin:/bin' });
assert.match(checkOut, /Toolchain boundary check: PASS/);
assert.match(checkOut, /Vite effective PostCSS/);
console.log('OK: check-toolchain-boundary.sh PASS without rg in PATH');

console.log('All verify-toolchain-postcss unit tests passed.');
