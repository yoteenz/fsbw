#!/usr/bin/env node
/**
 * Record a gate status into .ci/aio-validation-results.json (JSON-safe).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const [resultsPath, key, status, ...detailParts] = process.argv.slice(2);
const detail = detailParts.join(' ');

if (!resultsPath || !key || !status) {
  console.error('aio-record-result: missing result path, key, or status');
  process.exit(1);
}

if (!key.trim()) {
  console.error('aio-record-result: missing result key');
  process.exit(1);
}

if (!/^[A-Za-z0-9_]+$/.test(key)) {
  console.error(`aio-record-result: invalid result key: ${key}`);
  process.exit(1);
}

const data = existsSync(resultsPath)
  ? JSON.parse(readFileSync(resultsPath, 'utf8'))
  : { project: 'nnnljnhtmseagotvgxxt' };

data[key] = status;
if (detail) {
  data[`${key}Detail`] = detail;
}

writeFileSync(resultsPath, `${JSON.stringify(data, null, 2)}\n`);

console.log(`Recorded ${key}=${status}`);
